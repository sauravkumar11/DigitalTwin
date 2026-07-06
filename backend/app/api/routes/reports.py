import json
import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import require_doctor, get_current_user
from app.core.config import settings
from app.models.models import Patient, Report, MedicalHistory
from app.schemas.schemas import ReportOut
from app.services.gemini_service import summarize_report_text
from app.services.organ_mapping import map_condition_to_organ

router = APIRouter(prefix="/reports", tags=["reports"])


def _extract_text(file_path: str, file_type: str) -> str:
    if file_type == "pdf":
        try:
            from pypdf import PdfReader
            reader = PdfReader(file_path)
            return "\n".join((page.extract_text() or "") for page in reader.pages)
        except Exception:
            return ""
    # For images, OCR could be wired in (e.g. pytesseract). Left as an
    # extension point; Gemini Vision can also be used directly on the image.
    return ""


@router.post("", response_model=ReportOut)
async def upload_report(
    patient_id: str = Form(...),
    report_type: str = Form("general"),
    file: UploadFile = File(...),
    doctor=Depends(require_doctor),
    db: Session = Depends(get_db),
):
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = (file.filename or "upload").split(".")[-1].lower()
    file_type = "pdf" if ext == "pdf" else "image"
    saved_name = f"{uuid.uuid4()}.{ext}"
    saved_path = os.path.join(settings.UPLOAD_DIR, saved_name)
    with open(saved_path, "wb") as f:
        f.write(await file.read())

    extracted_text = _extract_text(saved_path, file_type)
    ai_result = summarize_report_text(extracted_text) if extracted_text else {
        "summary": "No extractable text (image report). Consider enabling OCR or Gemini Vision.",
        "diagnosis": [], "medication": [], "tests": [], "procedures": [], "organs": [],
    }

    report = Report(
        patient_id=patient.id,
        uploaded_by_doctor_id=doctor.id,
        file_path=saved_path,
        file_type=file_type,
        report_type=report_type,
        extracted_text=extracted_text,
        ai_summary=ai_result.get("summary", ""),
        classification=json.dumps(ai_result),
    )
    db.add(report)

    # Add a timeline entry so this shows up in the medical timeline module
    for dx in ai_result.get("diagnosis", []):
        organ = map_condition_to_organ(str(dx))
        db.add(MedicalHistory(
            patient_id=patient.id,
            event_date=report.uploaded_at.date() if hasattr(report.uploaded_at, "date") else __import__("datetime").date.today(),
            title=str(dx),
            description=f"From uploaded {report_type} report",
            category="diagnosis",
            organ=organ,
        ))

    db.commit()
    db.refresh(report)
    return ReportOut.model_validate(report)


@router.get("/{patient_id}", response_model=list[ReportOut])
def list_reports(patient_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if user.role == "patient" and patient.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    reports = (
        db.query(Report).filter(Report.patient_id == patient_id).order_by(Report.uploaded_at.desc()).all()
    )
    return [ReportOut.model_validate(r) for r in reports]
