
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from models.feedback import RequestFeedback
from models.request import Request
from schemas.feedback import FeedbackCreate

logger = logging.getLogger("app.feedback_service")

async def create_feedback(db: AsyncSession, request_id: int, buyer_id: int, feedback_in: FeedbackCreate):
    # Verify request exists and belongs to buyer
    logger.debug("create_feedback: validating request %s buyer %s", request_id, buyer_id)
    result = await db.execute(select(Request).where(Request.request_id == request_id, Request.buyer_id == buyer_id))
    request = result.scalars().first()
    
    if not request:
        logger.warning("create_feedback: request %s not found or access denied for buyer %s", request_id, buyer_id)
        raise HTTPException(status_code=404, detail="Request not found or access denied")
    
    # Validating Business Rule: Feedback allowed only if request.status = 'completed'
    if request.status != "completed":
        logger.info("create_feedback: request %s status=%s (not completed) for buyer %s", request_id, request.status, buyer_id)
        raise HTTPException(status_code=400, detail="Feedback can only be submitted for completed requests")

    # Check if feedback already exists
    stmt = select(RequestFeedback).where(RequestFeedback.request_id == request_id)
    res = await db.execute(stmt)
    if res.scalars().first():
        logger.info("create_feedback: duplicate feedback prevented for request %s", request_id)
        raise HTTPException(status_code=400, detail="Feedback already submitted for this request")

    # Get Organization ID from material (via request -> material -> org)
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
    logger.info("create_feedback: inserted id=%s request=%s buyer=%s rating=%d", db_obj.feedback_id, request_id, buyer_id, feedback_in.rating)
    return db_obj

async def get_feedback_for_request(db: AsyncSession, request_id: int):
    logger.debug("get_feedback_for_request: fetching for request %s", request_id)
    stmt = select(RequestFeedback).where(RequestFeedback.request_id == request_id)
    result = await db.execute(stmt)
    feedback = result.scalars().first()
    if feedback:
        logger.info("get_feedback_for_request: found feedback id=%s", feedback.feedback_id)
    return feedback

async def get_feedbacks_for_organization(db: AsyncSession, org_id: int):
    """Fetch all feedbacks for materials owned by the organization."""
    logger.debug("get_feedbacks_for_organization: fetching for org %s", org_id)
    stmt = select(RequestFeedback).where(RequestFeedback.org_id == org_id).order_by(RequestFeedback.created_at.desc())
    result = await db.execute(stmt)
    feedbacks = result.scalars().all()
    logger.info("get_feedbacks_for_organization: found %d feedbacks for org %s", len(feedbacks), org_id)
    return feedbacks
