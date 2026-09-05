import os
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Header, Query
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
    PatientMedication,
    HospitalApplication,
    HospitalUser,
    StaffUser,
    MedicalSummary,
    DoctorAssignment
)
from backend.schemas import (
    PatientRegisterRequest,
    PatientFlexibleRegisterRequest,
    PatientLoginRequest,
    PatientResponse,
    PatientRegisterResponse,
    LoginResponse,
    EmergencyContactSchema,
    HospitalRegisterRequest,
    HospitalApplicationResponse,
    HospitalRegisterResponse,
    VerificationDecisionRequest,
    VerificationDecisionResponse,
    MedicalSummaryCreateRequest,
    MedicalSummaryResponse,
    DoctorAssignmentResponse,
    AssignDoctorRequest,
    HospitalDoctorResponse,
    PatientSummaryStatusResponse
)
from backend.crud import (
    create_patient_transaction,
    get_patient_by_patient_id,
    get_patient_by_email,
    get_patient_by_identifier,
    authenticate_patient,
    list_patients,
    format_patient_dict,
    check_duplicate_hospital,
    create_hospital_application_transaction,
    list_hospital_applications,
    get_hospital_application_by_id,
    approve_hospital_application,
    reject_hospital_application,
    authenticate_hospital_user,
    authenticate_staff_user,
    format_hospital_application_dict,
    create_medical_summary,
    get_medical_summary_by_id,
    list_patient_summaries,
    list_hospital_summaries,
    list_hospital_doctors,
    assign_doctor_to_summary,
    list_doctor_assignments,
    get_doctor_assignment_by_id,
    get_patient_latest_summary_status,
    format_summary_dict,
    format_assignment_dict
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


@app.post("/api/auth/login", response_model=LoginResponse, summary="Unified Authentication (Patient & Hospital Admin)")
def login(payload: PatientLoginRequest, db: Session = Depends(get_db)):
    """
    Unified Login:
    - Role 'patient': checks `patient_credentials` in PostgreSQL.
    - Role 'hospital': checks `hospital_users` in PostgreSQL.
      If application is still 'pending', returns 403 Forbidden with clear explanation!
    """
    role = (payload.role or "patient").lower()
    clean_id = payload.identifier.strip()

    if role == "hospital":
        # Authenticate against hospital_users in PostgreSQL
        hospital_user = authenticate_hospital_user(db, clean_id, payload.password)
        if not hospital_user:
            # Check if an application is still pending or was rejected
            existing_app = db.query(HospitalApplication).filter(
                (HospitalApplication.official_email.ilike(clean_id)) |
                (HospitalApplication.application_id.ilike(clean_id))
            ).first()

            if existing_app:
                if existing_app.status == "pending":
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Application '{existing_app.application_id}' for {existing_app.hospital_name} is currently PENDING Super Admin verification. An active login account is only generated after verification approval."
                    )
                elif existing_app.status == "rejected":
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Application for {existing_app.hospital_name} was REJECTED: {existing_app.rejection_reason or 'Eligibility criteria not met'}"
                    )

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Hospital Organization ID / Email or Password."
            )

        token = create_access_token({
            "sub": hospital_user.hospital_id,
            "email": hospital_user.email,
            "role": "hospital"
        })

        return LoginResponse(
            success=True,
            token=token,
            role="hospital",
            user={
                "id": hospital_user.hospital_id,
                "entityId": hospital_user.hospital_id,
                "name": hospital_user.name,
                "email": hospital_user.email,
                "phone": hospital_user.phone,
                "role": "hospital"
            }
        )

    if role in ["doctor", "admin"]:
        staff_user = authenticate_staff_user(db, clean_id, payload.password, role)
        if not staff_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid {role.capitalize()} credentials or account inactive."
            )

        token = create_access_token({
            "sub": staff_user.staff_id,
            "email": staff_user.email,
            "role": staff_user.role
        })

        return LoginResponse(
            success=True,
            token=token,
            role=staff_user.role,
            user={
                "id": staff_user.staff_id,
                "entityId": staff_user.staff_id,
                "name": staff_user.name,
                "email": staff_user.email,
                "phone": staff_user.phone,
                "role": staff_user.role,
                "title": staff_user.title,
                "department": staff_user.department,
                "specialty": staff_user.specialty,
                "hospital": staff_user.hospital_name
            }
        )

    # Default: Patient Login
    patient = authenticate_patient(db, clean_id, payload.password)
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


