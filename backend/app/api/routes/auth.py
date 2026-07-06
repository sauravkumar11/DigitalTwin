from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import verify_password, hash_password, create_access_token
from app.models.models import User, Doctor, Patient, RoleEnum
from app.schemas.schemas import LoginRequest, TokenResponse, RegisterRequest

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    token = create_access_token(subject=user.id, role=user.role.value)
    return TokenResponse(access_token=token, role=user.role.value, user_id=user.id, full_name=user.full_name)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if payload.role not in ("doctor", "patient"):
        raise HTTPException(status_code=400, detail="role must be 'doctor' or 'patient'")
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=RoleEnum(payload.role),
        full_name=payload.full_name,
    )
    db.add(user)
    db.flush()

    if payload.role == "doctor":
        db.add(Doctor(user_id=user.id))
    else:
        db.add(Patient(user_id=user.id, sex=payload.sex or "unspecified", date_of_birth=payload.date_of_birth))

    db.commit()
    token = create_access_token(subject=user.id, role=user.role.value)
    return TokenResponse(access_token=token, role=user.role.value, user_id=user.id, full_name=user.full_name)
