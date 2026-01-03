
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from models.feedback import RequestFeedback
from models.request import Request
from schemas.feedback import FeedbackCreate

async def create_feedback(db: AsyncSession, request_id: int, buyer_id: int, feedback_in: FeedbackCreate):
    # Verify request exists and belongs to buyer
    result = await db.execute(select(Request).where(Request.request_id == request_id, Request.buyer_id == buyer_id))
    request = result.scalars().first()
    
    # Validating Business Rule: Feedback allowed only if request.status = 'completed'
    if request.status != "completed":
        raise HTTPException(status_code=400, detail="Feedback can only be submitted for completed requests")

    # Check if feedback already exists
    stmt = select(RequestFeedback).where(RequestFeedback.request_id == request_id)
    res = await db.execute(stmt)
    if res.scalars().first():
         raise HTTPException(status_code=400, detail="Feedback already submitted for this request")

    # Get Organization ID from material (via request -> material -> org)
    # Since we need Org ID, let's fetch request with material
    # Or simpler: we pass org_id or fetch it. The table needs org_id.
    
    # Re-fetch request with material to get org_id
    from sqlalchemy.orm import selectinload
    stmt = select(Request).options(selectinload(Request.material)).where(Request.request_id == request_id)
    result = await db.execute(stmt)
    request = result.scalars().first()
    
    org_id = request.material.org_id
        
    db_obj = RequestFeedback(
        request_id=request_id,
        buyer_id=buyer_id,
        org_id=org_id,
        rating=feedback_in.rating,
        comment=feedback_in.comment
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def get_feedback_for_request(db: AsyncSession, request_id: int):
    stmt = select(RequestFeedback).where(RequestFeedback.request_id == request_id)
    result = await db.execute(stmt)
    return result.scalars().first()
