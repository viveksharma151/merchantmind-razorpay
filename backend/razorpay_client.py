import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

MOCK_MODE = not (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET and RAZORPAY_KEY_ID != "rzp_test_your_key_here")


def _get_client():
    if MOCK_MODE:
        return None
    import razorpay
    return razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))


def create_order(amount: float, currency: str = "INR", receipt: str = "", notes: dict = {}) -> dict:
    """Create a Razorpay order. Falls back to mock if no API keys."""
    amount_paise = int(amount * 100)
    if MOCK_MODE:
        return {
            "id": f"order_mock_{datetime.utcnow().strftime('%H%M%S%f')[:12]}",
            "amount": amount_paise,
            "amount_due": amount_paise,
            "currency": currency,
            "receipt": receipt,
            "status": "created",
            "notes": notes,
            "mock": True,
            "created_at": int(datetime.utcnow().timestamp())
        }
    client = _get_client()
    order = client.order.create({
        "amount": amount_paise,
        "currency": currency,
        "receipt": receipt,
        "notes": notes
    })
    return dict(order)


def create_payment_link(amount: float, description: str, product_name: str = "") -> dict:
    """Create a Razorpay payment link. Falls back to mock if no API keys."""
    amount_paise = int(amount * 100)
    suffix = datetime.utcnow().strftime('%H%M%S')
    if MOCK_MODE:
        return {
            "id": f"plink_mock_{suffix}",
            "short_url": f"https://rzp.io/l/mock{suffix}",
            "amount": amount_paise,
            "description": description,
            "status": "created",
            "mock": True
        }
    client = _get_client()
    link = client.payment_link.create({
        "amount": amount_paise,
        "currency": "INR",
        "description": description,
        "notify": {"sms": True, "email": True}
    })
    return dict(link)


def get_config() -> dict:
    return {
        "key_id": RAZORPAY_KEY_ID if not MOCK_MODE else "rzp_test_demo",
        "mock_mode": MOCK_MODE
    }
