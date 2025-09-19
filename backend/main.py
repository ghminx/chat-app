# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import create_tables
import os
from dotenv import load_dotenv

from models import user, room, room_member, message, message_reaction
from routers import auth, rooms, users, ws

load_dotenv()

app = FastAPI(title="Chat API", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(auth.router)
app.include_router(rooms.router)
app.include_router(users.router)
app.include_router(ws.router)




@app.on_event("startup")
def startup_event():
    """앱 시작시 테이블 생성"""
    create_tables()

@app.get("/")
def root():
    return {"message": "Chat API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}


# uvicorn main:app --host 0.0.0.0 --port 8000 --reload