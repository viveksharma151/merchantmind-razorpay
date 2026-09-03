from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from datetime import datetime
from enum import Enum


class CheckoutRequest(BaseModel):
    message: str = Field(..., description="Natural language checkout request")
    customer_name: str = Field(default="Demo Customer")
    customer_email: str = Field(default="demo@example.com")
    customer_phone: str = Field(default="9999999999")


class Product(BaseModel):
    id: str
    name: str
    category: str
    price: float
    description: str
    image: str
    tags: List[str]
    stock: int
    rating: float


class CheckoutResult(BaseModel):
    success: bool
    message: str
    product: Optional[Dict] = None
    order: Optional[Dict] = None
    upsell_prompt: Optional[str] = None
    audit_trail: List[Dict] = []


class UpsellRequest(BaseModel):
    product_id: str
    customer_history: Optional[List[str]] = []


class UpsellResult(BaseModel):
    suggestions: List[Dict]
    reasoning: str
    audit_trail: List[Dict] = []


class CatalogQuery(BaseModel):
    query: str


class CatalogResult(BaseModel):
    products: List[Dict]
    explanation: str
    total_found: int


class CampaignRequest(BaseModel):
    product_ids: List[str]
    campaign_type: str = Field(..., description="email | sms | social")
    target_audience: str = Field(default="general")


class CampaignResult(BaseModel):
    campaign_copy: str
    payment_links: List[Dict]
    subject: Optional[str] = None
    reasoning: str
    audit_trail: List[Dict] = []


class AuditStatus(str, Enum):
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    PARTIAL = "PARTIAL"


class AuditEntry(BaseModel):
    agent: str
    action: str
    input_data: Dict[str, Any]
    output_data: Dict[str, Any]
    reasoning: str
    status: AuditStatus
    explainability: str
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)
