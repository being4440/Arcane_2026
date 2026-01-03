from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/organizations", tags=["organizations"])

class Organization(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = None
    email: str
    phone: Optional[str] = None

class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

# Mock database
organizations_db: List[Organization] = []

@router.get("/", response_model=List[Organization])
async def get_organizations():
    """Get all organizations"""
    return organizations_db

@router.get("/{org_id}", response_model=Organization)
async def get_organization(org_id: int):
    """Get a specific organization"""
    org = next((o for o in organizations_db if o.id == org_id), None)
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    return org

@router.post("/", response_model=Organization, status_code=status.HTTP_201_CREATED)
async def create_organization(org: Organization):
    """Create a new organization"""
    org.id = len(organizations_db) + 1
    organizations_db.append(org)
    return org

@router.put("/{org_id}", response_model=Organization)
async def update_organization(org_id: int, org_update: OrganizationUpdate):
    """Update an organization"""
    org = next((o for o in organizations_db if o.id == org_id), None)
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    
    update_data = org_update.dict(exclude_unset=True)
    updated_org = org.copy(update={**org.dict(), **update_data})
    return updated_org

@router.delete("/{org_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_organization(org_id: int):
    """Delete an organization"""
    global organizations_db
    organizations_db = [o for o in organizations_db if o.id != org_id]