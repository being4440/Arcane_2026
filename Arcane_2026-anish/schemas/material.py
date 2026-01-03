
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from decimal import Decimal

class MaterialPhotoBase(BaseModel):
    photo_url: str

class MaterialPhotoResponse(MaterialPhotoBase):
    photo_id: int
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

class MaterialBase(BaseModel):
    title: str
    category: str
    description: Optional[str] = None
    quantity_value: Optional[Decimal] = None
    quantity_unit: Optional[str] = None
    condition: Optional[str] = None

class MaterialCreate(MaterialBase):
    photos: List[str] = []

class MaterialUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    quantity_value: Optional[Decimal] = None
    quantity_unit: Optional[str] = None
    condition: Optional[str] = None
    availability_status: Optional[str] = None

class MaterialResponse(MaterialBase):
    material_id: int
    org_id: int
    availability_status: str
    created_at: datetime
    photos: List[MaterialPhotoResponse] = []
    
    class Config:
        from_attributes = True
