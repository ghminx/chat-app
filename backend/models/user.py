# backend/models/user.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean, BigInteger, Enum
from sqlalchemy.sql import func
from database import Base
import enum

# 상태 값 정의
class UserStatus(enum.Enum):
    online = "online"
    away = "away"
    offline = "offline"

class User(Base):
    __tablename__ = "users"
    
    user_id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    department = Column(String(255), nullable=True)
    role = Column(String(255), default="user")


    status = Column(Enum(UserStatus), default=UserStatus.offline, nullable=False)
    status_message = Column(String(255), nullable=True)

    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
