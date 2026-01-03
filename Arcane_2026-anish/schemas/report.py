
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class ReportCreate(BaseModel):
    reason: str
    description: Optional[str] = None

class ReportResponse(BaseModel):
    report_id: int
    request_id: Optional[int]
    buyer_id: int
    org_id: int
    reason: str
    description: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
