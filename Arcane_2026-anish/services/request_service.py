
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException
from models.request import Request
from models.material import Material
from schemas.request import RequestCreate

async def create_request(
    db: AsyncSession, 
    material_id: int, 
    buyer_id: int, 
    request_in: RequestCreate
):
    res = await db.execute(select(Material).where(Material.material_id == material_id))
    material = res.scalars().first()
    
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
        
    if material.availability_status != 'available':
        raise HTTPException(status_code=400, detail="Material is not available")
    
    stmt = select(Request).where(Request.material_id == material_id, Request.buyer_id == buyer_id)
    existing = await db.execute(stmt)
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="You have already requested this material")
        
    db_obj = Request(
        material_id=material_id,
        buyer_id=buyer_id,
        requested_quantity=request_in.requested_quantity,
        message=request_in.message
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def get_requests_for_material(db: AsyncSession, material_id: int, org_id: int):
    res = await db.execute(select(Material).where(Material.material_id == material_id, Material.org_id == org_id))
    material = res.scalars().first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found or access denied")
        
    stmt = (
        select(Request)
        .options(selectinload(Request.buyer))
        .where(Request.material_id == material_id)
        .order_by(Request.created_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()

async def mark_transferred(db: AsyncSession, material_id: int, org_id: int):
    stmt = select(Material).where(Material.material_id == material_id, Material.org_id == org_id)
    result = await db.execute(stmt)
    material = result.scalars().first()
    
    if not material:
         raise HTTPException(status_code=404, detail="Material not found or access denied")
         
    material.availability_status = "transferred"
    db.add(material)
    await db.commit()
    await db.refresh(material)
    return material
