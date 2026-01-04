
from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from decimal import Decimal

class RequestCreate(BaseModel):
    requested_quantity: Optional[Decimal] = None
    message: Optional[str] = None

class RequestUpdateStatus(BaseModel):
    status: str

class RequestResponse(BaseModel):
    request_id: int
    material_id: int
    buyer_id: int
    requested_quantity: Optional[Decimal]
    message: Optional[str]
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class OrgRequestItem(BaseModel):
    request_id: int
    material_id: int
    material_title: Optional[str]
    buyer_id: int
    buyer_name: Optional[str]
    buyer_email: Optional[str]
    requested_quantity: Optional[Decimal]
    message: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
