from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import require_doctor, require_patient
from app.models.models import Patient, User, Report
from app.schemas.schemas import PatientListItem, PatientOut

router = APIRouter(prefix="/patients", tags=["patients"])


@router.get("", response_model=list[PatientListItem])
def list_patients(
    search: str | None = Query(default=None),
    doctor=Depends(require_doctor),
    db: Session = Depends(get_db),
):
    """Doctor dashboard: total patients + search."""
    q = db.query(Patient).join(User, Patient.user_id == User.id)
    if search:
        q = q.filter(User.full_name.ilike(f"%{search}%"))
    patients = q.all()

    results = []
    for p in patients:
        last_report = (
            db.query(Report)
            .filter(Report.patient_id == p.id)
            .order_by(Report.uploaded_at.desc())
            .first()
        )
        flagged_labs = sum(1 for lr in p.lab_results if lr.flagged)
        results.append(
            PatientListItem(
                id=p.id,
                full_name=p.user.full_name,
                sex=p.sex,
                date_of_birth=p.date_of_birth,
                last_report_date=last_report.uploaded_at if last_report else None,
                alert_count=flagged_labs,
            )
        )
    return results


@router.get("/me", response_model=PatientOut)
def get_my_profile(patient: Patient = Depends(require_patient)):
    out = PatientOut.model_validate(patient)
    out.full_name = patient.user.full_name
    return out


@router.get("/{patient_id}", response_model=PatientOut)
def get_patient(patient_id: str, doctor=Depends(require_doctor), db: Session = Depends(get_db)):
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    out = PatientOut.model_validate(patient)
    out.full_name = patient.user.full_name
    return out
