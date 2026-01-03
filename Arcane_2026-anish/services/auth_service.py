
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from models.organization import Organization
from models.buyer import Buyer
from models.admin import Admin
from schemas.auth import Login
from schemas.organization import OrganizationCreate
from schemas.buyer import BuyerCreate
from schemas.admin import AdminCreate
from core import security

async def authenticate_user(db: AsyncSession, login_data: Login):
    # Check Organization
    result = await db.execute(select(Organization).where(Organization.email == login_data.email))
    user = result.scalars().first()
    role = "organization"
    
    if not user:
        # Check Buyer
        result = await db.execute(select(Buyer).where(Buyer.email == login_data.email))
        user = result.scalars().first()
        role = "buyer"
    
    if not user:
        # Check Admin
        result = await db.execute(select(Admin).where(Admin.email == login_data.email))
        user = result.scalars().first()
        role = "admin"
        
    if not user:
        return None
        
    if not security.verify_password(login_data.password, user.password_hash):
        return None
        
    id_val = getattr(user, f"{role}_id") if role != "organization" else user.org_id
    
    return {"user": user, "role": role, "id": id_val}

async def create_organization(db: AsyncSession, user_in: OrganizationCreate):
    result = await db.execute(select(Organization).where(Organization.email == user_in.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = security.get_password_hash(user_in.password)
    db_obj = Organization(
        org_name=user_in.org_name,
        org_type=user_in.org_type,
        industry_type=user_in.industry_type,
        email=user_in.email,
        password_hash=hashed_password
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def create_buyer(db: AsyncSession, user_in: BuyerCreate):
    result = await db.execute(select(Buyer).where(Buyer.email == user_in.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = security.get_password_hash(user_in.password)
    db_obj = Buyer(
        name=user_in.name,
        email=user_in.email,
        city=user_in.city,
        phone=user_in.phone,
        password_hash=hashed_password
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def create_admin(db: AsyncSession, user_in: AdminCreate):
    result = await db.execute(select(Admin).where(Admin.email == user_in.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = security.get_password_hash(user_in.password)
    db_obj = Admin(
        name=user_in.name,
        email=user_in.email,
        role=user_in.role,
        password_hash=hashed_password
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj
