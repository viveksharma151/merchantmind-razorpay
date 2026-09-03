import json
import os
from datetime import datetime
from dotenv import load_dotenv
from models import UpsellRequest, UpsellResult, AuditEntry, AuditStatus
from database import log_audit
from catalog import get_all_products, get_product_by_id

load_dotenv()

GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")
MOCK_AI = not GEMINI_KEY or GEMINI_KEY == "your_gemini_key_here"


def _upsell_mock(product: dict, all_products: list) -> tuple[list, str]:
    """Suggest products based on upsell_ids field."""
    upsell_ids = product.get("upsell_ids", [])
    suggestions = [p for p in all_products if p["id"] in upsell_ids][:3]
    if not suggestions:
        same_cat = [p for p in all_products if p["category"] == product["category"] and p["id"] != product["id"]][:3]
        suggestions = same_cat
    reasoning = f"Based on purchase patterns for {product['name']}, customers also buy these complementary products."
    return suggestions, reasoning


def _upsell_gemini(product: dict, all_products: list) -> tuple[list, str]:
    """Use Gemini to intelligently suggest upsells."""
    import google.generativeai as genai
    genai.configure(api_key=GEMINI_KEY)
    catalog_summary = "\n".join([
        f"ID: {p['id']}, Name: {p['name']}, Price: Rs.{p['price']}, Category: {p['category']}"
        for p in all_products if p["id"] != product["id"]
    ])
    prompt = f"""You are an AI upsell agent for an e-commerce store. Suggest 3 complementary products.

Primary product: {product['name']} (Category: {product['category']}, Price: Rs.{product['price']})

Available products to suggest from:
{catalog_summary}

Respond ONLY with valid JSON:
{{"suggestions": ["prod_id1", "prod_id2", "prod_id3"], "reasoning": "explanation of why these products complement the primary item"}}"""
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)
    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    data = json.loads(text.strip())
    suggestions = [p for p in all_products if p["id"] in data.get("suggestions", [])]
    return suggestions, data.get("reasoning", "")


async def run_upsell_agent(request: UpsellRequest) -> UpsellResult:
    """Upsell & cross-sell agent."""
    all_products = get_all_products()
    product = get_product_by_id(request.product_id)
    ts = lambda: datetime.utcnow().isoformat()
    audit_trail = [{"step": "1_product_loaded", "ts": ts(), "product": product["name"] if product else "Not found"}]

    if not product:
        return UpsellResult(suggestions=[], reasoning="Product not found", audit_trail=audit_trail)

    try:
        if MOCK_AI:
            suggestions, reasoning = _upsell_mock(product, all_products)
            audit_trail.append({"step": "2_suggestions_generated", "ts": ts(), "mode": "mock", "count": len(suggestions)})
        else:
            suggestions, reasoning = _upsell_gemini(product, all_products)
            audit_trail.append({"step": "2_suggestions_generated", "ts": ts(), "mode": "gemini", "count": len(suggestions)})
    except Exception as e:
        suggestions, reasoning = _upsell_mock(product, all_products)
        audit_trail.append({"step": "2_suggestions_generated", "ts": ts(), "mode": "fallback", "error": str(e)})

    audit_entry = AuditEntry(
        agent="upsell_agent",
        action="upsell_generated",
        input_data={"product_id": request.product_id},
        output_data={"suggestions": [s["name"] for s in suggestions]},
        reasoning=reasoning,
        status=AuditStatus.SUCCESS,
        explainability=f"For primary product '{product['name']}', agent recommended {len(suggestions)} complementary items based on category affinity and purchase patterns."
    )
    await log_audit(audit_entry)

    return UpsellResult(
        suggestions=suggestions,
        reasoning=reasoning,
        audit_trail=audit_trail
    )
