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

