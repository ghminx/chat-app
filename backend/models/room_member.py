# backend/models/room_member.py
from sqlalchemy import Column, BigInteger, Enum, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class RoomMember(Base):
    __tablename__ = "room_members"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    room_id = Column(BigInteger, ForeignKey('rooms.room_id'), nullable=False)
    user_id = Column(BigInteger, ForeignKey('users.user_id'), nullable=False)
    role = Column(Enum('owner', 'admin', 'member'), default='member')
    joined_at = Column(DateTime, server_default=func.now())
    last_read_at = Column(DateTime, server_default=func.now())
    
    # 관계 설정
    room = relationship("Room", back_populates="members")
    user = relationship("User")
    
    # 제약조건
    __table_args__ = (
        UniqueConstraint('room_id', 'user_id', name='unique_room_user'),
    )