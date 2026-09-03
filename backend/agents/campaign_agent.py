import json
import os
from datetime import datetime
from dotenv import load_dotenv
from models import CampaignRequest, CampaignResult, AuditEntry, AuditStatus
from database import log_audit
from razorpay_client import create_payment_link
from catalog import get_product_by_id

load_dotenv()

GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")
MOCK_AI = not GEMINI_KEY or GEMINI_KEY == "your_gemini_key_here"


CAMPAIGN_TEMPLATES = {
    "email": """Subject: Exclusive Deal Just for You!

Dear Valued Customer,

We have handpicked {products} especially for you!

{product_details}

Don't miss out — these deals are available for a limited time.
Click the payment links above to grab yours now!

Best regards,
The MerchantMind AI Team""",
    "sms": "Exclusive offer! Get {products} at special prices. Grab now: {links}",
    "social": "🔥 Amazing deals on {products}! Shop now and save big! ✨ #Sale #Deals #Shopping {links}"
}


def _generate_campaign_mock(products: list, campaign_type: str, target_audience: str) -> str:
    product_names = ", ".join([p["name"] for p in products])
    product_details = "\n".join([
        f"• {p['name']} — Rs.{p['price']:,}\n  {p['description']}"
        for p in products
    ])
    template = CAMPAIGN_TEMPLATES.get(campaign_type, CAMPAIGN_TEMPLATES["email"])
    return template.format(
        products=product_names,
        product_details=product_details,
        links=" | ".join([f"rzp.io/buy/{p['id']}" for p in products])
    )


def _generate_campaign_gemini(products: list, campaign_type: str, target_audience: str) -> str:
    import google.generativeai as genai
    genai.configure(api_key=GEMINI_KEY)
    product_info = "\n".join([f"- {p['name']}: Rs.{p['price']:,} — {p['description']}" for p in products])
    type_instructions = {
        "email": "Write a professional email campaign with subject line",
        "sms": "Write a concise SMS campaign under 160 characters",
        "social": "Write an engaging social media post with emojis and hashtags"
    }
    prompt = f"""You are an expert marketing copywriter for an Indian e-commerce platform.

{type_instructions.get(campaign_type, 'Write a marketing campaign')} for these products targeting {target_audience} audience:

{product_info}

Make it compelling, include urgency, and be specific about the products. Keep it authentic for Indian market."""
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)
    return response.text.strip()


async def run_campaign_agent(request: CampaignRequest) -> CampaignResult:
    """Campaign orchestrator: generates copy and creates Razorpay payment links."""
    ts = lambda: datetime.utcnow().isoformat()
    audit_trail = []

    # Load products
    products = [get_product_by_id(pid) for pid in request.product_ids]
    products = [p for p in products if p is not None]
    if not products:
        return CampaignResult(
            campaign_copy="No valid products found.",
            payment_links=[],
            reasoning="Product IDs not found in catalog",
            audit_trail=[{"step": "failed", "reason": "products not found"}]
        )

    audit_trail.append({"step": "1_products_loaded", "ts": ts(), "count": len(products)})

    # Generate campaign copy
    try:
        if MOCK_AI:
            copy = _generate_campaign_mock(products, request.campaign_type, request.target_audience)
            audit_trail.append({"step": "2_copy_generated", "ts": ts(), "mode": "template"})
        else:
            copy = _generate_campaign_gemini(products, request.campaign_type, request.target_audience)
            audit_trail.append({"step": "2_copy_generated", "ts": ts(), "mode": "gemini"})
    except Exception as e:
        copy = _generate_campaign_mock(products, request.campaign_type, request.target_audience)
        audit_trail.append({"step": "2_copy_generated", "ts": ts(), "mode": "fallback", "error": str(e)})

    # Create Razorpay payment links for each product
    payment_links = []
    for p in products:
        link = create_payment_link(
            amount=p["price"],
            description=f"{p['name']} - Exclusive Campaign Offer",
            product_name=p["name"]
        )
        payment_links.append({
            "product_id": p["id"],
            "product_name": p["name"],
            "price": p["price"],
            "link_id": link["id"],
            "short_url": link["short_url"],
            "mock": link.get("mock", False)
        })

    audit_trail.append({"step": "3_payment_links_created", "ts": ts(), "count": len(payment_links)})

    product_names = ", ".join([p["name"] for p in products])
    reasoning = f"Generated {request.campaign_type} campaign for {product_names} targeting {request.target_audience} audience."

    audit_entry = AuditEntry(
        agent="campaign_agent",
        action="campaign_created",
        input_data={"products": request.product_ids, "type": request.campaign_type},
        output_data={"links_created": len(payment_links), "campaign_type": request.campaign_type},
        reasoning=reasoning,
        status=AuditStatus.SUCCESS,
        explainability=f"Created {request.campaign_type} campaign for {len(products)} products with {len(payment_links)} Razorpay payment links. Each link is bounded and gated — no amount can be changed by the buyer."
    )
    await log_audit(audit_entry)

    subject = None
    if request.campaign_type == "email" and "Subject:" in copy:
        lines = copy.split("\n")
        subject = lines[0].replace("Subject:", "").strip()

    return CampaignResult(
        campaign_copy=copy,
        payment_links=payment_links,
        subject=subject,
        reasoning=reasoning,
        audit_trail=audit_trail
    )
