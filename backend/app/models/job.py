from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.sql import func
from ..database import Base

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    company_name = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    required_skills = Column(Text, nullable=False)  # JSON or comma-separated
    experience_level = Column(String(50), nullable=False)
    location = Column(String(200), nullable=False)
    domain = Column(String(100), nullable=False)
    role_type = Column(String(100), nullable=False)
    status = Column(String(20), default="Open")  # Open or Closed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())