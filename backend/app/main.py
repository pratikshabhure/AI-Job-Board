from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from .database import create_tables, get_db

# Import ALL models so SQLAlchemy creates their tables
from .models import Job, CandidateProfile, Application, User  # noqa: F401

from .services import SeedService
from .routers import (
    jobs_router,
    candidates_router,
    applications_router,
    dashboard_router,
    ai_match_router,
    auth_router
)

# Create all tables on startup
create_tables()

# Auto-seed database if empty
from .database import SessionLocal
from .models import User
db = SessionLocal()
try:
    if db.query(User).count() == 0:
        print("[STARTUP] Database is empty, auto-seeding demo data...")
        SeedService.seed_all_data(db)
except Exception as e:
    print(f"[STARTUP] Auto-seeding failed: {e}")
finally:
    db.close()

app = FastAPI(
    title="AI Job Board API",
    description="AI-powered job board with candidate matching",
    version="1.0.0"
)

import os
allowed_origins = ["http://localhost:5173", "http://localhost:3000"]
env_origins = os.getenv("ALLOWED_ORIGINS")
if env_origins:
    allowed_origins.extend([o.strip() for o in env_origins.split(",")])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
    )

app.include_router(auth_router)
app.include_router(jobs_router)
app.include_router(candidates_router)
app.include_router(applications_router)
app.include_router(dashboard_router)
app.include_router(ai_match_router)


@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "AI Job Board API is running"}


@app.post("/seed-demo-data")
def seed_demo_data(db: Session = Depends(get_db)):
    try:
        SeedService.seed_all_data(db)
        return {"message": "Demo data seeded successfully"}
    except Exception as e:
        return {"error": f"Failed to seed data: {str(e)}"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
