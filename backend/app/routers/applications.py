from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List
from ..database import get_db
from ..models import Application, Job, CandidateProfile, User
from ..schemas.application import ApplicationCreate, ApplicationResponse, ApplicationStatusUpdate
from .auth import get_current_user

router = APIRouter(prefix="/applications", tags=["applications"])

@router.get("/me", response_model=List[dict])
def get_my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "candidate":
        raise HTTPException(status_code=400, detail="Only candidates can view their applications")
        
    candidate = db.query(CandidateProfile).filter(
        (CandidateProfile.email == current_user.email) | (CandidateProfile.id == current_user.id)
    ).first()
    
    if not candidate:
        return []
        
    applications = db.query(Application, Job).join(
        Job, Application.job_id == Job.id
    ).filter(Application.candidate_id == candidate.id).all()
    
    result = []
    for app, job in applications:
        result.append({
            "id": app.id,
            "status": app.status,
            "created_at": app.created_at,
            "job": {
                "id": job.id,
                "title": job.title,
                "company_name": job.company_name,
                "location": job.location,
                "required_skills": job.required_skills,
                "status": job.status
            }
        })
    return result

@router.post("/", response_model=ApplicationResponse)
def create_application(application: ApplicationCreate, db: Session = Depends(get_db)):
    # Verify candidate exists (check by ID first, then by email/user relationship if mismatch)
    candidate = db.query(CandidateProfile).filter(CandidateProfile.id == application.candidate_id).first()
    if not candidate:
        user = db.query(User).filter(User.id == application.candidate_id).first()
        if user:
            candidate = db.query(CandidateProfile).filter(CandidateProfile.email == user.email).first()

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate profile not found. Please complete your profile first.")

    # Override candidate_id to correct profile ID
    app_data = application.dict()
    app_data["candidate_id"] = candidate.id

    # Check if application already exists
    existing = db.query(Application).filter(
        and_(
            Application.candidate_id == candidate.id,
            Application.job_id == application.job_id
        )
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job")
    
    job = db.query(Job).filter(Job.id == application.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status != "Open":
        raise HTTPException(status_code=400, detail="Job is not open for applications")
    
    db_application = Application(**app_data)
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application

@router.get("/jobs/{job_id}", response_model=List[dict])
def get_job_applications(job_id: int, db: Session = Depends(get_db)):
    applications = db.query(Application, CandidateProfile).join(
        CandidateProfile, Application.candidate_id == CandidateProfile.id
    ).filter(Application.job_id == job_id).all()
    
    result = []
    for app, candidate in applications:
        result.append({
            "id": app.id,
            "candidate_id": app.candidate_id,
            "job_id": app.job_id,
            "status": app.status,
            "created_at": app.created_at,
            "candidate_name": candidate.name,
            "candidate_email": candidate.email,
            "candidate_skills": candidate.skills
        })
    
    return result

@router.patch("/{application_id}/status")
def update_application_status(
    application_id: int, 
    status_update: ApplicationStatusUpdate, 
    db: Session = Depends(get_db)
):
    application = db.query(Application).filter(Application.id == application_id).first()
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    
    valid_statuses = ["Applied", "Shortlisted", "Rejected"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    application.status = status_update.status
    db.commit()
    return {"message": "Status updated successfully"}