# ==========================================
# HOSPITAL REGISTRATION & VERIFICATION ENDPOINTS
# ==========================================

@app.post(
    "/api/hospitals/register",
    response_model=HospitalRegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Hospital Registration (Stage 1: Pending Verification)"
)
@app.post(
    "/api/auth/register-hospital",
    response_model=HospitalRegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Alias for Hospital Registration"
)
def register_hospital(payload: HospitalRegisterRequest, db: Session = Depends(get_db)):
    """
    Stage 1: Hospital Registration
    1. Validates all legal and clinical fields via Pydantic
    2. Strict duplicate check (registration number and email)
    3. Persists application across:
       - hospital_applications (status = 'pending')
       - hospital_infrastructure
       - hospital_departments
       - hospital_documents
    4. Generates unique tracking ID: APP-2026-XXXXXX
    NOTE: Does NOT create an active login account (Registration != Login).
    """
    hospital_name = (payload.hospital_name or payload.hospitalName or "").strip()
    if not hospital_name or len(hospital_name) < 2:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Hospital name must be at least 2 characters long."
        )

    reg_number = (payload.registration_number or payload.regNumber or "").strip()
    if not reg_number or len(reg_number) < 3:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Valid clinical establishment registration number is required."
        )

    official_email = (payload.official_email or payload.officialEmail)
    if not official_email:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Valid official hospital email address is required."
        )

    # 1. Check for duplicate registration
    is_dup, dup_reason = check_duplicate_hospital(db, reg_number, str(official_email))
    if is_dup:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=dup_reason
        )

    # 2. Extract infrastructure & details
    branches_count = payload.branches_count if payload.branches_count is not None else (payload.branchesCount or 1)
    total_beds = payload.total_beds if payload.total_beds is not None else (payload.totalBeds or 0)
    icu_beds = payload.icu_beds if payload.icu_beds is not None else (payload.icuBeds or 0)
    has_emergency = payload.has_emergency if payload.has_emergency is not None else (payload.hasEmergency if payload.hasEmergency is not None else True)

    hospital_data = {
        "hospital_name": hospital_name,
        "hospital_type": payload.hospital_type or payload.hospitalType or "Private",
        "registration_number": reg_number,
        "state": payload.state or "Not Specified",
        "city": payload.city or "Not Specified",
        "pincode": payload.pincode or "000000",
        "official_email": str(official_email),
        "phone": payload.phone.strip(),
        "medical_superintendent": payload.medical_superintendent or payload.medicalSuperintendent or "Not Specified",
        "branches_count": branches_count,
        "total_beds": total_beds,
        "icu_beds": icu_beds,
        "has_emergency": has_emergency,
        "departments": payload.departments or []
    }

    # 3. Documents
    docs_to_store = []
    if payload.documents and isinstance(payload.documents, list):
        docs_to_store = payload.documents
    else:
        # Standard legal set
        docs_to_store = [
            {"document_type": "Clinical Establishment License", "file_name": f"{reg_number}_License.pdf", "file_path": f"uploads/hospitals/{reg_number}_license.pdf"},
            {"document_type": "NABH Quality Certificate", "file_name": f"{reg_number}_NABH.pdf", "file_path": f"uploads/hospitals/{reg_number}_nabh.pdf"},
            {"document_type": "BioMedical Waste Clearance", "file_name": f"{reg_number}_WasteClearance.pdf", "file_path": f"uploads/hospitals/{reg_number}_waste.pdf"}
        ]

    # 4. Atomic transaction store
    new_application = create_hospital_application_transaction(db, hospital_data, docs_to_store)
    formatted = format_hospital_application_dict(new_application)

    return HospitalRegisterResponse(
        success=True,
        message="Hospital registration submitted successfully. Application is pending Super Admin review.",
        application_id=new_application.application_id,
        tracking_id=new_application.application_id,
        trackingId=new_application.application_id,
        status="pending",
        application=HospitalApplicationResponse(**formatted)
    )


@app.get(
    "/api/hospitals/applications",
    response_model=List[HospitalApplicationResponse],
    summary="List Hospital Applications (Super Admin Queue)"
)
@app.get(
    "/api/admin/verification/queue",
    summary="Alias for Super Admin Verification Queue"
)
def get_hospital_applications(
    status: Optional[str] = Query(None, description="Filter by status: pending, approved, rejected, all"),
    db: Session = Depends(get_db)
):
    """Lists applications directly from PostgreSQL for the Super Admin verification dashboard."""
    apps = list_hospital_applications(db, status=status)
    return [HospitalApplicationResponse(**format_hospital_application_dict(a)) for a in apps]


