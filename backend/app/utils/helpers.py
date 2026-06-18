from typing import List, Dict, Any

def normalize_skills(skills_str: str) -> List[str]:
    """Normalize skills string to list of lowercase skills"""
    if not skills_str:
        return []
    return [skill.strip().lower() for skill in skills_str.split(',')]

def calculate_skill_overlap(skills1: str, skills2: str) -> float:
    """Calculate percentage overlap between two skill sets"""
    set1 = set(normalize_skills(skills1))
    set2 = set(normalize_skills(skills2))
    
    if not set1 or not set2:
        return 0.0
    
    intersection = set1 & set2
    union = set1 | set2
    
    return len(intersection) / len(union) if union else 0.0

def extract_keywords(text: str, keywords: List[str]) -> List[str]:
    """Extract matching keywords from text"""
    text_lower = text.lower()
    return [keyword for keyword in keywords if keyword.lower() in text_lower]