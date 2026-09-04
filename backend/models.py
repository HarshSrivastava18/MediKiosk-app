from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    JSON,
    func
)
from sqlalchemy.orm import relationship as orm_relationship
from backend.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String(64), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    date_of_birth = Column(String(32), nullable=True)
    gender = Column(String(32), nullable=True)
    blood_group = Column(String(16), nullable=True)
    phone = Column(String(32), index=True, nullable=True)
    email = Column(String(255), index=True, nullable=True)
    address = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), default=datetime.utcnow)

    # Relationships
    credentials = orm_relationship(
        "PatientCredential",
        back_populates="patient",
        uselist=False,
        cascade="all, delete-orphan"
    )
    emergency_contacts = orm_relationship(
        "EmergencyContact",
        back_populates="patient",
        cascade="all, delete-orphan"
    )
    conditions = orm_relationship(
        "PatientCondition",
        back_populates="patient",
        cascade="all, delete-orphan"
    )
    allergies = orm_relationship(
        "PatientAllergy",
        back_populates="patient",
        cascade="all, delete-orphan"
    )
    medications = orm_relationship(
        "PatientMedication",
        back_populates="patient",
        cascade="all, delete-orphan"
    )
    vitals = orm_relationship(
        "PatientVital",
        back_populates="patient",
        uselist=False,
        cascade="all, delete-orphan"
    )
    visits = orm_relationship(
        "HospitalVisit",
        back_populates="patient",
        cascade="all, delete-orphan"
    )
    prescriptions = orm_relationship(
        "Prescription",
        back_populates="patient",
        cascade="all, delete-orphan"
    )
    lab_reports = orm_relationship(
        "LabReport",
        back_populates="patient",
        cascade="all, delete-orphan"
    )
    consents = orm_relationship(
        "PatientConsent",
        back_populates="patient",
        cascade="all, delete-orphan"
    )



