from .jobs import router as jobs_router
from .candidates import router as candidates_router
from .applications import router as applications_router
from .dashboard import router as dashboard_router
from .ai_match import router as ai_match_router
from .auth import router as auth_router

__all__ = [
    "jobs_router",
    "candidates_router", 
    "applications_router",
    "dashboard_router",
    "ai_match_router",
    "auth_router"
]