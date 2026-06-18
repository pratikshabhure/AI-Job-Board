import bcrypt
import jwt
import secrets
import smtplib
import asyncio
from email.mime.text import MIMEText
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..models import User
from typing import Optional
import os

class AuthService:
    SECRET_KEY = "your-secret-key-change-in-production"
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 days
    OTP_EXPIRE_MINUTES = 10
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    @staticmethod
    def verify_password(password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    @staticmethod
    def create_access_token(data: dict) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=AuthService.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, AuthService.SECRET_KEY, algorithm=AuthService.ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Optional[dict]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, AuthService.SECRET_KEY, algorithms=[AuthService.ALGORITHM])
            return payload
        except jwt.PyJWTError:
            return None
    
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        user = db.query(User).filter(User.email == email).first()
        if not user or not AuthService.verify_password(password, user.password_hash):
            return None
        return user
    
    @staticmethod
    def create_user(db: Session, email: str, password: str, name: str, role: str = "candidate") -> User:
        """Create a new user"""
        hashed_password = AuthService.hash_password(password)
        user = User(
            email=email,
            password_hash=hashed_password,
            name=name,
            role=role,
            is_verified=False
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def generate_otp() -> str:
        """Generate a cryptographically secure 6-digit OTP"""
        return f"{secrets.randbelow(1_000_000):06d}"
    
    @staticmethod
    def store_otp(db: Session, user: User, otp: str) -> None:
        """Persist OTP on the user record"""
        user.otp_code = otp
        user.otp_expires_at = datetime.utcnow() + timedelta(minutes=AuthService.OTP_EXPIRE_MINUTES)
        db.commit()
        db.refresh(user)
    
    @staticmethod
    def clear_otp(db: Session, user: User) -> None:
        """Remove OTP after successful verification"""
        user.otp_code = None
        user.otp_expires_at = None
        db.commit()
    
    @staticmethod
    def _send_otp_email_sync(email: str, otp: str) -> bool:
        """Send OTP via SMTP (runs in a thread pool)"""
        smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_user = os.getenv("SMTP_USER")
        smtp_password = os.getenv("SMTP_PASSWORD")
        smtp_from = os.getenv("SMTP_FROM", smtp_user)

        if not smtp_user or not smtp_password:
            print(f"SMTP not configured. OTP for {email}: {otp}")
            return False

        message = MIMEText(
            f"Your AI Job Board verification code is: {otp}\n\n"
            f"This code expires in {AuthService.OTP_EXPIRE_MINUTES} minutes.\n\n"
            "If you did not request this, please ignore this email."
        )
        message["Subject"] = "Your AI Job Board Verification Code"
        message["From"] = smtp_from
        message["To"] = email

        try:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.sendmail(smtp_from, email, message.as_string())
            print(f"OTP email sent to {email}")
            return True
        except Exception as e:
            print(f"Failed to send OTP email to {email}: {e}")
            print(f"OTP for {email}: {otp}")
            return False
    
    @staticmethod
    async def send_otp_email(email: str, otp: str) -> bool:
        """Send OTP via email; returns False if email could not be sent"""
        return await asyncio.to_thread(AuthService._send_otp_email_sync, email, otp)
