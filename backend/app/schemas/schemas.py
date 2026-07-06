from datetime import date, datetime
from pydantic import BaseModel, EmailStr, ConfigDict


# ---------- Auth ----------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    full_name: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str  # doctor | patient
    sex: str | None = "unspecified"
    date_of_birth: date | None = None


# ---------- Patient ----------
class PatientOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    full_name: str | None = None
    sex: str
    date_of_birth: date | None
    blood_type: str
    height_cm: float | None
    weight_kg: float | None


class PatientListItem(BaseModel):
    id: str
    full_name: str
    sex: str
    date_of_birth: date | None
    last_report_date: datetime | None = None
    alert_count: int = 0


# ---------- Medical records ----------
class DiagnosisOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    code: str
    name: str
    diagnosed_date: date
    organ: str | None
    status: str


class MedicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    dose: str
    frequency: str
    purpose: str
    side_effects: str
    organs_affected: str
    interactions: str
    active: bool


class LabResultOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    test_name: str
    value: float
    unit: str
    reference_range: str
    result_date: date
    organ: str | None
    flagged: bool


class TimelineEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    event_date: date
    title: str
    description: str
    category: str
    organ: str | None


# ---------- Organ insight ----------
class OrganInsightOut(BaseModel):
    organ: str
    health_score: int
    risk_level: str
    confidence: float
    trend: str
    ai_summary: str
    suggested_followup: str
    current_conditions: list[str]
    past_diagnoses: list[DiagnosisOut]
    relevant_medications: list[MedicationOut]
    lab_results: list[LabResultOut]
    timeline: list[TimelineEventOut]
    updated_at: datetime


class OrganOverview(BaseModel):
    organ: str
    health_score: int
    risk_level: str
    trend: str


# ---------- Reports ----------
class ReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    file_type: str
    report_type: str
    ai_summary: str
    classification: str
    uploaded_at: datetime


# ---------- Diet ----------
class DietLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    logged_at: datetime
    food_items: str
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float


class DietTrendOut(BaseModel):
    date: date
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    compliance: bool


class AccessRequestCreate(BaseModel):

    patient_id:str

    hospital:str

    doctor_name:str

    department:str

    reason:str


class AccessRequestResponse(BaseModel):

    id:str

    hospital:str

    doctor_name:str

    department:str

    reason:str

    status:str

    class Config:

        from_attributes=True