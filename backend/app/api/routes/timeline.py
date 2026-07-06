from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.models import Patient, MedicalHistory
from app.schemas.schemas import TimelineEventOut

router = APIRouter(prefix="/timeline", tags=["timeline"])


@router.get("/{patient_id}", response_model=list[TimelineEventOut])
def get_timeline(patient_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if user.role == "patient" and patient.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    events = (
        db.query(MedicalHistory)
        .filter(MedicalHistory.patient_id == patient_id)
        .order_by(MedicalHistory.event_date.asc())
        .all()
    )
    return [TimelineEventOut.model_validate(e) for e in events]
