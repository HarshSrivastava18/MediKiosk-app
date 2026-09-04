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
    PatientMedication,
    HospitalApplication,
    HospitalInfrastructure,
    HospitalDepartment,
    HospitalDocument,
    HospitalUser,
    StaffUser
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


# ==========================================
# HOSPITAL ONBOARDING & VERIFICATION CRUD
# ==========================================

def generate_application_id() -> str:
    """Generate standardized Hospital Application Tracking ID: APP-2026-XXXXXX"""
    num = random.randint(100000, 999999)
    return f"APP-2026-{num}"

def generate_org_id() -> str:
    """Generate standardized Hospital Organization ID: ORG-XXXXXX"""
    num = random.randint(100000, 999999)
    return f"ORG-{num}"

def format_hospital_application_dict(app: HospitalApplication) -> dict:
    """Helper to convert ORM HospitalApplication with related infrastructure, departments & documents."""
    infra_dict = None
    if app.infrastructure:
        infra_dict = {
            "branches_count": app.infrastructure.branches_count,
            "total_beds": app.infrastructure.total_beds,
            "icu_beds": app.infrastructure.icu_beds,
            "has_emergency": app.infrastructure.has_emergency
        }

    return {
        "id": app.id,
        "application_id": app.application_id,
        "hospital_name": app.hospital_name,
        "hospital_type": app.hospital_type,
        "registration_number": app.registration_number,
        "state": app.state,
        "city": app.city,
        "pincode": app.pincode,
        "official_email": app.official_email,
        "phone": app.phone,
        "medical_superintendent": app.medical_superintendent,
        "status": app.status,
        "org_id": app.org_id,
        "submitted_at": app.submitted_at,
        "verified_at": app.verified_at,
        "rejection_reason": app.rejection_reason,
        "infrastructure": infra_dict,
        "departments": [d.department_name for d in (app.departments or []) if d.is_active],
        "documents": [
            {
                "id": doc.id,
                "document_type": doc.document_type,
                "file_name": doc.file_name,
                "file_path": doc.file_path,
                "uploaded_at": doc.uploaded_at,
                "verification_status": doc.verification_status,
                "verified_at": doc.verified_at
            }
            for doc in (app.documents or [])
        ]
    }

def check_duplicate_hospital(db: Session, registration_number: str, official_email: str):
    """
    Check if an application with this registration number or official email already exists.
    Returns (is_duplicate: bool, reason: str)
    """
    clean_reg = registration_number.strip()
    clean_email = official_email.strip().lower()

    existing_reg = db.query(HospitalApplication).filter(
        HospitalApplication.registration_number == clean_reg
    ).first()
    if existing_reg:
        return True, f"Hospital with registration number '{clean_reg}' is already registered (Application: {existing_reg.application_id}, Status: {existing_reg.status})."

    existing_email = db.query(HospitalApplication).filter(
        HospitalApplication.official_email.ilike(clean_email)
    ).first()
    if existing_email:
        return True, f"Hospital with official email '{clean_email}' is already registered (Application: {existing_email.application_id}, Status: {existing_email.status})."

    return False, ""

def create_hospital_application_transaction(
    db: Session,
    hospital_data: dict,
    documents_list: List[dict]
) -> HospitalApplication:
    """
    Stores hospital application across:
    1. hospital_applications (status = 'pending')
    2. hospital_infrastructure
    3. hospital_departments
    4. hospital_documents
    Does NOT create any hospital_users record!
    """
    app_id = generate_application_id()
    while db.query(HospitalApplication).filter(HospitalApplication.application_id == app_id).first():
        app_id = generate_application_id()

    # 1. hospital_applications
    application = HospitalApplication(
        application_id=app_id,
        hospital_name=hospital_data["hospital_name"].strip(),
        hospital_type=hospital_data.get("hospital_type", "Private"),
        registration_number=hospital_data["registration_number"].strip(),
        state=hospital_data.get("state", ""),
        city=hospital_data.get("city", ""),
        pincode=hospital_data.get("pincode", ""),
        official_email=hospital_data["official_email"].strip().lower(),
        phone=hospital_data.get("phone", "").strip(),
        medical_superintendent=hospital_data.get("medical_superintendent", "").strip(),
        status="pending",
        submitted_at=datetime.utcnow()
    )
    db.add(application)
    db.flush()

    # 2. hospital_infrastructure
    infra = HospitalInfrastructure(
        application_id=app_id,
        branches_count=int(hospital_data.get("branches_count") or 1),
        total_beds=int(hospital_data.get("total_beds") or 0),
        icu_beds=int(hospital_data.get("icu_beds") or 0),
        has_emergency=bool(hospital_data.get("has_emergency", True))
    )
    db.add(infra)

    # 3. hospital_departments
    for dept_name in hospital_data.get("departments", []):
        cleaned_dept = dept_name.strip()
        if cleaned_dept:
            db.add(HospitalDepartment(
                application_id=app_id,
                department_name=cleaned_dept,
                is_active=True
            ))

    # 4. hospital_documents
    for doc in documents_list:
        db.add(HospitalDocument(
            application_id=app_id,
            document_type=doc.get("document_type", "legal_license"),
            file_name=doc.get("file_name", "document.pdf"),
            file_path=doc.get("file_path", ""),
            uploaded_at=datetime.utcnow(),
            verification_status="pending"
        ))

    db.commit()
    db.refresh(application)
    return application