@app.get(
    "/api/hospitals/applications/{application_id}",
    response_model=HospitalApplicationResponse,
    summary="Get Detailed Hospital Application"
)
def get_hospital_application_details(application_id: str, db: Session = Depends(get_db)):
    """Retrieves full application details including infrastructure, departments, and documents."""
    app = get_hospital_application_by_id(db, application_id)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application '{application_id}' was not found in PostgreSQL."
        )
    return HospitalApplicationResponse(**format_hospital_application_dict(app))


@app.post(
    "/api/admin/verification/{application_id}/decision",
    response_model=VerificationDecisionResponse,
    summary="Super Admin Verification Decision (Approve / Reject)"
)
def submit_verification_decision(
    application_id: str,
    payload: VerificationDecisionRequest,
    db: Session = Depends(get_db)
):
    """
    Super Admin Decision:
    - 'approve':
      1. Sets status = 'approved'
      2. Issues Organization ID: ORG-XXXXXX
      3. Creates active login account in `hospital_users`
    - 'reject':
      1. Sets status = 'rejected'
      2. Records rejection reason
      3. No hospital admin user created
    """
    action = payload.action.strip().lower()

    if action == "approve":
        initial_pw = payload.initial_password or "Hospital@2026"
        app, user_info = approve_hospital_application(
            db,
            application_id,
            initial_password=initial_pw,
            comments=payload.comments or ""
        )
        if not app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application '{application_id}' not found."
            )

        return VerificationDecisionResponse(
            success=True,
            application_id=app.application_id,
            status="approved",
            org_id=app.org_id,
            admin_account=user_info if isinstance(user_info, dict) else None,
            message=f"Hospital successfully approved! Organization ID '{app.org_id}' issued and Admin Account created."
        )

    elif action == "reject":
        reason = payload.rejection_reason or payload.comments or "Documentation did not meet national compliance requirements."
        app, msg = reject_hospital_application(db, application_id, reason)
        if not app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application '{application_id}' not found."
            )

        return VerificationDecisionResponse(
            success=True,
            application_id=app.application_id,
            status="rejected",
            org_id=None,
            admin_account=None,
            message=f"Application '{app.application_id}' marked as rejected. Reason: {reason}"
        )

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Action must be either 'approve' or 'reject'."
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


# ==============================================================================
# PATIENT SUMMARY → HOSPITAL REVIEW → DOCTOR ALLOCATION WORKFLOW ENDPOINTS
# ==============================================================================

# -----------------
# 1. Patient Summary Endpoints
# -----------------

@app.post(
    "/api/patient/summaries",
    response_model=MedicalSummaryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Patient Creates & Submits Medical Summary"
)
def submit_medical_summary(
    payload: MedicalSummaryCreateRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Step 1 & 2 of workflow:
    When a patient completes the checkup/registration and generates a Medical Summary,
    it is persisted in PostgreSQL `medical_summaries`.
    Status is initialized to 'Pending Hospital Review'.
    """
    target_pid = payload.patient_id
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "").strip()
        decoded = decode_access_token(token)
        if decoded and decoded.get("role") == "patient":
            target_pid = decoded.get("sub")

    patient = None
    if target_pid:
        patient = get_patient_by_identifier(db, target_pid)
    if not patient:
        patient = db.query(Patient).order_by(Patient.id.desc()).first()

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active patient profile not found in database to associate medical summary."
        )

    summary = create_medical_summary(db, patient, payload)
    return MedicalSummaryResponse(**format_summary_dict(summary))


@app.get(
    "/api/patient/summaries",
    response_model=List[MedicalSummaryResponse],
    summary="List Submitted Medical Summaries for Logged-in Patient"
)
def get_patient_summaries(
    patient_id: Optional[str] = None,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Retrieves all medical summaries for the patient."""
    target_pid = patient_id
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "").strip()
        decoded = decode_access_token(token)
        if decoded:
            target_pid = decoded.get("sub")

    if not target_pid:
        latest = db.query(Patient).order_by(Patient.id.desc()).first()
        if latest:
            target_pid = latest.patient_id

    if not target_pid:
        return []

    summaries = list_patient_summaries(db, target_pid)
    return [MedicalSummaryResponse(**format_summary_dict(s)) for s in summaries]


