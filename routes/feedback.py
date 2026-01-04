from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from db.connection import get_session
from models.request import Request, RequestFeedback
from models.buyer import Buyer

router = APIRouter()

class FeedbackCreate(BaseModel):
    rating: int
    comment: Optional[str] = None

class FeedbackResponse(BaseModel):
    feedback_id: int
    request_id: int
    rating: Optional[int] = None
    comment: Optional[str] = None
    created_at: datetime

@router.post("/{request_id}/feedback", response_model=FeedbackResponse)
async def create_feedback(request_id: int, feedback: FeedbackCreate, buyer_id: int, db: AsyncSession = Depends(get_session)):
    # Verify request exists and belongs to buyer
    result = await db.execute(select(Request).where(Request.request_id == request_id, Request.buyer_id == buyer_id))
    db_request = result.scalar_one_or_none()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found or not owned by buyer")
    
    # Check if feedback already exists
    result = await db.execute(select(RequestFeedback).where(RequestFeedback.request_id == request_id))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Feedback already exists for this request")
    
    db_feedback = RequestFeedback(
        request_id=request_id,
        rating=feedback.rating,
        comment=feedback.comment
    )
    db.add(db_feedback)
    await db.commit()
    await db.refresh(db_feedback)
    
    return FeedbackResponse(
        feedback_id=db_feedback.feedback_id,
        request_id=db_feedback.request_id,
        rating=db_feedback.rating,
        comment=db_feedback.comment,
        created_at=db_feedback.created_at
    )

@router.get("/{request_id}/feedback", response_model=List[FeedbackResponse])
async def get_feedback_for_request(request_id: int, db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(RequestFeedback).where(RequestFeedback.request_id == request_id))
    feedbacks = result.scalars().all()
    return [
        FeedbackResponse(
            feedback_id=f.feedback_id,
            request_id=f.request_id,
            rating=f.rating,
            comment=f.comment,
            created_at=f.created_at
        ) for f in feedbacks
    ]