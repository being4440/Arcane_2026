
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from models.report import SellerReport
from models.request import Request
from schemas.report import ReportCreate

async def create_report(db: AsyncSession, request_id: int, org_id: int, report_in: ReportCreate):
    # Verify request exists and belongs to org (via material)
    # We need to join with material to check org_id
    from models.material import Material
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
        
    db_obj = SellerReport(
        request_id=request_id,
        buyer_id=request.buyer_id,
        org_id=org_id,
        reason=report_in.reason,
        description=report_in.description
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def get_org_reports(db: AsyncSession, org_id: int):
    stmt = select(SellerReport).where(SellerReport.org_id == org_id)
    result = await db.execute(stmt)
    return result.scalars().all()
