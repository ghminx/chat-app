# backend/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from schemas.user import UserUpdate 
from typing import List

from database import get_db
from schemas.user import UserCreate, UserLogin, UserResponse
from models.user import User
from core.security import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=UserResponse)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """회원가입"""
    # 이메일 중복 체크
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 등록된 이메일입니다."
        )
    
    # 사용자명 중복 체크
    existing_username = db.query(User).filter(User.name == user_data.name).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 사용중인 사용자명입니다."
        )
    
    # 새 사용자 생성
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password=hashed_password,
        department=user_data.department,
        role="user"  # 기본값
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login")
def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    """로그인"""
    # 사용자 찾기
    user = db.query(User).filter(User.email == login_data.email).first()
    
    # 사용자 존재 및 비밀번호 검증
    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # JWT 토큰 생성
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.user_id, "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # 초 단위
        "user": {
            "user_id": user.user_id,
            "name": user.name,
            "email": user.email,
            "department": user.department,
            "role": user.role
        }
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """현재 로그인한 사용자 정보 조회"""
    return current_user

@router.post("/logout")
def logout_user():
    """로그아웃 (클라이언트에서 토큰 삭제하도록 응답)"""
    return {"message": "로그아웃되었습니다."}

@router.post("/refresh")
def refresh_token(current_user: User = Depends(get_current_user)):
    """토큰 갱신"""
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": current_user.email, "user_id": current_user.user_id, "role": current_user.role},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }
    
    
@router.patch("/profile", response_model=UserResponse)
def update_profile(
    profile_data: UserUpdate, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """사용자 프로필 업데이트"""
    
    # 업데이트할 필드가 있는지 확인
    update_data = profile_data.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="업데이트할 정보가 없습니다."
        )
    
    # 사용자 정보 업데이트
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    # updated_at 필드 자동 업데이트 (모델에서 onupdate=func.now()로 설정했다면 자동)
    db.commit()
    db.refresh(current_user)
    
    return current_user

