# auth.py
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer
from pydantic import BaseModel, EmailStr
from typing import Optional
from firebase_admin import auth
from firebasedependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    role: str  # "buyer" or "seller"
    display_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    uid: str
    email: str
    role: str
    display_name: Optional[str] = None

@router.post("/register", response_model=UserResponse)
async def register_user(user: UserRegister):
    """Register a new user (buyer or seller) with Firebase"""
    try:
        # Create user in Firebase Auth
        user_record = auth.create_user(
            email=user.email,
            password=user.password,
            display_name=user.display_name,
            custom_claims={"role": user.role}
        )

        return UserResponse(
            uid=user_record.uid,
            email=user_record.email,
            role=user.role,
            display_name=user_record.display_name
        )
    except auth.EmailAlreadyExistsError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login")
async def login_user(user: UserLogin):
    """Login user - returns success message. Token verification happens in protected routes"""
    try:
        # In a real implementation, you'd verify credentials here
        # For Firebase, login is typically handled on the frontend
        # This endpoint just confirms the user exists
        user_record = auth.get_user_by_email(user.email)

        return {
            "message": "Login successful",
            "uid": user_record.uid,
            "email": user_record.email,
            "role": user_record.custom_claims.get("role", "buyer") if user_record.custom_claims else "buyer"
        }
    except auth.UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Login failed: {str(e)}"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user's information"""
    try:
        user_record = auth.get_user(current_user['uid'])

        return UserResponse(
            uid=user_record.uid,
            email=user_record.email,
            role=current_user.get('role', 'buyer'),
            display_name=user_record.display_name
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get user info: {str(e)}"
        )

@router.post("/refresh-token")
async def refresh_token(current_user: dict = Depends(get_current_user)):
    """Refresh the user's custom token if needed"""
    try:
        # Create a custom token for the user
        custom_token = auth.create_custom_token(current_user['uid'])

        return {"custom_token": custom_token.decode('utf-8')}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Token refresh failed: {str(e)}"
        )