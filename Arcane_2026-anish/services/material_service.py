
from typing import List, Optional
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from models.material import Material
from models.material_photo import MaterialPhoto
from models.organization import Organization
from models.location import Location
from schemas.material import MaterialCreate, MaterialUpdate

async def create_material(db: AsyncSession, material_in: MaterialCreate, org_id: int):
    # Check if Organization is blocked
    stmt = select(Organization).where(Organization.org_id == org_id)
    res = await db.execute(stmt)
    org = res.scalars().first()
    
    if not org or org.is_blocked:
        raise HTTPException(status_code=403, detail="Organization is blocked or not found")

    db_obj = Material(
        org_id=org_id,
        title=material_in.title,
        category=material_in.category,
        description=material_in.description,
        quantity_value=material_in.quantity_value,
        quantity_unit=material_in.quantity_unit,
        condition=material_in.condition,
        availability_status="available",
        available_quantity=material_in.quantity_value
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    
    if material_in.photos:
        for url in material_in.photos:
            photo = MaterialPhoto(material_id=db_obj.material_id, photo_url=url)
            db.add(photo)
        await db.commit()
        
    return await get_material(db, db_obj.material_id)

async def get_material(db: AsyncSession, material_id: int):
    stmt = (
        select(Material)
        .options(selectinload(Material.photos)) # Add org load if needed
        .where(Material.material_id == material_id)
    )
    result = await db.execute(stmt)
    return result.scalars().first()

async def get_materials(
    db: AsyncSession, 
    category: Optional[str] = None, 
    city: Optional[str] = None, 
    q: Optional[str] = None,
    industry: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100
):
    stmt = (
        select(Material)
        .join(Material.organization)
        .outerjoin(Organization.location)
        .options(selectinload(Material.photos), selectinload(Material.organization).selectinload(Organization.location))
        .where(Material.availability_status == 'available')
        .where(Organization.is_blocked == False)
    )
    
    if category:
        stmt = stmt.where(Material.category == category)
    
    if city:
        stmt = stmt.where(Location.city.ilike(f"%{city}%"))
    
    if q:
        stmt = stmt.where(Material.title.ilike(f"%{q}%"))
    
    if industry:
        stmt = stmt.where(Organization.industry_type.ilike(f"%{industry}%"))
        
    stmt = stmt.offset(skip).limit(limit)
    
    result = await db.execute(stmt)
    return result.scalars().all()

async def update_material(db: AsyncSession, material_id: int, material_in: MaterialUpdate, org_id: int):
    stmt = select(Material).where(Material.material_id == material_id, Material.org_id == org_id)
    result = await db.execute(stmt)
    material = result.scalars().first()
    
    if not material:
        return None
        
    update_data = material_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(material, field, value)
        
    db.add(material)
    await db.commit()
    await db.refresh(material)
    return material

async def delete_material(db: AsyncSession, material_id: int, org_id: int):
    stmt = select(Material).where(Material.material_id == material_id, Material.org_id == org_id)
    result = await db.execute(stmt)
    material = result.scalars().first()
    
    if not material:
        return False
        
    await db.delete(material)
    await db.commit()
    return True
