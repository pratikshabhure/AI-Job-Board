from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class JobBase(BaseModel):
    title: str
    company_name: str
    description: str
    required_skills: str
    experience_level: str
    location: str
    domain: str
    role_type: str

class JobCreate(JobBase):
    status: str = "Open"

class JobUpdate(JobBase):
    pass

class JobStatusUpdate(BaseModel):
    status: str

class JobResponse(JobBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True