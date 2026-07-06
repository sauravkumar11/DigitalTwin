from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import require_doctor, get_current_user
from app.models.models import Patient, Medication
from app.schemas.schemas import MedicationOut

router = APIRouter(prefix="/medications", tags=["medications"])


class MedicationIn(MedicationOut):
    id: str | None = None  # ignored on create


@router.get("/{patient_id}", response_model=list[MedicationOut])
def list_medications(patient_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if user.role == "patient" and patient.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return [MedicationOut.model_validate(m) for m in patient.medications]


@router.post("/{patient_id}", response_model=MedicationOut, status_code=201)
def add_medication(patient_id: str, payload: dict, doctor=Depends(require_doctor), db: Session = Depends(get_db)):
    """Doctor-only: patients have read-only access and cannot edit prescriptions."""
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    med = Medication(
        patient_id=patient.id,
        name=payload.get("name", ""),
        dose=payload.get("dose", ""),
        frequency=payload.get("frequency", ""),
        purpose=payload.get("purpose", ""),
        side_effects=payload.get("side_effects", ""),
        organs_affected=payload.get("organs_affected", ""),
        interactions=payload.get("interactions", ""),
        active=payload.get("active", True),
    )
    db.add(med)
    db.commit()
    db.refresh(med)
    return MedicationOut.model_validate(med)
