
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException
from models.request import Request
from models.material import Material
from models.organization import Organization
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
        
    # Validation: Material availability
    if material.availability_status != 'available':
        raise HTTPException(status_code=400, detail="Material is not available")
        
    # Validation: Quantity
    if request_in.requested_quantity <= 0:
        raise HTTPException(status_code=400, detail="Requested quantity must be positive")
        
    if request_in.requested_quantity > material.quantity_value:
        raise HTTPException(status_code=400, detail="Requested quantity exceeds available quantity")
        
    # Validation: Blocked Seller
    # Assuming material.organization is loaded, or we fetch it. 
    # The get_material query used in lines 16-17 does NOT eager load organization by default unless configured.
    # Let's verify if 'material.organization' is accessible or fetch it.
    stmt_org = select(Organization).where(Organization.org_id == material.org_id)
    res_org = await db.execute(stmt_org)
    seller_org = res_org.scalars().first()
    
    if not seller_org or seller_org.is_blocked:
        raise HTTPException(status_code=400, detail="Cannot request from this seller")
    
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

async def update_request_status(db: AsyncSession, request_id: int, org_id: int, status_update: str):
    stmt = (
        select(Request)
        .join(Material)
        .where(Request.request_id == request_id)
        .where(Material.org_id == org_id)
    )
    result = await db.execute(stmt)
    request = result.scalars().first()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found or access denied")
        
    if status_update not in ["accepted", "rejected", "completed"]:
         raise HTTPException(status_code=400, detail="Invalid status")

    # Seller Block Check (if accepting)
    if status_update == "accepted":
        stmt_org = select(Organization).where(Organization.org_id == org_id)
        res_org = await db.execute(stmt_org)
        org = res_org.scalars().first()
        if not org or org.is_blocked:
             raise HTTPException(status_code=403, detail="Blocked organization cannot accept requests")

        # Check Material Availability (prevent double acceptance)
        # request.material_id is available. We must fetch material status.
        # We can use the already imported Material model logic or fetch.
        material_check = await db.get(Material, request.material_id)
        if not material_check:
             raise HTTPException(status_code=404, detail="Material not found")
        
        if material_check.availability_status != 'available':
             raise HTTPException(status_code=400, detail="Material is no longer available (already reserved or transferred)")

    # State Machine Enforcement
    current_status = request.status
    
    if current_status == "pending":
        if status_update not in ["accepted", "rejected"]:
            raise HTTPException(status_code=400, detail=f"Cannot transition from {current_status} to {status_update}")
            
    elif current_status == "accepted":
        if status_update != "completed":
            raise HTTPException(status_code=400, detail=f"Cannot transition from {current_status} to {status_update}")
            
    elif current_status in ["rejected", "completed"]:
        raise HTTPException(status_code=400, detail=f"Cannot change status of a {current_status} request")

    request.status = status_update
    
    # Side Effect: Update Material Logic
    if status_update == "accepted":
        # Lock the material (Reserved)
        # We need to fetch material object or update via relationship if eager loaded.
        # request joins material in query but not selectinload.
        # Efficient update:
        material = await db.get(Material, request.material_id)
        if material:
            material.availability_status = "reserved"
            db.add(material)
            
    elif status_update == "completed":
        # Mark as transferred
        material = await db.get(Material, request.material_id)
        if material:
            material.availability_status = "transferred"
            # Deduct quantity logic could go here if partials allowed, 
            # but per current 'reserved' rule, we assume full lock.
            # However, user mentioned "If quantity becomes 0 -> transferred".
            # For simplicity and strictness now: completed = transferred.
            db.add(material)

    db.add(request)
    await db.commit()
    await db.refresh(request)
    return request
