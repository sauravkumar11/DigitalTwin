from sqlalchemy.orm import Session

from app.models.models import AccessRequest


def create_request(
    db:Session,
    obj:AccessRequest
):

    db.add(obj)

    db.commit()

    db.refresh(obj)

    return obj


def get_patient_requests(
    db:Session,
    patient_id:str
):

    return (

        db.query(AccessRequest)

        .filter(

            AccessRequest.patient_id==patient_id,

            AccessRequest.status=="pending"

        )

        .order_by(

            AccessRequest.requested_at.desc()

        )

        .all()

    )