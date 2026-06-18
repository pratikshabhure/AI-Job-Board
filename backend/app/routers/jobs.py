from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Job
from ..schemas.job import JobCreate, JobUpdate, JobResponse, JobStatusUpdate

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.get("/", response_model=List[JobResponse])
def get_jobs(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Job)
    if status:
        query = query.filter(Job.status == status)
    jobs = query.offset(skip).limit(limit).all()
    return jobs

@router.post("/", response_model=JobResponse)
def create_job(job: JobCreate, db: Session = Depends(get_db)):
    db_job = Job(**job.dict())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.put("/{job_id}", response_model=JobResponse)
def update_job(job_id: int, job: JobUpdate, db: Session = Depends(get_db)):
    db_job = db.query(Job).filter(Job.id == job_id).first()
    if db_job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    
    for key, value in job.dict().items():
        setattr(db_job, key, value)
    
    db.commit()
    db.refresh(db_job)
    return db_job

@router.patch("/{job_id}/status", response_model=JobResponse)
def update_job_status(job_id: int, status_update: JobStatusUpdate, db: Session = Depends(get_db)):
    db_job = db.query(Job).filter(Job.id == job_id).first()
    if db_job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    
    db_job.status = status_update.status
    db.commit()
    db.refresh(db_job)
    return db_job

@router.get("/search/", response_model=List[JobResponse])
def search_jobs(
    skills: Optional[str] = None,
    location: Optional[str] = None,
    experience_level: Optional[str] = None,
    domain: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Job).filter(Job.status == "Open")
    
    if skills:
        query = query.filter(Job.required_skills.contains(skills))
    if location:
        query = query.filter(Job.location.contains(location))
    if experience_level:
        query = query.filter(Job.experience_level == experience_level)
    if domain:
        query = query.filter(Job.domain.contains(domain))
    
    return query.all()