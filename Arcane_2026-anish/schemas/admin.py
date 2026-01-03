
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

class AdminBase(BaseModel):
    name: str
    email: EmailStr
    role: Optional[str] = "admin"

class AdminCreate(AdminBase):
    password: str

class AdminResponse(AdminBase):
    admin_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
