import json
import os
from datetime import datetime
from dotenv import load_dotenv
from models import CatalogQuery, CatalogResult, AuditEntry, AuditStatus
from database import log_audit
from catalog import get_all_products, search_products_simple

load_dotenv()

GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")
MOCK_AI = not GEMINI_KEY or GEMINI_KEY == "your_gemini_key_here"


def _search_gemini(query: str, all_products: list) -> tuple[list, str]:
    """Use Gemini to semantically understand the catalog query."""
    import google.generativeai as genai
    genai.configure(api_key=GEMINI_KEY)
    catalog_json = json.dumps([{"id": p["id"], "name": p["name"], "category": p["category"],
                                "price": p["price"], "tags": p["tags"]} for p in all_products], indent=2)
    prompt = f"""You are an AI catalog agent. Find products matching the user's query.

Catalog:
{catalog_json}

User query: "{query}"

Respond ONLY with valid JSON:
{{"product_ids": ["id1", "id2"], "explanation": "why these products match the query"}}"""
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)
    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    data = json.loads(text.strip())
    matched = [p for p in all_products if p["id"] in data.get("product_ids", [])]
    return matched, data.get("explanation", "")


async def run_catalog_agent(request: CatalogQuery) -> CatalogResult:
    """Agent-readable catalog with AI-powered natural language search."""
    all_products = get_all_products()
    ts = lambda: datetime.utcnow().isoformat()

    try:
        if MOCK_AI:
            matched = search_products_simple(request.query)
            explanation = f"Keyword search matched {len(matched)} products for query: '{request.query}'"
            mode = "keyword"
        else:
            matched, explanation = _search_gemini(request.query, all_products)
            mode = "gemini"
    except Exception as e:
        matched = search_products_simple(request.query)
        explanation = f"Fallback search: {len(matched)} results for '{request.query}' (error: {str(e)[:50]})"
        mode = "fallback"

    audit_entry = AuditEntry(
        agent="catalog_agent",
        action="catalog_search",
        input_data={"query": request.query},
        output_data={"results": len(matched), "mode": mode},
        reasoning=explanation,
        status=AuditStatus.SUCCESS if matched else AuditStatus.PARTIAL,
        explainability=f"Catalog agent processed query '{request.query}' using {mode} search, returning {len(matched)} results."
    )
    await log_audit(audit_entry)

    return CatalogResult(
        products=matched,
        explanation=explanation,
        total_found=len(matched)
    )
