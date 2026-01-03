
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from db.connection import get_session
from services import feedback_service
from schemas.feedback import FeedbackCreate, FeedbackResponse
from core import deps
from schemas.auth import TokenData

router = APIRouter()

@router.post("/{request_id}/feedback", response_model=FeedbackResponse)
async def create_feedback(
    request_id: int,
    feedback: FeedbackCreate,
    db: AsyncSession = Depends(get_session),
    current_user: TokenData = Depends(deps.require_role(["buyer"]))
):
    return await feedback_service.create_feedback(db, request_id, int(current_user.id), feedback)

@router.get("/{request_id}/feedback", response_model=FeedbackResponse)
async def get_feedback(
    request_id: int,
    db: AsyncSession = Depends(get_session),
    current_user: TokenData = Depends(deps.require_role(["organization", "buyer", "admin"]))
):
    feedback = await feedback_service.get_feedback_for_request(db, request_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return feedback
