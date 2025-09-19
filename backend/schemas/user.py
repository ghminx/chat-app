# backend/schemas/user.py
from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    name: str
    email: EmailStr
    department: Optional[str] = None

class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('비밀번호는 최소 8자 이상이어야 합니다.')
        return v
    
    @validator('name')
    def validate_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('이름은 최소 2자 이상이어야 합니다.')
        return v.strip()

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    
class UserResponse(BaseModel):
    user_id: int
    name: str
    email: str
    department: Optional[str]
    role: str
    status: Optional[str]         # ✅ 추가
    status_message: Optional[str] # ✅ 추가
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True