def list_hospital_applications(db: Session, status: Optional[str] = None) -> List[HospitalApplication]:
    query = db.query(HospitalApplication)
    if status and status.lower() != "all":
        query = query.filter(HospitalApplication.status == status.lower())
    return query.order_by(HospitalApplication.id.desc()).all()

def get_hospital_application_by_id(db: Session, application_id: str) -> Optional[HospitalApplication]:
    return db.query(HospitalApplication).filter(
        HospitalApplication.application_id == application_id.strip()
    ).first()

def approve_hospital_application(
    db: Session,
    application_id: str,
    initial_password: str = "Hospital@2026",
    comments: str = ""
):
    """
    Super Admin approval action:
    1. Sets status = 'approved'
    2. Generates unique ORG-XXXXXX
    3. Creates hospital admin account in hospital_users
    """
    app = get_hospital_application_by_id(db, application_id)
    if not app:
        return None, "Application not found"

    if app.status == "approved":
        return app, "Application is already approved"

    org_id = generate_org_id()
    while db.query(HospitalApplication).filter(HospitalApplication.org_id == org_id).first():
        org_id = generate_org_id()

    app.status = "approved"
    app.org_id = org_id
    app.verified_at = datetime.utcnow()

    # Update document status to verified
    for doc in (app.documents or []):
        doc.verification_status = "verified"
        doc.verified_at = datetime.utcnow()

    # Create Hospital Admin Account in hospital_users
    admin_user = db.query(HospitalUser).filter(HospitalUser.email == app.official_email).first()
    if not admin_user:
        admin_user = HospitalUser(
            hospital_id=org_id,
            name=f"{app.hospital_name} Administrator",
            email=app.official_email,
            phone=app.phone,
            password_hash=hash_password(initial_password),
            role="hospital_admin",
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(admin_user)
    else:
        admin_user.hospital_id = org_id
        admin_user.is_active = True
        admin_user.password_hash = hash_password(initial_password)

    db.commit()
    db.refresh(app)

    user_info = {
        "org_id": org_id,
        "email": app.official_email,
        "initial_password": initial_password,
        "name": f"{app.hospital_name} Administrator",
        "role": "hospital_admin"
    }
    return app, user_info

def reject_hospital_application(db: Session, application_id: str, reason: str):
    """
    Super Admin rejection action:
    1. Sets status = 'rejected'
    2. Records rejection reason
    3. Does NOT create any record in hospital_users
    """
    app = get_hospital_application_by_id(db, application_id)
    if not app:
        return None, "Application not found"

    app.status = "rejected"
    app.rejection_reason = reason
    app.verified_at = datetime.utcnow()

    db.commit()
    db.refresh(app)
    return app, reason

def authenticate_hospital_user(db: Session, identifier: str, password: str) -> Optional[HospitalUser]:
    """
    Authenticate hospital admin using either:
    1. Organization ID (e.g. ORG-123456)
    2. Administrator Email
    """
    clean_id = identifier.strip()
    user = db.query(HospitalUser).filter(
        or_(
            HospitalUser.hospital_id.ilike(clean_id),
            HospitalUser.email.ilike(clean_id)
        )
    ).first()

    if not user:
        return None

    if not user.is_active:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return user

def authenticate_staff_user(db: Session, identifier: str, password: str, role: Optional[str] = None) -> Optional[StaffUser]:
    """
    Authenticate staff user (Doctor or Super Admin) using either:
    1. Staff / License / Gov ID (e.g. DOC-001, SA-001)
    2. Email address
    """
    clean_id = identifier.strip()
    query = db.query(StaffUser).filter(
        or_(
            StaffUser.staff_id.ilike(clean_id),
            StaffUser.email.ilike(clean_id),
            StaffUser.phone == clean_id
        )
    )
    if role:
        query = query.filter(StaffUser.role == role.lower())

    user = query.first()
    if not user:
        return None

    if not user.is_active:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return user

