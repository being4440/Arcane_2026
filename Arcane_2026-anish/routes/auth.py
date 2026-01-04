
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any

from db.connection import get_session
from services import auth_service
from schemas.auth import Token, Login
from schemas.organization import OrganizationCreate, OrganizationResponse
from schemas.buyer import BuyerCreate, BuyerResponse
from schemas.admin import AdminCreate, AdminResponse
from core import security, deps
from schemas.buyer import BuyerUpdate
from schemas.organization import OrganizationUpdate
from schemas.auth import TokenData

router = APIRouter()

@router.post("/login", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_session)
):
    # Normalize form_data to Login schema
    login_data = Login(email=form_data.username, password=form_data.password)
    
    user_data = await auth_service.authenticate_user(db, login_data)
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = security.create_access_token(
        subject=user_data["id"],
        role=user_data["role"]
    )
    
    # Construct user details based on role
    user_obj = user_data["user"]
    details = {}
    if user_data["role"] == "buyer":
        details = {
            "name": user_obj.name,
            "email": user_obj.email,
            "city": user_obj.city,
            "phone": user_obj.phone
        }
    elif user_data["role"] == "organization":
        details = {
            "organisationName": user_obj.org_name,
            "orgType": user_obj.org_type,
            "industryType": user_obj.industry_type,
            "email": user_obj.email,
            "city": "New Delhi" # Default for now if not in model, user_obj doesn't have city in Organization model? Check model.
            # Checking auth_service.py create_organization: org_name, org_type, industry_type, email. No city.
            # Frontend expects city. I will mock it or add it to model later if needed.
        }
    elif user_data["role"] == "admin":
        details = {
            "name": user_obj.name,
            "email": user_obj.email,
            "role": user_obj.role
        }

    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": user_data["role"],
        "user_id": user_data["id"],
        "user_details": details
    }

@router.post("/signup/organization", response_model=OrganizationResponse)
async def signup_organization(
    user_in: OrganizationCreate,
    db: AsyncSession = Depends(get_session)
):
    user = await auth_service.create_organization(db, user_in)
    return user

@router.post("/signup/buyer", response_model=BuyerResponse)
async def signup_buyer(
    user_in: BuyerCreate,
    db: AsyncSession = Depends(get_session)
):
    user = await auth_service.create_buyer(db, user_in)
    return user

@router.post("/signup/admin", response_model=AdminResponse)
async def signup_admin(
    user_in: AdminCreate,
    db: AsyncSession = Depends(get_session)
):
    user = await auth_service.create_admin(db, user_in)
    return user


@router.get('/me')
async def get_current_user(user = Depends(deps.get_current_active_user)):
    # Returns the current authenticated user's object (ORM)
    return user


@router.put('/me')
async def update_current_user(
    update: dict,
    token: TokenData = Depends(deps.get_current_user_token),
    db: AsyncSession = Depends(get_session)
):
    # Delegate to service layer based on role
    role = token.role
    user_id = int(token.id)
    if role == 'buyer':
        user = await auth_service.update_buyer_profile(db, user_id, update)
        return user
    elif role == 'organization':
        user = await auth_service.update_organization_profile(db, user_id, update)
        return user
    else:
        raise HTTPException(status_code=400, detail='Profile update not supported for this role')
