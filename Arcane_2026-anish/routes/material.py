
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from db.connection import get_session
from services import material_service
from schemas.material import MaterialResponse, MaterialCreate, MaterialUpdate
from core import deps
from schemas.auth import TokenData

router = APIRouter()

@router.post("/", response_model=MaterialResponse)
async def create_new_material(
    material: MaterialCreate,
    db: AsyncSession = Depends(get_session),
    current_user: TokenData = Depends(deps.require_role(["organization"]))
):
    return await material_service.create_material(db, material, int(current_user.id))

@router.get("/", response_model=List[MaterialResponse])
async def read_materials(
    category: Optional[str] = None,
    city: Optional[str] = None,
    q: Optional[str] = None,
    industry: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_session)
):
    materials = await material_service.get_materials(db, category, city, q, industry, skip, limit)
    
    results = []
    for m in materials:
        m_resp = MaterialResponse.model_validate(m)
        m_resp.org_id = m.org_id # Ensure IDs are set
        if m.organization and m.organization.location:
             pass # Logic inside service or here often simpler. Service returns ORM objects.
        results.append(m_resp)
        
    return results

@router.get("/{material_id}", response_model=MaterialResponse)
async def read_material(
    material_id: int,
    db: AsyncSession = Depends(get_session)
):
    material = await material_service.get_material(db, material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return material

@router.put("/{material_id}", response_model=MaterialResponse)
async def update_material(
    material_id: int,
    material_in: MaterialUpdate,
    db: AsyncSession = Depends(get_session),
    current_user: TokenData = Depends(deps.require_role(["organization"]))
):
    material = await material_service.update_material(db, material_id, material_in, int(current_user.id))
    if not material:
        raise HTTPException(status_code=404, detail="Material not found or access denied")
    return material

@router.delete("/{material_id}")
async def delete_material(
    material_id: int,
    db: AsyncSession = Depends(get_session),
    current_user: TokenData = Depends(deps.require_role(["organization"]))
):
    success = await material_service.delete_material(db, material_id, int(current_user.id))
    if not success:
         raise HTTPException(status_code=404, detail="Material not found or access denied")
    return {"status": "success", "message": "Material deleted"}
