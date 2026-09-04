from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
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
