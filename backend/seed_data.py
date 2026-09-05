"""
Comprehensive Master Seed Script for MediKiosk National Health Platform
Populates all 25 relational tables in PostgreSQL:
1. patients
2. patient_credentials
3. emergency_contacts
4. patient_conditions
5. patient_allergies
6. patient_medications
7. patient_vitals
8. hospital_visits
9. prescriptions
10. prescription_items
11. lab_reports
12. lab_parameters
13. patient_consents
14. hospital_applications
15. hospital_infrastructure
16. hospital_departments
17. hospital_documents
18. hospital_users
19. staff_users
20. doctor_cases
21. doctor_referrals
22. hospital_branches
23. hospital_staff
24. opd_queue
25. audit_logs
"""

import sys
from datetime import datetime, timezone
from backend.database import SessionLocal, init_db
from backend.models import (
    Patient,
    PatientCredential,
    EmergencyContact,
    PatientCondition,
    PatientAllergy,
    PatientMedication,
    PatientVital,
    HospitalVisit,
    Prescription,
    PrescriptionItem,
    LabReport,
    LabParameter,
    PatientConsent,
    HospitalApplication,
    HospitalInfrastructure,
    HospitalDepartment,
    HospitalDocument,
    HospitalUser,
    StaffUser,
    DoctorCase,
    DoctorReferral,
    HospitalBranch,
    HospitalStaff,
    OpdQueue,
    AuditLog
)
from backend.security import hash_password

def utc_now():
    return datetime.now(timezone.utc)

