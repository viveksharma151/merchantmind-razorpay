from fastapi import APIRouter, Query
from database import get_audit_log, get_audit_stats

router = APIRouter()


@router.get("/log")
async def get_audit_log_endpoint(limit: int = Query(default=50, le=200)):
    """Get full audit log of all agent actions."""
    entries = await get_audit_log(limit)
    return {"total": len(entries), "entries": entries}


@router.get("/stats")
async def get_audit_stats_endpoint():
    """Get audit statistics."""
    return await get_audit_stats()
