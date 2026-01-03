
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from db.connection import get_session
from services import report_service
from schemas.report import ReportCreate, ReportResponse
from core import deps
from schemas.auth import TokenData

router = APIRouter()

@router.post("/requests/{request_id}/report", response_model=ReportResponse)
async def create_report(
    request_id: int,
    report: ReportCreate,
    db: AsyncSession = Depends(get_session),
    current_user: TokenData = Depends(deps.require_role(["organization"]))
):
    return await report_service.create_report(db, request_id, int(current_user.id), report)

@router.get("/org/reports", response_model=List[ReportResponse])
async def get_my_reports(
    db: AsyncSession = Depends(get_session),
    current_user: TokenData = Depends(deps.require_role(["organization"]))
):
    return await report_service.get_org_reports(db, int(current_user.id))
