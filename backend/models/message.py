# backend/models/message.py
from sqlalchemy import Column, BigInteger, Text, Enum, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class Message(Base):
    __tablename__ = "messages"
    
    message_id = Column(BigInteger, primary_key=True, autoincrement=True)
    room_id = Column(BigInteger, ForeignKey('rooms.room_id'), nullable=False)
    user_id = Column(BigInteger, ForeignKey('users.user_id'), nullable=False)
    content = Column(Text, nullable=False)
    message_type = Column(Enum('text', 'image', 'file', 'system'), default='text')
    reply_to_message_id = Column(BigInteger, ForeignKey('messages.message_id'), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    is_deleted = Column(Boolean, default=False)
    
    # 관계 설정 - 문자열로 참조하여 순환 의존성 해결
    room = relationship("Room", back_populates="messages")
    user = relationship("User")
    reply_to = relationship("Message", remote_side=[message_id])
    reactions = relationship("MessageReaction", back_populates="message", cascade="all, delete-orphan")