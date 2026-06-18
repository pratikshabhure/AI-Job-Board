from pydantic import BaseModel
from datetime import datetime

class ApplicationBase(BaseModel):
    candidate_id: int
    job_id: int

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationStatusUpdate(BaseModel):
    status: str

class ApplicationResponse(ApplicationBase):
    id: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True