class PatientCredential(Base):
    __tablename__ = "patient_credentials"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(
        String(64),
        ForeignKey("patients.patient_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    password_hash = Column(String(255), nullable=False)
    last_login = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.utcnow)

    patient = orm_relationship("Patient", back_populates="credentials")


class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(
        String(64),
        ForeignKey("patients.patient_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    name = Column(String(255), nullable=False)
    relationship = Column(String(100), nullable=True)
    phone = Column(String(32), nullable=True)

    patient = orm_relationship("Patient", back_populates="emergency_contacts")


class PatientCondition(Base):
    __tablename__ = "patient_conditions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(
        String(64),
        ForeignKey("patients.patient_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    condition = Column(String(255), nullable=False)

    patient = orm_relationship("Patient", back_populates="conditions")


class PatientAllergy(Base):
    __tablename__ = "patient_allergies"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(
        String(64),
        ForeignKey("patients.patient_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    allergy = Column(String(255), nullable=False)

    patient = orm_relationship("Patient", back_populates="allergies")


class PatientMedication(Base):
    __tablename__ = "patient_medications"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(
        String(64),
        ForeignKey("patients.patient_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    medication = Column(String(255), nullable=False)

    patient = orm_relationship("Patient", back_populates="medications")


# ==========================================
# HOSPITAL ONBOARDING & VERIFICATION MODELS
# ==========================================

class HospitalApplication(Base):
    __tablename__ = "hospital_applications"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(String(64), unique=True, index=True, nullable=False)
    hospital_name = Column(String(255), nullable=False)
    hospital_type = Column(String(64), default="Private", nullable=True)
    registration_number = Column(String(128), unique=True, index=True, nullable=False)
    state = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    pincode = Column(String(32), nullable=True)
    official_email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(64), nullable=True)
    medical_superintendent = Column(String(255), nullable=True)
    status = Column(String(32), default="pending", nullable=False, index=True) # pending, approved, rejected
    org_id = Column(String(64), unique=True, index=True, nullable=True)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.utcnow)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)

    infrastructure = orm_relationship(
        "HospitalInfrastructure",
        back_populates="application",
        uselist=False,
        cascade="all, delete-orphan"
    )
    departments = orm_relationship(
        "HospitalDepartment",
        back_populates="application",
        cascade="all, delete-orphan"
    )
    documents = orm_relationship(
        "HospitalDocument",
        back_populates="application",
        cascade="all, delete-orphan"
    )


class HospitalInfrastructure(Base):
    __tablename__ = "hospital_infrastructure"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(
        String(64),
        ForeignKey("hospital_applications.application_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    branches_count = Column(Integer, default=1)
    total_beds = Column(Integer, default=0)
    icu_beds = Column(Integer, default=0)
    has_emergency = Column(Boolean, default=True)

    application = orm_relationship("HospitalApplication", back_populates="infrastructure")


class HospitalDepartment(Base):
    __tablename__ = "hospital_departments"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(
        String(64),
        ForeignKey("hospital_applications.application_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    department_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)

    application = orm_relationship("HospitalApplication", back_populates="departments")


class HospitalDocument(Base):
    __tablename__ = "hospital_documents"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(
        String(64),
        ForeignKey("hospital_applications.application_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    document_type = Column(String(100), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(Text, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.utcnow)
    verification_status = Column(String(32), default="pending")
    verified_at = Column(DateTime(timezone=True), nullable=True)

    application = orm_relationship("HospitalApplication", back_populates="documents")


class HospitalUser(Base):
    __tablename__ = "hospital_users"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(String(64), nullable=False, index=True) # Stores ORG-XXXXXX
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(64), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(64), default="hospital_admin", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.utcnow)


class StaffUser(Base):
    __tablename__ = "staff_users"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(String(64), unique=True, index=True, nullable=False) # e.g. DOC-001, SA-001
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(64), nullable=True)
    role = Column(String(64), nullable=False, index=True) # 'doctor', 'admin'
    password_hash = Column(String(255), nullable=False)
    title = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)
    specialty = Column(String(100), nullable=True)
    hospital_name = Column(String(255), nullable=True)
    experience = Column(Integer, default=5)
    rating = Column(Float, default=4.8)
    patients_count = Column(Integer, default=30)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.utcnow)


class PatientVital(Base):
    __tablename__ = "patient_vitals"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(
        String(64),
        ForeignKey("patients.patient_id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True
    )
    bp = Column(String(32), nullable=True, default="120/80")
    pulse = Column(Integer, nullable=True, default=72)
    spo2 = Column(Integer, nullable=True, default=98)
    temp = Column(String(32), nullable=True, default="98.6°F")
    weight = Column(String(32), nullable=True, default="70 kg")
    height = Column(String(32), nullable=True, default="5'8\"")
    recorded_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.utcnow)

    patient = orm_relationship("Patient", back_populates="vitals")


class HospitalVisit(Base):
    __tablename__ = "hospital_visits"

    id = Column(Integer, primary_key=True, index=True)
    visit_id = Column(String(64), unique=True, index=True, nullable=False) # e.g. VIS-2026-081
    patient_id = Column(
        String(64),
        ForeignKey("patients.patient_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    hospital = Column(String(255), nullable=False)
    branch = Column(String(255), nullable=True)
    department = Column(String(100), nullable=True)
    doctor = Column(String(255), nullable=True)
    date = Column(String(64), nullable=False)
    time = Column(String(32), nullable=True)
    reason = Column(Text, nullable=True)
    diagnosis = Column(Text, nullable=True)
    status = Column(String(64), default="Completed")
    prescriptions_summary = Column(JSON, nullable=True) # list of medicine names
    reports_summary = Column(JSON, nullable=True) # list of report names
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.utcnow)

    patient = orm_relationship("Patient", back_populates="visits")


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(String(64), unique=True, index=True, nullable=False) # e.g. RX-2026-901
    patient_id = Column(
        String(64),
        ForeignKey("patients.patient_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    doctor = Column(String(255), nullable=False)
    department = Column(String(100), nullable=True)
    hospital = Column(String(255), nullable=True)
    date = Column(String(64), nullable=False)
    status = Column(String(32), default="Active") # Active, Completed, Cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.utcnow)

    patient = orm_relationship("Patient", back_populates="prescriptions")
    items = orm_relationship("PrescriptionItem", back_populates="prescription", cascade="all, delete-orphan")


class PrescriptionItem(Base):
    __tablename__ = "prescription_items"

    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(
        String(64),
        ForeignKey("prescriptions.prescription_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    name = Column(String(255), nullable=False)
    dosage = Column(String(100), nullable=True)
    freq = Column(String(100), nullable=True)
    duration = Column(String(100), nullable=True)
    instructions = Column(Text, nullable=True)

    prescription = orm_relationship("Prescription", back_populates="items")


class LabReport(Base):
    __tablename__ = "lab_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String(64), unique=True, index=True, nullable=False) # e.g. LAB-2026-1049
    patient_id = Column(
        String(64),
        ForeignKey("patients.patient_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    title = Column(String(255), nullable=False)
    lab = Column(String(255), nullable=True)
    date = Column(String(64), nullable=False)
    status = Column(String(64), default="Normal") # Normal, Borderline, Elevated
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.utcnow)

    patient = orm_relationship("Patient", back_populates="lab_reports")
    parameters = orm_relationship("LabParameter", back_populates="report", cascade="all, delete-orphan")


class LabParameter(Base):
    __tablename__ = "lab_parameters"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(
        String(64),
        ForeignKey("lab_reports.report_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    name = Column(String(255), nullable=False)
    value = Column(String(100), nullable=False)
    reference = Column(String(100), nullable=True)
    status = Column(String(32), default="normal") # normal, high, low, abnormal

    report = orm_relationship("LabReport", back_populates="parameters")


class PatientConsent(Base):
    __tablename__ = "patient_consents"

    id = Column(Integer, primary_key=True, index=True)
    consent_id = Column(String(64), unique=True, index=True, nullable=False) # CS-8891
    patient_id = Column(
        String(64),
        ForeignKey("patients.patient_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    hospital = Column(String(255), nullable=False)
    purpose = Column(String(255), nullable=False)
    requested_by = Column(String(255), nullable=True)
    granted_on = Column(String(64), nullable=True)
    expires_on = Column(String(64), nullable=True)
    status = Column(String(32), default="Active") # Active, Expired, Revoked
    permissions = Column(JSON, nullable=True) # {demographics: true, ...}
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.utcnow)

    patient = orm_relationship("Patient", back_populates="consents")


class DoctorCase(Base):
    __tablename__ = "doctor_cases"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(String(64), nullable=False, index=True) # e.g. DOC-001
    patient_id = Column(String(64), nullable=False, index=True)
    patient_name = Column(String(255), nullable=False)
    time = Column(String(32), nullable=False)
    type = Column(String(64), default="OPD") # OPD, Follow-up, Review
    status = Column(String(64), default="waiting") # in-progress, waiting, scheduled, done
    red_flag = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.utcnow)


class DoctorReferral(Base):
    __tablename__ = "doctor_referrals"

    id = Column(Integer, primary_key=True, index=True)
    referral_id = Column(String(64), unique=True, index=True, nullable=False) # REF-001
    patient_id = Column(String(64), nullable=False, index=True)
    patient_name = Column(String(255), nullable=False)
    referring_doctor_id = Column(String(64), nullable=True, index=True)
    referred_to = Column(String(255), nullable=False) # e.g. KGMU, Lucknow
    referred_doctor = Column(String(255), nullable=True) # e.g. Dr. Patel
    specialty = Column(String(100), nullable=False)
    reason = Column(Text, nullable=False)
    urgency = Column(String(32), default="moderate") # high, moderate, low
    status = Column(String(32), default="pending") # pending, accepted, completed, rejected
    date = Column(String(64), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.utcnow)


class HospitalBranch(Base):
    __tablename__ = "hospital_branches"

    id = Column(Integer, primary_key=True, index=True)
    branch_id = Column(String(64), unique=True, index=True, nullable=False) # BR-001
    hospital_id = Column(String(64), nullable=False, index=True) # ORG-001
    name = Column(String(255), nullable=False) # Lucknow Branch
    location = Column(String(255), nullable=False)
    departments = Column(Integer, default=5)
    doctors = Column(Integer, default=12)
    opd = Column(Integer, default=200)
    status = Column(String(32), default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.utcnow)


class HospitalStaff(Base):
    __tablename__ = "hospital_staff"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(String(64), unique=True, index=True, nullable=False) # STF-001
    hospital_id = Column(String(64), nullable=False, index=True) # ORG-001
    name = Column(String(255), nullable=False)
    role = Column(String(64), nullable=False) # Nurse, Receptionist, Lab Tech, Pharmacist
    department = Column(String(100), nullable=True)
    branch = Column(String(255), nullable=True)
    phone = Column(String(64), nullable=True)
    status = Column(String(32), default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.utcnow)


class OpdQueue(Base):
    __tablename__ = "opd_queue"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String(32), unique=True, index=True, nullable=False) # T-001
    hospital_id = Column(String(64), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    patient_id = Column(String(64), nullable=True)
    doctor = Column(String(255), nullable=False)
    department = Column(String(100), nullable=False)
    time = Column(String(32), nullable=False)
    status = Column(String(32), default="waiting") # done, in-progress, waiting
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    log_id = Column(String(64), unique=True, index=True, nullable=False) # AUD-99120
    timestamp = Column(String(64), nullable=False)
    actor = Column(String(255), nullable=False)
    actor_role = Column(String(64), nullable=False)
    action = Column(String(100), nullable=False)
    resource = Column(Text, nullable=False)
    purpose = Column(Text, nullable=True)
    ip_address = Column(String(64), nullable=True)
    status = Column(String(32), default="SUCCESS") # SUCCESS, TRIGGERED, DENIED
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.utcnow)



