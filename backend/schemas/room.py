# backend/schemas/room.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class RoomCreate(BaseModel):
    name: str
    description: Optional[str] = None
    room_type: str = 'public'

class RoomResponse(BaseModel):
    room_id: int
    name: str
    description: Optional[str]
    room_type: str
    created_by: int
    created_at: datetime
    updated_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True