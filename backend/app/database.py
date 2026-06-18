from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./job_board.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def migrate_db():
    """Add new columns to existing tables without dropping data."""
    from sqlalchemy import inspect, text

    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return

    columns = {col["name"] for col in inspector.get_columns("users")}
    with engine.begin() as conn:
        if "otp_code" not in columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN otp_code VARCHAR(6)"))
        if "otp_expires_at" not in columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN otp_expires_at DATETIME"))


def create_tables():
    Base.metadata.create_all(bind=engine)
    migrate_db()