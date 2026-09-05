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
    StaffUser,
    MedicalSummary,
    DoctorAssignment
)
from backend.schemas import PatientRegisterRequest, EmergencyContactSchema, MedicalSummaryCreateRequest
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


# ==========================================
# MEDICAL SUMMARY & DOCTOR ALLOCATION CRUD
# ==========================================

def generate_summary_id() -> str:
    """Generate standardized Medical Summary ID: SUM-2026-XXXXXX"""
    num = random.randint(100000, 999999)
    return f"SUM-2026-{num}"

def generate_assignment_id() -> str:
    """Generate standardized Doctor Assignment ID: ASN-2026-XXXXXX"""
    num = random.randint(100000, 999999)
    return f"ASN-2026-{num}"

def format_assignment_dict(assignment: DoctorAssignment) -> dict:
    summary_patient_name = assignment.summary.patient_name if assignment.summary else None
    summary_chief_complaint = assignment.summary.chief_complaint if assignment.summary else None
    summary_priority = assignment.summary.priority if assignment.summary else "Normal"
    summary_red_flags = assignment.summary.red_flags if assignment.summary else None

    return {
        "id": assignment.id,
        "assignment_id": assignment.assignment_id,
        "patient_id": assignment.patient_id,
        "summary_id": assignment.summary_id,
        "hospital_id": assignment.hospital_id,
        "hospital_name": assignment.hospital_name,
        "doctor_id": assignment.doctor_id,
        "doctor_name": assignment.doctor_name,
        "doctor_specialty": assignment.doctor_specialty,
        "doctor_department": assignment.doctor_department,
        "assigned_by": assignment.assigned_by,
        "status": assignment.status,
        "notes": assignment.notes,
        "assignment_timestamp": assignment.assignment_timestamp,
        "patient_name": summary_patient_name,
        "chief_complaint": summary_chief_complaint,
        "priority": summary_priority,
        "red_flags": summary_red_flags
    }


def format_summary_dict(summary: MedicalSummary) -> dict:
    assignment_dict = None
    if summary.assignment:
        assignment_dict = format_assignment_dict(summary.assignment)

    return {
        "id": summary.id,
        "summary_id": summary.summary_id,
        "patient_id": summary.patient_id,
        "hospital_id": summary.hospital_id,
        "hospital_name": summary.hospital_name,
        "patient_name": summary.patient_name,
        "patient_age": summary.patient_age,
        "patient_gender": summary.patient_gender,
        "contact_phone": summary.contact_phone,
        "contact_email": summary.contact_email,
        "chief_complaint": summary.chief_complaint,
        "symptoms": summary.symptoms or [],
        "duration": summary.duration,
        "severity_label": summary.severity_label,
        "pain_score": summary.pain_score,
        "medical_history": summary.medical_history or [],
        "current_medications": summary.current_medications or [],
        "allergies": summary.allergies or [],
        "previous_diagnoses": summary.previous_diagnoses or [],
        "uploaded_documents": summary.uploaded_documents or [],
        "ai_summary": summary.ai_summary,
        "soap": summary.soap,
        "red_flags": summary.red_flags,
        "priority": summary.priority or "Normal",
        "status": summary.status,
        "submitted_at": summary.submitted_at,
        "assignment": assignment_dict
    }

def create_medical_summary(db: Session, patient: Patient, data: MedicalSummaryCreateRequest) -> MedicalSummary:
    sid = generate_summary_id()
    while db.query(MedicalSummary).filter(MedicalSummary.summary_id == sid).first():
        sid = generate_summary_id()

    # Determine priority: if red flags active, priority is "Urgent"
    is_urgent = False
    if data.red_flags and isinstance(data.red_flags, dict) and data.red_flags.get("active"):
        is_urgent = True
    priority = data.priority or ("Urgent" if is_urgent else "Normal")

    # If hospital_name not provided, look up from hospital_id
    h_name = data.hospital_name
    h_id = data.hospital_id or "ORG-001"
    if not h_name and h_id:
        app = db.query(HospitalApplication).filter(HospitalApplication.org_id == h_id).first()
        if app:
            h_name = app.hospital_name

    # Calculate approximate age from date_of_birth if patient_age not provided
    age = data.patient_age
    if not age and patient.date_of_birth:
        try:
            birth_year = int(patient.date_of_birth.split("-")[0])
            age = f"{2026 - birth_year} yrs"
        except Exception:
            age = None

    summary = MedicalSummary(
        summary_id=sid,
        patient_id=patient.patient_id,
        hospital_id=h_id,
        hospital_name=h_name or "City Hospital — Lucknow",
        patient_name=data.patient_name or patient.full_name,
        patient_age=age,
        patient_gender=data.patient_gender or patient.gender,
        contact_phone=data.contact_phone or patient.phone,
        contact_email=data.contact_email or patient.email,
        chief_complaint=data.chief_complaint,
        symptoms=data.symptoms or [],
        duration=data.duration,
        severity_label=data.severity_label or "Moderate",
        pain_score=data.pain_score if data.pain_score is not None else 5,
        medical_history=data.medical_history or [c.condition for c in (patient.conditions or [])],
        current_medications=data.current_medications or [m.medication for m in (patient.medications or [])],
        allergies=data.allergies or [a.allergy for a in (patient.allergies or [])],
        previous_diagnoses=data.previous_diagnoses or [],
        uploaded_documents=data.uploaded_documents or [],
        ai_summary=data.ai_summary,
        soap=data.soap,
        red_flags=data.red_flags,
        priority=priority,
        status="Pending Hospital Review",
        submitted_at=datetime.utcnow()
    )

    db.add(summary)
    db.commit()
    db.refresh(summary)
    return summary

