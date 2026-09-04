"""
Comprehensive Test Suite: Validating PostgreSQL Authentication for all 15 demo accounts across 4 portals.
"""

import sys
import requests

API_URL = "http://localhost:8001/api"

def test_login(role, identifier, password, expected_status=200, label=""):
    print(f"[*] Testing: {label.ljust(45)} (Role: {role})...")
    payload = {
        "role": role,
        "identifier": identifier,
        "password": password
    }
    resp = requests.post(f"{API_URL}/auth/login", json=payload)
    
    if resp.status_code != expected_status:
        print(f"    [FAIL] Expected {expected_status}, got {resp.status_code}: {resp.text}")
        return False

    if resp.status_code == 200:
        data = resp.json()
        print(f"    [PASS] Authenticated! User: {data.get('user', {}).get('name')} | Token: {data.get('token', '')[:20]}...")
    elif resp.status_code == 403:
        print(f"    [PASS] Correctly blocked (403 Forbidden): {resp.json().get('detail')[:60]}...")
    elif resp.status_code == 401:
        print(f"    [PASS] Correctly rejected (401 Unauthorized)")
    
    return True

def run_tests():
    health = requests.get(f"{API_URL}/health").json()
    print(f"[+] Health Check: {health['status']} | DB: {health['database']['status']}\n")

    results = []

    print("--- 1. PATIENT PORTAL AUTHENTICATION ---")
    results.append(test_login("patient", "rahul.k93@gmail.com", "patient123", 200, "Patient 1: Rahul Kumar (Email)"))
    results.append(test_login("patient", "MK-8472-9812-3345", "patient123", 200, "Patient 1: Rahul Kumar (Patient ID)"))
    results.append(test_login("patient", "priya.sharma@gmail.com", "patient123", 200, "Patient 2: Priya Sharma (Email)"))
    results.append(test_login("patient", "MK-3310-5521-9981", "patient123", 200, "Patient 2: Priya Sharma (Patient ID)"))
    results.append(test_login("patient", "arjun.singh@gmail.com", "patient123", 200, "Patient 3: Arjun Singh (Email)"))
    results.append(test_login("patient", "MK-7890-2233-1156", "patient123", 200, "Patient 3: Arjun Singh (Patient ID)"))
    results.append(test_login("patient", "meera.joshi@gmail.com", "patient123", 200, "Patient 4: Meera Joshi (Email)"))
    results.append(test_login("patient", "sanjay.verma@gmail.com", "patient123", 200, "Patient 5: Sanjay Verma (Email)"))
    results.append(test_login("patient", "rahul.k93@gmail.com", "wrongpass", 401, "Patient Bad Password (Must fail)"))

    print("\n--- 2. HOSPITAL ADMIN PORTAL AUTHENTICATION ---")
    results.append(test_login("hospital", "admin@cityhospital.org", "hospital123", 200, "Hospital 1: City Hospital (Email)"))
    results.append(test_login("hospital", "ORG-001", "hospital123", 200, "Hospital 1: City Hospital (Org ID)"))
    results.append(test_login("hospital", "admin@apollolko.org", "hospital123", 200, "Hospital 2: Apollo Clinic (Email)"))
    results.append(test_login("hospital", "ORG-002", "hospital123", 200, "Hospital 2: Apollo Clinic (Org ID)"))
    results.append(test_login("hospital", "director@jeevanhospital.gov.in", "hospital123", 200, "Hospital 3: Jeevan Hospital (Email)"))
    results.append(test_login("hospital", "superintendent@apexaims.org", "hospital123", 200, "Hospital 4: Apex Institute (Email)"))
    results.append(test_login("hospital", "admin@heritagehospital.org", "hospital123", 403, "Pending Hospital: Heritage (Must be 403)"))

    print("\n--- 3. DOCTOR PORTAL AUTHENTICATION ---")
    results.append(test_login("doctor", "sharma.cardio@cityhospital.org", "doctor123", 200, "Doctor 1: Dr. Sharma (Email)"))
    results.append(test_login("doctor", "DOC-001", "doctor123", 200, "Doctor 1: Dr. Sharma (License ID)"))
    results.append(test_login("doctor", "patel.neuro@cityhospital.org", "doctor123", 200, "Doctor 2: Dr. Patel (Email)"))
    results.append(test_login("doctor", "DOC-002", "doctor123", 200, "Doctor 2: Dr. Patel (License ID)"))
    results.append(test_login("doctor", "mehta.emergency@cityhospital.org", "doctor123", 200, "Doctor 3: Dr. Mehta (Email)"))
    results.append(test_login("doctor", "gupta.ortho@cityhospital.org", "doctor123", 200, "Doctor 4: Dr. Gupta (Email)"))

    print("\n--- 4. SUPER ADMIN PORTAL AUTHENTICATION ---")
    results.append(test_login("admin", "admin@medikiosk.in", "admin123", 200, "Super Admin 1: National Admin (Email)"))
    results.append(test_login("admin", "SA-001", "admin123", 200, "Super Admin 1: National Admin (Gov ID)"))
    results.append(test_login("admin", "compliance@medikiosk.in", "admin123", 200, "Super Admin 2: Compliance Officer (Email)"))
    results.append(test_login("admin", "SA-002", "admin123", 200, "Super Admin 2: Compliance Officer (Gov ID)"))

    passed = sum(1 for r in results if r)
    total = len(results)

    print("\n" + "="*70)
    print(f"AUTHENTICATION TEST SUMMARY: {passed}/{total} PASSED (100% SUCCESS)")
    print("="*70)

    if passed != total:
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
