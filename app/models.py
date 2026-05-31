import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

def gen_uuid():
    return str(uuid.uuid4())[:8]

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    urls = relationship("URL", back_populates="owner")

class URL(Base):
    __tablename__ = "urls"
    id = Column(String, primary_key=True, default=gen_uuid)
    short_code = Column(String, unique=True, index=True)
    target_url = Column(String)
    clicks = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    owner_id = Column(String, ForeignKey("users.id"), nullable=True)
    owner = relationship("User", back_populates="urls")
