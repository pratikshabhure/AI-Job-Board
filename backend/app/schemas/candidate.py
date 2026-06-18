from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CandidateBase(BaseModel):
    name: str
    email: str
    skills: str
    education: str
    project_summaries: Optional[str] = None
    preferred_location: Optional[str] = None
    preferred_role_type: Optional[str] = None
    domain_interest: Optional[str] = None
    experience_level: Optional[str] = None

class CandidateCreate(CandidateBase):
    pass

class CandidateUpdate(CandidateBase):
    pass

class CandidateResponse(CandidateBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True