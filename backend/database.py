# backend/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()  # .env 파일 읽기

# 환경변수 검증
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL 환경변수가 설정되지 않았습니다.")

# 데이터베이스 엔진 생성
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  
    pool_recycle=3600,  
    echo=False,         
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 의존성 주입용 함수
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 테이블 생성 함수
def create_tables():
    """데이터베이스 테이블 생성"""
    Base.metadata.create_all(bind=engine)
