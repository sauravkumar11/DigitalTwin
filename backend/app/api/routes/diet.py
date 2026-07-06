import os
import uuid
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import require_patient, get_current_user
from app.core.config import settings
from app.models.models import Patient, DietLog
from app.schemas.schemas import DietLogOut, DietTrendOut
from app.services.gemini_service import analyze_meal_image

router = APIRouter(prefix="/diet", tags=["diet"])


@router.post("/upload", response_model=DietLogOut)
async def upload_meal(
    file: UploadFile = File(...),
    patient: Patient = Depends(require_patient),
    db: Session = Depends(get_db),
):
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = (file.filename or "meal.jpg").split(".")[-1].lower()
    saved_name = f"{uuid.uuid4()}.{ext}"
    saved_path = os.path.join(settings.UPLOAD_DIR, saved_name)
    with open(saved_path, "wb") as f:
        f.write(await file.read())

    analysis = analyze_meal_image(saved_path)
    log = DietLog(
        patient_id=patient.id,
        image_path=saved_path,
        food_items=", ".join(analysis.get("food_items", [])),
        calories=analysis.get("calories", 0),
        protein_g=analysis.get("protein_g", 0),
        carbs_g=analysis.get("carbs_g", 0),
        fat_g=analysis.get("fat_g", 0),
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return DietLogOut.model_validate(log)


@router.get("/{patient_id}/logs", response_model=list[DietLogOut])
def get_logs(patient_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if user.role == "patient" and patient.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    logs = db.query(DietLog).filter(DietLog.patient_id == patient_id).order_by(DietLog.logged_at.desc()).all()
    return [DietLogOut.model_validate(l) for l in logs]


@router.get("/{patient_id}/trends", response_model=list[DietTrendOut])
def get_trends(patient_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Daily nutrition + weekly trend + compliance, for the doctor dashboard."""
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if user.role == "patient" and patient.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    logs = db.query(DietLog).filter(DietLog.patient_id == patient_id).all()
    by_day: dict = defaultdict(lambda: {"calories": 0.0, "protein_g": 0.0, "carbs_g": 0.0, "fat_g": 0.0})
    for l in logs:
        d = l.logged_at.date()
        by_day[d]["calories"] += l.calories
        by_day[d]["protein_g"] += l.protein_g
        by_day[d]["carbs_g"] += l.carbs_g
        by_day[d]["fat_g"] += l.fat_g

    out = []
    for d, vals in sorted(by_day.items()):
        compliance = 1500 <= vals["calories"] <= 2500  # simple demo compliance rule
        out.append(DietTrendOut(date=d, compliance=compliance, **vals))
    return out
