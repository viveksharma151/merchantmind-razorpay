import json
import os
from datetime import datetime
from dotenv import load_dotenv
from models import CheckoutRequest, CheckoutResult, AuditEntry, AuditStatus
from database import log_audit
from razorpay_client import create_order
from catalog import get_all_products, get_product_by_id

load_dotenv()

GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")
MOCK_AI = not GEMINI_KEY or GEMINI_KEY == "your_gemini_key_here"


def _parse_intent_mock(message: str, products: list) -> dict:
    """Fallback parser using simple keyword matching."""
    message_lower = message.lower()
    best_match = None
    best_score = 0
    for p in products:
        score = 0
        name_words = p["name"].lower().split()
        for word in name_words:
            if len(word) > 3 and word in message_lower:
                score += 3
        for tag in p["tags"]:
            if tag in message_lower:
                score += 2
        if p["category"].lower() in message_lower:
            score += 1
        if score > best_score:
            best_score = score
            best_match = p
    if not best_match and products:
        best_match = products[0]
        best_score = 0
    quantity = 1
    for word in message_lower.split():
        if word.isdigit():
            quantity = int(word)
            break
        nums = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5}
        if word in nums:
            quantity = nums[word]
            break
    return {
        "product_id": best_match["id"] if best_match else None,
        "product_name": best_match["name"] if best_match else "Unknown",
        "quantity": quantity,
        "confidence": min(best_score * 0.15, 0.95) if best_score > 0 else 0.3,
        "reasoning": f"Keyword match: found {best_match['name']}" if best_match else "No match"
    }


def _parse_intent_gemini(message: str, products: list) -> dict:
    """Use Google Gemini to intelligently parse checkout intent."""
    import google.generativeai as genai
    genai.configure(api_key=GEMINI_KEY)
    catalog_summary = "\n".join([
        f"ID: {p['id']}, Name: {p['name']}, Price: Rs.{p['price']}, Category: {p['category']}, Tags: {', '.join(p['tags'])}"
        for p in products
    ])
    prompt = f"""You are an AI shopping assistant. Extract the purchase intent from the user message.

Available products:
{catalog_summary}

User message: "{message}"

Respond ONLY with valid JSON (no markdown, no code blocks):
{{"product_id": "best matching product ID or null", "product_name": "product name", "quantity": 1, "confidence": 0.85, "reasoning": "brief explanation of why you matched this product"}}"""
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)
    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())


async def run_checkout_agent(request: CheckoutRequest) -> CheckoutResult:
    """Conversational checkout agent: parses intent and creates Razorpay order."""
    audit_trail = []
    ts = lambda: datetime.utcnow().isoformat()

    # Step 1: Load catalog
    products = get_all_products()
    audit_trail.append({"step": "1_catalog_loaded", "ts": ts(), "info": f"Loaded {len(products)} products"})

    # Step 2: Parse intent
    try:
        if MOCK_AI:
            intent = _parse_intent_mock(request.message, products)
            audit_trail.append({"step": "2_intent_parsed", "ts": ts(), "mode": "mock", "intent": intent})
        else:
            intent = _parse_intent_gemini(request.message, products)
            audit_trail.append({"step": "2_intent_parsed", "ts": ts(), "mode": "gemini", "intent": intent})
    except Exception as e:
        intent = _parse_intent_mock(request.message, products)
        audit_trail.append({"step": "2_intent_parsed", "ts": ts(), "mode": "fallback", "error": str(e), "intent": intent})

    # Step 3: Find product
    product = None
    if intent.get("product_id"):
        product = get_product_by_id(intent["product_id"])
    if not product:
        product = next(
            (p for p in products if intent.get("product_name", "").lower() in p["name"].lower()),
            None
        )

    if not product:
        # Graceful failure - this is required by the bar
        audit_entry = AuditEntry(
            agent="checkout_agent",
            action="checkout_failed",
            input_data={"message": request.message},
            output_data={"error": "No matching product"},
            reasoning=intent.get("reasoning", "Low confidence match"),
            status=AuditStatus.FAILED,
            explainability=f"Agent parsed '{request.message}' but found no product match above confidence threshold ({intent.get('confidence', 0)*100:.0f}%). User should refine their query."
        )
        await log_audit(audit_entry)
        return CheckoutResult(
            success=False,
            message="I couldn't find a matching product. Could you be more specific? Try: 'I want to buy Sony headphones' or 'Add a yoga mat to my cart'",
            audit_trail=audit_trail
        )

    audit_trail.append({"step": "3_product_matched", "ts": ts(), "product": product["name"], "id": product["id"]})

    # Step 4: Create Razorpay order
    quantity = max(1, intent.get("quantity", 1))
    total = product["price"] * quantity
    receipt = f"rcpt_{product['id']}_{datetime.utcnow().strftime('%H%M%S')}"

    order = create_order(
        amount=total,
        currency="INR",
        receipt=receipt,
        notes={"product_id": product["id"], "product_name": product["name"], "quantity": str(quantity)}
    )
    audit_trail.append({"step": "4_order_created", "ts": ts(), "order_id": order["id"], "amount_inr": total})

    # Step 5: Log to audit DB
    audit_entry = AuditEntry(
        agent="checkout_agent",
        action="checkout_order_created",
        input_data={"message": request.message, "customer": request.customer_name},
        output_data={"order_id": order["id"], "product": product["name"], "amount": total, "currency": "INR"},
        reasoning=intent.get("reasoning", ""),
        status=AuditStatus.SUCCESS,
        explainability=(
            f"Parsed '{request.message}' → matched '{product['name']}' with {intent.get('confidence', 0)*100:.0f}% confidence. "
            f"Created Razorpay order {order['id']} for Rs.{total} (qty: {quantity}). "
            f"{'MOCK MODE - no real charge' if order.get('mock') else 'Live Razorpay order created.'}"
        )
    )
    await log_audit(audit_entry)

    return CheckoutResult(
        success=True,
        message=f"Found **{product['name']}** for Rs.{product['price']:,}! Initiating checkout for {quantity} item(s). Total: **Rs.{total:,}**",
        product=product,
        order=order,
        upsell_prompt=f"Customers who bought {product['name']} also bought these complementary items!",
        audit_trail=audit_trail
    )
