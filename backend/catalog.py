import json
import os
from typing import Optional

_PRODUCTS_PATH = os.path.join(os.path.dirname(__file__), "data", "products.json")


def get_all_products() -> list:
    with open(_PRODUCTS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def get_product_by_id(product_id: str) -> Optional[dict]:
    return next((p for p in get_all_products() if p["id"] == product_id), None)


def get_products_by_category(category: str) -> list:
    return [p for p in get_all_products() if p["category"].lower() == category.lower()]


def search_products_simple(query: str) -> list:
    """Keyword-based fallback search."""
    products = get_all_products()
    query_lower = query.lower()
    scored = []
    for p in products:
        score = 0
        if query_lower in p["name"].lower():
            score += 3
        if query_lower in p["description"].lower():
            score += 2
        if any(query_lower in tag for tag in p["tags"]):
            score += 2
        if query_lower in p["category"].lower():
            score += 1
        if score > 0:
            scored.append((score, p))
    scored.sort(key=lambda x: -x[0])
    return [p for _, p in scored]
