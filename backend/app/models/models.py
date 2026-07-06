"""
SQLAlchemy ORM models for TwinCare AI.

Tables:
  users, doctors, patients, medical_history, diagnoses, medications,
  lab_results, reports, organ_summaries, diet_logs, appointments
"""
import enum
import uuid
from datetime import datetime, date
from sqlalchemy import Text
from sqlalchemy import DateTime
from sqlalchemy import func
from sqlalchemy import (
    String, Integer, Float, Boolean, ForeignKey, DateTime, Date, Text, Enum
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


class RoleEnum(str, enum.Enum):
    doctor = "doctor"
    patient = "patient"


class RiskLevel(str, enum.Enum):
    healthy = "healthy"     # green
    monitor = "monitor"     # yellow
    critical = "critical"   # red


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String)
    role: Mapped[RoleEnum] = mapped_column(Enum(RoleEnum))
    full_name: Mapped[str] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    doctor_profile: Mapped["Doctor"] = relationship(back_populates="user", uselist=False)
    patient_profile: Mapped["Patient"] = relationship(back_populates="user", uselist=False)


class Doctor(Base):
    __tablename__ = "doctors"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), unique=True)
    specialization: Mapped[str] = mapped_column(String, default="General Medicine")
    license_number: Mapped[str] = mapped_column(String, default="")

    user: Mapped["User"] = relationship(back_populates="doctor_profile")
    patients: Mapped[list["Patient"]] = relationship(back_populates="primary_doctor")


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), unique=True)
    primary_doctor_id: Mapped[str | None] = mapped_column(ForeignKey("doctors.id"), nullable=True)

    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    sex: Mapped[str] = mapped_column(String, default="unspecified")  # male/female -> twin model
    blood_type: Mapped[str] = mapped_column(String, default="")
    height_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    weight_kg: Mapped[float | None] = mapped_column(Float, nullable=True)
    synthea_patient_id: Mapped[str | None] = mapped_column(String, nullable=True)

    user: Mapped["User"] = relationship(back_populates="patient_profile")
    primary_doctor: Mapped["Doctor"] = relationship(back_populates="patients")

    medical_history: Mapped[list["MedicalHistory"]] = relationship(back_populates="patient", cascade="all, delete-orphan")
    diagnoses: Mapped[list["Diagnosis"]] = relationship(back_populates="patient", cascade="all, delete-orphan")
    medications: Mapped[list["Medication"]] = relationship(back_populates="patient", cascade="all, delete-orphan")
    lab_results: Mapped[list["LabResult"]] = relationship(back_populates="patient", cascade="all, delete-orphan")
    reports: Mapped[list["Report"]] = relationship(back_populates="patient", cascade="all, delete-orphan")
    organ_summaries: Mapped[list["OrganSummary"]] = relationship(back_populates="patient", cascade="all, delete-orphan")
    diet_logs: Mapped[list["DietLog"]] = relationship(back_populates="patient", cascade="all, delete-orphan")
    appointments: Mapped[list["Appointment"]] = relationship(back_populates="patient", cascade="all, delete-orphan")


class MedicalHistory(Base):
    """Generic chronological timeline event (used to build the Timeline module)."""
    __tablename__ = "medical_history"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id"))
    event_date: Mapped[date] = mapped_column(Date)
    title: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(Text, default="")
    category: Mapped[str] = mapped_column(String, default="general")  # diagnosis/medication/procedure/lab
    organ: Mapped[str | None] = mapped_column(String, nullable=True)

    patient: Mapped["Patient"] = relationship(back_populates="medical_history")


class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id"))
    code: Mapped[str] = mapped_column(String, default="")  # ICD-10 style code
    name: Mapped[str] = mapped_column(String)
    diagnosed_date: Mapped[date] = mapped_column(Date)
    organ: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default="active")  # active/resolved

    patient: Mapped["Patient"] = relationship(back_populates="diagnoses")


class Medication(Base):
    __tablename__ = "medications"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id"))
    name: Mapped[str] = mapped_column(String)
    dose: Mapped[str] = mapped_column(String, default="")
    frequency: Mapped[str] = mapped_column(String, default="")
    purpose: Mapped[str] = mapped_column(Text, default="")
    side_effects: Mapped[str] = mapped_column(Text, default="")
    organs_affected: Mapped[str] = mapped_column(String, default="")  # comma-separated
    interactions: Mapped[str] = mapped_column(Text, default="")
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)

    patient: Mapped["Patient"] = relationship(back_populates="medications")


