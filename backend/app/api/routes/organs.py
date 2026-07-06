from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import require_doctor, require_patient, get_current_user
from app.models.models import Patient, OrganSummary, Diagnosis, Medication, LabResult, MedicalHistory, User
from app.schemas.schemas import OrganInsightOut, OrganOverview, DiagnosisOut, MedicationOut, LabResultOut, TimelineEventOut
from app.services.organ_mapping import ORGANS, compute_source_hash
from app.services.gemini_service import generate_organ_insight

router = APIRouter(prefix="/organs", tags=["organ-insights"])


def _get_patient_or_403(patient_id: str, user: User, db: Session) -> Patient:
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if user.role == "patient" and patient.user_id != user.id:
        raise HTTPException(status_code=403, detail="Cannot access another patient's data")
    return patient


def _build_context_and_hash(patient: Patient, organ: str, db: Session):
    diagnoses = [d for d in patient.diagnoses if d.organ == organ]
    medications = [m for m in patient.medications if organ in (m.organs_affected or "")]
    labs = [l for l in patient.lab_results if l.organ == organ]
    timeline = [t for t in patient.medical_history if t.organ == organ]

    ids = (
        [f"dx:{d.id}:{d.status}" for d in diagnoses]
        + [f"med:{m.id}:{m.active}" for m in medications]
        + [f"lab:{l.id}:{l.value}" for l in labs]
    )
    source_hash = compute_source_hash(*ids) if ids else "empty"

    context = {
        "organ": organ,
        "patient_sex": patient.sex,
        "diagnoses": [{"name": d.name, "status": d.status, "date": str(d.diagnosed_date)} for d in diagnoses],
        "medications": [{"name": m.name, "dose": m.dose, "purpose": m.purpose} for m in medications],
        "lab_results": [
            {"test": l.test_name, "value": l.value, "unit": l.unit, "flagged": l.flagged, "date": str(l.result_date)}
            for l in labs
        ],
    }
    return context, source_hash, diagnoses, medications, labs, timeline


@router.get("/{patient_id}/overview", response_model=list[OrganOverview])
def organ_overview(patient_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Color-coded overview for all 8 organs on the digital twin."""
    patient = _get_patient_or_403(patient_id, user, db)
    summaries = {s.organ: s for s in patient.organ_summaries}

    out = []
    for organ in ORGANS:
        s = summaries.get(organ)
        if s:
            out.append(OrganOverview(organ=organ, health_score=s.health_score, risk_level=s.risk_level.value, trend=s.trend))
        else:
            out.append(OrganOverview(organ=organ, health_score=85, risk_level="healthy", trend="stable"))
    return out


@router.get("/{patient_id}/{organ}", response_model=OrganInsightOut)
def get_organ_insight(patient_id: str, organ: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Click an organ on the 3D twin -> gather patient context -> (re)generate via
    Gemini if stale -> return full insight.
    """
    if organ not in ORGANS:
        raise HTTPException(status_code=400, detail=f"Unknown organ. Must be one of {ORGANS}")

    patient = _get_patient_or_403(patient_id, user, db)
    context, source_hash, diagnoses, medications, labs, timeline = _build_context_and_hash(patient, organ, db)

    existing = (
        db.query(OrganSummary)
        .filter(OrganSummary.patient_id == patient.id, OrganSummary.organ == organ)
        .first()
    )

    if existing is None or existing.source_hash != source_hash:
        ai_result = generate_organ_insight(organ, context)
        if existing is None:
            existing = OrganSummary(patient_id=patient.id, organ=organ)
            db.add(existing)
        existing.health_score = int(ai_result.get("health_score", 80))
        existing.risk_level = ai_result.get("risk_level", "healthy")
        existing.confidence = float(ai_result.get("confidence", 0.7))
        existing.trend = ai_result.get("trend", "stable")
        existing.ai_summary = ai_result.get("ai_summary", "")
        existing.suggested_followup = ai_result.get("suggested_followup", "")
        existing.source_hash = source_hash
        db.commit()
        db.refresh(existing)

    return OrganInsightOut(
        organ=organ,
        health_score=existing.health_score,
        risk_level=existing.risk_level.value if hasattr(existing.risk_level, "value") else existing.risk_level,
        confidence=existing.confidence,
        trend=existing.trend,
        ai_summary=existing.ai_summary,
        suggested_followup=existing.suggested_followup,
        current_conditions=[d.name for d in diagnoses if d.status == "active"],
        past_diagnoses=[DiagnosisOut.model_validate(d) for d in diagnoses],
        relevant_medications=[MedicationOut.model_validate(m) for m in medications],
        lab_results=[LabResultOut.model_validate(l) for l in labs],
        timeline=[TimelineEventOut.model_validate(t) for t in timeline],
        updated_at=existing.updated_at,
    )
