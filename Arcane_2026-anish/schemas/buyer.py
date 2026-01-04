
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

class BuyerBase(BaseModel):
    name: str
    email: EmailStr
    city: Optional[str] = None
    phone: Optional[str] = None

class BuyerCreate(BuyerBase):
    password: str

class BuyerResponse(BuyerBase):
    buyer_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class BuyerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    city: Optional[str] = None
    phone: Optional[str] = None
