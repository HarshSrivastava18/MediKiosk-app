import time
import requests
from backend.database import SessionLocal
from backend.models import (
    Patient,
    PatientCredential,
    EmergencyContact,
    PatientCondition,
    PatientAllergy,
    PatientMedication
)

BASE_URL = "http://127.0.0.1:8001"

def test_full_pipeline():
    print("\n--- 1. Testing Health Endpoint ---")
    res = requests.get(f"{BASE_URL}/api/health")
    assert res.status_code == 200, res.text
    health = res.json()
    assert health["database"]["status"] == "connected"
    print("Health check passed! Database connected:", health["database"])

    print("\n--- 2. Testing Validation: Invalid Payload (password too short, bad email) ---")
    invalid_payload = {
        "full_name": "R",
        "email": "not-an-email",
        "phone": "",
        "password": "123" # too short
    }
    res = requests.post(f"{BASE_URL}/api/patients/register", json=invalid_payload)
    assert res.status_code == 422, f"Expected 422 Validation Error, got {res.status_code}"
    print("FastAPI Backend validation rejected invalid data with HTTP 422 as expected!")

    print("\n--- 3. Testing Valid Registration Flow Across All 6 PostgreSQL Tables ---")
    test_email = "vikram.malhotra.test@medikiosk.in"
    
    # Cleanup any previous test data with this email
    db = SessionLocal()
    existing = db.query(Patient).filter(Patient.email == test_email).first()
    if existing:
        db.delete(existing)
        db.commit()
    db.close()

    valid_payload = {
        "name": "Dr. Vikram Malhotra",
        "dob": "1988-07-22",
        "gender": "Male",
        "bloodGroup": "B+",
        "phone": "+91-9876543210",
        "email": test_email,
        "address": "42 Civil Lines, Jaipur, Rajasthan - 302006",
        "password": "SecurePassword2026!",
        "emergencyContact": {
            "name": "Anjali Malhotra",
            "relation": "Spouse",
            "phone": "+91-9876543299"
        },
        "conditions": ["Hypertension", "Type 2 Diabetes"],
        "allergies": ["Penicillin", "Sulfa Drugs"],
        "currentMeds": "Metformin 500mg, Telmisartan 40mg"
    }

    res = requests.post(f"{BASE_URL}/api/patients/register", json=valid_payload)
    assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.text}"
    data = res.json()
    assert data["success"] is True
    assigned_patient_id = data["patient_id"]
    print(f"Patient registered successfully! Generated Patient ID: {assigned_patient_id}")

    print("\n--- 4. Verifying Direct PostgreSQL Storage in All 6 Tables ---")
    db = SessionLocal()
    
    # 1. patients table
    p_row = db.query(Patient).filter(Patient.patient_id == assigned_patient_id).first()
    assert p_row is not None
    assert p_row.full_name == "Dr. Vikram Malhotra"
    assert p_row.blood_group == "B+"
    print(f"[OK] Table 'patients': ID={p_row.id}, patient_id={p_row.patient_id}, full_name='{p_row.full_name}'")

    # 2. patient_credentials table
    c_row = db.query(PatientCredential).filter(PatientCredential.patient_id == assigned_patient_id).first()
    assert c_row is not None
    assert c_row.password_hash.startswith("") and "$" in c_row.password_hash
    print(f"[OK] Table 'patient_credentials': ID={c_row.id}, password_hash={c_row.password_hash[:16]}..., is_active={c_row.is_active}")

    # 3. emergency_contacts table
    ec_row = db.query(EmergencyContact).filter(EmergencyContact.patient_id == assigned_patient_id).first()
    assert ec_row is not None
    assert ec_row.name == "Anjali Malhotra"
    assert ec_row.relationship == "Spouse"
    print(f"[OK] Table 'emergency_contacts': ID={ec_row.id}, name='{ec_row.name}', relationship='{ec_row.relationship}'")

    # 4. patient_conditions table
    cond_rows = db.query(PatientCondition).filter(PatientCondition.patient_id == assigned_patient_id).all()
    cond_list = [c.condition for c in cond_rows]
    assert "Hypertension" in cond_list
    assert "Type 2 Diabetes" in cond_list
    print(f"[OK] Table 'patient_conditions': {cond_list}")

    # 5. patient_allergies table
    all_rows = db.query(PatientAllergy).filter(PatientAllergy.patient_id == assigned_patient_id).all()
    all_list = [a.allergy for a in all_rows]
    assert "Penicillin" in all_list
    assert "Sulfa Drugs" in all_list
    print(f"[OK] Table 'patient_allergies': {all_list}")

    # 6. patient_medications table
    med_rows = db.query(PatientMedication).filter(PatientMedication.patient_id == assigned_patient_id).all()
    med_list = [m.medication for m in med_rows]
    assert "Metformin 500mg" in med_list
    print(f"[OK] Table 'patient_medications': {med_list}")
    db.close()

    print("\n--- 5. Testing Dashboard Read-Back from PostgreSQL ---")
    res = requests.get(f"{BASE_URL}/api/patients/{assigned_patient_id}")
    assert res.status_code == 200
    dashboard_data = res.json()
    assert dashboard_data["patient_id"] == assigned_patient_id
    assert dashboard_data["full_name"] == "Dr. Vikram Malhotra"
    assert len(dashboard_data["conditions"]) == 2
    assert len(dashboard_data["allergies"]) == 2
    assert len(dashboard_data["medications"]) == 2
    print("[OK] Dashboard read back from PostgreSQL successfully!")
    print(f"  Name: {dashboard_data['full_name']}")
    print(f"  Conditions: {dashboard_data['conditions']}")
    print(f"  Allergies: {dashboard_data['allergies']}")
    print(f"  Medications: {dashboard_data['medications']}")

    print("\n--- 6. Testing Patient Authentication Against PostgreSQL ---")
    login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
        "identifier": test_email,
        "password": "SecurePassword2026!"
    })
    assert login_res.status_code == 200
    login_data = login_res.json()
    token = login_data["token"]
    assert token is not None
    print(f"[OK] Authentication successful against PostgreSQL! Token generated: {token[:20]}...")

    print("\n--- 7. Testing /api/patient/me with Bearer Token ---")
    me_res = requests.get(f"{BASE_URL}/api/patient/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["patient"]["patient_id"] == assigned_patient_id
    print("[OK] /api/patient/me returned registered patient from PostgreSQL!")

    print("\n=======================================================")
    print("ALL TESTS PASSED! FULL PIPELINE VERIFIED END-TO-END:")
    print("User enters patient data -> Frontend sends to FastAPI ->")
    print("Backend validates it -> PostgreSQL stores it in 6 tables ->")
    print("Dashboard reads it back from PostgreSQL.")
    print("=======================================================")

if __name__ == "__main__":
    test_full_pipeline()
