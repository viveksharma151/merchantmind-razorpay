import { CheckoutRequest, CheckoutResult, Product } from '../types';
import { getAllProducts, getProductById } from '../catalog';
import { createRazorpayOrder, IS_MOCK_MODE } from '../razorpay';
import { logAudit } from '../db';

interface ParsedIntent {
  product_id?: string | null;
  product_name?: string;
  quantity: number;
  confidence: number;
  reasoning: string;
}

function parseIntentHeuristic(message: string, catalog: Product[]): ParsedIntent {
  const msgLower = message.toLowerCase();
  let bestMatch: Product | null = null;
  let bestScore = 0;

  for (const p of catalog) {
    let score = 0;
    const nameWords = p.name.toLowerCase().split(/\s+/);
    for (const w of nameWords) {
      if (w.length > 2 && msgLower.includes(w)) score += 3;
    }
    for (const tag of p.tags) {
      if (msgLower.includes(tag.toLowerCase())) score += 2;
    }
    if (msgLower.includes(p.category.toLowerCase())) score += 1;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = p;
    }
  }

  // Extract quantity
  let quantity = 1;
  const numMatches = msgLower.match(/\b(\d+)\b/);
  if (numMatches) {
    quantity = Math.max(1, parseInt(numMatches[1], 10));
  } else {
    const wordNumbers: Record<string, number> = {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
    };
    for (const [w, n] of Object.entries(wordNumbers)) {
      if (msgLower.includes(` ${w} `) || msgLower.startsWith(`${w} `)) {
        quantity = n;
        break;
      }
    }
  }

  if (bestScore === 0 && !bestMatch) {
    return {
      product_id: null,
      product_name: undefined,
      quantity: 1,
      confidence: 0.1,
      reasoning: 'No product matched the input message keywords.',
    };
  }

  const confidence = Math.min(0.95, bestScore * 0.15);
  return {
    product_id: bestMatch ? bestMatch.id : null,
    product_name: bestMatch ? bestMatch.name : undefined,
    quantity,
    confidence,
    reasoning: bestMatch
      ? `Keyword affinity matched "${bestMatch.name}" with score ${bestScore}.`
      : 'Uncertain match.',
  };
}

async function parseIntentGemini(message: string, catalog: Product[], apiKey: string): Promise<ParsedIntent> {
  const catalogSummary = catalog
    .map(p => `ID: ${p.id} | Name: ${p.name} | Price: ₹${p.price} | Category: ${p.category} | Tags: ${p.tags.join(', ')}`)
    .join('\n');

  const prompt = `You are an Autonomous AI Shopping Agent for Razorpay. Extract buyer purchase intent.

Catalog:
${catalogSummary}

User Message: "${message}"

Respond ONLY with valid JSON in this structure:
{
  "product_id": "matching product id or null",
  "product_name": "product name",
  "quantity": 1,
  "confidence": 0.85,
  "reasoning": "short explanation of why this product was chosen"
}`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.statusText}`);
  }

  const data = await res.json();
  let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  text = text.trim();
  if (text.startsWith('```')) {
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
  }
  return JSON.parse(text);
}

export async function runCheckoutAgent(request: CheckoutRequest): Promise<CheckoutResult> {
  const auditTrail: Record<string, unknown>[] = [];
  const catalog = getAllProducts();
  const apiKey = process.env.GEMINI_API_KEY;

  auditTrail.push({
    step: '1_catalog_loaded',
    timestamp: new Date().toISOString(),
    itemCount: catalog.length,
  });

  let intent: ParsedIntent;

  // Step 2: Intent parsing
  if (apiKey && apiKey !== 'your_gemini_key_here') {
    try {
      intent = await parseIntentGemini(request.message, catalog, apiKey);
      auditTrail.push({ step: '2_intent_parsed', mode: 'gemini_ai', intent });
    } catch (err) {
      console.warn('Gemini parsing failed, falling back to heuristic:', err);
      intent = parseIntentHeuristic(request.message, catalog);
      auditTrail.push({ step: '2_intent_parsed', mode: 'heuristic_fallback', intent });
    }
  } else {
    intent = parseIntentHeuristic(request.message, catalog);
    auditTrail.push({ step: '2_intent_parsed', mode: 'heuristic', intent });
  }

  // Step 3: Product matching & gating
  let matchedProduct: Product | undefined;
  if (intent.product_id) {
    matchedProduct = getProductById(intent.product_id);
  }
  if (!matchedProduct && intent.product_name) {
    matchedProduct = catalog.find(p =>
      p.name.toLowerCase().includes(intent.product_name!.toLowerCase())
    );
  }

  // "THE BAR": Graceful failure handling
  if (!matchedProduct || intent.confidence < 0.25) {
    await logAudit({
      agent: 'checkout_agent',
      action: 'checkout_failed',
      input_data: { message: request.message, customer: request.customer_name },
      output_data: { error: 'No matching product found', confidence: intent.confidence },
      reasoning: intent.reasoning || 'Confidence below threshold (25%).',
      status: 'FAILED',
      explainability: `Agent processed buyer message "${request.message}" but found no product match with sufficient confidence (${Math.round((intent.confidence || 0) * 100)}%). Handled gracefully without creating any errant charges.`,
    });

    return {
      success: false,
      message:
        "I couldn't find a matching product for that request. Try being more specific, for example: *\"I want to buy Sony headphones\"*, *\"Add a yoga mat\"*, or *\"Order 2 startup books\"*.",
      audit_trail: auditTrail,
    };
  }

  auditTrail.push({
    step: '3_product_matched',
    product: matchedProduct.name,
    productId: matchedProduct.id,
  });

  // Step 4: Bounded order creation via Razorpay
  const quantity = Math.max(1, intent.quantity || 1);
  const totalAmount = matchedProduct.price * quantity;
  const receipt = `rcpt_${matchedProduct.id}_${Date.now().toString().slice(-6)}`;

  const order = await createRazorpayOrder({
    amount: totalAmount,
    currency: 'INR',
    receipt,
    notes: {
      product_id: matchedProduct.id,
      product_name: matchedProduct.name,
      quantity: quantity.toString(),
      customer: request.customer_name || 'Guest Buyer',
    },
  });

  auditTrail.push({
    step: '4_razorpay_order_created',
    orderId: order.id,
    amount: totalAmount,
    isMock: order.mock,
  });

  // Step 5: Log audit
  await logAudit({
    agent: 'checkout_agent',
    action: 'checkout_order_created',
    input_data: {
      message: request.message,
      customer: request.customer_name,
      quantity,
    },
    output_data: {
      order_id: order.id,
      product: matchedProduct.name,
      total_inr: totalAmount,
      currency: 'INR',
      mock: order.mock,
    },
    reasoning: intent.reasoning,
    status: 'SUCCESS',
    explainability: `Parsed "${request.message}" with ${Math.round(intent.confidence * 100)}% confidence. Created bounded Razorpay order ${order.id} for ₹${totalAmount.toLocaleString('en-IN')} (Quantity: ${quantity}). Price verified against catalog to prevent tampering.`,
  });

  return {
    success: true,
    message: `Found **${matchedProduct.name}** for ₹${matchedProduct.price.toLocaleString('en-IN')}. Created order for ${quantity} unit(s). Total: **₹${totalAmount.toLocaleString('en-IN')}**`,
    product: matchedProduct,
    order,
    upsell_prompt: `Shoppers who bought ${matchedProduct.name} also frequently added these complementary items:`,
    audit_trail: auditTrail,
  };
}