@app.get(
    "/api/patient/summaries/status",
    response_model=PatientSummaryStatusResponse,
    summary="Get Active Summary & Doctor Allocation Status for Patient Dashboard"
)
def get_patient_summary_status(
    patient_id: Optional[str] = None,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Provides real-time allocation status for the Patient Dashboard:
    Possible states: Draft -> Submitted -> Pending Hospital Review -> Doctor Assigned -> Consultation
    When assigned, shows Doctor Name, Specialization, Department, Hospital, Timestamp.
    """
    target_pid = patient_id
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "").strip()
        decoded = decode_access_token(token)
        if decoded:
            target_pid = decoded.get("sub")

    if not target_pid:
        latest = db.query(Patient).order_by(Patient.id.desc()).first()
        if latest:
            target_pid = latest.patient_id

    if not target_pid:
        return PatientSummaryStatusResponse(status="Draft")

    status_data = get_patient_latest_summary_status(db, target_pid)
    return PatientSummaryStatusResponse(**status_data)


@app.get(
    "/api/patient/summaries/{summary_id}",
    response_model=MedicalSummaryResponse,
    summary="Get Specific Medical Summary by ID"
)
def get_medical_summary(
    summary_id: str,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Retrieve full details of a medical summary with role authorization."""
    summary = get_medical_summary_by_id(db, summary_id)
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Medical summary '{summary_id}' not found."
        )

    # RBAC security check
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "").strip()
        decoded = decode_access_token(token)
        if decoded:
            role = decoded.get("role")
            sub = decoded.get("sub")
            if role == "patient" and summary.patient_id != sub:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Patients can only view their own medical summaries."
                )
            elif role == "hospital" and summary.hospital_id and summary.hospital_id != sub:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Hospital staff cannot access summaries belonging to unrelated hospitals."
                )
            elif role == "doctor":
                if not summary.assignment or summary.assignment.doctor_id != sub:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Doctors can only view medical summaries specifically assigned to them."
                    )

    return MedicalSummaryResponse(**format_summary_dict(summary))


# -----------------
# 2. Hospital Review & Doctor Allocation Endpoints
# -----------------

@app.get(
    "/api/hospital/summaries",
    response_model=List[MedicalSummaryResponse],
    summary="Hospital Dashboard: List Patient Summaries for Review"
)
def get_hospital_summaries(
    status: Optional[str] = Query(None, description="Filter by status: pending, assigned, all"),
    hospital_id: Optional[str] = None,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Step 2 of workflow:
    Hospital receives and lists submitted summaries with Priority, Submitted Time, Status.
    """
    hid = hospital_id
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "").strip()
        decoded = decode_access_token(token)
        if decoded:
            if decoded.get("role") not in ["hospital", "admin"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only authorized Hospital Administrators/Staff can access hospital summaries."
                )
            hid = decoded.get("sub")

    if not hid:
        hid = "ORG-001"

    summaries = list_hospital_summaries(db, hid, status=status)
    return [MedicalSummaryResponse(**format_summary_dict(s)) for s in summaries]


@app.get(
    "/api/hospital/summaries/{summary_id}",
    response_model=MedicalSummaryResponse,
    summary="Hospital Dashboard: Review Full Patient Summary"
)
def hospital_get_summary_detail(
    summary_id: str,
    hospital_id: Optional[str] = None,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Step 3 of workflow:
    Hospital opens and reviews patient's complete clinical intake before doctor allocation.
    """
    summary = get_medical_summary_by_id(db, summary_id)
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Medical summary '{summary_id}' not found."
        )

    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "").strip()
        decoded = decode_access_token(token)
        if decoded:
            if decoded.get("role") not in ["hospital", "admin"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Hospital access required."
                )
            if decoded.get("role") == "hospital" and summary.hospital_id and summary.hospital_id != decoded.get("sub"):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: Summary belongs to another hospital."
                )

    return MedicalSummaryResponse(**format_summary_dict(summary))


