from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator

# -----------------
# Nested Schemas
# -----------------
class EmergencyContactSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Full name of emergency contact")
    relationship: Optional[str] = Field(None, max_length=100, description="Relationship with patient")
    phone: Optional[str] = Field(None, max_length=32, description="Phone number")

    class Config:
        from_attributes = True

class ConditionSchema(BaseModel):
    id: Optional[int] = None
    condition: str = Field(..., min_length=1, max_length=255)

    class Config:
        from_attributes = True

class AllergySchema(BaseModel):
    id: Optional[int] = None
    allergy: str = Field(..., min_length=1, max_length=255)

    class Config:
        from_attributes = True

class MedicationSchema(BaseModel):
    id: Optional[int] = None
    medication: str = Field(..., min_length=1, max_length=255)

    class Config:
        from_attributes = True

# -----------------
# Patient Registration Request Schema (Validation)
# -----------------
class PatientRegisterRequest(BaseModel):
    patient_id: Optional[str] = Field(None, description="Optional custom or pre-generated patient ID")
    full_name: str = Field(..., min_length=2, max_length=255, description="Legal full name")
    date_of_birth: Optional[str] = Field(None, description="Date of birth in YYYY-MM-DD format")
    gender: Optional[str] = Field(None, description="Gender (e.g. Male, Female, Other)")
    blood_group: Optional[str] = Field(None, description="Blood group (e.g. A+, O-, etc.)")
    phone: str = Field(..., min_length=7, max_length=32, description="Primary contact phone number")
    email: EmailStr = Field(..., description="Valid email address for communications & login")
    address: Optional[str] = Field(None, description="Residential address")
    password: str = Field(..., min_length=6, max_length=128, description="Secure account password (min 6 chars)")
    
    # Nested lists
    emergency_contact: Optional[EmergencyContactSchema] = None
    conditions: List[str] = Field(default_factory=list, description="List of pre-existing chronic conditions")
    allergies: List[str] = Field(default_factory=list, description="List of known drug or environmental allergies")
    medications: List[str] = Field(default_factory=list, description="List of active routine medications")

    @field_validator("full_name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        cleaned = v.strip()
        if len(cleaned) < 2:
            raise ValueError("Full name must be at least 2 characters")
        return cleaned

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Phone number cannot be empty")
        return cleaned

# -----------------
# Flexible registration alias schema for compatibility
# -----------------
class PatientFlexibleRegisterRequest(BaseModel):
    name: Optional[str] = None
    full_name: Optional[str] = None
    phone: str
    email: EmailStr
    dob: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    bloodGroup: Optional[str] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None
    password: str = Field(..., min_length=6)
    conditions: List[str] = Field(default_factory=list)
    allergies: List[str] = Field(default_factory=list)
    medications: Optional[List[str]] = None
    currentMeds: Optional[str] = None
    emergencyContact: Optional[dict] = None
    emergency_contact: Optional[EmergencyContactSchema] = None

# -----------------
# Login Schema
# -----------------
class PatientLoginRequest(BaseModel):
    role: Optional[str] = "patient"
    identifier: str = Field(..., description="Email, Phone, or Patient ID")
    password: str = Field(..., min_length=1, description="Password")

# -----------------
# Response Schemas
# -----------------
class PatientResponse(BaseModel):
    id: int
    patient_id: str
    full_name: str
    date_of_birth: Optional[str]
    gender: Optional[str]
    blood_group: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    address: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    is_active: bool = True
    last_login: Optional[datetime] = None
    emergency_contacts: List[EmergencyContactSchema] = []
    conditions: List[str] = []
    allergies: List[str] = []
    medications: List[str] = []

    class Config:
        from_attributes = True

class PatientRegisterResponse(BaseModel):
    success: bool = True
    message: str = "Patient successfully validated and registered into PostgreSQL"
    patient_id: str
    patientId: Optional[str] = None
    patient: PatientResponse

class LoginResponse(BaseModel):
    success: bool = True
    token: str
    patient_id: Optional[str] = None
    patientId: Optional[str] = None
    role: str = "patient"
    user: dict
    patient: Optional[PatientResponse] = None


# ==========================================
# HOSPITAL SCHEMAS
# ==========================================

class HospitalDocumentSchema(BaseModel):
    id: Optional[int] = None
    document_type: str = Field(..., description="Type of document (e.g. license, nabh, pollution)")
    file_name: str
    file_path: str
    uploaded_at: Optional[datetime] = None
    verification_status: Optional[str] = "pending"
    verified_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class HospitalInfrastructureSchema(BaseModel):
    branches_count: int = 1
    total_beds: int = 0
    icu_beds: int = 0
    has_emergency: bool = True

    class Config:
        from_attributes = True


class HospitalDepartmentSchema(BaseModel):
    id: Optional[int] = None
    department_name: str
    is_active: bool = True

    class Config:
        from_attributes = True


class HospitalRegisterRequest(BaseModel):
    hospital_name: Optional[str] = None
    hospitalName: Optional[str] = None
    hospital_type: Optional[str] = "Private"
    hospitalType: Optional[str] = "Private"
    registration_number: Optional[str] = None
    regNumber: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    official_email: Optional[EmailStr] = None
    officialEmail: Optional[EmailStr] = None
    phone: str = Field(..., min_length=7, max_length=64)
    medical_superintendent: Optional[str] = None
    medicalSuperintendent: Optional[str] = None
    
    # Infrastructure
    branches_count: Optional[int] = None
    branchesCount: Optional[int] = None
    total_beds: Optional[int] = None
    totalBeds: Optional[int] = None
    icu_beds: Optional[int] = None
    icuBeds: Optional[int] = None
    has_emergency: Optional[bool] = None
    hasEmergency: Optional[bool] = None

    # Departments & Docs
    departments: List[str] = Field(default_factory=list)
    documents: Optional[List[dict]] = Field(default_factory=list)

    @field_validator("phone")
    @classmethod
    def clean_phone(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Phone number cannot be empty")
        return cleaned


class HospitalApplicationResponse(BaseModel):
    id: int
    application_id: str
    hospital_name: str
    hospital_type: Optional[str]
    registration_number: str
    state: Optional[str]
    city: Optional[str]
    pincode: Optional[str]
    official_email: str
    phone: Optional[str]
    medical_superintendent: Optional[str]
    status: str
    org_id: Optional[str] = None
    submitted_at: Optional[datetime] = None
    verified_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    infrastructure: Optional[HospitalInfrastructureSchema] = None
    departments: List[str] = []
    documents: List[HospitalDocumentSchema] = []

    class Config:
        from_attributes = True


class HospitalRegisterResponse(BaseModel):
    success: bool = True
    message: str = "Hospital application successfully submitted for Super Admin verification"
    application_id: str
    tracking_id: str
    trackingId: str
    status: str = "pending"
    application: HospitalApplicationResponse


class VerificationDecisionRequest(BaseModel):
    action: str = Field(..., description="'approve' or 'reject'")
    rejection_reason: Optional[str] = None
    comments: Optional[str] = None
    initial_password: Optional[str] = "Hospital@2026"


class VerificationDecisionResponse(BaseModel):
    success: bool = True
    application_id: str
    status: str
    org_id: Optional[str] = None
    admin_account: Optional[dict] = None
    message: str


# ==========================================
# MEDICAL SUMMARY & DOCTOR ASSIGNMENT SCHEMAS
# ==========================================

class MedicalSummaryCreateRequest(BaseModel):
    patient_id: Optional[str] = None
    hospital_id: Optional[str] = "ORG-001"
    hospital_name: Optional[str] = None
    patient_name: Optional[str] = None
    patient_age: Optional[str] = None
    patient_gender: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    chief_complaint: str = Field(..., min_length=2, description="Chief medical complaint")
    symptoms: List[str] = Field(default_factory=list)
    duration: Optional[str] = None
    severity_label: Optional[str] = "Moderate"
    pain_score: Optional[int] = 5
    medical_history: List[str] = Field(default_factory=list)
    current_medications: List[str] = Field(default_factory=list)
    allergies: List[str] = Field(default_factory=list)
    previous_diagnoses: List[str] = Field(default_factory=list)
    uploaded_documents: List[dict] = Field(default_factory=list)
    ai_summary: Optional[str] = None
    soap: Optional[dict] = None
    red_flags: Optional[dict] = None
    priority: Optional[str] = None # Normal, Urgent
    status: Optional[str] = "Pending Hospital Review"


class DoctorAssignmentResponse(BaseModel):
    id: int
    assignment_id: str
    patient_id: str
    summary_id: str
    hospital_id: str
    hospital_name: Optional[str] = None
    doctor_id: str
    doctor_name: str
    doctor_specialty: Optional[str] = None
    doctor_department: Optional[str] = None
    assigned_by: Optional[str] = None
    status: str = "Assigned"
    notes: Optional[str] = None
    assignment_timestamp: Optional[datetime] = None
    patient_name: Optional[str] = None
    chief_complaint: Optional[str] = None
    priority: Optional[str] = "Normal"
    red_flags: Optional[dict] = None

    class Config:
        from_attributes = True


class MedicalSummaryResponse(BaseModel):
    id: int
    summary_id: str
    patient_id: str
    hospital_id: Optional[str] = None
    hospital_name: Optional[str] = None
    patient_name: str
    patient_age: Optional[str] = None
    patient_gender: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    chief_complaint: str
    symptoms: List[str] = []
    duration: Optional[str] = None
    severity_label: Optional[str] = None
    pain_score: Optional[int] = None
    medical_history: List[str] = []
    current_medications: List[str] = []
    allergies: List[str] = []
    previous_diagnoses: List[str] = []
    uploaded_documents: List[dict] = []
    ai_summary: Optional[str] = None
    soap: Optional[dict] = None
    red_flags: Optional[dict] = None
    priority: str = "Normal"
    status: str = "Pending Hospital Review"
    submitted_at: Optional[datetime] = None
    assignment: Optional[DoctorAssignmentResponse] = None

    class Config:
        from_attributes = True


class AssignDoctorRequest(BaseModel):
    doctor_id: str = Field(..., description="Staff ID of the doctor (e.g. DOC-001)")
    notes: Optional[str] = None


class HospitalDoctorResponse(BaseModel):
    staff_id: str
    name: str
    email: str
    phone: Optional[str] = None
    title: Optional[str] = None
    department: Optional[str] = None
    specialty: Optional[str] = None
    hospital_name: Optional[str] = None
    hospital_id: Optional[str] = None
    experience: Optional[int] = 5
    rating: Optional[float] = 4.8
    is_active: bool = True
    status: str = "Available"
    active_workload: int = 0

    class Config:
        from_attributes = True


class PatientSummaryStatusResponse(BaseModel):
    summary_id: Optional[str] = None
    patient_id: Optional[str] = None
    status: str
    submitted_at: Optional[datetime] = None
    hospital_name: Optional[str] = None
    doctor_name: Optional[str] = None
    doctor_specialty: Optional[str] = None
    doctor_department: Optional[str] = None
    appointment_info: Optional[str] = None
    assignment_timestamp: Optional[datetime] = None
    priority: Optional[str] = None
    chief_complaint: Optional[str] = None


