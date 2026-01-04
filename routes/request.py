from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from db.connection import get_session
from models.request import Request, RequestFeedback
from models.material import Material
from models.buyer import Buyer
from models.organization import Organization

router = APIRouter()

class RequestCreate(BaseModel):
    material_id: int
    buyer_id: int
    message: Optional[str] = None

class RequestResponse(BaseModel):
    request_id: int
    material_id: int
    buyer_id: int
    status: str
    message: Optional[str] = None
    created_at: datetime

@router.post("/materials/{material_id}/request", response_model=RequestResponse)
async def create_request(material_id: int, request: RequestCreate, db: AsyncSession = Depends(get_session)):
    # Verify material exists
    result = await db.execute(select(Material).where(Material.material_id == material_id))
    material = result.scalar_one_or_none()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    # Verify buyer exists
    result = await db.execute(select(Buyer).where(Buyer.buyer_id == request.buyer_id))
    buyer = result.scalar_one_or_none()
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer not found")
    
    # Check if request already exists
    result = await db.execute(
        select(Request).where(
            Request.material_id == material_id,
            Request.buyer_id == request.buyer_id
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Request already exists")
    
    db_request = Request(
        material_id=material_id,
        buyer_id=request.buyer_id,
        message=request.message
    )
    db.add(db_request)
    await db.commit()
    await db.refresh(db_request)
    
    return RequestResponse(
        request_id=db_request.request_id,
        material_id=db_request.material_id,
        buyer_id=db_request.buyer_id,
        status=db_request.status,
        message=db_request.message,
        created_at=db_request.created_at
    )

@router.get("/org/materials/{material_id}/requests", response_model=List[RequestResponse])
async def get_requests_for_material(material_id: int, db: AsyncSession = Depends(get_session)):
    result = await db.execute(
        select(Request).where(Request.material_id == material_id).order_by(Request.created_at.desc())
    )
    requests = result.scalars().all()
    return [
        RequestResponse(
            request_id=r.request_id,
            material_id=r.material_id,
            buyer_id=r.buyer_id,
            status=r.status,
            message=r.message,
            created_at=r.created_at
        ) for r in requests
    ]

@router.get("/org/requests", response_model=List[RequestResponse])
async def get_requests_for_organization(org_id: int, db: AsyncSession = Depends(get_session)):
    result = await db.execute(
        select(Request).join(Material).where(Material.org_id == org_id).order_by(Request.created_at.desc())
    )
    requests = result.scalars().all()
    return [
        RequestResponse(
            request_id=r.request_id,
            material_id=r.material_id,
            buyer_id=r.buyer_id,
            status=r.status,
            message=r.message,
            created_at=r.created_at
        ) for r in requests
    ]

@router.put("/requests/{request_id}/status")
async def update_request_status(request_id: int, status: str, org_id: int, db: AsyncSession = Depends(get_session)):
    result = await db.execute(
        select(Request).join(Material).where(
            Request.request_id == request_id,
            Material.org_id == org_id
        )
    )
    db_request = result.scalar_one_or_none()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    db_request.status = status
    if status in ["accepted", "rejected"]:
        db_request.material.availability_status = "requested"
    
    await db.commit()
    return {"message": "Request status updated successfully"}

@router.post("/materials/{material_id}/mark-transferred")
async def mark_transferred(material_id: int, db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Material).where(Material.material_id == material_id))
    material = result.scalar_one_or_none()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    material.availability_status = "transferred"
    await db.commit()
    return {"message": "Material marked as transferred"}