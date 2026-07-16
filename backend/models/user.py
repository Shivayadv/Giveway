from pydantic import BaseModel, EmailStr
from typing import Optional, Literal


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    role: Literal["user", "seller"] = "user"
    brand_name: Optional[str] = None
    brand_category: Optional[str] = None
    brand_website: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    role: str
    referral_code: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
