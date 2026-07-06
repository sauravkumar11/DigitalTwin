from datetime import datetime
import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import AccessRequest
from app.schemas.access import AccessRequestCreate
from app.crud.access import (
    create_request,
    get_patient_requests,
)

router = APIRouter(
    prefix="/access",
    tags=["Access"],
)


@router.post("/request")
def request_access(
    body: AccessRequestCreate,
    db: Session = Depends(get_db),
):
    req = AccessRequest(
    patient_id=body.patient_id,
    hospital=body.hospital,
    doctor_name=body.doctor_name,
    department=body.department,
    reason=body.reason,
    status="pending",
    requested_at=datetime.utcnow(),
)

    return create_request(db, req)


@router.get("/pending/{patient_id}")
def pending_requests(
    patient_id: str,
    db: Session = Depends(get_db),
):
    return get_patient_requests(db, patient_id)