
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
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": user_data["role"],
        "user_id": user_data["id"] 
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
