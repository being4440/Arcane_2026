from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from pydantic import BaseModel
from models.organization import OrganizationModel

# --- Pydantic Schemas ---
class OrganizationBase(BaseModel):
    name: str
    description: str | None = None
    email: str
    phone: str | None = None

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationOut(OrganizationBase):
    id: int
    class Config:
        from_attributes = True

# --- Routes ---
router = APIRouter(prefix="/organizations", tags=["organizations"])

@router.post("/", response_model=OrganizationOut, status_code=status.HTTP_201_CREATED)
def create_organization(org: OrganizationCreate, db: Session = Depends(get_db)):
    new_org = OrganizationModel(**org.dict())
    db.add(new_org)
    db.commit()
    db.refresh(new_org)
    return new_org

@router.get("/", response_model=List[OrganizationOut])
def get_organizations(db: Session = Depends(get_db)):
    return db.query(OrganizationModel).all()

@router.get("/{org_id}", response_model=OrganizationOut)
def get_organization(org_id: int, db: Session = Depends(get_db)):
    org = db.query(OrganizationModel).filter(OrganizationModel.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org

@router.delete("/{org_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_organization(org_id: int, db: Session = Depends(get_db)):
    org = db.query(OrganizationModel).filter(OrganizationModel.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    db.delete(org)
    db.commit()