def get_medical_summary_by_id(db: Session, summary_id: str) -> Optional[MedicalSummary]:
    clean_id = summary_id.strip()
    return db.query(MedicalSummary).filter(
        or_(
            MedicalSummary.summary_id == clean_id,
            MedicalSummary.id == (int(clean_id) if clean_id.isdigit() else -1)
        )
    ).first()

def list_patient_summaries(db: Session, patient_id: str) -> List[MedicalSummary]:
    return db.query(MedicalSummary).filter(
        MedicalSummary.patient_id == patient_id
    ).order_by(MedicalSummary.id.desc()).all()

def list_hospital_summaries(
    db: Session,
    hospital_id: str,
    status: Optional[str] = None
) -> List[MedicalSummary]:
    clean_hid = hospital_id.strip()
    query = db.query(MedicalSummary).filter(
        or_(
            MedicalSummary.hospital_id == clean_hid,
            MedicalSummary.hospital_id.is_(None)
        )
    )
    if status and status.lower() != "all":
        if status.lower() == "pending":
            query = query.filter(MedicalSummary.status == "Pending Hospital Review")
        elif status.lower() == "assigned":
            query = query.filter(MedicalSummary.status == "Doctor Assigned")
        else:
            query = query.filter(MedicalSummary.status.ilike(status))

    return query.order_by(
        # Order Urgent first, then by id descending
        MedicalSummary.priority.desc(),
        MedicalSummary.id.desc()
    ).all()

def list_hospital_doctors(db: Session, hospital_id: str) -> List[dict]:
    """
    Fetch doctors belonging to that hospital with workload calculation.
    """
    clean_hid = hospital_id.strip()
    # Find hospital name if exists
    app = db.query(HospitalApplication).filter(HospitalApplication.org_id == clean_hid).first()
    h_name = app.hospital_name if app else ""

    doctors_query = db.query(StaffUser).filter(StaffUser.role == "doctor")
    if clean_hid:
        filters = [StaffUser.hospital_id == clean_hid]
        if h_name:
            # Also allow doctors with matching hospital name
            filters.append(StaffUser.hospital_name.ilike(f"%{h_name.split('—')[0].strip()}%"))
        # If default hospital ORG-001, also include doctors without explicit hospital_id
        if clean_hid == "ORG-001":
            filters.append(StaffUser.hospital_id.is_(None))
        doctors_query = doctors_query.filter(or_(*filters))

    doctors = doctors_query.all()
    results = []
    for doc in doctors:
        # Calculate active workload from doctor_assignments
        active_count = db.query(DoctorAssignment).filter(
            DoctorAssignment.doctor_id == doc.staff_id,
            DoctorAssignment.status.in_(["Assigned", "In Consultation"])
        ).count()

        status_text = "Available" if active_count < 8 else ("Busy" if active_count < 15 else "At Capacity")

        results.append({
            "staff_id": doc.staff_id,
            "name": doc.name,
            "email": doc.email,
            "phone": doc.phone,
            "title": doc.title or "Attending Physician",
            "department": doc.department or "General Medicine",
            "specialty": doc.specialty or "General Medicine",
            "hospital_name": doc.hospital_name or h_name or "City Hospital",
            "hospital_id": doc.hospital_id or clean_hid,
            "experience": doc.experience or 5,
            "rating": doc.rating or 4.8,
            "is_active": doc.is_active,
            "status": status_text,
            "active_workload": active_count
        })

    return results

