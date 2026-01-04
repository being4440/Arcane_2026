from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional
from db.connection import get_session
from models.material import Material, MaterialPhoto
from models.organization import Organization

router = APIRouter()

class MaterialCreate(BaseModel):
    title: str
    category: str
    description: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    location: Optional[str] = None
    photo_urls: Optional[List[str]] = []

class MaterialResponse(BaseModel):
    material_id: int
    org_id: int
    title: str
    category: str
    description: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    location: Optional[str] = None
    availability_status: str
    is_blocked: bool
    photos: List[str] = []

@router.get("/", response_model=List[MaterialResponse])
async def get_materials(limit: int = 10, offset: int = 0, db: AsyncSession = Depends(get_session)):
    result = await db.execute(
        select(Material).where(
            Material.availability_status == "available",
            Material.is_blocked == False
        ).limit(limit).offset(offset)
    )
    materials = result.scalars().all()
    
    response = []
    for material in materials:
        photos = await db.execute(select(MaterialPhoto.photo_url).where(MaterialPhoto.material_id == material.material_id))
        photo_urls = photos.scalars().all()
        response.append(MaterialResponse(
            material_id=material.material_id,
            org_id=material.org_id,
            title=material.title,
            category=material.category,
            description=material.description,
            quantity=material.quantity,
            unit=material.unit,
            location=material.location,
            availability_status=material.availability_status,
            is_blocked=material.is_blocked,
            photos=list(photo_urls)
        ))
    return response

@router.get("/{material_id}", response_model=MaterialResponse)
async def get_material(material_id: int, db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Material).where(Material.material_id == material_id))
    material = result.scalar_one_or_none()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    photos = await db.execute(select(MaterialPhoto.photo_url).where(MaterialPhoto.material_id == material_id))
    photo_urls = photos.scalars().all()
    
    return MaterialResponse(
        material_id=material.material_id,
        org_id=material.org_id,
        title=material.title,
        category=material.category,
        description=material.description,
        quantity=material.quantity,
        unit=material.unit,
        location=material.location,
        availability_status=material.availability_status,
        is_blocked=material.is_blocked,
        photos=list(photo_urls)
    )

@router.post("/", response_model=MaterialResponse)
async def create_material(material: MaterialCreate, org_id: int, db: AsyncSession = Depends(get_session)):
    # Verify organization exists
    result = await db.execute(select(Organization).where(Organization.org_id == org_id))
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    db_material = Material(
        org_id=org_id,
        title=material.title,
        category=material.category,
        description=material.description,
        quantity=material.quantity,
        unit=material.unit,
        location=material.location
    )
    db.add(db_material)
    await db.commit()
    await db.refresh(db_material)
    
    # Add photos
    for url in material.photo_urls:
        db_photo = MaterialPhoto(material_id=db_material.material_id, photo_url=url)
        db.add(db_photo)
    await db.commit()
    
    return MaterialResponse(
        material_id=db_material.material_id,
        org_id=db_material.org_id,
        title=db_material.title,
        category=db_material.category,
        description=db_material.description,
        quantity=db_material.quantity,
        unit=db_material.unit,
        location=db_material.location,
        availability_status=db_material.availability_status,
        is_blocked=db_material.is_blocked,
        photos=material.photo_urls
    )

@router.put("/{material_id}")
async def update_material(material_id: int, material: MaterialCreate, org_id: int, db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Material).where(Material.material_id == material_id, Material.org_id == org_id))
    db_material = result.scalar_one_or_none()
    if not db_material:
        raise HTTPException(status_code=404, detail="Material not found or not owned by organization")
    
    db_material.title = material.title
    db_material.category = material.category
    db_material.description = material.description
    db_material.quantity = material.quantity
    db_material.unit = material.unit
    db_material.location = material.location
    
    await db.commit()
    return {"message": "Material updated successfully"}

@router.delete("/{material_id}")
async def delete_material(material_id: int, org_id: int, db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Material).where(Material.material_id == material_id, Material.org_id == org_id))
    db_material = result.scalar_one_or_none()
    if not db_material:
        raise HTTPException(status_code=404, detail="Material not found or not owned by organization")
    
    await db.delete(db_material)
    await db.commit()
    return {"message": "Material deleted successfully"}