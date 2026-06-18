from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from ..database import Base

class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    email = Column(String(200), nullable=False, unique=True)
    skills = Column(Text, nullable=False)  # comma-separated
    education = Column(Text, nullable=False)
    project_summaries = Column(Text)
    preferred_location = Column(String(200))
    preferred_role_type = Column(String(100))
    domain_interest = Column(String(100))
    experience_level = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())