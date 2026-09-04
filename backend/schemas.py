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
    patient_id: str
    patientId: Optional[str] = None
    role: str = "patient"
    user: dict
    patient: PatientResponse
