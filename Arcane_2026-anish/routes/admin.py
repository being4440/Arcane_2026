
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from db.connection import get_session
from services import stats_service
from schemas.analytics import ImpactStats, ActivityStats
from core import deps
from schemas.auth import TokenData

router = APIRouter()

@router.post("/orgs/{org_id}/block")
async def block_organization(
    org_id: int,
    db: AsyncSession = Depends(get_session),
    current_user: TokenData = Depends(deps.require_role(["admin"]))
):
    await stats_service.block_org(db, org_id)
    return {"status": "success", "message": "Organization blocked"}

@router.post("/orgs/{org_id}/unblock")
async def unblock_organization(
    org_id: int,
    db: AsyncSession = Depends(get_session),
    current_user: TokenData = Depends(deps.require_role(["admin"]))
):
    await stats_service.unblock_org(db, org_id)
    return {"status": "success", "message": "Organization unblocked"}

@router.get("/analytics/impact", response_model=ImpactStats)
async def get_impact_analytics(
    db: AsyncSession = Depends(get_session),
    current_user: TokenData = Depends(deps.require_role(["admin"]))
):
    return await stats_service.get_impact_stats(db)

@router.get("/analytics/activity", response_model=ActivityStats)
async def get_activity_analytics(
    db: AsyncSession = Depends(get_session),
    current_user: TokenData = Depends(deps.require_role(["admin"]))
):
    return await stats_service.get_activity_stats(db)
