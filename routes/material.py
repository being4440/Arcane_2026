from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from pydantic import BaseModel
from models.material import MaterialModel

# --- Pydantic Schemas ---
class MaterialBase(BaseModel):
    name: str
    category: str
    quantity: int
    organization_id: int

class MaterialCreate(MaterialBase):
    pass

class MaterialOut(MaterialBase):
    id: int
    class Config:
        from_attributes = True

# --- Routes ---
router = APIRouter(prefix="/materials", tags=["materials"])

@router.post("/", response_model=MaterialOut)
def create_material(material: MaterialCreate, db: Session = Depends(get_db)):
    new_material = MaterialModel(**material.dict())
    db.add(new_material)
    db.commit()
    db.refresh(new_material)
    return new_material

@router.get("/", response_model=List[MaterialOut])
def get_materials(db: Session = Depends(get_db)):
    return db.query(MaterialModel).all()