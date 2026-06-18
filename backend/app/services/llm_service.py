import httpx
import json
import os
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

class LLMService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"
        
        # Debug: Print API key info (first/last 4 chars only)
        if self.api_key:
            print(f"[LLM] API Key format: {self.api_key[:4]}...{self.api_key[-4:]} (length: {len(self.api_key)})")
        else:
            print("[LLM] No API key found!")
    
    async def extract_preferences(self, query: str) -> Optional[Dict[str, Any]]:
        """Extract structured preferences from natural language query"""
        if not self.api_key:
            print("[LLM] No Groq API key found")
            return None
        
        # Valid Groq models (as backup)
        valid_models = [
            "llama-3.1-8b-instant",
            "llama-3.1-70b-versatile", 
            "llama3-8b-8192",
            "llama3-70b-8192",
            "mixtral-8x7b-32768",
            "gemma-7b-it"
        ]
        
        # Use a known working model if current one isn't in the list
        model_to_use = self.model if self.model in valid_models else "llama3-8b-8192"
        print(f"[LLM] Using model: {model_to_use}")
        
        prompt = f"""Extract job preferences from this query: "{query}"

Return ONLY a JSON object with these exact keys (use null for missing info):
{{
    "role": "job role/position type",
    "skills": "comma-separated technical skills", 
    "location": "preferred locations (comma-separated)",
    "domain": "industry/domain preference",
    "experience_level": "entry/mid/senior"
}}

Query: {query}
JSON:"""
        
        try:
            print(f"[LLM] Sending preference extraction to {model_to_use}")
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.base_url,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": model_to_use,
                        "messages": [
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.1,
                        "max_tokens": 300
                    },
                    timeout=15.0
                )
                
                print(f"[LLM] Groq Response Status: {response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    content = result["choices"][0]["message"]["content"]
                    print(f"[LLM] Raw AI Response: {content[:200]}...")
                    
                    # Extract JSON from response
                    json_start = content.find("{")
                    json_end = content.rfind("}") + 1
                    if json_start != -1 and json_end > json_start:
                        json_str = content[json_start:json_end]
                        parsed = json.loads(json_str)
                        print(f"[LLM] Parsed Preferences: {parsed}")
                        return parsed
                else:
                    error_text = response.text
                    print(f"[LLM] Groq Error {response.status_code}: {error_text}")
                
        except Exception as e:
            print(f"[LLM] extraction error: {e}")
        
        return None
    
    async def generate_match_explanations(self, jobs_with_scores: list, query: str) -> Dict[int, str]:
        """Generate explanations for job matches"""
        if not self.api_key or not jobs_with_scores:
            return {}
        
        # Prepare job summaries for the prompt
        job_summaries = []
        for item in jobs_with_scores[:5]:  # Only top 5 for cost efficiency
            job = item["job"]
            score = item["score"]
            matched_skills = item.get("matched_skills", [])
            job_summaries.append({
                "id": job.id,
                "title": job.title,
                "company": job.company_name,
                "skills": job.required_skills,
                "location": job.location,
                "domain": job.domain,
                "score": score,
                "matched_skills": matched_skills
            })
        
        prompt = f"""For each job below, write a specific 1-sentence explanation of why it matches this query: "{query}"

Jobs to explain:
{json.dumps(job_summaries, indent=2)}

Return ONLY a JSON object like this:
{{
    "1": "Strong match because this Python backend role requires FastAPI skills you mentioned and offers remote work in healthcare domain",
    "2": "Good fit as it matches your React frontend preferences and is in the fintech sector you're interested in"
}}

Focus on specific skill matches, location preferences, domain interests, and experience level alignment.
JSON:"""
        
        try:
            print(f"[LLM] Generating explanations for {len(job_summaries)} jobs")
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.base_url,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.3,
                        "max_tokens": 400
                    },
                    timeout=20.0
                )
                
                print(f"[LLM] Explanations Response Status: {response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    content = result["choices"][0]["message"]["content"]
                    print(f"[LLM] Raw Explanations: {content[:300]}...")
                    
                    # Extract JSON from response
                    json_start = content.find("{")
                    json_end = content.rfind("}") + 1
                    if json_start != -1 and json_end > json_start:
                        json_str = content[json_start:json_end]
                        explanations = json.loads(json_str)
                        
                        # Convert string keys to int
                        result_dict = {int(k): v for k, v in explanations.items()}
                        print(f"[LLM] Generated {len(result_dict)} AI explanations")
                        return result_dict
                else:
                    error_text = response.text
                    print(f"[LLM] Explanations Error {response.status_code}: {error_text}")
                
        except Exception as e:
            print(f"[LLM] explanation error: {e}")
        
        return {}