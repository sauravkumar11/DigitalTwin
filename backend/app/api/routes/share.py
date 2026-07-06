from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

age = None


from app.db.session import get_db
from app.models.models import Patient
router = APIRouter(prefix="/share", tags=["Share"])


@router.get("/{patient_id}")
def get_public_patient(patient_id: str, db: Session = Depends(get_db)):

    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if patient.date_of_birth:
       today = date.today()

       age = (
        today.year
        - patient.date_of_birth.year
        - (
            (today.month, today.day)
            <
            (
                patient.date_of_birth.month,
                patient.date_of_birth.day,
            )
        )
    )
    return {
    "id": patient.id,
    "full_name": patient.user.full_name,
    "age": age,
    "sex": patient.sex,
    "date_of_birth": patient.date_of_birth,
    "blood_group": patient.blood_type,
    "weight": patient.weight_kg,
}