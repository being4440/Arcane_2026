
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class FeedbackCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating between 1 and 5")
    comment: Optional[str] = None

class FeedbackResponse(BaseModel):
    feedback_id: int
    request_id: int
    buyer_id: int
    org_id: int
    rating: int
    comment: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
