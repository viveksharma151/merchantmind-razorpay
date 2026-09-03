from fastapi import APIRouter
from typing import List
from models import CatalogQuery, CatalogResult
from agents.catalog_agent import run_catalog_agent
from catalog import get_all_products, get_product_by_id, get_products_by_category

router = APIRouter()


@router.get("/products")
async def list_all_products():
    """Agent-readable product catalog."""
    products = get_all_products()
    return {
        "total": len(products),
        "categories": list(set(p["category"] for p in products)),
        "products": products
    }


@router.get("/products/{product_id}")
async def get_product(product_id: str):
    """Get single product by ID."""
    product = get_product_by_id(product_id)
    if not product:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/search", response_model=CatalogResult)
async def search_catalog(query: CatalogQuery):
    """AI-powered natural language catalog search."""
    return await run_catalog_agent(query)


@router.get("/categories")
async def list_categories():
    """List all product categories."""
    products = get_all_products()
    cats = {}
    for p in products:
        cat = p["category"]
        if cat not in cats:
            cats[cat] = 0
        cats[cat] += 1
    return {"categories": cats}
