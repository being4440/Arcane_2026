
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

class OrganizationBase(BaseModel):
    org_name: str
    org_type: str
    industry_type: Optional[str] = None
    email: EmailStr
    contact_number: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    password: str

class OrganizationUpdate(BaseModel):
    org_name: Optional[str] = None
    industry_type: Optional[str] = None
    email: Optional[EmailStr] = None
    contact_number: Optional[str] = None
    # Add other fields as needed

class OrganizationResponse(OrganizationBase):
    org_id: int
    verification_status: str
    is_blocked: bool
    contact_number: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
