
from typing import Optional, List
from pydantic import BaseModel, EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    user_details: dict

class TokenData(BaseModel):
    id: Optional[str] = None
    role: Optional[str] = None

class Login(BaseModel):
    email: EmailStr
    password: str
