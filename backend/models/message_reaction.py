# backend/models/message_reaction.py
from sqlalchemy import Column, BigInteger, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class MessageReaction(Base):
    __tablename__ = "message_reactions"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    message_id = Column(BigInteger, ForeignKey('messages.message_id'), nullable=False)
    user_id = Column(BigInteger, ForeignKey('users.user_id'), nullable=False)
    emoji = Column(String(10), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    # 관계 설정
    message = relationship("Message", back_populates="reactions")
    user = relationship("User")
    
    # 제약조건: 같은 사용자가 같은 메시지에 같은 이모지는 한 번만
    __table_args__ = (
        UniqueConstraint('user_id', 'message_id', 'emoji', name='unique_user_message_emoji'),
    )