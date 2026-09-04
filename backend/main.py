from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from backend.config import CORS_ORIGINS
from backend.database import get_db, init_db, engine
from backend.models import (
    Patient,
    PatientCredential,
    EmergencyContact,
    PatientCondition,
    PatientAllergy,
    PatientMedication
)
from backend.schemas import (
    PatientRegisterRequest,
    PatientFlexibleRegisterRequest,
    PatientLoginRequest,
    PatientResponse,
    PatientRegisterResponse,
    LoginResponse,
    EmergencyContactSchema
)
from backend.crud import (
    create_patient_transaction,
    get_patient_by_patient_id,
    get_patient_by_email,
    get_patient_by_identifier,
    authenticate_patient,
    list_patients,
    format_patient_dict
)
from backend.security import create_access_token, decode_access_token


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize PostgreSQL tables automatically on app startup
    try:
        init_db()
        print("[OK] PostgreSQL tables initialized successfully.")
    except Exception as e:
        print(f"Warning: Failed to auto-initialize DB: {e}")
    yield


app = FastAPI(
    title="MediKiosk National Health Platform API",
    description="FastAPI Backend for MediKiosk with PostgreSQL persistent storage across 6 clinical tables.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration for Vite and Client applications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    """Health check validating both FastAPI and PostgreSQL status."""
    try:
        db.execute(text("SELECT 1;"))
        db_status = "connected"
    except Exception as e:
        db_status = f"unreachable ({str(e)})"

    return {
        "status": "online",
        "service": "MediKiosk FastAPI Backend",
        "database": {
            "type": "PostgreSQL",
            "status": db_status
        },
        "version": "1.0.0"
    }


def normalize_registration_data(data: PatientFlexibleRegisterRequest) -> PatientRegisterRequest:
    """Normalize input from various frontend formats into strict PatientRegisterRequest."""
    full_name = (data.full_name or data.name or "").strip()
    dob = (data.date_of_birth or data.dob or "").strip()
    blood_group = (data.blood_group or data.bloodGroup or "").strip()

    # Normalize emergency contact
    ec = None
    if data.emergency_contact:
        ec = data.emergency_contact
    elif data.emergencyContact and isinstance(data.emergencyContact, dict):
        ec = EmergencyContactSchema(
            name=data.emergencyContact.get("name", ""),
            relationship=data.emergencyContact.get("relation") or data.emergencyContact.get("relationship", ""),
            phone=data.emergencyContact.get("phone", "")
        )

    # Normalize medications from string or list
    meds: List[str] = []
    if data.medications and isinstance(data.medications, list):
        meds.extend(data.medications)
    elif data.currentMeds and isinstance(data.currentMeds, str):
        # e.g. "Amlodipine 5mg, Salbutamol Inhaler"
        meds.extend([m.strip() for m in data.currentMeds.split(",") if m.strip()])

    return PatientRegisterRequest(
        full_name=full_name,
        date_of_birth=dob,
        gender=data.gender or "Not Specified",
        blood_group=blood_group or "Unknown",
        phone=data.phone.strip(),
        email=data.email,
        address=data.address,
        password=data.password,
        emergency_contact=ec,
        conditions=data.conditions or [],
        allergies=data.allergies or [],
        medications=meds
    )


@app.post(
    "/api/patients/register",
    response_model=PatientRegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register Patient & Store in 6 PostgreSQL Tables"
)
@app.post(
    "/api/auth/register-patient",
    response_model=PatientRegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Alias endpoint for frontend registration"
)
def register_patient(payload: PatientFlexibleRegisterRequest, db: Session = Depends(get_db)):
    """
    1. Validates patient data via Pydantic
    2. Stores across 6 PostgreSQL relational tables in an atomic transaction:
       - patients
       - patient_credentials
       - emergency_contacts
       - patient_conditions
       - patient_allergies
       - patient_medications
    """
    # Normalize & strictly validate
    normalized_data = normalize_registration_data(payload)

    # Check if existing patient with same email already exists
    existing = get_patient_by_email(db, normalized_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A patient with email '{normalized_data.email}' is already registered."
        )

    # Create all records in transaction
    new_patient = create_patient_transaction(db, normalized_data)
    patient_dict = format_patient_dict(new_patient)

    return PatientRegisterResponse(
        success=True,
        message="Patient successfully validated and persisted in PostgreSQL database.",
        patient_id=new_patient.patient_id,
        patientId=new_patient.patient_id,
        patient=PatientResponse(**patient_dict)
    )


@app.post("/api/auth/login", response_model=LoginResponse, summary="Patient Authentication")
def login(payload: PatientLoginRequest, db: Session = Depends(get_db)):
    """
    Validates password against PostgreSQL `patient_credentials.password_hash`.
    Updates `last_login` timestamp in PostgreSQL.
    """
    patient = authenticate_patient(db, payload.identifier, payload.password)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid patient credentials or inactive account."
        )

    patient_dict = format_patient_dict(patient)
    token = create_access_token({
        "sub": patient.patient_id,
        "email": patient.email,
        "role": "patient"
    })

    return LoginResponse(
        success=True,
        token=token,
        patient_id=patient.patient_id,
        patientId=patient.patient_id,
        role="patient",
        user={
            "id": patient.patient_id,
            "entityId": patient.patient_id,
            "name": patient.full_name,
            "email": patient.email,
            "phone": patient.phone,
            "role": "patient"
        },
        patient=PatientResponse(**patient_dict)
    )


@app.get(
    "/api/patients/{patient_id}",
    response_model=PatientResponse,
    summary="Read Patient Back From PostgreSQL (Dashboard)"
)
def get_patient(patient_id: str, db: Session = Depends(get_db)):
    """Reads patient data and all 5 relational tables directly from PostgreSQL."""
    patient = get_patient_by_patient_id(db, patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID '{patient_id}' was not found in PostgreSQL."
        )
    return PatientResponse(**format_patient_dict(patient))


@app.get(
    "/api/patient/me",
    summary="Get Active Patient Profile for Dashboard"
)
def get_current_patient(
    authorization: Optional[str] = Header(None),
    patient_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Reads active patient back from PostgreSQL using JWT or patient_id query param.
    If no header or param is given, returns the most recently registered/updated patient.
    """
    target_id = patient_id

    if not target_id and authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "").strip()
        decoded = decode_access_token(token)
        if decoded:
            target_id = decoded.get("sub")

    if target_id:
        patient = get_patient_by_patient_id(db, target_id)
        if patient:
            return {"patient": format_patient_dict(patient), "source": "postgresql"}

    # Fallback to the latest registered patient from PostgreSQL
    latest = db.query(Patient).order_by(Patient.id.desc()).first()
    if latest:
        return {"patient": format_patient_dict(latest), "source": "postgresql"}

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No patient records found in PostgreSQL.")


@app.get(
    "/api/patients",
    response_model=List[PatientResponse],
    summary="List All Patients Stored in PostgreSQL"
)
def get_all_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Returns directory of all patients stored in PostgreSQL."""
    patients = list_patients(db, skip=skip, limit=limit)
    return [PatientResponse(**format_patient_dict(p)) for p in patients]
