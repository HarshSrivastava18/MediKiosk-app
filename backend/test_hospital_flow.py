import requests
from backend.database import SessionLocal
from backend.models import (
    HospitalApplication,
    HospitalInfrastructure,
    HospitalDepartment,
    HospitalDocument,
    HospitalUser
)

BASE_URL = "http://127.0.0.1:8001"

def test_hospital_pipeline():
    print("\n=======================================================")
    print("TESTING HOSPITAL REGISTRATION, VERIFICATION & LOGIN FLOW")
    print("=======================================================")

    # Clean up test records first
    test_reg = "CEA-UP-2026-TEST999"
    test_email = "superintendent@apexaims.org"

    db = SessionLocal()
    existing_apps = db.query(HospitalApplication).filter(
        (HospitalApplication.registration_number == test_reg) |
        (HospitalApplication.official_email == test_email)
    ).all()
    for app in existing_apps:
        db.delete(app)
    existing_users = db.query(HospitalUser).filter(HospitalUser.email == test_email).all()
    for u in existing_users:
        db.delete(u)
    db.commit()
    db.close()

    print("\n--- 1. Testing Validation: Missing Required Fields ---")
    bad_payload = {
        "hospital_name": "", # invalid
        "registration_number": "1", # too short
        "phone": "123"
    }
    res = requests.post(f"{BASE_URL}/api/hospitals/register", json=bad_payload)
    assert res.status_code == 422, f"Expected 422, got {res.status_code}: {res.text}"
    print("[OK] FastAPI Pydantic validation rejected invalid hospital payload with HTTP 422!")

    print("\n--- 2. Testing Stage 1: Valid Hospital Registration ---")
    valid_payload = {
        "hospitalName": "Apex Institute of Medical Sciences",
        "hospitalType": "Private",
        "regNumber": test_reg,
        "state": "Uttar Pradesh",
        "city": "Lucknow",
        "pincode": "226028",
        "officialEmail": test_email,
        "phone": "+91-522-2998800",
        "medicalSuperintendent": "Dr. R. K. Saxena (MCI Reg: 44102)",
        "branchesCount": 2,
        "totalBeds": 350,
        "icuBeds": 50,
        "hasEmergency": True,
        "departments": [
            "Cardiology",
            "Emergency & Trauma (24x7)",
            "Neurology",
            "Orthopedics",
            "Pathology Laboratory",
            "Radiology & Imaging"
        ],
        "documents": [
            {"document_type": "Clinical Establishment License", "file_name": "Apex_CEA_License_2026.pdf", "file_path": "uploads/hospitals/Apex_CEA_License_2026.pdf"},
            {"document_type": "NABH Quality Accreditation", "file_name": "Apex_NABH_Accreditation.pdf", "file_path": "uploads/hospitals/Apex_NABH_Accreditation.pdf"},
            {"document_type": "BioMedical Waste Clearance", "file_name": "Apex_BMW_Clearance.pdf", "file_path": "uploads/hospitals/Apex_BMW_Clearance.pdf"}
        ]
    }

    reg_res = requests.post(f"{BASE_URL}/api/hospitals/register", json=valid_payload)
    assert reg_res.status_code == 201, f"Expected 201, got {reg_res.status_code}: {reg_res.text}"
    reg_data = reg_res.json()
    assert reg_data["success"] is True
    tracking_id = reg_data["tracking_id"]
    assert tracking_id.startswith("APP-2026-")
    assert reg_data["status"] == "pending"
    print(f"[OK] Hospital application created! Real Tracking ID: {tracking_id}, Status: {reg_data['status']}")

    print("\n--- 3. Testing Duplicate Registration Prevention ---")
    dup_res = requests.post(f"{BASE_URL}/api/hospitals/register", json=valid_payload)
    assert dup_res.status_code == 400, f"Expected 400 Bad Request, got {dup_res.status_code}"
    dup_data = dup_res.json()
    assert "already registered" in dup_data["detail"]
    print(f"[OK] Duplicate check prevented duplicate registration: {dup_data['detail']}")

    print("\n--- 4. Verifying PostgreSQL Tables & Zero Premature Users ---")
    db = SessionLocal()
    app_row = db.query(HospitalApplication).filter(HospitalApplication.application_id == tracking_id).first()
    assert app_row is not None
    assert app_row.status == "pending"
    assert app_row.org_id is None
    print(f"[OK] Table 'hospital_applications': ID={app_row.id}, tracking_id={app_row.application_id}, status={app_row.status}")

    infra_row = db.query(HospitalInfrastructure).filter(HospitalInfrastructure.application_id == tracking_id).first()
    assert infra_row is not None
    assert infra_row.total_beds == 350
    assert infra_row.icu_beds == 50
    print(f"[OK] Table 'hospital_infrastructure': branches={infra_row.branches_count}, total_beds={infra_row.total_beds}, icu_beds={infra_row.icu_beds}")

    depts = db.query(HospitalDepartment).filter(HospitalDepartment.application_id == tracking_id).all()
    assert len(depts) == 6
    print(f"[OK] Table 'hospital_departments': {len(depts)} active departments stored")

    docs = db.query(HospitalDocument).filter(HospitalDocument.application_id == tracking_id).all()
    assert len(docs) == 3
    print(f"[OK] Table 'hospital_documents': {len(docs)} legal documents stored with status 'pending'")

    # Crucial check: Registration != Login. No user must exist yet!
    premature_user = db.query(HospitalUser).filter(HospitalUser.email == test_email).first()
    assert premature_user is None, "Hospital user was created prematurely before Super Admin verification!"
    print("[OK] Verified 'hospital_users' contains 0 records for pending hospital. Registration != Login decoupled!")
    db.close()

    print("\n--- 5. Testing Login Denial While Application is Pending ---")
    premature_login = requests.post(f"{BASE_URL}/api/auth/login", json={
        "role": "hospital",
        "identifier": test_email,
        "password": "AnyPassword123!"
    })
    assert premature_login.status_code == 403, f"Expected 403 Forbidden, got {premature_login.status_code}"
    print(f"[OK] Login forbidden for pending hospital: {premature_login.json()['detail']}")

    print("\n--- 6. Testing Super Admin Verification Queue ---")
    queue_res = requests.get(f"{BASE_URL}/api/hospitals/applications?status=pending")
    assert queue_res.status_code == 200
    queue = queue_res.json()
    found = any(a["application_id"] == tracking_id for a in queue)
    assert found, f"Application {tracking_id} not found in Super Admin queue"
    print(f"[OK] Application {tracking_id} successfully listed in Super Admin Verification Queue ({len(queue)} pending)!")

    print("\n--- 7. Testing Stage 2: Super Admin Approval ---")
    approval_res = requests.post(
        f"{BASE_URL}/api/admin/verification/{tracking_id}/decision",
        json={
            "action": "approve",
            "initial_password": "ApexAdmin@2026",
            "comments": "Inspected Clinical Establishment License and NABH Accreditation. Fully compliant."
        }
    )
    assert approval_res.status_code == 200, f"Expected 200, got {approval_res.status_code}: {approval_res.text}"
    decision_data = approval_res.json()
    assert decision_data["status"] == "approved"
    issued_org_id = decision_data["org_id"]
    assert issued_org_id.startswith("ORG-")
    print(f"[OK] Super Admin approved application! Issued ORG ID: {issued_org_id}")

    # Verify user record now created in hospital_users
    db = SessionLocal()
    user_row = db.query(HospitalUser).filter(HospitalUser.hospital_id == issued_org_id).first()
    assert user_row is not None
    assert user_row.email == test_email
    assert user_row.is_active is True
    print(f"[OK] Verified active account created in 'hospital_users' with hospital_id={user_row.hospital_id}")
    db.close()

    print("\n--- 8. Testing Stage 3: Hospital Admin Login Post-Approval ---")
    # Test login via ORG ID
    login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
        "role": "hospital",
        "identifier": issued_org_id,
        "password": "ApexAdmin@2026"
    })
    assert login_res.status_code == 200, f"Expected 200, got {login_res.status_code}: {login_res.text}"
    login_data = login_res.json()
    assert login_data["role"] == "hospital"
    assert login_data["user"]["id"] == issued_org_id
    print(f"[OK] Hospital Admin successfully logged in via ORG ID: {login_data['user']['id']}")

    # Test login via Email as well
    login_email_res = requests.post(f"{BASE_URL}/api/auth/login", json={
        "role": "hospital",
        "identifier": test_email,
        "password": "ApexAdmin@2026"
    })
    assert login_email_res.status_code == 200
    print(f"[OK] Hospital Admin successfully logged in via official email: {test_email}")

    print("\n=======================================================")
    print("ALL HOSPITAL REGISTRATION & VERIFICATION TESTS PASSED!")
    print("=======================================================")

if __name__ == "__main__":
    test_hospital_pipeline()
