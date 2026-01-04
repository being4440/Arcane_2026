
from typing import List
import logging
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select
from models.material import Material
from models.request import Request

from db.connection import get_session
from services import request_service
from schemas.request import RequestCreate, RequestResponse, RequestUpdateStatus, OrgRequestItem
from core import deps
from schemas.auth import TokenData

router = APIRouter()
logger = logging.getLogger("app.request")

@router.post("/materials/{material_id}/request", response_model=RequestResponse)
async def create_request(
    material_id: int,
    request_in: RequestCreate,
    db: AsyncSession = Depends(get_session),
    current_user: TokenData = Depends(deps.require_role(["buyer"]))
):
    logger.info("POST /interactions/materials/%s/request hit by user %s", material_id, getattr(current_user, 'id', None))
    resp = await request_service.create_request(db, material_id, int(current_user.id), request_in)
    logger.info("Request created id=%s material=%s buyer=%s status=%s", getattr(resp, 'request_id', None), material_id, getattr(resp, 'buyer_id', None), getattr(resp, 'status', None))
    return resp

@router.get("/org/materials/{material_id}/requests", response_model=List[RequestResponse])
async def view_requests(
    material_id: int,
    db: AsyncSession = Depends(get_session),
    current_user: TokenData = Depends(deps.require_role(["organization"]))
):
    requests = await request_service.get_requests_for_material(db, material_id, int(current_user.id))
    return requests

@router.get("/debug/eth_requests")
async def debug_eth_requests(db: AsyncSession = Depends(get_session)):
    """DEV: Return requests for materials with title like 'ethyl alcohol' for debugging."""
    stmt = (
        select(Material)
        .where(Material.title.ilike('%ethyl alcohol%'))
        .options(selectinload(Material.requests).selectinload(Request.buyer))
    )
    res = await db.execute(stmt)
    mats = res.scalars().all()
    out = []
    for m in mats:
        for r in m.requests:
            out.append({
                'material_id': m.material_id,
                'material_title': m.title,
                'request_id': r.request_id,
                'buyer_id': r.buyer_id,
                'buyer_name': getattr(r.buyer, 'name', None),
                'requested_quantity': float(r.requested_quantity) if r.requested_quantity is not None else None,
                'message': r.message,
                'status': r.status,
                'created_at': r.created_at.isoformat() if r.created_at else None
            })
    return out

@router.get("/org/requests", response_model=List[OrgRequestItem])
async def view_org_requests(
    db: AsyncSession = Depends(get_session),
    current_user: TokenData = Depends(deps.require_role(["organization"]))
):
    """Return all requests for materials owned by the current organization.

    The returned objects include buyer info and material title so the frontend
    can render an interactive pending-requests list.
    """
    logger.info("GET /interactions/org/requests hit by org %s", getattr(current_user, 'id', None))
    org_id = int(current_user.id)
    requests = await request_service.get_requests_for_organization(db, org_id)
    logger.info("Returned %d requests for org %s", len(requests), org_id)
    return requests

@router.post("/materials/{material_id}/mark-transferred")
async def mark_transferred(
    material_id: int,
    db: AsyncSession = Depends(get_session),
    current_user: TokenData = Depends(deps.require_role(["organization"]))
):
    logger.info("POST /interactions/materials/%s/mark-transferred by org %s", material_id, getattr(current_user, 'id', None))
    res = await request_service.mark_transferred(db, material_id, int(current_user.id))
    logger.info("Material %s marked transferred (org=%s)", material_id, getattr(current_user, 'id', None))
    return {"status": "success", "message": "Material marked as transferred", "material": getattr(res, 'material_id', None)}

@router.put("/requests/{request_id}/status", response_model=RequestResponse)
async def update_request_status(
    request_id: int,
    status_update: RequestUpdateStatus,
    db: AsyncSession = Depends(get_session),
    current_user: TokenData = Depends(deps.require_role(["organization"]))
):
    logger.info("PUT /interactions/requests/%s/status by org %s -> %s", request_id, getattr(current_user, 'id', None), status_update.status)
    resp = await request_service.update_request_status(db, request_id, int(current_user.id), status_update.status)
    logger.info("Request %s updated to %s", request_id, getattr(resp, 'status', None))
    return resp
