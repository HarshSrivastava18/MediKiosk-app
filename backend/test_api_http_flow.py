"""
End-to-End HTTP API Integration Test:
Tests the workflow via live HTTP requests to FastAPI on http://127.0.0.1:8001
Including JWT authentication and RBAC boundary enforcement.
"""

import requests

BASE_URL = "http://127.0.0.1:8001/api"

def run_http_tests():
    print("\n=======================================================")
    print("TESTING FULL HTTP API WORKFLOW & RBAC ENFORCEMENT")
    print("=======================================================")

    # 1. Health check
    h = requests.get(f"{BASE_URL}/health").json()
    assert h["status"] == "online" and h["database"]["status"] == "connected"
    print("[OK] Health check online, PostgreSQL connected.")

    # 2. Patient Login
    print("\n--- 1. Authenticating Patient ---")
    p_login = requests.post(f"{BASE_URL}/auth/login", json={
        "role": "patient",
        "identifier": "rahul.k93@gmail.com",
        "password": "patient123"
    }).json()
    assert p_login["success"], f"Patient login failed: {p_login}"
    patient_token = p_login["token"]
    patient_headers = {"Authorization": f"Bearer {patient_token}"}
    patient_id = p_login["user"]["id"]
    print(f"[OK] Patient logged in! ID: {patient_id}")

    # 3. Patient Submits Medical Summary
    print("\n--- 2. Patient Submitting Medical Summary via HTTP POST ---")
    summary_payload = {
        "hospital_id": "ORG-001",
        "hospital_name": "City Hospital — Lucknow",
        "patient_name": "Rahul Kumar",
        "patient_age": "33 yrs",
        "chief_complaint": "Persistent chest tightness with palpitations",
        "symptoms": ["Chest tightness", "Palpitations", "Lightheadedness"],
        "duration": "1 day",
        "severity_label": "Severe",
        "pain_score": 7,
        "medical_history": ["Hypertension"],
        "current_medications": ["Amlodipine 5mg"],
        "allergies": ["Penicillin"],
        "ai_summary": "Triage alert: Suspected hypertensive emergency / cardiac evaluation needed.",
        "red_flags": {
            "active": True,
            "severity": "HIGH",
            "title": "Hypertensive Cardiac Risk",
            "description": "Chest tightness in patient with hypertension."
        }
    }
    s_res = requests.post(f"{BASE_URL}/patient/summaries", json=summary_payload, headers=patient_headers)
    assert s_res.status_code == 201, f"Summary submission failed: {s_res.text}"
    summary_data = s_res.json()
    summary_id = summary_data["summary_id"]
    assert summary_data["status"] == "Pending Hospital Review"
    assert summary_data["priority"] == "Urgent"
    print(f"[OK] Summary submitted! ID: {summary_id}, Priority: {summary_data['priority']}, Status: {summary_data['status']}")

    # 4. Patient Checks Initial Status
    st_res = requests.get(f"{BASE_URL}/patient/summaries/status", headers=patient_headers).json()
    assert st_res["status"] == "Pending Hospital Review"
    assert st_res["doctor_name"] is None
    print(f"[OK] Patient status verified: {st_res['status']}")

    # 5. Hospital Admin Login
    print("\n--- 3. Authenticating Hospital Admin ---")
    h_login = requests.post(f"{BASE_URL}/auth/login", json={
        "role": "hospital",
        "identifier": "ORG-001",
        "password": "hospital123"
    }).json()
    assert h_login["success"], f"Hospital login failed: {h_login}"
    hosp_token = h_login["token"]
    hosp_headers = {"Authorization": f"Bearer {hosp_token}"}
    print("[OK] Hospital Admin authenticated!")

    # 6. Hospital Views Summaries
    print("\n--- 4. Hospital Fetching Summaries for Review ---")
    h_summaries_res = requests.get(f"{BASE_URL}/hospital/summaries", headers=hosp_headers)
    assert h_summaries_res.status_code == 200, h_summaries_res.text
    h_summaries = h_summaries_res.json()
    target_summary = next((s for s in h_summaries if s["summary_id"] == summary_id), None)
    assert target_summary is not None, "Submitted summary must appear in hospital queue."
    print(f"[OK] Hospital queue contains {len(h_summaries)} summaries. Target summary priority: {target_summary['priority']}")

    # 7. Hospital Views Doctors
    print("\n--- 5. Hospital Fetching Doctors for Allocation ---")
    h_docs_res = requests.get(f"{BASE_URL}/hospital/doctors", headers=hosp_headers)
    assert h_docs_res.status_code == 200
    docs = h_docs_res.json()
    assert len(docs) > 0
    print(f"[OK] Hospital has {len(docs)} available doctors.")

    # 8. Hospital Assigns Doctor DOC-001 (Dr. Sharma)
    print("\n--- 6. Hospital Assigns Doctor DOC-001 ---")
    assign_res = requests.post(
        f"{BASE_URL}/hospital/summaries/{summary_id}/assign-doctor",
        json={"doctor_id": "DOC-001", "notes": "Stat ECG upon arrival"},
        headers=hosp_headers
    )
    assert assign_res.status_code == 200, assign_res.text
    assignment_data = assign_res.json()
    assert assignment_data["status"] == "Assigned"
    assert assignment_data["doctor_id"] == "DOC-001"
    assignment_id = assignment_data["assignment_id"]
    print(f"[OK] Assignment successful! ID: {assignment_id}, Doctor: {assignment_data['doctor_name']}")

    # 9. Doctor DOC-001 Login
    print("\n--- 7. Doctor DOC-001 Login & Dashboard Access ---")
    doc_login = requests.post(f"{BASE_URL}/auth/login", json={
        "role": "doctor",
        "identifier": "sharma.cardio@cityhospital.org",
        "password": "doctor123"
    }).json()
    assert doc_login["success"]
    doc_token = doc_login["token"]
    doc_headers = {"Authorization": f"Bearer {doc_token}"}

    doc_cases_res = requests.get(f"{BASE_URL}/doctor/assignments", headers=doc_headers)
    assert doc_cases_res.status_code == 200
    doc_cases = doc_cases_res.json()
    case_found = any(c["summary_id"] == summary_id for c in doc_cases)
    assert case_found, "Assigned patient must appear in Dr. Sharma's dashboard."
    print(f"[OK] Dr. Sharma sees assigned case! Total assigned: {len(doc_cases)}")

    # 10. RBAC Isolation: Dr. Patel (DOC-002) Login
    print("\n--- 8. Testing Doctor Isolation (RBAC) ---")
    doc2_login = requests.post(f"{BASE_URL}/auth/login", json={
        "role": "doctor",
        "identifier": "patel.neuro@cityhospital.org",
        "password": "doctor123"
    }).json()
    doc2_token = doc2_login["token"]
    doc2_headers = {"Authorization": f"Bearer {doc2_token}"}

    # Dr. Patel list
    doc2_cases = requests.get(f"{BASE_URL}/doctor/assignments", headers=doc2_headers).json()
    doc2_has_case = any(c["summary_id"] == summary_id for c in doc2_cases)
    assert not doc2_has_case, "Dr. Patel must not see patient assigned to Dr. Sharma."

    # Dr. Patel tries to open Dr. Sharma's specific assignment
    forbidden_res = requests.get(f"{BASE_URL}/doctor/assignments/{assignment_id}", headers=doc2_headers)
    assert forbidden_res.status_code == 403, f"Expected 403 Forbidden, got {forbidden_res.status_code}"
    print("[OK] RBAC verified! Dr. Patel cannot view Dr. Sharma's assigned patient (403 Forbidden).")

    # 11. RBAC: Patient Cannot Assign Doctor
    print("\n--- 9. Testing Patient Cannot Assign Doctor (RBAC) ---")
    patient_assign_res = requests.post(
        f"{BASE_URL}/hospital/summaries/{summary_id}/assign-doctor",
        json={"doctor_id": "DOC-001"},
        headers=patient_headers
    )
    assert patient_assign_res.status_code == 403, f"Expected 403 Forbidden, got {patient_assign_res.status_code}"
    print("[OK] RBAC verified! Patient cannot assign doctors (403 Forbidden).")

    # 12. Patient Dashboard Status Post-Assignment
    print("\n--- 10. Testing Patient Dashboard Updated Live ---")
    updated_st = requests.get(f"{BASE_URL}/patient/summaries/status", headers=patient_headers).json()
    assert updated_st["status"] == "Doctor Assigned"
    assert updated_st["doctor_name"] == "Dr. Sharma"
    assert updated_st["doctor_specialty"] == "Cardiology"
    assert updated_st["hospital_name"] == "City Hospital — Lucknow"
    print(f"[OK] Patient dashboard verified: {updated_st['status']} with {updated_st['doctor_name']} ({updated_st['doctor_specialty']})")

    print("\n=======================================================")
    print("ALL HTTP END-TO-END WORKFLOW & RBAC TESTS PASSED!")
    print("=======================================================")

if __name__ == "__main__":
    run_http_tests()
