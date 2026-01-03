
from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from jose import jwt, JWTError
from pydantic import ValidationError

from db.connection import get_session
from core.config import settings
from core import security
from schemas.auth import TokenData
from models.organization import Organization
from models.buyer import Buyer
from models.admin import Admin

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

async def get_current_user_token(token: str = Depends(oauth2_scheme)) -> TokenData:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        if user_id is None or role is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return TokenData(id=user_id, role=role)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Optional: Get full user object if needed. 
async def get_current_active_user(
    token_data: TokenData = Depends(get_current_user_token),
    db: AsyncSession = Depends(get_session)
):
    user = None
    if token_data.role == "organization":
        res = await db.execute(select(Organization).where(Organization.org_id == int(token_data.id)))
        user = res.scalars().first()
        if user and user.is_blocked:
             raise HTTPException(status_code=400, detail="Organization is blocked")
    elif token_data.role == "buyer":
        res = await db.execute(select(Buyer).where(Buyer.buyer_id == int(token_data.id)))
        user = res.scalars().first()
    elif token_data.role == "admin":
        res = await db.execute(select(Admin).where(Admin.admin_id == int(token_data.id)))
        user = res.scalars().first()
        
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return user

def require_role(allowed_roles: List[str]):
    async def role_checker(token_data: TokenData = Depends(get_current_user_token)):
        if token_data.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to perform this action"
            )
        return token_data
    return role_checker
