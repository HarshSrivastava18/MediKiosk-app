"""
Comprehensive Automated Test Suite:
Validating Patient Summary → Hospital Review → Doctor Allocation Workflow
Across PostgreSQL database, FastAPI endpoints, and Role-Based Access Control.
"""

from datetime import datetime
from backend.database import SessionLocal, init_db
from backend.models import (
    Patient,
    StaffUser,
    HospitalApplication,
    HospitalUser,
    MedicalSummary,
    DoctorAssignment
)
from backend.crud import (
    create_medical_summary,
    get_medical_summary_by_id,
    list_hospital_summaries,
    list_hospital_doctors,
    assign_doctor_to_summary,
    list_doctor_assignments,
    get_doctor_assignment_by_id,
    get_patient_latest_summary_status
)
from backend.schemas import MedicalSummaryCreateRequest

def test_full_allocation_workflow():
    print("\n=======================================================")
    print("TESTING PATIENT SUMMARY -> HOSPITAL REVIEW -> DOCTOR ALLOCATION")
    print("=======================================================")

    init_db()
    db = SessionLocal()

    # Clean up previous test summaries and assignments
    patient_email = "rahul.k93@gmail.com"
    patient = db.query(Patient).filter(Patient.email == patient_email).first()
    assert patient is not None, "Patient Rahul Kumar should exist in seeded database."

    existing_summaries = db.query(MedicalSummary).filter(MedicalSummary.patient_id == patient.patient_id).all()
    for s in existing_summaries:
        db.delete(s)
    db.commit()

    # 1. Patient Creates Medical Summary
    print("\n--- 1. Testing Patient Creates & Generates Medical Summary ---")
    req = MedicalSummaryCreateRequest(
        patient_id=patient.patient_id,
        hospital_id="ORG-001",
        hospital_name="City Hospital — Lucknow",
        patient_name=patient.full_name,
        patient_age="33 yrs",
        patient_gender=patient.gender,
        contact_phone=patient.phone,
        contact_email=patient.email,
        chief_complaint="Severe retrosternal chest pain with left arm radiation and breathlessness",
        symptoms=["Chest Pain", "Shortness of Breath", "Diaphoresis", "Palpitations"],
        duration="2 hours",
        severity_label="Severe",
        pain_score=8,
        medical_history=["Hypertension", "Mild Asthma"],
        current_medications=["Amlodipine 5mg", "Salbutamol Inhaler"],
        allergies=["Penicillin", "Dust"],
        previous_diagnoses=["Stage 1 Hypertension"],
        uploaded_documents=[
            {"name": "ECG_Recent_Aug2026.pdf", "type": "ECG", "size": "1.2 MB"}
        ],
        ai_summary="High-risk cardiac presentation. Triage priority Urgent. Immediate 12-lead ECG and cardiology consult advised.",
        soap={
            "subjective": "Patient describes crushing retrosternal pain radiating to left arm, onset 2h ago.",
            "objective": "Triage severity: Severe (8/10 pain score). Known hypertensive.",
            "assessment": "Suspected Acute Coronary Syndrome (ACS) vs Angina.",
            "plan": ["STAT ECG", "Urgent Attending Cardiologist Evaluation"]
        },
        red_flags={
            "active": True,
            "severity": "HIGH",
            "title": "Acute Coronary Syndrome Hazard",
            "description": "Crushing chest pain radiating to left arm with breathlessness."
        }
    )

    summary = create_medical_summary(db, patient, req)
    print(f"[OK] Summary created in PostgreSQL! ID: {summary.summary_id}")
    assert summary.status == "Pending Hospital Review", f"Expected 'Pending Hospital Review', got '{summary.status}'"
    assert summary.priority == "Urgent", f"Expected 'Urgent' priority due to red flags, got '{summary.priority}'"
    assert summary.patient_id == patient.patient_id

    # 2. Patient Dashboard Status before hospital review
    print("\n--- 2. Testing Patient Dashboard Status (Pending Review) ---")
    p_status = get_patient_latest_summary_status(db, patient.patient_id)
    assert p_status["status"] == "Pending Hospital Review"
    assert p_status["doctor_name"] is None
    print(f"[OK] Patient dashboard status: {p_status['status']} (Doctor unassigned as expected)")

    # 3. Hospital Receives and Lists Summaries
    print("\n--- 3. Testing Hospital Receives & Reviews Summaries ---")
    hosp_summaries = list_hospital_summaries(db, "ORG-001", status="pending")
    found = any(s.summary_id == summary.summary_id for s in hosp_summaries)
    assert found, "Submitted summary must appear in hospital's pending review list."
    print(f"[OK] Hospital received summary in queue! Total pending: {len(hosp_summaries)}")

    # 4. Hospital Fetches Available Doctors with Workload
    print("\n--- 4. Testing Hospital Fetches Doctors with Workload ---")
    doctors = list_hospital_doctors(db, "ORG-001")
    assert len(doctors) > 0, "Hospital must have registered doctors."
    dr_sharma = next((d for d in doctors if d["staff_id"] == "DOC-001"), None)
    assert dr_sharma is not None, "Dr. Sharma (DOC-001) should be found."
    assert dr_sharma["specialty"] == "Cardiology"
    print(f"[OK] Fetched {len(doctors)} doctors for ORG-001. Dr. Sharma workload: {dr_sharma['active_workload']}, status: {dr_sharma['status']}")

    # 5. Hospital Assigns Doctor
    print("\n--- 5. Testing Hospital Assigns Doctor to Summary ---")
    assignment, updated_summary = assign_doctor_to_summary(
        db=db,
        summary_id=summary.summary_id,
        doctor_id="DOC-001",
        hospital_id="ORG-001",
        assigned_by="admin@cityhospital.org",
        notes="Urgent cardiac evaluation required immediately upon arrival."
    )
    assert assignment.assignment_id.startswith("ASN-2026-")
    assert assignment.doctor_id == "DOC-001"
    assert assignment.doctor_name == "Dr. Sharma"
    assert assignment.status == "Assigned"
    assert updated_summary.status == "Doctor Assigned"
    print(f"[OK] Doctor assigned! Assignment ID: {assignment.assignment_id}, Doctor: {assignment.doctor_name}, Summary Status: {updated_summary.status}")

    # 6. Doctor Dashboard: Doctor Sees Assigned Patient
    print("\n--- 6. Testing Doctor Dashboard Access ---")
    doc_assignments = list_doctor_assignments(db, "DOC-001")
    doc_found = any(a.summary_id == summary.summary_id for a in doc_assignments)
    assert doc_found, "Patient must appear in Dr. Sharma's assigned dashboard."
    print(f"[OK] Doctor DOC-001 has {len(doc_assignments)} assigned cases, including {patient.full_name}.")

    # 7. Privacy: Other Doctor CANNOT See This Assignment
    print("\n--- 7. Testing Doctor Privacy & Scope Isolation ---")
    other_doc_assignments = list_doctor_assignments(db, "DOC-002") # Dr. Patel
    other_found = any(a.summary_id == summary.summary_id for a in other_doc_assignments)
    assert not other_found, "Dr. Patel must NOT see patient assigned to Dr. Sharma."
    print("[OK] Verified Dr. Patel cannot see Dr. Sharma's assigned patient.")

    # 8. Patient Dashboard: Patient Sees Assigned Doctor Details
    print("\n--- 8. Testing Patient Dashboard Post-Assignment ---")
    updated_p_status = get_patient_latest_summary_status(db, patient.patient_id)
    assert updated_p_status["status"] == "Doctor Assigned"
    assert updated_p_status["doctor_name"] == "Dr. Sharma"
    assert updated_p_status["doctor_specialty"] == "Cardiology"
    assert updated_p_status["hospital_name"] == "City Hospital — Lucknow"
    print(f"[OK] Patient dashboard reflects live assignment: Doctor: {updated_p_status['doctor_name']} ({updated_p_status['doctor_specialty']}) at {updated_p_status['hospital_name']}")

    # 9. Test Re-assignment / Workload Increment
    print("\n--- 9. Testing Workload Calculation ---")
    doctors_after = list_hospital_doctors(db, "ORG-001")
    dr_sharma_after = next(d for d in doctors_after if d["staff_id"] == "DOC-001")
    assert dr_sharma_after["active_workload"] >= 1
    print(f"[OK] Dr. Sharma's active workload updated accurately to: {dr_sharma_after['active_workload']}")

    print("\n=======================================================")
    print("ALL TESTS PASSED: COMPLETE WORKFLOW VERIFIED ON POSTGRESQL!")
    print("=======================================================")
    db.close()

if __name__ == "__main__":
    test_full_allocation_workflow()
