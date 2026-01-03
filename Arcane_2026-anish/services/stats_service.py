
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from models.material import Material
from models.organization import Organization
from models.request import Request

async def block_org(db: AsyncSession, org_id: int):
    stmt = select(Organization).where(Organization.org_id == org_id)
    result = await db.execute(stmt)
    org = result.scalars().first()
    if org:
        org.is_blocked = True
        db.add(org)
        await db.commit()
    return org

async def unblock_org(db: AsyncSession, org_id: int):
    stmt = select(Organization).where(Organization.org_id == org_id)
    result = await db.execute(stmt)
    org = result.scalars().first()
    if org:
        org.is_blocked = False
        db.add(org)
        await db.commit()
    return org

async def get_impact_stats(db: AsyncSession):
    res_total = await db.execute(select(func.count(Material.material_id)))
    total_listed = res_total.scalar() or 0
    
    res_transferred = await db.execute(select(func.count(Material.material_id)).where(Material.availability_status == 'transferred'))
    total_transferred = res_transferred.scalar() or 0
    
    stmt_waste = select(func.sum(Material.quantity_value)).where(Material.availability_status == 'transferred')
    res_waste = await db.execute(stmt_waste)
    waste_kg = float(res_waste.scalar() or 0)
    
    stmt_materials = select(Material).where(Material.availability_status == 'transferred')
    result = await db.execute(stmt_materials)
    transferred_materials = result.scalars().all()
    
    co2_saved = 0.0
    for m in transferred_materials:
        qty = float(m.quantity_value or 0)
        cat = (m.category or "").lower()
        factor = 1.5
        if "metal" in cat:
            factor = 1.8
        elif "plastic" in cat:
            factor = 2.5
        co2_saved += qty * factor
        
    return {
        "total_materials_listed": total_listed,
        "total_materials_transferred": total_transferred,
        "waste_diverted_kg": round(waste_kg, 2),
        "co2_reduction_kg": round(co2_saved, 2)
    }

async def get_activity_stats(db: AsyncSession):
    res_requests = await db.execute(select(func.count(Request.request_id)))
    total_requests = res_requests.scalar() or 0
    
    res_transfers = await db.execute(select(func.count(Material.material_id)).where(Material.availability_status == 'transferred'))
    total_transfers = res_transfers.scalar() or 0
    
    ratio = 0.0
    if total_requests > 0:
        ratio = total_transfers / total_requests
        
    stmt_org = (
        select(Organization.org_name, func.count(Request.request_id))
        .join(Material, Material.org_id == Organization.org_id)
        .join(Request, Request.material_id == Material.material_id)
        .group_by(Organization.org_name)
        .limit(10)
    )
    res_org = await db.execute(stmt_org)
    requests_per_org = [{"org": r[0], "count": r[1]} for r in res_org.all()]
    
    return {
        "requests_per_org": requests_per_org,
        "requests_per_material": [],
        "conversion_ratio": round(ratio, 2)
    }