@app.get(
    "/api/hospital/doctors",
    response_model=List[HospitalDoctorResponse],
    summary="Hospital Dashboard: List Available Doctors with Workload"
)
def get_hospital_doctors(
    hospital_id: Optional[str] = None,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Step 4: Fetch doctors belonging to that hospital with workload, specialty, and availability.
    """
    hid = hospital_id
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "").strip()
        decoded = decode_access_token(token)
        if decoded:
            if decoded.get("role") not in ["hospital", "admin"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Hospital access required."
                )
            hid = decoded.get("sub")

    if not hid:
        hid = "ORG-001"

    doctors = list_hospital_doctors(db, hid)
    return [HospitalDoctorResponse(**d) for d in doctors]


@app.post(
    "/api/hospital/summaries/{summary_id}/assign-doctor",
    response_model=DoctorAssignmentResponse,
    summary="Hospital Allocates Doctor to Medical Summary"
)
def assign_doctor(
    summary_id: str,
    payload: AssignDoctorRequest,
    hospital_id: Optional[str] = None,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Step 4 & 5:
    Hospital staff/admin assigns an available doctor to the patient summary.
    Creates an assignment record in PostgreSQL and updates summary status to 'Doctor Assigned'.
    """
    assigned_by = "Hospital Admin"
    hid = hospital_id

    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "").strip()
        decoded = decode_access_token(token)
        if decoded:
            if decoded.get("role") not in ["hospital", "admin"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only Hospital staff or administrators can assign doctors."
                )
            hid = decoded.get("sub")
            assigned_by = decoded.get("email") or decoded.get("sub")

    if not hid:
        hid = "ORG-001"

    try:
        assignment, summary = assign_doctor_to_summary(
            db=db,
            summary_id=summary_id,
            doctor_id=payload.doctor_id,
            hospital_id=hid,
            assigned_by=assigned_by,
            notes=payload.notes
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    return DoctorAssignmentResponse(**format_assignment_dict(assignment))


# -----------------
# 3. Doctor Dashboard Endpoints
# -----------------

@app.get(
    "/api/doctor/assignments",
    response_model=List[DoctorAssignmentResponse],
    summary="Doctor Dashboard: List Patients Assigned to this Doctor"
)
def get_doctor_assignments(
    doctor_id: Optional[str] = None,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Step 6: Doctor retrieves patients assigned strictly to them.
    Doctors cannot see patients assigned to other doctors.
    """
    target_doc_id = doctor_id
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "").strip()
        decoded = decode_access_token(token)
        if decoded:
            if decoded.get("role") != "doctor":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Doctor access required."
                )
            target_doc_id = decoded.get("sub")

    if not target_doc_id:
        target_doc_id = "DOC-001"

    assignments = list_doctor_assignments(db, target_doc_id)
    return [DoctorAssignmentResponse(**format_assignment_dict(a)) for a in assignments]


@app.get(
    "/api/doctor/assignments/{assignment_id}",
    summary="Doctor Dashboard: Open Assigned Patient Summary"
)
def get_doctor_assignment_details(
    assignment_id: str,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Step 6: Doctor opens the full patient medical summary for consultation.
    """
    assignment = get_doctor_assignment_by_id(db, assignment_id)
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Assignment '{assignment_id}' not found."
        )

    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "").strip()
        decoded = decode_access_token(token)
        if decoded and decoded.get("role") == "doctor":
            if assignment.doctor_id != decoded.get("sub"):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: You can only view patients assigned directly to you."
                )

    summary_dict = format_summary_dict(assignment.summary) if assignment.summary else None
    return {
        "assignment": format_assignment_dict(assignment),
        "summary": summary_dict
    }


@app.patch(
    "/api/doctor/assignments/{assignment_id}/status",
    summary="Doctor Dashboard: Update Consultation Status"
)
def update_doctor_assignment_status(
    assignment_id: str,
    payload: dict,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Updates consultation status (e.g. In Consultation, Completed)."""
    assignment = get_doctor_assignment_by_id(db, assignment_id)
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found."
        )

    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "").strip()
        decoded = decode_access_token(token)
        if decoded and decoded.get("role") == "doctor":
            if assignment.doctor_id != decoded.get("sub"):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Cannot update another doctor's assignment."
                )

    new_status = payload.get("status", "In Consultation")
    assignment.status = new_status
    if assignment.summary:
        if new_status in ["In Consultation", "Consultation"]:
            assignment.summary.status = "Consultation"
        elif new_status == "Completed":
            assignment.summary.status = "Completed"

    db.commit()
    db.refresh(assignment)
    return format_assignment_dict(assignment)

