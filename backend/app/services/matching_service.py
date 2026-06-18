from typing import List, Dict, Any
from sqlalchemy.orm import Session
from ..models import Job
import re

class MatchingService:
    @staticmethod
    def calculate_match_score(job: Job, preferences: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate match score based on weighted criteria:
        - skill overlap: 40%
        - role relevance: 20%
        - location match: 15%
        - experience match: 10%
        - domain match: 15%
        """
        score = 0
        matched_skills = []
        
        # Enhanced skill mapping for better matching
        skill_synonyms = {
            'continuous integration': ['jenkins', 'ci/cd', 'ci', 'cd', 'devops', 'pipeline'],
            'deployment': ['jenkins', 'ci/cd', 'cd', 'devops', 'docker', 'kubernetes'],
            'ci/cd': ['jenkins', 'continuous integration', 'deployment', 'devops'],
            'jenkins': ['continuous integration', 'ci/cd', 'deployment', 'devops'],
            'devops': ['jenkins', 'ci/cd', 'continuous integration', 'deployment', 'docker', 'kubernetes'],
            'machine learning': ['tensorflow', 'scikit-learn', 'ml', 'ai', 'data science'],
            'ai': ['machine learning', 'tensorflow', 'scikit-learn', 'ml', 'data science'],
            'frontend': ['react', 'javascript', 'css', 'html'],
            'backend': ['python', 'java', 'node.js', 'api', 'database'],
            'database': ['sql', 'mysql', 'postgresql', 'mongodb']
        }
        
        # Skill overlap (40%) - Enhanced with synonyms and job description
        if preferences.get("skills"):
            job_skills_text = (job.required_skills + " " + job.description).lower()
            pref_skills = [s.strip().lower() for s in preferences["skills"].split(",")]
            
            print(f"[MATCH] Matching skills for {job.title}:")
            print(f"   Job skills/desc: {job_skills_text}")
            print(f"   Preferred skills: {pref_skills}")
            
            skill_matches = 0
            total_pref_skills = len(pref_skills)
            
            for pref_skill in pref_skills:
                # Direct match in job skills/description
                if pref_skill in job_skills_text:
                    skill_matches += 1
                    matched_skills.append(pref_skill)
                    print(f"   [OK] Direct match: {pref_skill}")
                else:
                    synonyms = skill_synonyms.get(pref_skill, [])
                    print(f"   Checking synonyms for '{pref_skill}': {synonyms}")
                    for synonym in synonyms:
                        if synonym in job_skills_text:
                            skill_matches += 0.8
                            matched_skills.append(f"{pref_skill} (via {synonym})")
                            print(f"   [OK] Synonym match: {pref_skill} via {synonym}")
                            break
                    else:
                        print(f"   [MISS] No match for: {pref_skill}")
            
            skill_score = (skill_matches / max(total_pref_skills, 1)) * 40
            score += skill_score
            print(f"   Skill score: {skill_matches}/{total_pref_skills} * 40% = {skill_score:.1f}")
        
        
        # Enhanced role relevance (20%) - Check job description too
        if preferences.get("role"):
            role_keywords = preferences["role"].lower().split()
            job_text = (job.title + " " + job.role_type + " " + job.description).lower()
            
            role_matches = sum(1 for keyword in role_keywords if keyword in job_text)
            role_score = min(role_matches * 4, 20)  # More generous scoring
            score += role_score
        
        # More flexible location match (15%)
        if preferences.get("location"):
            pref_locations = [loc.strip().lower() for loc in preferences["location"].split(",")]
            job_location = job.location.lower()
            
            location_score = 0
            # Exact city match
            if any(loc in job_location for loc in pref_locations if loc != "remote"):
                location_score = 15
            # Remote work preference
            elif "remote" in job_location and any("remote" in loc for loc in pref_locations):
                location_score = 15
            # Partial match for nearby cities or flexible locations
            elif any(loc in job_location or "hybrid" in job_location for loc in pref_locations):
                location_score = 10
            
            score += location_score
        
        # Experience match (10%) - More flexible
        if preferences.get("experience_level"):
            exp_mapping = {
                "entry": ["entry", "junior", "intern", "fresher"],
                "mid": ["mid", "intermediate", "senior"],
                "senior": ["senior", "lead", "principal", "staff"]
            }
            
            pref_exp = preferences["experience_level"].lower() if preferences["experience_level"] else ""
            job_exp = job.experience_level.lower()
            
            # Exact match
            if pref_exp == job_exp:
                score += 10
            else:
                # Flexible matching
                for level, keywords in exp_mapping.items():
                    if pref_exp in keywords and job_exp in keywords:
                        score += 8  # Slightly lower for category match
                        break
        
        # Domain match (15%) - Check description too
        if preferences.get("domain"):
            pref_domains = [d.strip().lower() for d in preferences["domain"].split(",")]
            job_domain_text = (job.domain + " " + job.description).lower()
            
            domain_score = 0
            for domain in pref_domains:
                if domain in job_domain_text:
                    domain_score = 15
                    break
            
            score += domain_score
        
        return {
            "score": min(score, 100),  # Cap at 100
            "matched_skills": matched_skills
        }
    
    @staticmethod
    def generate_fallback_explanation(job: Job, match_data: Dict[str, Any]) -> str:
        """Generate explanation when LLM is unavailable"""
        explanations = []
        
        if match_data["matched_skills"]:
            skills_text = ", ".join(match_data["matched_skills"][:3])
            explanations.append(f"Strong skill match with {skills_text}")
        
        explanations.append(f"Role fits {job.role_type} preferences")
        
        if "remote" in job.location.lower():
            explanations.append("Offers remote work flexibility")
        
        explanations.append(f"Domain expertise in {job.domain}")
        
        return ". ".join(explanations) + "."
    
    @staticmethod
    def rank_jobs(jobs: List[Job], preferences: Dict[str, Any], db: Session) -> List[Dict[str, Any]]:
        """Rank jobs based on preferences and return with explanations"""
        job_matches = []
        
        print(f"[MATCH] Ranking {len(jobs)} jobs with preferences: {preferences}")
        
        for job in jobs:
            if job.status != "Open":
                continue
                
            match_data = MatchingService.calculate_match_score(job, preferences)
            explanation = MatchingService.generate_fallback_explanation(job, match_data)
            
            # Debug: Print each job's score
            print(f"[MATCH] {job.title} ({job.company_name}): {match_data['score']:.1f}% - Skills: {match_data['matched_skills']}")
            
            job_matches.append({
                "job": job,
                "score": match_data["score"],
                "explanation": explanation,
                "matched_skills": match_data["matched_skills"]
            })
        
        # Sort by score descending
        job_matches.sort(key=lambda x: x["score"], reverse=True)
        
        # Debug: Show top matches before filtering
        print("[MATCH] Top matches:")
        for i, match in enumerate(job_matches[:5]):
            print(f"  {i+1}. {match['job'].title}: {match['score']:.1f}%")
        
        return job_matches[:10]  # Return top 10 matches