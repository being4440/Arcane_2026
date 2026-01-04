
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from db.connection import get_session
from services import feedback_service
from schemas.feedback import FeedbackCreate, FeedbackResponse
from core import deps
from schemas.auth import TokenData

router = APIRouter()
logger = logging.getLogger("app.feedback")

@router.post("/{request_id}/feedback", response_model=FeedbackResponse)
async def create_feedback(
    request_id: int,
    feedback: FeedbackCreate,
    db: AsyncSession = Depends(get_session),
    current_user: TokenData = Depends(deps.require_role(["buyer"]))
):
    logger.info("POST /interactions/%d/feedback by buyer %s rating=%d", request_id, current_user.id, feedback.rating)
    resp = await feedback_service.create_feedback(db, request_id, int(current_user.id), feedback)
    logger.info("Feedback created id=%s for request=%s", resp.feedback_id, request_id)
    return resp

@router.get("/{request_id}/feedback", response_model=FeedbackResponse)
async def get_feedback(
    request_id: int,
    db: AsyncSession = Depends(get_session),
    current_user: TokenData = Depends(deps.require_role(["organization", "buyer", "admin"]))
):
    logger.info("GET /interactions/%d/feedback by user %s", request_id, current_user.id)
    feedback = await feedback_service.get_feedback_for_request(db, request_id)
    if not feedback:
        logger.info("Feedback not found for request %d", request_id)
        raise HTTPException(status_code=404, detail="Feedback not found")
    logger.info("Feedback retrieved id=%s", feedback.feedback_id)
    return feedback

@router.get("/org/feedbacks", response_model=List[FeedbackResponse])
async def get_org_feedbacks(
    db: AsyncSession = Depends(get_session),
    current_user: TokenData = Depends(deps.require_role(["organization"]))
):
    """Return all feedbacks for materials owned by the current organization."""
    logger.info("GET /interactions/org/feedbacks by org %s", current_user.id)
    org_id = int(current_user.id)
    feedbacks = await feedback_service.get_feedbacks_for_organization(db, org_id)
    logger.info("Returned %d feedbacks for org %s", len(feedbacks), org_id)
    return feedbacks
