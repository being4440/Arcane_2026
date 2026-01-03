
from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from decimal import Decimal

class RequestCreate(BaseModel):
    requested_quantity: Optional[Decimal] = None
    message: Optional[str] = None

class RequestResponse(BaseModel):
    request_id: int
    material_id: int
    buyer_id: int
    requested_quantity: Optional[Decimal]
    message: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
