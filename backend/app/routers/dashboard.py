from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import Job, Application, CandidateProfile

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/admin-summary")
def get_admin_summary(db: Session = Depends(get_db)):
    # Basic counts
    total_jobs = db.query(Job).count()
    open_jobs = db.query(Job).filter(Job.status == "Open").count()
    total_applications = db.query(Application).count()
    
    # Application status counts
    status_counts = db.query(
        Application.status,
        func.count(Application.id).label('count')
    ).group_by(Application.status).all()
    
    status_distribution = {status: count for status, count in status_counts}
    
    # Applications per job
    apps_per_job = db.query(
        Job.title,
        func.count(Application.id).label('applications')
    ).outerjoin(Application).group_by(Job.id, Job.title).all()
    
    applications_per_job = [
        {"job_title": title, "applications": apps} 
        for title, apps in apps_per_job
    ]
    
    # Skill distribution from candidates who applied
    applied_candidates = db.query(CandidateProfile).join(
        Application, CandidateProfile.id == Application.candidate_id
    ).all()
    
    skill_counts = {}
    for candidate in applied_candidates:
        if candidate.skills:
            skills = [s.strip() for s in candidate.skills.split(',')]
            for skill in skills:
                skill_counts[skill] = skill_counts.get(skill, 0) + 1
    
    skill_distribution = [
        {"skill": skill, "count": count} 
        for skill, count in sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    ]
    
    return {
        "total_jobs": total_jobs,
        "open_jobs": open_jobs,
        "total_applications": total_applications,
        "status_distribution": status_distribution,
        "applications_per_job": applications_per_job,
        "skill_distribution": skill_distribution
    }