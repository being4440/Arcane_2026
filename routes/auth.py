from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from pydantic import BaseModel
from db.connection import get_session
from models.organization import Organization
from models.buyer import Buyer
from models.admin import Admin
from core.config import settings

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def authenticate_user(db: AsyncSession, email: str, password: str):
    # Check organization
    result = await db.execute(select(Organization).where(Organization.email == email))
    user = result.scalar_one_or_none()
    if user and verify_password(password, user.password_hash):
        return {"type": "organization", "user": user}
    
    # Check buyer
    result = await db.execute(select(Buyer).where(Buyer.email == email))
    user = result.scalar_one_or_none()
    if user and verify_password(password, user.password_hash):
        return {"type": "buyer", "user": user}
    
    # Check admin
    result = await db.execute(select(Admin).where(Admin.email == email))
    user = result.scalar_one_or_none()
    if user and verify_password(password, user.password_hash):
        return {"type": "admin", "user": user}
    
    return False

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    return token_data

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_session)):
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["user"].email, "type": user["type"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/signup/buyer")
async def create_buyer(name: str, email: str, password: str, organization: str = None, contact_info: str = None, db: AsyncSession = Depends(get_session)):
    hashed_password = get_password_hash(password)
    db_buyer = Buyer(name=name, email=email, password_hash=hashed_password, organization=organization, contact_info=contact_info)
    db.add(db_buyer)
    await db.commit()
    await db.refresh(db_buyer)
    return {"message": "Buyer created successfully"}

@router.post("/signup/organization")
async def create_organization(name: str, email: str, password: str, description: str = None, location: str = None, contact_info: str = None, db: AsyncSession = Depends(get_session)):
    hashed_password = get_password_hash(password)
    db_org = Organization(name=name, email=email, password_hash=hashed_password, description=description, location=location, contact_info=contact_info)
    db.add(db_org)
    await db.commit()
    await db.refresh(db_org)
    return {"message": "Organization created successfully"}