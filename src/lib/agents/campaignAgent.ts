import { CampaignRequest, CampaignResult, PaymentLinkData, Product } from '../types';
import { getProductById } from '../catalog';
import { createRazorpayPaymentLink } from '../razorpay';
import { logAudit } from '../db';

const TEMPLATES: Record<string, string> = {
  email: `Subject: Exclusive VIP Offer: Handpicked Just For You!

Dear Valued Customer,

We noticed you value top-tier quality. We've unlocked limited-time promotional pricing on these featured items:

{product_details}

⚡ Fast checkout enabled via secure Razorpay 1-click links below.
Don't wait — promotional allocations expire soon!

Warm regards,
MerchantMind VIP Commerce Team`,

  sms: `Exclusive VIP Deal! Get {product_names} at special prices. Secure 1-click Razorpay Checkout: {links}`,

  social: `🔥 FLASH SALE ALERT! 🔥

Upgrade your setup today with handpicked essentials:
{product_names}

🛒 Direct checkout links:
{links}

#Deals #RazorpayCommerce #ExclusiveOffer #LimitedTime`,
};

export async function runCampaignAgent(request: CampaignRequest): Promise<CampaignResult> {
  const auditTrail: Record<string, unknown>[] = [];
  const products: Product[] = [];

  for (const pid of request.product_ids) {
    const prod = getProductById(pid);
    if (prod) products.push(prod);
  }

  if (products.length === 0) {
    return {
      campaign_copy: 'No valid products found to orchestrate campaign.',
      payment_links: [],
      reasoning: 'Product IDs did not match catalog.',
      audit_trail: [{ step: 'error', message: 'No valid products' }],
    };
  }

  auditTrail.push({
    step: '1_products_loaded',
    count: products.length,
    products: products.map(p => p.name),
  });

  // Step 2: Create Razorpay payment links for each product
  const paymentLinks: PaymentLinkData[] = [];
  for (const prod of products) {
    const link = await createRazorpayPaymentLink({
      amount: prod.price,
      description: `VIP Offer: ${prod.name}`,
      productName: prod.name,
    });

    paymentLinks.push({
      product_id: prod.id,
      product_name: prod.name,
      price: prod.price,
      link_id: link.id,
      short_url: link.short_url,
      mock: link.mock,
    });
  }

  auditTrail.push({
    step: '2_payment_links_generated',
    count: paymentLinks.length,
  });

  // Step 3: Format copy
  const productNames = products.map(p => p.name).join(', ');
  const productDetails = products
    .map(p => `• ${p.name} — ₹${p.price.toLocaleString('en-IN')}\n  ${p.description}\n  👉 Buy: rzp.io/l/${p.id.slice(0, 8)}`)
    .join('\n\n');
  const links = paymentLinks.map(l => `${l.product_name}: ${l.short_url}`).join(' | ');

  let copy = TEMPLATES[request.campaign_type] || TEMPLATES.email;
  copy = copy
    .replace(/{product_names}/g, productNames)
    .replace(/{product_details}/g, productDetails)
    .replace(/{links}/g, links);

  let subject: string | undefined;
  if (request.campaign_type === 'email') {
    const firstLine = copy.split('\n')[0];
    if (firstLine.startsWith('Subject:')) {
      subject = firstLine.replace('Subject:', '').trim();
    }
  }

  const reasoning = `Orchestrated ${request.campaign_type} campaign targeting "${request.target_audience || 'general'}" audience for ${products.length} products with ${paymentLinks.length} bounded Razorpay Payment Links.`;

  // Step 4: Audit logging
  await logAudit({
    agent: 'campaign_agent',
    action: 'campaign_orchestrated',
    input_data: {
      products: request.product_ids,
      type: request.campaign_type,
      audience: request.target_audience,
    },
    output_data: {
      links_count: paymentLinks.length,
      links: paymentLinks.map(l => ({ id: l.link_id, url: l.short_url })),
    },
    reasoning,
    status: 'SUCCESS',
    explainability: `Created ${request.campaign_type} campaign with ${paymentLinks.length} bounded Razorpay Payment Links. Prices are hardcoded on the merchant server to protect against buyer tampering.`,
  });

  return {
    campaign_copy: copy,
    payment_links: paymentLinks,
    subject,
    reasoning,
    audit_trail: auditTrail,
  };
}
