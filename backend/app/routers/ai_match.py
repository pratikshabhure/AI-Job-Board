from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from ..database import get_db
from ..models import Job
from ..services import MatchingService, LLMService

router = APIRouter(prefix="/ai", tags=["ai-matching"])

class MatchRequest(BaseModel):
    query: str
    candidate_id: Optional[int] = None

class MatchResult(BaseModel):
    job: Dict[str, Any]
    score: float
    explanation: str
    matched_skills: List[str]

def _clean_preferences(preferences: Dict[str, Any]) -> Dict[str, Any]:
    """Remove null/empty values from extracted preferences."""
    cleaned = {}
    for key, value in preferences.items():
        if value is None or value == "null" or value == "":
            continue
        cleaned[key] = str(value).strip()
    return cleaned

@router.post("/match", response_model=List[MatchResult])
async def match_jobs(request: MatchRequest, db: Session = Depends(get_db)):
    """
    Match jobs based on natural language query.
    Uses hybrid approach: LLM extraction + rule-based scoring + LLM explanations
    """
    try:
        llm_service = LLMService()

        print(f"[AI-MATCH] Request: '{request.query}'")
        print(f"[AI-MATCH] API Key Available: {bool(llm_service.api_key)}")
        print(f"[AI-MATCH] Model: {llm_service.model}")

        preferences = await llm_service.extract_preferences(request.query)

        if preferences:
            preferences = _clean_preferences(preferences)
            print(f"[AI-MATCH] AI Extracted Preferences: {preferences}")
        else:
            print("[AI-MATCH] AI Extraction Failed - Using Fallback")

        if not preferences:
            preferences = _parse_query_fallback(request.query)
            print(f"[AI-MATCH] Fallback Preferences: {preferences}")

        jobs = db.query(Job).filter(Job.status == "Open").all()
        print(f"[AI-MATCH] Found {len(jobs)} open jobs")

        if not jobs:
            return []

        job_matches = MatchingService.rank_jobs(jobs, preferences, db)

        # Prefer matches above 30%; if none qualify, return the top 3 scored jobs
        high_quality = [match for match in job_matches if match["score"] >= 30]
        if high_quality:
            job_matches = high_quality
        else:
            job_matches = job_matches[:3]
        print(f"[AI-MATCH] Returning {len(job_matches)} matches")

        ai_explanations_used = False
        try:
            if llm_service.api_key and job_matches:
                print("[AI-MATCH] Generating AI explanations...")
                llm_explanations = await llm_service.generate_match_explanations(
                    job_matches, request.query
                )

                if llm_explanations:
                    print(f"[AI-MATCH] Got AI explanations for {len(llm_explanations)} jobs")
                    for match in job_matches:
                        job_id = match["job"].id
                        if job_id in llm_explanations:
                            match["explanation"] = llm_explanations[job_id]
                            ai_explanations_used = True
                else:
                    print("[AI-MATCH] No AI explanations returned")
            else:
                print("[AI-MATCH] No API key - skipping AI explanations")

        except Exception as e:
            print(f"[AI-MATCH] LLM explanation enhancement failed: {e}")

        if not ai_explanations_used:
            print("[AI-MATCH] Using fallback explanations")

        results = []
        for match in job_matches:
            job = match["job"]
            results.append(MatchResult(
                job={
                    "id": job.id,
                    "title": job.title,
                    "company_name": job.company_name,
                    "description": job.description,
                    "required_skills": job.required_skills,
                    "experience_level": job.experience_level,
                    "location": job.location,
                    "domain": job.domain,
                    "role_type": job.role_type,
                    "status": job.status
                },
                score=round(match["score"], 1),
                explanation=match["explanation"],
                matched_skills=match["matched_skills"]
            ))

        print(f"[AI-MATCH] Returning {len(results)} matches with {'AI' if ai_explanations_used else 'fallback'} explanations")
        return results

    except Exception as e:
        print(f"[AI-MATCH] Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI matching failed: {str(e)}")

def _parse_query_fallback(query: str) -> Dict[str, Any]:
    """
    Fallback query parsing when LLM is unavailable.
    Basic keyword extraction from natural language.
    """
    query_lower = query.lower()
    preferences = {}

    role_keywords = ["backend", "frontend", "fullstack", "full stack", "devops", "data scientist",
                    "machine learning", "ml engineer", "product manager", "developer"]
    for keyword in role_keywords:
        if keyword in query_lower:
            preferences["role"] = keyword
            break

    tech_skills = ["python", "java", "javascript", "react", "node.js", "fastapi", "django",
                  "tensorflow", "postgresql", "mongodb", "docker", "kubernetes", "aws", "jenkins", "ci/cd"]
    found_skills = [skill for skill in tech_skills if skill in query_lower]
    if found_skills:
        preferences["skills"] = ", ".join(found_skills)

    locations = ["pune", "mumbai", "bangalore", "delhi", "chennai", "hyderabad", "remote"]
    found_locations = [loc for loc in locations if loc in query_lower]
    if found_locations:
        preferences["location"] = ", ".join(found_locations)

    domains = ["healthcare", "fintech", "finance", "e-commerce", "ai", "ml", "saas", "startup"]
    for domain in domains:
        if domain in query_lower:
            preferences["domain"] = domain
            break

    if any(word in query_lower for word in ["senior", "lead", "principal"]):
        preferences["experience_level"] = "senior"
    elif any(word in query_lower for word in ["junior", "entry", "fresher"]):
        preferences["experience_level"] = "entry"
    else:
        preferences["experience_level"] = "mid"

    return preferences
