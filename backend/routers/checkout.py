from fastapi import APIRouter
from models import CheckoutRequest, CheckoutResult, UpsellRequest, UpsellResult
from agents.checkout_agent import run_checkout_agent
from agents.upsell_agent import run_upsell_agent
from razorpay_client import get_config

router = APIRouter()


@router.post("/chat", response_model=CheckoutResult)
async def conversational_checkout(request: CheckoutRequest):
    """Conversational checkout: natural language to Razorpay order."""
    return await run_checkout_agent(request)


@router.post("/upsell", response_model=UpsellResult)
async def get_upsell(request: UpsellRequest):
    """Get AI-powered upsell recommendations."""
    return await run_upsell_agent(request)


@router.get("/config")
async def get_razorpay_config():
    """Get Razorpay frontend config."""
    return get_config()
