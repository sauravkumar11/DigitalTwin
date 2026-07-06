"""
Seeds the database with:
  - 1 demo doctor account (doctor@twincare.ai / doctor123)
  - 1 demo patient account (patient@twincare.ai / patient123) with rich data
  - 24 additional synthetic patients modeled on Synthea-style profiles
    (demographics, diagnoses, medications, labs, timeline events)

Run with:  python -m app.seed.seed_data
"""
import random
from datetime import date, timedelta

from faker import Faker

from app.db.session import SessionLocal, Base, engine
from app.core.security import hash_password
from app.models.models import (
    User, Doctor, Patient, Diagnosis, Medication, LabResult,
    MedicalHistory, RoleEnum,
)
from app.services.organ_mapping import map_condition_to_organ, map_lab_to_organ

fake = Faker()
random.seed(42)
Faker.seed(42)

CONDITIONS = [
    ("Asthma", "E45"), ("Hypertension", "I10"), ("Type 2 Diabetes", "E11"),
    ("Chronic Kidney Disease", "N18"), ("Coronary Artery Disease", "I25"),
    ("Fatty Liver Disease", "K76"), ("Gastritis", "K29"), ("Migraine", "G43"),
    ("Hepatitis B", "B18.1"), ("Atherosclerosis", "I70"),
]

MEDICATIONS = [
    ("Metformin", "500mg", "Twice daily", "Lowers blood glucose", "Nausea, GI upset", "pancreas"),
    ("Lisinopril", "10mg", "Once daily", "Manages blood pressure", "Dry cough, dizziness", "blood_vessels,heart"),
    ("Atorvastatin", "20mg", "Once nightly", "Lowers cholesterol", "Muscle aches", "blood_vessels,liver"),
    ("Albuterol", "90mcg", "As needed", "Bronchodilator for asthma", "Tremor, palpitations", "lungs"),
    ("Omeprazole", "20mg", "Once daily", "Reduces stomach acid", "Headache, diarrhea", "stomach"),
]

LAB_TESTS = [
    ("Creatinine", 0.6, 1.3, "mg/dL"), ("Troponin", 0.0, 0.04, "ng/mL"),
    ("ALT", 7, 56, "U/L"), ("HbA1c", 4.0, 5.6, "%"), ("LDL", 0, 100, "mg/dL"),
]


def random_date(start_year=2020, end_year=2025) -> date:
    start = date(start_year, 1, 1)
    end = date(end_year, 12, 31)
    return start + timedelta(days=random.randint(0, (end - start).days))


def create_patient_record(db, doctor: Doctor, email: str, full_name: str, sex: str, dob: date, rich=False):
    user = User(email=email, hashed_password=hash_password("patient123"), role=RoleEnum.patient, full_name=full_name)
    db.add(user)
    db.flush()

    patient = Patient(
        user_id=user.id,
        primary_doctor_id=doctor.id,
        date_of_birth=dob,
        sex=sex,
        blood_type=random.choice(["A+", "A-", "B+", "B-", "O+", "O-", "AB+"]),
        height_cm=round(random.uniform(150, 190), 1),
        weight_kg=round(random.uniform(50, 100), 1),
        synthea_patient_id=f"synthea-{fake.uuid4()[:8]}",
    )
    db.add(patient)
    db.flush()

    n_conditions = random.randint(2, 4) if rich else random.randint(1, 3)
    chosen = random.sample(CONDITIONS, n_conditions)
    for name, code in chosen:
        d_date = random_date()
        organ = map_condition_to_organ(name)
        db.add(Diagnosis(patient_id=patient.id, code=code, name=name, diagnosed_date=d_date,
                          organ=organ, status=random.choice(["active", "active", "resolved"])))
        db.add(MedicalHistory(patient_id=patient.id, event_date=d_date, title=name,
                               description=f"Diagnosed with {name}", category="diagnosis", organ=organ))

    n_meds = random.randint(1, 3)
    for name, dose, freq, purpose, side_effects, organs in random.sample(MEDICATIONS, n_meds):
        db.add(Medication(patient_id=patient.id, name=name, dose=dose, frequency=freq,
                           purpose=purpose, side_effects=side_effects, organs_affected=organs,
                           interactions="Consult doctor before combining with other prescriptions.",
                           start_date=random_date(), active=True))

    n_labs = random.randint(3, 6)
    for test_name, lo, hi, unit in random.sample(LAB_TESTS * 2, n_labs):
        flagged = random.random() < 0.35
        value = round(random.uniform(hi, hi * 1.6), 2) if flagged else round(random.uniform(lo, hi), 2)
        organ = map_lab_to_organ(test_name)
        r_date = random_date()
        db.add(LabResult(patient_id=patient.id, test_name=test_name, value=value, unit=unit,
                          reference_range=f"{lo}-{hi}", result_date=r_date, organ=organ, flagged=flagged))
        db.add(MedicalHistory(patient_id=patient.id, event_date=r_date, title=f"{test_name} test",
                               description=f"Result: {value} {unit}", category="lab", organ=organ))

    return patient


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).filter(User.email == "doctor@twincare.ai").first():
            print("Seed data already present. Skipping.")
            return

        # Demo doctor
        doc_user = User(email="doctor@twincare.ai", hashed_password=hash_password("doctor123"),
                         role=RoleEnum.doctor, full_name="Dr. Asha Mehta")
        db.add(doc_user)
        db.flush()
        doctor = Doctor(user_id=doc_user.id, specialization="Internal Medicine", license_number="MCI-100234")
        db.add(doctor)
        db.flush()

        # Rich demo patient (deterministic login: patient@twincare.ai / patient123)
        create_patient_record(
            db, doctor, "patient@twincare.ai", "Rohan Kapoor", "male", date(1985, 6, 12), rich=True
        )

        # 24 additional synthetic patients
        for i in range(24):
            sex = random.choice(["male", "female"])
            name = fake.name_male() if sex == "male" else fake.name_female()
            email = f"patient{i+2}@twincare.ai"
            dob = date(random.randint(1950, 2005), random.randint(1, 12), random.randint(1, 28))
            create_patient_record(db, doctor, email, name, sex, dob)

        db.commit()
        print("Seeded 1 doctor + 25 patients (24 synthetic + 1 rich demo patient).")
        print("Doctor login:  doctor@twincare.ai  / doctor123")
        print("Patient login: patient@twincare.ai / patient123")
    finally:
        db.close()


if __name__ == "__main__":
    run()
