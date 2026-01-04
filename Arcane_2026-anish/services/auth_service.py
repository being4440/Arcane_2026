
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
    # Basic validations
    if not user_in.org_name or not user_in.org_type or not user_in.email:
        raise HTTPException(status_code=400, detail="Required fields missing for organization registration")
    if len(user_in.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")

    # Optional contact number validation if provided
    if getattr(user_in, 'contact_number', None):
        pn = str(user_in.contact_number)
        if not pn.isdigit() or len(pn) != 10:
            raise HTTPException(status_code=400, detail="Mobile number must be exactly 10 digits")

    hashed_password = security.get_password_hash(user_in.password)
    db_obj = Organization(
        org_name=user_in.org_name,
        org_type=user_in.org_type,
        industry_type=user_in.industry_type,
        email=user_in.email,
        password_hash=hashed_password,
        contact_number=getattr(user_in, 'contact_number', None)
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def create_buyer(db: AsyncSession, user_in: BuyerCreate):
    result = await db.execute(select(Buyer).where(Buyer.email == user_in.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
    # Basic validations
    if not user_in.name or not user_in.email or not user_in.password:
        raise HTTPException(status_code=400, detail="Required fields missing for buyer registration")
    if len(user_in.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")

    # Validate phone if provided
    if user_in.phone:
        ph = str(user_in.phone)
        if not ph.isdigit() or len(ph) != 10:
            raise HTTPException(status_code=400, detail="Mobile number must be exactly 10 digits")

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


async def get_user_by_id(db: AsyncSession, role: str, user_id: int):
    if role == 'buyer':
        res = await db.execute(select(Buyer).where(Buyer.buyer_id == user_id))
        return res.scalars().first()
    elif role == 'organization':
        res = await db.execute(select(Organization).where(Organization.org_id == user_id))
        return res.scalars().first()
    elif role == 'admin':
        res = await db.execute(select(Admin).where(Admin.admin_id == user_id))
        return res.scalars().first()
    return None


async def update_buyer_profile(db: AsyncSession, buyer_id: int, update_data: dict):
    res = await db.execute(select(Buyer).where(Buyer.buyer_id == buyer_id))
    buyer = res.scalars().first()
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer not found")

    # Validate email if changing
    if 'email' in update_data and update_data['email']:
        # Check uniqueness
        r = await db.execute(select(Buyer).where(Buyer.email == update_data['email'], Buyer.buyer_id != buyer_id))
        if r.scalars().first():
            raise HTTPException(status_code=400, detail="Email already registered")
    # Validate phone
    if 'phone' in update_data and update_data['phone']:
        ph = str(update_data['phone'])
        if not ph.isdigit() or len(ph) != 10:
            raise HTTPException(status_code=400, detail="Mobile number must be exactly 10 digits")

    for k, v in update_data.items():
        if v is not None and hasattr(buyer, k):
            setattr(buyer, k, v)
    db.add(buyer)
    await db.commit()
    await db.refresh(buyer)
    return buyer


async def update_organization_profile(db: AsyncSession, org_id: int, update_data: dict):
    res = await db.execute(select(Organization).where(Organization.org_id == org_id))
    org = res.scalars().first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    if 'email' in update_data and update_data['email']:
        r = await db.execute(select(Organization).where(Organization.email == update_data['email'], Organization.org_id != org_id))
        if r.scalars().first():
            raise HTTPException(status_code=400, detail="Email already registered")

    if 'contact_number' in update_data and update_data['contact_number']:
        ph = str(update_data['contact_number'])
        if not ph.isdigit() or len(ph) != 10:
            raise HTTPException(status_code=400, detail="Mobile number must be exactly 10 digits")

    for k, v in update_data.items():
        if v is not None and hasattr(org, k):
            setattr(org, k, v)
    db.add(org)
    await db.commit()
    await db.refresh(org)
    return org
