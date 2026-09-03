from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routers import checkout, catalog, campaigns, audit
from database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title="AI Growth & Agentic Commerce",
    description="Razorpay Buildathon Track 01 - AI agent that grows merchant revenue",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(checkout.router, prefix="/api/checkout", tags=["Checkout Agent"])
app.include_router(catalog.router, prefix="/api/catalog", tags=["Catalog Agent"])
app.include_router(campaigns.router, prefix="/api/campaigns", tags=["Campaign Agent"])
app.include_router(audit.router, prefix="/api/audit", tags=["Audit Trail"])

@app.get("/")
async def root():
    return {
        "project": "AI Growth & Agentic Commerce",
        "track": "Track 01 - Razorpay Buildathon 2026",
        "agents": [
            "checkout_agent - Conversational in-app checkout",
            "upsell_agent - Upsell & cross-sell recommendations",
            "campaign_agent - Campaign orchestrator with payment links",
            "catalog_agent - Agent-readable product catalog"
        ],
        "status": "operational",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "version": "1.0.0"}
