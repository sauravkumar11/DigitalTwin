from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.models import User, Doctor, Patient

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user = db.get(User, payload.get("sub"))
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    return user


def require_doctor(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Doctor:
    if user.role != "doctor":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Doctor role required")
    doctor = db.query(Doctor).filter(Doctor.user_id == user.id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor profile not found")
    return doctor


def require_patient(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Patient:
    if user.role != "patient":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Patient role required")
    patient = db.query(Patient).filter(Patient.user_id == user.id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found")
    return patient
