from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db
from ..models import User
from ..schemas.auth import UserSignup, UserLogin, UserResponse, TokenResponse, OTPRequest, OTPVerify
from ..services import AuthService

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    payload = AuthService.verify_token(token)

    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user


@router.post("/signup", response_model=dict)
async def signup(user_data: UserSignup, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = AuthService.create_user(db, user_data.email, user_data.password, user_data.name, user_data.role)

    otp = AuthService.generate_otp()
    AuthService.store_otp(db, user, otp)

    email_sent = await AuthService.send_otp_email(user_data.email, otp)

    response = {
        "message": "Account created. Check your email for the verification code.",
        "email": user_data.email,
        "email_sent": email_sent,
    }
    if not email_sent:
        response["otp"] = otp
        response["message"] = "Account created. Use the verification code shown below."

    return response


@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(otp_data: OTPVerify, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == otp_data.email).first()

    if not user or not user.otp_code:
        raise HTTPException(status_code=400, detail="No OTP found. Request a new one.")

    if user.otp_expires_at and user.otp_expires_at < datetime.utcnow():
        AuthService.clear_otp(db, user)
        raise HTTPException(status_code=400, detail="OTP has expired. Request a new one.")

    if user.otp_code != otp_data.otp.strip():
        raise HTTPException(status_code=400, detail="Invalid OTP code.")

    user.is_verified = True
    user.is_active = True
    AuthService.clear_otp(db, user)
    db.refresh(user)

    token = AuthService.create_access_token(
        {"user_id": user.id, "email": user.email, "role": user.role}
    )

    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = AuthService.authenticate_user(db, login_data.email, login_data.password)

    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    if not user.is_verified:
        raise HTTPException(status_code=401, detail="Account not verified. Please check your email for OTP.")

    if not user.is_active:
        raise HTTPException(status_code=401, detail="Account is deactivated")

    token = AuthService.create_access_token(
        {"user_id": user.id, "email": user.email, "role": user.role}
    )

    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/resend-otp", response_model=dict)
async def resend_otp(otp_request: OTPRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == otp_request.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_verified:
        raise HTTPException(status_code=400, detail="Account already verified")

    otp = AuthService.generate_otp()
    AuthService.store_otp(db, user, otp)

    email_sent = await AuthService.send_otp_email(otp_request.email, otp)

    response = {"message": "OTP resent successfully", "email_sent": email_sent}
    if not email_sent:
        response["otp"] = otp
        response["message"] = "New verification code generated. Use the code shown below."

    return response


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
