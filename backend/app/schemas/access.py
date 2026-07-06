from pydantic import BaseModel


class AccessRequestCreate(BaseModel):
    patient_id: str
    hospital: str
    doctor_name: str
    department: str
    reason: str


class AccessRequestResponse(BaseModel):
    id: str
    patient_id: str
    hospital: str
    doctor_name: str
    department: str
    reason: str
    status: str

    class Config:
        from_attributes = True