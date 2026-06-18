from pydantic import BaseModel
from typing import Optional

class MatchRequest1(BaseModel):
    query: str
    candidate_id: Optional[int] = None

class MatchRequest2(BaseModel):
    query: str
    candidate_id: int | None = None

try:
    m1 = MatchRequest1(query="test", candidate_id=None)
    print("MatchRequest1 succeeded with None")
except Exception as e:
    print("MatchRequest1 failed:", e)

try:
    m2 = MatchRequest2(query="test", candidate_id=None)
    print("MatchRequest2 succeeded with None")
except Exception as e:
    print("MatchRequest2 failed:", e)