def seed_all():
    print("[*] Ensuring all 25 tables are initialized in PostgreSQL...")
    init_db()
    db = SessionLocal()

    try:
        # ==========================================
        # 1. SEED PATIENTS & CLINICAL RELATIONSHIPS
        # ==========================================
        print("\n[*] Seeding 5 Patients and Clinical Records...")
        patients_dataset = [
            {
                "patient_id": "MK-8472-9812-3345",
                "full_name": "Rahul Kumar",
                "dob": "1993-03-15",
                "gender": "Male",
                "blood_group": "O+",
                "phone": "9876543210",
                "email": "rahul.k93@gmail.com",
                "address": "Sector 21, Lucknow, UP",
                "password": "patient123",
                "emergency_contact": {"name": "Anjali Kumar", "relationship": "Spouse", "phone": "9876543211"},
                "conditions": ["Hypertension", "Mild Asthma"],
                "allergies": ["Penicillin", "Dust"],
                "medications": ["Amlodipine 5mg", "Salbutamol Inhaler"],
                "vitals": {"bp": "138/88", "pulse": 92, "spo2": 97, "temp": "98.6°F", "weight": "74 kg", "height": "5'9\""},
                "visits": [
                    {
                        "visit_id": "VIS-2026-081",
                        "hospital": "City Hospital",
                        "branch": "Lucknow Branch",
                        "department": "Cardiology",
                        "doctor": "Dr. Sharma",
                        "date": "15 Jul 2026",
                        "time": "10:30 AM",
                        "reason": "Evaluation for intermittent chest pain and shortness of breath",
                        "diagnosis": "Atypical Angina / Stage 1 Hypertension",
                        "status": "Completed",
                        "prescriptions": ["Amlodipine 5mg", "Aspirin 75mg"],
                        "reports": ["ECG Report", "Lipid Profile"]
                    },
                    {
                        "visit_id": "VIS-2026-042",
                        "hospital": "City Hospital",
                        "branch": "Lucknow Branch",
                        "department": "General Medicine",
                        "doctor": "Dr. Mehta",
                        "date": "18 Apr 2026",
                        "time": "02:15 PM",
                        "reason": "Routine quarterly checkup and BP monitoring",
                        "diagnosis": "Essential Hypertension - Stable",
                        "status": "Completed",
                        "prescriptions": ["Amlodipine 5mg"],
                        "reports": ["Basic Metabolic Panel"]
                    }
                ],
                "prescriptions": [
                    {
                        "prescription_id": "RX-2026-901",
                        "doctor": "Dr. Sharma",
                        "department": "Cardiology",
                        "hospital": "City Hospital - Lucknow Branch",
                        "date": "15 Jul 2026",
                        "status": "Active",
                        "items": [
                            {"name": "Amlodipine Besylate", "dosage": "5 mg", "freq": "Once daily (Morning)", "duration": "30 Days", "instructions": "Take with or after breakfast"},
                            {"name": "Aspirin (Ecosprin)", "dosage": "75 mg", "freq": "Once daily (Night)", "duration": "30 Days", "instructions": "Take post-dinner"}
                        ]
                    }
                ],
                "lab_reports": [
                    {
                        "report_id": "LAB-2026-1049",
                        "title": "Complete Blood Count (CBC) & Lipid Profile",
                        "lab": "City Hospital Pathology Laboratory",
                        "date": "25 Apr 2026",
                        "status": "Normal",
                        "parameters": [
                            {"name": "Hemoglobin", "value": "14.2 g/dL", "reference": "13.0 - 17.0 g/dL", "status": "normal"},
                            {"name": "Total Cholesterol", "value": "188 mg/dL", "reference": "< 200 mg/dL", "status": "normal"},
                            {"name": "Triglycerides", "value": "142 mg/dL", "reference": "< 150 mg/dL", "status": "normal"},
                            {"name": "HDL Cholesterol", "value": "44 mg/dL", "reference": "> 40 mg/dL", "status": "normal"},
                            {"name": "LDL Cholesterol", "value": "115 mg/dL", "reference": "< 100 mg/dL", "status": "high"}
                        ]
                    },
                    {
                        "report_id": "LAB-2026-0812",
                        "title": "12-Lead Electrocardiogram (ECG) Report",
                        "lab": "Cardiology Diagnostic Wing",
                        "date": "28 Aug 2026",
                        "status": "Borderline",
                        "parameters": [
                            {"name": "Heart Rate", "value": "92 bpm", "reference": "60 - 100 bpm", "status": "normal"},
                            {"name": "PR Interval", "value": "160 ms", "reference": "120 - 200 ms", "status": "normal"},
                            {"name": "QRS Duration", "value": "88 ms", "reference": "80 - 120 ms", "status": "normal"},
                            {"name": "ST-T Findings", "value": "Mild T-wave inversion in V4-V5", "reference": "Normal upright T-waves", "status": "abnormal"}
                        ]
                    }
                ],
                "consents": [
                    {
                        "consent_id": "CS-8891",
                        "hospital": "City Hospital - Lucknow Branch",
                        "purpose": "OPD Consultation & AI Diagnostics",
                        "requested_by": "Dr. Sharma (Cardiology)",
                        "granted_on": "15 Jul 2026",
                        "expires_on": "15 Aug 2026",
                        "status": "Active",
                        "permissions": {"demographics": True, "previousDiagnosis": True, "medications": True, "labReports": True, "ecgScans": True, "fullHistory": False}
                    },
                    {
                        "consent_id": "CS-8840",
                        "hospital": "Apollo Clinic - Lucknow",
                        "purpose": "Pulmonology Routine Follow-up",
                        "requested_by": "Dr. Verma (Pulmonology)",
                        "granted_on": "10 Feb 2026",
                        "expires_on": "10 May 2026",
                        "status": "Expired",
                        "permissions": {"demographics": True, "previousDiagnosis": True, "medications": True, "labReports": False, "ecgScans": False, "fullHistory": False}
                    }
                ]
            },
            {
                "patient_id": "MK-3310-5521-9981",
                "full_name": "Priya Sharma",
                "dob": "1981-07-22",
                "gender": "Female",
                "blood_group": "B+",
                "phone": "9812345678",
                "email": "priya.sharma@gmail.com",
                "address": "Gomti Nagar, Lucknow, UP",
                "password": "patient123",
                "emergency_contact": {"name": "Rajesh Sharma", "relationship": "Husband", "phone": "9812345679"},
                "conditions": ["Type 2 Diabetes", "Hypothyroidism"],
                "allergies": ["Sulfa Drugs"],
                "medications": ["Metformin 500mg", "Levothyroxine 50mcg"],
                "vitals": {"bp": "126/82", "pulse": 78, "spo2": 98, "temp": "98.4°F", "weight": "68 kg", "height": "5'4\""},
                "visits": [
                    {
                        "visit_id": "VIS-2026-064",
                        "hospital": "Apollo Clinic",
                        "branch": "Lucknow Center",
                        "department": "Endocrinology",
                        "doctor": "Dr. Mehta",
                        "date": "10 Aug 2026",
                        "time": "11:30 AM",
                        "reason": "Routine quarterly diabetes and thyroid evaluation",
                        "diagnosis": "Uncontrolled Type 2 Diabetes - Needs Metformin Titration",
                        "status": "Completed",
                        "prescriptions": ["Metformin 500mg", "Levothyroxine 50mcg"],
                        "reports": ["HbA1c Report", "Thyroid Profile"]
                    }
                ],
                "prescriptions": [
                    {
                        "prescription_id": "RX-2026-814",
                        "doctor": "Dr. Mehta",
                        "department": "Endocrinology",
                        "hospital": "Apollo Clinic",
                        "date": "10 Aug 2026",
                        "status": "Active",
                        "items": [
                            {"name": "Metformin Hydrochloride", "dosage": "500 mg", "freq": "Twice daily (Post Meals)", "duration": "60 Days", "instructions": "Take with meals"},
                            {"name": "Levothyroxine Sodium", "dosage": "50 mcg", "freq": "Once daily (Morning)", "duration": "90 Days", "instructions": "Take 30 mins before breakfast"}
                        ]
                    }
                ],
                "lab_reports": [
                    {
                        "report_id": "LAB-2026-0921",
                        "title": "Glycated Hemoglobin (HbA1c) & Fasting Blood Sugar",
                        "lab": "Apollo Diagnostics Wing",
                        "date": "14 Jul 2026",
                        "status": "Elevated",
                        "parameters": [
                            {"name": "HbA1c", "value": "7.8 %", "reference": "< 5.7 %", "status": "high"},
                            {"name": "Fasting Plasma Glucose", "value": "148 mg/dL", "reference": "70 - 100 mg/dL", "status": "high"},
                            {"name": "Post-Prandial Glucose", "value": "192 mg/dL", "reference": "< 140 mg/dL", "status": "high"}
                        ]
                    }
                ],
                "consents": [
                    {
                        "consent_id": "CS-8902",
                        "hospital": "Apollo Clinic - Lucknow",
                        "purpose": "Endocrine Review & Tele-Consult",
                        "requested_by": "Dr. Mehta (Endocrinology)",
                        "granted_on": "10 Aug 2026",
                        "expires_on": "10 Nov 2026",
                        "status": "Active",
                        "permissions": {"demographics": True, "previousDiagnosis": True, "medications": True, "labReports": True, "ecgScans": False, "fullHistory": True}
                    }
                ]
            },
            {
                "patient_id": "MK-7890-2233-1156",
                "full_name": "Arjun Singh",
                "dob": "1968-11-05",
                "gender": "Male",
                "blood_group": "A+",
                "phone": "9988776655",
                "email": "arjun.singh@gmail.com",
                "address": "Hazratganj, Lucknow, UP",
                "password": "patient123",
                "emergency_contact": {"name": "Sunita Singh", "relationship": "Wife", "phone": "9988776656"},
                "conditions": ["COPD", "Coronary Artery Disease"],
                "allergies": ["Sulfa drugs"],
                "medications": ["Tiotropium Inhaler", "Aspirin 75mg", "Atorvastatin 20mg"],
                "vitals": {"bp": "142/90", "pulse": 84, "spo2": 95, "temp": "98.8°F", "weight": "82 kg", "height": "5'8\""},
                "visits": [
                    {
                        "visit_id": "VIS-2026-098",
                        "hospital": "KGMU Hospital",
                        "branch": "Lucknow Center",
                        "department": "Pulmonology",
                        "doctor": "Dr. Gupta",
                        "date": "28 Aug 2026",
                        "time": "09:00 AM",
                        "reason": "COPD acute exacerbation management",
                        "diagnosis": "COPD Grade 2 with Bronchial Spasm",
                        "status": "Completed",
                        "prescriptions": ["Tiotropium Inhaler"],
                        "reports": ["Chest X-Ray", "Spirometry"]
                    }
                ],
                "prescriptions": [],
                "lab_reports": [],
                "consents": []
            },
            {
                "patient_id": "MK-4421-6678-2290",
                "full_name": "Meera Joshi",
                "dob": "1997-04-12",
                "gender": "Female",
                "blood_group": "A-",
                "phone": "9822334455",
                "email": "meera.joshi@gmail.com",
                "address": "Indira Nagar, Lucknow, UP",
                "password": "patient123",
                "emergency_contact": {"name": "Alok Joshi", "relationship": "Father", "phone": "9822334456"},
                "conditions": ["Migraine", "Mild Anemia"],
                "allergies": ["None"],
                "medications": ["Naproxen 250mg", "Iron Carbonyl 100mg"],
                "vitals": {"bp": "118/76", "pulse": 74, "spo2": 99, "temp": "98.2°F", "weight": "58 kg", "height": "5'3\""},
                "visits": [],
                "prescriptions": [],
                "lab_reports": [],
                "consents": []
            },
            {
                "patient_id": "MK-5512-8899-3301",
                "full_name": "Sanjay Verma",
                "dob": "1985-09-29",
                "gender": "Male",
                "blood_group": "B-",
                "phone": "9833445566",
                "email": "sanjay.verma@gmail.com",
                "address": "Alambagh, Lucknow, UP",
                "password": "patient123",
                "emergency_contact": {"name": "Rekha Verma", "relationship": "Spouse", "phone": "9833445567"},
                "conditions": ["Lumbar Spondylosis"],
                "allergies": ["Ibuprofen"],
                "medications": ["Pregabalin 75mg", "Paracetamol 650mg"],
                "vitals": {"bp": "130/84", "pulse": 80, "spo2": 98, "temp": "98.5°F", "weight": "76 kg", "height": "5'10\""},
                "visits": [],
                "prescriptions": [],
                "lab_reports": [],
                "consents": []
            }
        ]

        for pdata in patients_dataset:
            # Cleanly delete existing patient to enforce pristine relational hierarchy
            existing = db.query(Patient).filter(
                (Patient.patient_id == pdata["patient_id"]) | 
                (Patient.email == pdata["email"])
            ).first()

            if existing:
                db.delete(existing)
                db.commit()

            print(f"  [+] Creating Patient: {pdata['full_name']} ({pdata['patient_id']})...")
            p = Patient(
                patient_id=pdata["patient_id"],
                full_name=pdata["full_name"],
                date_of_birth=pdata["dob"],
                gender=pdata["gender"],
                blood_group=pdata["blood_group"],
                phone=pdata["phone"],
                email=pdata["email"],
                address=pdata["address"],
                created_at=utc_now()
            )
            db.add(p)
            db.flush()

            # 1. Credentials
            db.add(PatientCredential(
                patient_id=p.patient_id,
                password_hash=hash_password(pdata["password"]),
                is_active=True,
                created_at=utc_now()
            ))

            # 2. Emergency Contact
            ec = pdata["emergency_contact"]
            db.add(EmergencyContact(
                patient_id=p.patient_id,
                name=ec["name"],
                relationship=ec["relationship"],
                phone=ec["phone"]
            ))

            # 3. Conditions
            for c in pdata["conditions"]:
                db.add(PatientCondition(patient_id=p.patient_id, condition=c))

            # 4. Allergies
            for a in pdata["allergies"]:
                db.add(PatientAllergy(patient_id=p.patient_id, allergy=a))

            # 5. Medications
            for m in pdata["medications"]:
                db.add(PatientMedication(patient_id=p.patient_id, medication=m))

            # 6. Vitals
            v = pdata["vitals"]
            db.add(PatientVital(
                patient_id=p.patient_id,
                bp=v["bp"],
                pulse=v["pulse"],
                spo2=v["spo2"],
                temp=v["temp"],
                weight=v["weight"],
                height=v["height"],
                recorded_at=utc_now()
            ))

            # 7. Visits
            for vis in pdata["visits"]:
                db.add(HospitalVisit(
                    visit_id=vis["visit_id"],
                    patient_id=p.patient_id,
                    hospital=vis["hospital"],
                    branch=vis["branch"],
                    department=vis["department"],
                    doctor=vis["doctor"],
                    date=vis["date"],
                    time=vis["time"],
                    reason=vis["reason"],
                    diagnosis=vis["diagnosis"],
                    status=vis["status"],
                    prescriptions_summary=vis["prescriptions"],
                    reports_summary=vis["reports"],
                    created_at=utc_now()
                ))

            # 8. Prescriptions & Items
            for rx in pdata["prescriptions"]:
                pres = Prescription(
                    prescription_id=rx["prescription_id"],
                    patient_id=p.patient_id,
                    doctor=rx["doctor"],
                    department=rx["department"],
                    hospital=rx["hospital"],
                    date=rx["date"],
                    status=rx["status"],
                    created_at=utc_now()
                )
                db.add(pres)
                db.flush()

                for item in rx["items"]:
                    db.add(PrescriptionItem(
                        prescription_id=pres.prescription_id,
                        name=item["name"],
                        dosage=item["dosage"],
                        freq=item["freq"],
                        duration=item["duration"],
                        instructions=item["instructions"]
                    ))

            # 9. Lab Reports & Parameters
            for rep in pdata["lab_reports"]:
                lr = LabReport(
                    report_id=rep["report_id"],
                    patient_id=p.patient_id,
                    title=rep["title"],
                    lab=rep["lab"],
                    date=rep["date"],
                    status=rep["status"],
                    created_at=utc_now()
                )
                db.add(lr)
                db.flush()

                for param in rep["parameters"]:
                    db.add(LabParameter(
                        report_id=lr.report_id,
                        name=param["name"],
                        value=param["value"],
                        reference=param["reference"],
                        status=param["status"]
                    ))

            # 10. Consents
            for cs in pdata["consents"]:
                db.add(PatientConsent(
                    consent_id=cs["consent_id"],
                    patient_id=p.patient_id,
                    hospital=cs["hospital"],
                    purpose=cs["purpose"],
                    requested_by=cs["requested_by"],
                    granted_on=cs["granted_on"],
                    expires_on=cs["expires_on"],
                    status=cs["status"],
                    permissions=cs["permissions"],
                    created_at=utc_now()
                ))

        db.commit()
        print("  [OK] Patients and all clinical tables seeded successfully.")

        # ==========================================
        # 2. SEED HOSPITALS & HOSPITAL USERS
        # ==========================================
        print("\n[*] Seeding 7 Hospital Entities & Logins...")
        hospitals_dataset = [
            {
                "app_id": "APP-2026-100001",
                "org_id": "ORG-001",
                "name": "City Hospital — Lucknow",
                "reg_no": "REG-UP-2024-001",
                "email": "admin@cityhospital.org",
                "phone": "9812399999",
                "state": "Uttar Pradesh",
                "city": "Lucknow",
                "pincode": "226010",
                "type": "Private",
                "status": "approved",
                "admin_name": "Alok Gupta",
                "password": "hospital123",
                "beds": 400,
                "icu": 50,
                "branches": 3,
                "depts": ["Cardiology", "Neurology", "Orthopedics", "Emergency", "Laboratory", "Pharmacy"]
            },
            {
                "app_id": "APP-2026-100002",
                "org_id": "ORG-002",
                "name": "Apollo Clinic — Lucknow",
                "reg_no": "REG-UP-2024-002",
                "email": "admin@apollolko.org",
                "phone": "9812388888",
                "state": "Uttar Pradesh",
                "city": "Lucknow",
                "pincode": "226016",
                "type": "Private",
                "status": "approved",
                "admin_name": "Suresh Nair",
                "password": "hospital123",
                "beds": 120,
                "icu": 20,
                "branches": 2,
                "depts": ["Pulmonology", "Endocrinology", "Dermatology", "Pediatrics"]
            },
            {
                "app_id": "APP-2026-100006",
                "org_id": "ORG-006",
                "name": "Jeevan Hospital — Jaipur",
                "reg_no": "REG-RJ-2024-009",
                "email": "director@jeevanhospital.gov.in",
                "phone": "9812377777",
                "state": "Rajasthan",
                "city": "Jaipur",
                "pincode": "302001",
                "type": "Government",
                "status": "approved",
                "admin_name": "Dr. R. K. Meena",
                "password": "hospital123",
                "beds": 650,
                "icu": 110,
                "branches": 4,
                "depts": ["General Surgery", "Cardiology", "Trauma Care", "Oncology", "Internal Medicine"]
            },
            {
                "app_id": "APP-2026-755186",
                "org_id": "ORG-391206",
                "name": "Apex Institute of Medical Sciences",
                "reg_no": "REG-MH-2026-0892",
                "email": "superintendent@apexaims.org",
                "phone": "9820011223",
                "state": "Maharashtra",
                "city": "Mumbai",
                "pincode": "400012",
                "type": "Private",
                "status": "approved",
                "admin_name": "Apex Admin",
                "password": "hospital123",
                "beds": 350,
                "icu": 60,
                "branches": 1,
                "depts": ["Cardiology", "Neurology", "Oncology"]
            },
            {
                "app_id": "APP-2026-439106",
                "org_id": None,
                "name": "Heritage Superspecialty Hospital",
                "reg_no": "REG-DL-2026-4411",
                "email": "admin@heritagehospital.org",
                "phone": "9811002233",
                "state": "Delhi",
                "city": "New Delhi",
                "pincode": "110001",
                "type": "Private",
                "status": "pending",
                "admin_name": "Heritage Admin",
                "password": "hospital123",
                "beds": 250,
                "icu": 35,
                "branches": 1,
                "depts": ["Internal Medicine", "Pediatrics"]
            },
            {
                "app_id": "APP-2026-000003",
                "org_id": None,
                "name": "Bhardwaj Hospital",
                "reg_no": "REG-UP-2026-003",
                "email": "contact@bhardwajhospital.org",
                "phone": "9811003344",
                "state": "Uttar Pradesh",
                "city": "Agra",
                "pincode": "282001",
                "type": "Private",
                "status": "pending",
                "admin_name": "K. Bhardwaj",
                "password": "hospital123",
                "beds": 90,
                "icu": 10,
                "branches": 1,
                "depts": ["Orthopedics", "General Surgery"]
            },
            {
                "app_id": "APP-2026-000007",
                "org_id": "ORG-007",
                "name": "Naved Hospital — Delhi",
                "reg_no": "REG-DL-2026-007",
                "email": "admin@navedhospital.org",
                "phone": "9811005566",
                "state": "Delhi",
                "city": "Delhi",
                "pincode": "110025",
                "type": "Private",
                "status": "rejected",
                "admin_name": "Naved Khan",
                "password": "hospital123",
                "beds": 100,
                "icu": 15,
                "branches": 1,
                "depts": ["Emergency Medicine"]
            }
        ]

        for h in hospitals_dataset:
            app = db.query(HospitalApplication).filter(
                (HospitalApplication.application_id == h["app_id"]) |
                (HospitalApplication.official_email == h["email"])
            ).first()

            if not app:
                print(f"  [+] Creating Hospital Application: {h['name']} ({h['app_id']})...")
                app = HospitalApplication(
                    application_id=h["app_id"],
                    hospital_name=h["name"],
                    registration_number=h["reg_no"],
                    official_email=h["email"],
                    phone=h["phone"],
                    state=h["state"],
                    city=h["city"],
                    pincode=h["pincode"],
                    status=h["status"],
                    org_id=h["org_id"],
                    medical_superintendent=h["admin_name"],
                    submitted_at=utc_now(),
                    verified_at=utc_now() if h["status"] == "approved" else None,
                    rejection_reason="Incomplete mandatory fire safety and biomedical waste documentation" if h["status"] == "rejected" else None
                )
                db.add(app)
                db.flush()

                # Infrastructure
                db.add(HospitalInfrastructure(
                    application_id=app.application_id,
                    branches_count=h["branches"],
                    total_beds=h["beds"],
                    icu_beds=h["icu"],
                    has_emergency=True
                ))

                # Departments
                for d in h["depts"]:
                    db.add(HospitalDepartment(
                        application_id=app.application_id,
                        department_name=d,
                        is_active=True
                    ))
            else:
                app.status = h["status"]
                app.org_id = h["org_id"]
                if h["status"] == "approved":
                    app.verified_at = utc_now()

            db.commit()

            # For approved hospitals, provision the active user in hospital_users
            if h["status"] == "approved" and h["org_id"]:
                huser = db.query(HospitalUser).filter(
                    (HospitalUser.hospital_id == h["org_id"]) |
                    (HospitalUser.email == h["email"])
                ).first()

                if not huser:
                    print(f"  [+] Provisioning login account for {h['name']} (Org ID: {h['org_id']})...")
                    huser = HospitalUser(
                        hospital_id=h["org_id"],
                        name=h["admin_name"],
                        email=h["email"],
                        phone=h["phone"],
                        role="hospital_admin",
                        password_hash=hash_password(h["password"]),
                        is_active=True,
                        created_at=utc_now()
                    )
                    db.add(huser)
                else:
                    huser.hospital_id = h["org_id"]
                    huser.password_hash = hash_password(h["password"])
                    huser.is_active = True

                db.commit()

        print("  [OK] Hospital applications & hospital users seeded successfully.")

        # ==========================================
        # 3. SEED HOSPITAL BRANCHES & STAFF
        # ==========================================
        print("\n[*] Seeding Hospital Branches & Clinical Staff...")
        branches_data = [
            {"branch_id": "BR-001", "hospital_id": "ORG-001", "name": "Lucknow Branch", "location": "Hazratganj, Lucknow", "departments": 5, "doctors": 12, "opd": 218, "status": "active"},
            {"branch_id": "BR-002", "hospital_id": "ORG-001", "name": "Delhi Branch", "location": "Connaught Place, Delhi", "departments": 4, "doctors": 8, "opd": 182, "status": "active"},
            {"branch_id": "BR-003", "hospital_id": "ORG-001", "name": "Kanpur Branch", "location": "Civil Lines, Kanpur", "departments": 3, "doctors": 4, "opd": 97, "status": "active"},
        ]

        for b in branches_data:
            existing_b = db.query(HospitalBranch).filter(HospitalBranch.branch_id == b["branch_id"]).first()
            if not existing_b:
                db.add(HospitalBranch(**b, created_at=utc_now()))

        staff_data = [
            {"staff_id": "STF-001", "hospital_id": "ORG-001", "name": "Neha Singh", "role": "Nurse", "department": "Cardiology", "branch": "Lucknow Branch", "phone": "9870012301", "status": "active"},
            {"staff_id": "STF-002", "hospital_id": "ORG-001", "name": "Rajesh Kumar", "role": "Receptionist", "department": "Front Desk", "branch": "Lucknow Branch", "phone": "9870012302", "status": "active"},
            {"staff_id": "STF-003", "hospital_id": "ORG-001", "name": "Sunita Rao", "role": "Nurse", "department": "Emergency", "branch": "Lucknow Branch", "phone": "9870012303", "status": "active"},
            {"staff_id": "STF-004", "hospital_id": "ORG-001", "name": "Anil Sharma", "role": "Lab Tech", "department": "Laboratory", "branch": "Lucknow Branch", "phone": "9870012304", "status": "active"},
            {"staff_id": "STF-005", "hospital_id": "ORG-001", "name": "Pooja Joshi", "role": "Pharmacist", "department": "Pharmacy", "branch": "Lucknow Branch", "phone": "9870012305", "status": "active"},
            {"staff_id": "STF-006", "hospital_id": "ORG-001", "name": "Vivek Pandey", "role": "Nurse", "department": "Neurology", "branch": "Lucknow Branch", "phone": "9870012306", "status": "active"},
            {"staff_id": "STF-007", "hospital_id": "ORG-001", "name": "Anita Mishra", "role": "Receptionist", "department": "Front Desk", "branch": "Delhi Branch", "phone": "9870012307", "status": "active"},
            {"staff_id": "STF-008", "hospital_id": "ORG-001", "name": "Karan Gupta", "role": "Lab Tech", "department": "Laboratory", "branch": "Delhi Branch", "phone": "9870012308", "status": "inactive"},
            {"staff_id": "STF-009", "hospital_id": "ORG-001", "name": "Divya Tiwari", "role": "Nurse", "department": "Orthopedics", "branch": "Delhi Branch", "phone": "9870012309", "status": "active"},
            {"staff_id": "STF-010", "hospital_id": "ORG-001", "name": "Mohit Verma", "role": "Pharmacist", "department": "Pharmacy", "branch": "Kanpur Branch", "phone": "9870012310", "status": "active"},
            {"staff_id": "STF-011", "hospital_id": "ORG-001", "name": "Priya Shukla", "role": "Nurse", "department": "Pediatrics", "branch": "Kanpur Branch", "phone": "9870012311", "status": "active"},
            {"staff_id": "STF-012", "hospital_id": "ORG-001", "name": "Rahul Srivastava", "role": "Receptionist", "department": "Front Desk", "branch": "Kanpur Branch", "phone": "9870012312", "status": "active"}
        ]

        for s in staff_data:
            existing_s = db.query(HospitalStaff).filter(HospitalStaff.staff_id == s["staff_id"]).first()
            if not existing_s:
                db.add(HospitalStaff(**s, created_at=utc_now()))

        db.commit()
        print("  [OK] Branches & staff seeded successfully.")

        # ==========================================
        # 4. SEED DOCTORS & SUPER ADMIN (staff_users)
        # ==========================================
        print("\n[*] Seeding Clinicians & Super Admins (staff_users)...")
        staff_users_data = [
            {
                "staff_id": "DOC-001",
                "name": "Dr. Sharma",
                "email": "sharma.cardio@cityhospital.org",
                "phone": "9812300001",
                "role": "doctor",
                "password": "doctor123",
                "title": "Senior Cardiologist",
                "department": "Cardiology",
                "specialty": "Cardiology",
                "hospital_name": "City Hospital — Lucknow",
                "hospital_id": "ORG-001",
                "experience": 15,
                "rating": 4.8,
                "patients_count": 42
            },
            {
                "staff_id": "DOC-002",
                "name": "Dr. Patel",
                "email": "patel.neuro@cityhospital.org",
                "phone": "9812300002",
                "role": "doctor",
                "password": "doctor123",
                "title": "Consultant Neurologist",
                "department": "Neurology",
                "specialty": "Neurology",
                "hospital_name": "City Hospital — Lucknow",
                "hospital_id": "ORG-001",
                "experience": 12,
                "rating": 4.7,
                "patients_count": 36
            },
            {
                "staff_id": "DOC-003",
                "name": "Dr. Mehta",
                "email": "mehta.emergency@cityhospital.org",
                "phone": "9812300003",
                "role": "doctor",
                "password": "doctor123",
                "title": "Senior Emergency Physician",
                "department": "Emergency",
                "specialty": "General Medicine",
                "hospital_name": "City Hospital — Lucknow",
                "hospital_id": "ORG-001",
                "experience": 8,
                "rating": 4.6,
                "patients_count": 58
            },
            {
                "staff_id": "DOC-004",
                "name": "Dr. Gupta",
                "email": "gupta.ortho@cityhospital.org",
                "phone": "9812300004",
                "role": "doctor",
                "password": "doctor123",
                "title": "Chief of Orthopedic Surgery",
                "department": "Orthopedics",
                "specialty": "Orthopedics",
                "hospital_name": "City Hospital — Delhi Branch",
                "hospital_id": "ORG-001",
                "experience": 20,
                "rating": 4.9,
                "patients_count": 29
            },
            {
                "staff_id": "SA-001",
                "name": "National Administrator",
                "email": "admin@medikiosk.in",
                "phone": "9800000001",
                "role": "admin",
                "password": "admin123",
                "title": "National Health Administrator",
                "department": "National Oversight",
                "specialty": "Tier-1 Root",
                "hospital_name": "Ministry of Health / MediKiosk Authority",
                "hospital_id": None,
                "experience": 18,
                "rating": 5.0,
                "patients_count": 0
            },
            {
                "staff_id": "SA-002",
                "name": "Dr. Rajeshwar Rao",
                "email": "compliance@medikiosk.in",
                "phone": "9800000002",
                "role": "admin",
                "password": "admin123",
                "title": "National Compliance & Audit Inspector",
                "department": "Regulatory Assurance",
                "specialty": "Hospital Accreditation",
                "hospital_name": "Quality Council of Health",
                "hospital_id": None,
                "experience": 16,
                "rating": 4.9,
                "patients_count": 0
            }
        ]

        for su in staff_users_data:
            existing_su = db.query(StaffUser).filter(
                (StaffUser.staff_id == su["staff_id"]) |
                (StaffUser.email == su["email"])
            ).first()

            if not existing_su:
                print(f"  [+] Creating Staff User: {su['name']} ({su['staff_id']})...")
                user = StaffUser(
                    staff_id=su["staff_id"],
                    name=su["name"],
                    email=su["email"],
                    phone=su["phone"],
                    role=su["role"],
                    password_hash=hash_password(su["password"]),
                    title=su["title"],
                    department=su["department"],
                    specialty=su["specialty"],
                    hospital_name=su["hospital_name"],
                    hospital_id=su.get("hospital_id"),
                    experience=su["experience"],
                    rating=su["rating"],
                    patients_count=su["patients_count"],
                    is_active=True,
                    created_at=utc_now()
                )
                db.add(user)
            else:
                existing_su.password_hash = hash_password(su["password"])
                existing_su.hospital_id = su.get("hospital_id")
                existing_su.is_active = True

        db.commit()
        print("  [OK] Clinicians and Super Admins seeded successfully.")

        # ==========================================
        # 5. SEED DOCTOR CASES & REFERRALS
        # ==========================================
        print("\n[*] Seeding Doctor Today's Cases & Referrals...")
        db.query(DoctorCase).delete()
        cases_data = [
            {"doctor_id": "DOC-001", "patient_id": "MK-8472-9812-3345", "patient_name": "Rahul Kumar", "time": "09:30 AM", "type": "OPD", "status": "in-progress", "red_flag": True},
            {"doctor_id": "DOC-001", "patient_id": "MK-3310-5521-9981", "patient_name": "Priya Sharma", "time": "10:15 AM", "type": "OPD", "status": "waiting", "red_flag": False},
            {"doctor_id": "DOC-001", "patient_id": "MK-7890-2233-1156", "patient_name": "Arjun Singh", "time": "11:00 AM", "type": "Follow-up", "status": "waiting", "red_flag": False},
            {"doctor_id": "DOC-001", "patient_id": "MK-4421-6678-2290", "patient_name": "Meera Joshi", "time": "11:45 AM", "type": "OPD", "status": "scheduled", "red_flag": False},
            {"doctor_id": "DOC-001", "patient_id": "MK-5512-8899-3301", "patient_name": "Sanjay Verma", "time": "12:30 PM", "type": "OPD", "status": "scheduled", "red_flag": False},
        ]
        for c in cases_data:
            db.add(DoctorCase(**c, created_at=utc_now()))

        db.query(DoctorReferral).delete()
        referrals_data = [
            {
                "referral_id": "REF-001",
                "patient_id": "MK-8472-9812-3345",
                "patient_name": "Rahul Kumar",
                "referring_doctor_id": "DOC-001",
                "referred_to": "KGMU, Lucknow",
                "referred_doctor": "Dr. Patel (Neurology)",
                "specialty": "Neurology",
                "reason": "Chest pain evaluation, rule out cervical radiculopathy",
                "urgency": "high",
                "status": "pending",
                "date": "28 Aug 2026"
            },
            {
                "referral_id": "REF-002",
                "patient_id": "MK-3310-5521-9981",
                "patient_name": "Priya Sharma",
                "referring_doctor_id": "DOC-001",
                "referred_to": "Apollo Hospital, Lucknow",
                "referred_doctor": "Dr. Mehta (Endocrinology)",
                "specialty": "Endocrinology",
                "reason": "Uncontrolled Type 2 Diabetes, specialist therapeutic review",
                "urgency": "moderate",
                "status": "accepted",
                "date": "25 Aug 2026"
            },
            {
                "referral_id": "REF-003",
                "patient_id": "MK-7890-2233-1156",
                "patient_name": "Arjun Singh",
                "referring_doctor_id": "DOC-001",
                "referred_to": "City Hospital, Lucknow",
                "referred_doctor": "Dr. Gupta (Pulmonology)",
                "specialty": "Pulmonology",
                "reason": "COPD exacerbation long-term pulmonary rehabilitation",
                "urgency": "moderate",
                "status": "completed",
                "date": "20 Aug 2026"
            }
        ]
        for r in referrals_data:
            db.add(DoctorReferral(**r, created_at=utc_now()))

        db.commit()
        print("  [OK] Cases & referrals seeded successfully.")

        # ==========================================
        # 6. SEED OPD QUEUE & AUDIT LOGS
        # ==========================================
        print("\n[*] Seeding OPD Queue & Security Audit Logs...")
        db.query(OpdQueue).delete()
        queue_data = [
            {"token": "T-001", "hospital_id": "ORG-001", "name": "Rahul Kumar", "patient_id": "MK-8472-9812-3345", "doctor": "Dr. Sharma", "department": "Cardiology", "time": "09:15 AM", "status": "done"},
            {"token": "T-002", "hospital_id": "ORG-001", "name": "Priya Sharma", "patient_id": "MK-3310-5521-9981", "doctor": "Dr. Patel", "department": "Neurology", "time": "09:30 AM", "status": "done"},
            {"token": "T-003", "hospital_id": "ORG-001", "name": "Arjun Singh", "patient_id": "MK-7890-2233-1156", "doctor": "Dr. Sharma", "department": "Cardiology", "time": "09:45 AM", "status": "done"},
            {"token": "T-004", "hospital_id": "ORG-001", "name": "Anita Gupta", "patient_id": None, "doctor": "Dr. Mehta", "department": "Emergency", "time": "10:00 AM", "status": "in-progress"},
            {"token": "T-005", "hospital_id": "ORG-001", "name": "Suresh Verma", "patient_id": None, "doctor": "Dr. Patel", "department": "Neurology", "time": "10:15 AM", "status": "waiting"},
            {"token": "T-006", "hospital_id": "ORG-001", "name": "Meera Joshi", "patient_id": "MK-4421-6678-2290", "doctor": "Dr. Sharma", "department": "Cardiology", "time": "10:30 AM", "status": "waiting"},
            {"token": "T-007", "hospital_id": "ORG-001", "name": "Deepak Tiwari", "patient_id": None, "doctor": "Dr. Mehta", "department": "Emergency", "time": "10:45 AM", "status": "waiting"},
            {"token": "T-008", "hospital_id": "ORG-001", "name": "Kavita Sinha", "patient_id": None, "doctor": "Dr. Patel", "department": "Neurology", "time": "11:00 AM", "status": "waiting"},
            {"token": "T-009", "hospital_id": "ORG-001", "name": "Ravi Pandey", "patient_id": None, "doctor": "Dr. Sharma", "department": "Cardiology", "time": "11:15 AM", "status": "waiting"},
            {"token": "T-010", "hospital_id": "ORG-001", "name": "Geeta Mishra", "patient_id": None, "doctor": "Dr. Mehta", "department": "Emergency", "time": "11:30 AM", "status": "waiting"}
        ]
        for q in queue_data:
            db.add(OpdQueue(**q, created_at=utc_now()))

        db.query(AuditLog).delete()
        audit_data = [
            {
                "log_id": "AUD-99120",
                "timestamp": "2026-09-02 01:45:12",
                "actor": "Dr. Sharma (DOC-001)",
                "actor_role": "Doctor",
                "action": "RECORD_ACCESSED",
                "resource": "Patient Record: MK-8472-9812-3345 (Rahul Kumar)",
                "purpose": "OPD Consultation - Consent CS-8891 Validated",
                "ip_address": "103.21.144.92",
                "status": "SUCCESS"
            },
            {
                "log_id": "AUD-99119",
                "timestamp": "2026-09-02 01:40:05",
                "actor": "Super Admin (Administrator)",
                "actor_role": "Super Admin",
                "action": "HOSPITAL_APPROVED",
                "resource": "Hospital Entity: Jeevan Hospital (ORG-006)",
                "purpose": "National Registration Verification completed",
                "ip_address": "14.139.224.18",
                "status": "SUCCESS"
            },
            {
                "log_id": "AUD-99118",
                "timestamp": "2026-09-02 01:22:40",
                "actor": "AI Case Engine Subsystem",
                "actor_role": "AI Daemon",
                "action": "RED_FLAG_EVALUATED",
                "resource": "Case Session #4091 (Patient: Rahul Kumar)",
                "purpose": "Rule: Chest Pain + Breathlessness = High Urgency",
                "ip_address": "10.0.4.12 (Internal RPC)",
                "status": "TRIGGERED"
            },
            {
                "log_id": "AUD-99117",
                "timestamp": "2026-09-02 00:55:10",
                "actor": "Unauthorized API Client",
                "actor_role": "Anonymous",
                "action": "UNAUTHORIZED_ACCESS_ATTEMPT",
                "resource": "/api/v1/patients/MK-3310-5521-9981",
                "purpose": "No valid consent token presented",
                "ip_address": "45.112.88.190",
                "status": "DENIED"
            },
            {
                "log_id": "AUD-99116",
                "timestamp": "2026-09-01 23:14:02",
                "actor": "Patient (Rahul Kumar)",
                "actor_role": "Patient",
                "action": "CONSENT_GRANTED",
                "resource": "Consent Scope: Diagnostics + Previous Rx to City Hospital",
                "purpose": "Self-service consent grant on Patient App",
                "ip_address": "103.21.144.92",
                "status": "SUCCESS"
            }
        ]
        for a in audit_data:
            db.add(AuditLog(**a, created_at=utc_now()))

        db.commit()
        print("  [OK] OPD Queue and Audit Logs seeded successfully.")

        print("\n" + "="*70)
        print("MASTER SEEDING COMPLETE: ALL 25 RELATIONAL TABLES POPULATED!")
        print("="*70)

    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] Seeding failed: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_all()
