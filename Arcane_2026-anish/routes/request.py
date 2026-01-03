
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from db.connection import get_session
from services import request_service
from schemas.request import RequestCreate, RequestResponse, RequestUpdateStatus
from core import deps
from schemas.auth import TokenData

router = APIRouter()

@router.post("/materials/{material_id}/request", response_model=RequestResponse)
async def create_request(
    material_id: int,
    request_in: RequestCreate,
    db: AsyncSession = Depends(get_session),
    current_user: TokenData = Depends(deps.require_role(["buyer"]))
):
    return await request_service.create_request(db, material_id, int(current_user.id), request_in)

@router.get("/org/materials/{material_id}/requests", response_model=List[RequestResponse])
async def view_requests(
    material_id: int,
    db: AsyncSession = Depends(get_session),
    current_user: TokenData = Depends(deps.require_role(["organization"]))
):
    requests = await request_service.get_requests_for_material(db, material_id, int(current_user.id))
    return requests

@router.post("/materials/{material_id}/mark-transferred")
async def mark_transferred(
    material_id: int,
    db: AsyncSession = Depends(get_session),
    current_user: TokenData = Depends(deps.require_role(["organization"]))
):
    await request_service.mark_transferred(db, material_id, int(current_user.id))
    return {"status": "success", "message": "Material marked as transferred"}

@router.put("/requests/{request_id}/status", response_model=RequestResponse)
async def update_request_status(
    request_id: int,
    status_update: RequestUpdateStatus,
    db: AsyncSession = Depends(get_session),
    current_user: TokenData = Depends(deps.require_role(["organization"]))
):
    return await request_service.update_request_status(db, request_id, int(current_user.id), status_update.status)