class LabResult(Base):
    __tablename__ = "lab_results"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id"))
    test_name: Mapped[str] = mapped_column(String)   # e.g. Creatinine, Troponin, ALT, HbA1c
    value: Mapped[float] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String, default="")
    reference_range: Mapped[str] = mapped_column(String, default="")
    result_date: Mapped[date] = mapped_column(Date)
    organ: Mapped[str | None] = mapped_column(String, nullable=True)
    flagged: Mapped[bool] = mapped_column(Boolean, default=False)

    patient: Mapped["Patient"] = relationship(back_populates="lab_results")


class Report(Base):
    """Uploaded PDF/image reports (prescriptions, blood reports, imaging)."""
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id"))
    uploaded_by_doctor_id: Mapped[str | None] = mapped_column(ForeignKey("doctors.id"), nullable=True)
    file_path: Mapped[str] = mapped_column(String)
    file_type: Mapped[str] = mapped_column(String)  # pdf/image
    report_type: Mapped[str] = mapped_column(String, default="general")  # prescription/blood_report/imaging
    extracted_text: Mapped[str] = mapped_column(Text, default="")
    ai_summary: Mapped[str] = mapped_column(Text, default="")
    classification: Mapped[str] = mapped_column(Text, default="")  # JSON string: {diagnosis, medication, tests, procedures, organs}
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    patient: Mapped["Patient"] = relationship(back_populates="reports")


class OrganSummary(Base):
    """
    Cached AI-generated organ insight. Regenerated only when new records
    are uploaded for the patient (see services/organ_mapping.py).
    """
    __tablename__ = "organ_summaries"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id"))
    organ: Mapped[str] = mapped_column(String)  # brain/heart/lungs/liver/kidneys/pancreas/stomach/blood_vessels
    health_score: Mapped[int] = mapped_column(Integer, default=80)
    risk_level: Mapped[RiskLevel] = mapped_column(Enum(RiskLevel), default=RiskLevel.healthy)
    confidence: Mapped[float] = mapped_column(Float, default=0.7)
    trend: Mapped[str] = mapped_column(String, default="stable")  # improving/stable/declining
    ai_summary: Mapped[str] = mapped_column(Text, default="")
    suggested_followup: Mapped[str] = mapped_column(Text, default="")
    source_hash: Mapped[str] = mapped_column(String, default="")  # hash of contributing records, for cache invalidation
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient: Mapped["Patient"] = relationship(back_populates="organ_summaries")


class DietLog(Base):
    __tablename__ = "diet_logs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id"))
    image_path: Mapped[str] = mapped_column(String)
    logged_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    food_items: Mapped[str] = mapped_column(Text, default="")  # comma-separated / JSON
    calories: Mapped[float] = mapped_column(Float, default=0)
    protein_g: Mapped[float] = mapped_column(Float, default=0)
    carbs_g: Mapped[float] = mapped_column(Float, default=0)
    fat_g: Mapped[float] = mapped_column(Float, default=0)

    patient: Mapped["Patient"] = relationship(back_populates="diet_logs")


class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id"))
    doctor_id: Mapped[str] = mapped_column(ForeignKey("doctors.id"))
    scheduled_at: Mapped[datetime] = mapped_column(DateTime)
    reason: Mapped[str] = mapped_column(String, default="")
    status: Mapped[str] = mapped_column(String, default="scheduled")  # scheduled/completed/cancelled

    patient: Mapped["Patient"] = relationship(back_populates="appointments")

class AccessRequest(Base):
    __tablename__ = "access_requests"

    id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=gen_uuid,
    )

    patient_id: Mapped[str] = mapped_column(
        ForeignKey("patients.id")
    )

    hospital: Mapped[str] = mapped_column(String)

    doctor_name: Mapped[str] = mapped_column(String)

    department: Mapped[str] = mapped_column(String)

    reason: Mapped[str] = mapped_column(Text)

    status: Mapped[str] = mapped_column(
        String,
        default="pending",
    )

    requested_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    approved_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    patient: Mapped["Patient"] = relationship()    
