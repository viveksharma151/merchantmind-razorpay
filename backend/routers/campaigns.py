from fastapi import APIRouter
from models import CampaignRequest, CampaignResult
from agents.campaign_agent import run_campaign_agent

router = APIRouter()


@router.post("/create", response_model=CampaignResult)
async def create_campaign(request: CampaignRequest):
    """Orchestrate a marketing campaign with AI copy and Razorpay payment links."""
    return await run_campaign_agent(request)


@router.get("/types")
async def get_campaign_types():
    """List available campaign types."""
    return {
        "types": [
            {"id": "email", "name": "Email Campaign", "description": "Full email with subject and body"},
            {"id": "sms", "name": "SMS Campaign", "description": "160-char SMS with payment link"},
            {"id": "social", "name": "Social Media", "description": "Instagram/Twitter post with hashtags"}
        ]
    }
