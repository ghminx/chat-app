# backend/routers/rooms.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.room import Room
from models.room_member import RoomMember
from schemas.room import RoomCreate, RoomResponse
from core.security import get_current_user
from models.user import User

router = APIRouter(prefix="/rooms", tags=["rooms"])

@router.get("/", response_model=List[RoomResponse])  
def get_user_rooms(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """사용자가 속한 채팅방 목록"""
    rooms = (
        db.query(Room)
        .join(RoomMember)
        .filter(RoomMember.user_id == current_user.user_id)
        .filter(Room.is_active == True)
        .all()
    )
    return rooms

@router.post("/", response_model=RoomResponse)
def create_room(
    room_data: RoomCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """새 채팅방 생성"""
    # 채팅방 생성
    new_room = Room(
        name=room_data.name,
        description=room_data.description,
        room_type=room_data.room_type,
        created_by=current_user.user_id
    )
    
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    
    # 생성자를 자동으로 owner로 추가
    room_member = RoomMember(
        room_id=new_room.room_id,
        user_id=current_user.user_id,
        role='owner'
    )
    
    db.add(room_member)
    db.commit()
    
    return new_room

@router.get("/{room_id}", response_model=RoomResponse)
def get_room_info(
    room_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """특정 채팅방 정보 조회"""
    # 사용자가 해당 채팅방의 멤버인지 확인
    member = (
        db.query(RoomMember)
        .filter(RoomMember.room_id == room_id)
        .filter(RoomMember.user_id == current_user.user_id)
        .first()
    )
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="해당 채팅방에 접근 권한이 없습니다."
        )
    
    room = db.query(Room).filter(Room.room_id == room_id).first()
    if not room or not room.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="채팅방을 찾을 수 없습니다."
        )
    
    return room

@router.post("/{room_id}/join")
def join_room(
    room_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """채팅방 참여"""
    # 채팅방 존재 확인
    room = db.query(Room).filter(Room.room_id == room_id).first()
    if not room or not room.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="채팅방을 찾을 수 없습니다."
        )
    
    # 이미 멤버인지 확인
    existing_member = (
        db.query(RoomMember)
        .filter(RoomMember.room_id == room_id)
        .filter(RoomMember.user_id == current_user.user_id)
        .first()
    )
    
    if existing_member:
        return {"message": "이미 채팅방의 멤버입니다."}
    
    # 비공개방인 경우 초대받은 사용자만 참여 가능 (추후 초대 시스템 구현)
    if room.room_type == 'private':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="비공개 채팅방은 초대받은 사용자만 참여할 수 있습니다."
        )
    
    # 멤버 추가
    new_member = RoomMember(
        room_id=room_id,
        user_id=current_user.user_id,
        role='member'
    )
    
    db.add(new_member)
    db.commit()
    
    return {"message": f"'{room.name}' 채팅방에 참여했습니다."}

@router.post("/{room_id}/leave")
def leave_room(
    room_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """채팅방 나가기"""
    # 멤버십 확인
    member = (
        db.query(RoomMember)
        .filter(RoomMember.room_id == room_id)
        .filter(RoomMember.user_id == current_user.user_id)
        .first()
    )
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="해당 채팅방의 멤버가 아닙니다."
        )
    
    # 방장은 나갈 수 없음 (방을 삭제하거나 소유권 이전 필요)
    if member.role == 'owner':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="방장은 채팅방을 나갈 수 없습니다. 방을 삭제하거나 소유권을 이전하세요."
        )
    
    # 멤버 제거
    db.delete(member)
    db.commit()
    
    return {"message": "채팅방에서 나갔습니다."}

@router.delete("/{room_id}")
def delete_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """채팅방 삭제"""
    room = db.query(Room).filter(Room.room_id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="채팅방을 찾을 수 없습니다.")

    # 권한 체크 (방 생성자만 삭제 가능)
    if room.created_by != current_user.user_id and current_user.role != "owner":
        raise HTTPException(status_code=403, detail="채팅방을 삭제할 권한이 없습니다.")

    db.delete(room)
    db.commit()
    return {"message": f"채팅방 '{room.name}' 이 삭제되었습니다."}



@router.get("/{room_id}/members")
def get_room_members(
    room_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """채팅방 멤버 목록"""
    # 사용자가 해당 채팅방의 멤버인지 확인
    member = (
        db.query(RoomMember)
        .filter(RoomMember.room_id == room_id)
        .filter(RoomMember.user_id == current_user.user_id)
        .first()
    )
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="해당 채팅방에 접근 권한이 없습니다."
        )
    
    # 멤버 목록 조회
    members = (
        db.query(RoomMember, User)
        .join(User, RoomMember.user_id == User.user_id)
        .filter(RoomMember.room_id == room_id)
        .all()
    )
    
    member_list = []
    for member_info, user_info in members:
        member_list.append({
            "user_id": user_info.user_id,
            "name": user_info.name,
            "email": user_info.email,
            "role": member_info.role,
            "joined_at": member_info.joined_at
        })
    
    return {"members": member_list}