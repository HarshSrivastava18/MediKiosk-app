import random
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.models import (
    Patient,
    PatientCredential,
    EmergencyContact,
    PatientCondition,
    PatientAllergy,
    PatientMedication
)
from backend.schemas import PatientRegisterRequest, EmergencyContactSchema
from backend.security import hash_password, verify_password

def generate_patient_id() -> str:
    """Generate standardized MediKiosk National Patient ID: MK-XXXX-XXXX-XXXX"""
    p1 = random.randint(1000, 9999)
    p2 = random.randint(1000, 9999)
    p3 = random.randint(1000, 9999)
    return f"MK-{p1}-{p2}-{p3}"

def format_patient_dict(patient: Patient) -> dict:
    """Helper to convert ORM Patient and related relational tables into a clean dict."""
    return {
        "id": patient.id,
        "patient_id": patient.patient_id,
        "full_name": patient.full_name,
        "date_of_birth": patient.date_of_birth,
        "gender": patient.gender,
        "blood_group": patient.blood_group,
        "phone": patient.phone,
        "email": patient.email,
        "address": patient.address,
        "created_at": patient.created_at,
        "updated_at": patient.updated_at,
        "is_active": patient.credentials.is_active if patient.credentials else True,
        "last_login": patient.credentials.last_login if patient.credentials else None,
        "emergency_contacts": [
            {
                "name": ec.name,
                "relationship": ec.relationship,
                "phone": ec.phone
            }
            for ec in (patient.emergency_contacts or [])
        ],
        "conditions": [c.condition for c in (patient.conditions or [])],
        "allergies": [a.allergy for a in (patient.allergies or [])],
        "medications": [m.medication for m in (patient.medications or [])]
    }

def get_patient_by_patient_id(db: Session, patient_id: str) -> Optional[Patient]:
    return db.query(Patient).filter(Patient.patient_id == patient_id).first()

def get_patient_by_email(db: Session, email: str) -> Optional[Patient]:
    return db.query(Patient).filter(Patient.email == email).first()

def get_patient_by_identifier(db: Session, identifier: str) -> Optional[Patient]:
    clean_id = identifier.strip()
    return db.query(Patient).filter(
        or_(
            Patient.patient_id == clean_id,
            Patient.email == clean_id,
            Patient.phone == clean_id
        )
    ).first()

def create_patient_transaction(db: Session, data: PatientRegisterRequest) -> Patient:
    """
    Atomic transaction storing across all 6 PostgreSQL tables:
    1. patients
    2. patient_credentials
    3. emergency_contacts
    4. patient_conditions
    5. patient_allergies
    6. patient_medications
    """
    pid = data.patient_id or generate_patient_id()

    # Ensure uniqueness of patient_id
    while db.query(Patient).filter(Patient.patient_id == pid).first():
        pid = generate_patient_id()

    # 1. Insert into patients
    patient = Patient(
        patient_id=pid,
        full_name=data.full_name,
        date_of_birth=data.date_of_birth,
        gender=data.gender,
        blood_group=data.blood_group,
        phone=data.phone,
        email=data.email,
        address=data.address,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(patient)
    db.flush()  # Flush to register patient in transaction

    # 2. Insert into patient_credentials
    hashed = hash_password(data.password)
    credentials = PatientCredential(
        patient_id=pid,
        password_hash=hashed,
        is_active=True,
        created_at=datetime.utcnow()
    )
    db.add(credentials)

    # 3. Insert into emergency_contacts
    if data.emergency_contact and data.emergency_contact.name:
        ec = EmergencyContact(
            patient_id=pid,
            name=data.emergency_contact.name,
            relationship=data.emergency_contact.relationship,
            phone=data.emergency_contact.phone
        )
        db.add(ec)

    # 4. Insert into patient_conditions
    for cond_name in data.conditions:
        cleaned = cond_name.strip()
        if cleaned and cleaned.lower() != "none":
            db.add(PatientCondition(patient_id=pid, condition=cleaned))

    # 5. Insert into patient_allergies
    for allergy_name in data.allergies:
        cleaned = allergy_name.strip()
        if cleaned and cleaned.lower() != "none":
            db.add(PatientAllergy(patient_id=pid, allergy=cleaned))

    # 6. Insert into patient_medications
    for med_name in data.medications:
        cleaned = med_name.strip()
        if cleaned and cleaned.lower() != "none":
            db.add(PatientMedication(patient_id=pid, medication=cleaned))

    # Commit all tables atomically
    db.commit()
    db.refresh(patient)
    return patient

def authenticate_patient(db: Session, identifier: str, password: str) -> Optional[Patient]:
    patient = get_patient_by_identifier(db, identifier)
    if not patient:
        return None

    creds = patient.credentials
    if not creds or not creds.is_active:
        return None

    if not verify_password(password, creds.password_hash):
        return None

    # Update last login timestamp
    creds.last_login = datetime.utcnow()
    db.commit()
    db.refresh(patient)
    return patient

def list_patients(db: Session, skip: int = 0, limit: int = 100) -> List[Patient]:
    return db.query(Patient).offset(skip).limit(limit).all()