def assign_doctor_to_summary(
    db: Session,
    summary_id: str,
    doctor_id: str,
    hospital_id: str,
    assigned_by: str,
    notes: Optional[str] = None
) -> tuple[DoctorAssignment, MedicalSummary]:
    """
    Hospital allocates doctor to patient medical summary:
    1. Validates summary and doctor
    2. Enforces hospital scope
    3. Prevents duplicate active assignment
    4. Creates doctor_assignments record
    5. Updates medical_summaries status -> 'Doctor Assigned'
    """
    summary = get_medical_summary_by_id(db, summary_id)
    if not summary:
        raise ValueError(f"Medical Summary '{summary_id}' not found.")

    clean_doc_id = doctor_id.strip()
    doctor = db.query(StaffUser).filter(
        StaffUser.staff_id == clean_doc_id,
        StaffUser.role == "doctor"
    ).first()
    if not doctor:
        raise ValueError(f"Doctor with ID '{clean_doc_id}' not found.")

    # Validate hospital ownership: doctor must belong to this hospital
    if doctor.hospital_id and hospital_id and doctor.hospital_id != hospital_id:
        raise ValueError(f"Doctor '{doctor.name}' does not belong to hospital '{hospital_id}'.")

    # Check if assignment already exists
    existing_assignment = db.query(DoctorAssignment).filter(
        DoctorAssignment.summary_id == summary.summary_id
    ).first()

    if existing_assignment:
        # Re-assign or update
        existing_assignment.doctor_id = doctor.staff_id
        existing_assignment.doctor_name = doctor.name
        existing_assignment.doctor_specialty = doctor.specialty
        existing_assignment.doctor_department = doctor.department
        existing_assignment.assigned_by = assigned_by
        existing_assignment.status = "Assigned"
        existing_assignment.notes = notes
        existing_assignment.assignment_timestamp = datetime.utcnow()
        summary.status = "Doctor Assigned"
        db.commit()
        db.refresh(existing_assignment)
        db.refresh(summary)
        return existing_assignment, summary

    # Create new assignment
    aid = generate_assignment_id()
    while db.query(DoctorAssignment).filter(DoctorAssignment.assignment_id == aid).first():
        aid = generate_assignment_id()

    assignment = DoctorAssignment(
        assignment_id=aid,
        patient_id=summary.patient_id,
        summary_id=summary.summary_id,
        hospital_id=hospital_id or summary.hospital_id or "ORG-001",
        hospital_name=summary.hospital_name or doctor.hospital_name,
        doctor_id=doctor.staff_id,
        doctor_name=doctor.name,
        doctor_specialty=doctor.specialty,
        doctor_department=doctor.department,
        assigned_by=assigned_by,
        status="Assigned",
        notes=notes,
        assignment_timestamp=datetime.utcnow()
    )

    summary.status = "Doctor Assigned"
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    db.refresh(summary)
    return assignment, summary

def list_doctor_assignments(db: Session, doctor_id: str) -> List[DoctorAssignment]:
    clean_id = doctor_id.strip()
    return db.query(DoctorAssignment).filter(
        DoctorAssignment.doctor_id == clean_id
    ).order_by(DoctorAssignment.id.desc()).all()

def get_doctor_assignment_by_id(db: Session, assignment_id: str) -> Optional[DoctorAssignment]:
    clean_id = assignment_id.strip()
    return db.query(DoctorAssignment).filter(
        or_(
            DoctorAssignment.assignment_id == clean_id,
            DoctorAssignment.id == (int(clean_id) if clean_id.isdigit() else -1)
        )
    ).first()

def get_patient_latest_summary_status(db: Session, patient_id: str) -> Optional[dict]:
    summary = db.query(MedicalSummary).filter(
        MedicalSummary.patient_id == patient_id
    ).order_by(MedicalSummary.id.desc()).first()

    if not summary:
        return {
            "summary_id": None,
            "patient_id": patient_id,
            "status": "Draft",
            "submitted_at": None,
            "hospital_name": None,
            "doctor_name": None,
            "doctor_specialty": None,
            "doctor_department": None,
            "appointment_info": None,
            "assignment_timestamp": None,
            "priority": None,
            "chief_complaint": None
        }

    doc_name = None
    doc_spec = None
    doc_dept = None
    asgn_time = None
    appt_info = None

    if summary.assignment:
        doc_name = summary.assignment.doctor_name
        doc_spec = summary.assignment.doctor_specialty
        doc_dept = summary.assignment.doctor_department
        asgn_time = summary.assignment.assignment_timestamp
        appt_info = f"Assigned to {summary.assignment.doctor_department} OPD · Priority: {summary.priority}"

    return {
        "summary_id": summary.summary_id,
        "patient_id": summary.patient_id,
        "status": summary.status,
        "submitted_at": summary.submitted_at,
        "hospital_name": summary.hospital_name,
        "doctor_name": doc_name,
        "doctor_specialty": doc_spec,
        "doctor_department": doc_dept,
        "appointment_info": appt_info,
        "assignment_timestamp": asgn_time,
        "priority": summary.priority,
        "chief_complaint": summary.chief_complaint
    }


