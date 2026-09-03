import crypto from 'crypto'

// In-memory persistent database store initialized with comprehensive national seed data
class DatabaseStore {
  constructor() {
    this.users = []
    this.patients = []
    this.doctors = []
    this.hospitals = []
    this.branches = []
    this.departments = []
    this.encounters = []
    this.prescriptions = []
    this.documents = []
    this.opdQueue = []
    this.verificationQueue = []
    this.consentArtifacts = []
    this.auditLogs = []
    this.messages = []

    this.initSeedData()
  }

  initSeedData() {
    // 1. Users
    this.users = [
      {
        id: 'usr_pat_001',
        identifier: 'rahul.k93@gmail.com',
        username: 'rahul.k93@gmail.com',
        password: 'patient123',
        role: 'patient',
        name: 'Rahul Kumar',
        entityId: 'MK-8472-9812-3345',
        org: 'National Health Registry',
        phone: '9876543210',
        createdAt: new Date('2026-01-10').toISOString()
      },
      {
        id: 'usr_pat_002',
        identifier: 'priya.sharma@gmail.com',
        username: 'priya.sharma@gmail.com',
        password: 'patient123',
        role: 'patient',
        name: 'Priya Sharma',
        entityId: 'MK-3310-5521-9981',
        org: 'National Health Registry',
        phone: '9812345678',
        createdAt: new Date('2026-02-14').toISOString()
      },
      {
        id: 'usr_doc_001',
        identifier: 'sharma.cardio@cityhospital.org',
        username: 'sharma.cardio@cityhospital.org',
        password: 'doctor123',
        role: 'doctor',
        name: 'Dr. Sharma',
        entityId: 'DOC-001',
        org: 'City Hospital - Lucknow',
        phone: '9812300001',
        createdAt: new Date('2025-11-20').toISOString()
      },
      {
        id: 'usr_hosp_001',
        identifier: 'admin@cityhospital.org',
        username: 'admin@cityhospital.org',
        password: 'hospital123',
        role: 'hospital',
        name: 'Alok Gupta',
        entityId: 'ORG-001',
        org: 'City Hospital — Lucknow',
        phone: '9812399999',
        createdAt: new Date('2025-10-05').toISOString()
      },
      {
        id: 'usr_adm_001',
        identifier: 'admin@medikiosk.in',
        username: 'admin@medikiosk.in',
        password: 'admin123',
        role: 'admin',
        name: 'National Administrator',
        entityId: 'SA-001',
        org: 'Ministry of Health & Family Welfare',
        phone: '9800000001',
        createdAt: new Date('2025-01-01').toISOString()
      }
    ]

    // 2. Patients & EHR
    this.patients = [
      {
        id: 'MK-8472-9812-3345',
        userId: 'usr_pat_001',
        name: 'Rahul Kumar',
        age: 32,
        gender: 'Male',
        phone: '9876543210',
        email: 'rahul.k93@gmail.com',
        dob: '1993-03-15',
        bloodGroup: 'O+',
        address: 'Sector 21, Indira Nagar, Lucknow, UP',
        conditions: ['Hypertension', 'Mild Asthma'],
        allergies: ['Penicillin'],
        emergencyContact: { name: 'Sunita Kumar (Spouse)', phone: '9876543299' },
        redFlag: { active: true, label: 'Chest pain + Breathlessness', severity: 'HIGH', detectedAt: new Date().toISOString() },
        consentStatus: 'Authorised',
        vitals: {
          bp: '138/88',
          pulse: 92,
          spo2: 97,
          temp: '98.6°F',
          weight: '74 kg',
          height: "5'9\"",
          recordedAt: new Date().toISOString()
        }
      },
      {
        id: 'MK-3310-5521-9981',
        userId: 'usr_pat_002',
        name: 'Priya Sharma',
        age: 45,
        gender: 'Female',
        phone: '9812345678',
        email: 'priya.sharma@gmail.com',
        dob: '1981-07-22',
        bloodGroup: 'B+',
        address: 'Gomti Nagar, Lucknow, UP',
        conditions: ['Type 2 Diabetes', 'Hypothyroidism'],
        allergies: [],
        emergencyContact: { name: 'Rohan Sharma (Son)', phone: '9812345600' },
        redFlag: { active: false, label: '', severity: 'NONE' },
        consentStatus: 'Authorised',
        vitals: {
          bp: '126/82',
          pulse: 78,
          spo2: 98,
          temp: '98.4°F',
          weight: '68 kg',
          height: "5'4\"",
          recordedAt: new Date().toISOString()
        }
      }
    ]

    // 3. Doctors
    this.doctors = [
      {
        id: 'DOC-001',
        name: 'Dr. Sharma',
        specialty: 'Cardiology',
        department: 'Cardiology',
        hospitalId: 'ORG-001',
        branch: 'Lucknow Branch',
        phone: '9812300001',
        email: 'sharma.cardio@cityhospital.org',
        rating: 4.8,
        experience: 15,
        patientsCount: 42,
        activeCasesToday: 8
      },
      {
        id: 'DOC-002',
        name: 'Dr. Patel',
        specialty: 'Neurology',
        department: 'Neurology',
        hospitalId: 'ORG-001',
        branch: 'Lucknow Branch',
        phone: '9812300002',
        email: 'patel.neuro@cityhospital.org',
        rating: 4.7,
        experience: 12,
        patientsCount: 36,
        activeCasesToday: 6
      }
    ]

    // 4. Hospitals & Hierarchy
    this.hospitals = [
      {
        id: 'ORG-001',
        name: 'City Hospital',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        type: 'Private Tertiary Care',
        status: 'approved',
        regDate: '2026-01-15',
        branchesCount: 3,
        doctorsCount: 24,
        departmentsCount: 8,
        staffCount: 156
      },
      {
        id: 'ORG-002',
        name: 'Apollo Clinic',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        type: 'Private Multi-Specialty',
        status: 'approved',
        regDate: '2026-02-28',
        branchesCount: 2,
        doctorsCount: 18,
        departmentsCount: 6,
        staffCount: 98
      }
    ]

    this.branches = [
      { id: 'BR-001', hospitalId: 'ORG-001', name: 'Lucknow Branch', location: 'Hazratganj, Lucknow', departments: 5, doctors: 12, opdCapacity: 250, currentOpd: 218, status: 'active' },
      { id: 'BR-002', hospitalId: 'ORG-001', name: 'Delhi Branch', location: 'Connaught Place, Delhi', departments: 4, doctors: 8, opdCapacity: 200, currentOpd: 182, status: 'active' },
      { id: 'BR-003', hospitalId: 'ORG-001', name: 'Kanpur Branch', location: 'Civil Lines, Kanpur', departments: 3, doctors: 4, opdCapacity: 120, currentOpd: 97, status: 'active' }
    ]

    this.departments = [
      { id: 'DEP-001', branchId: 'BR-001', name: 'Cardiology', doctors: 5, nurses: 8, status: 'active' },
      { id: 'DEP-002', branchId: 'BR-001', name: 'Neurology', doctors: 4, nurses: 6, status: 'active' },
      { id: 'DEP-003', branchId: 'BR-001', name: 'Emergency', doctors: 3, nurses: 12, status: 'active' },
      { id: 'DEP-004', branchId: 'BR-002', name: 'Orthopedics', doctors: 4, nurses: 7, status: 'active' }
    ]

    // 5. Verification Queue (National Registry)
    this.verificationQueue = [
      {
        id: 'REQ-8891',
        hospitalName: 'Bhardwaj Multispecialty Hospital',
        city: 'Agra',
        state: 'Uttar Pradesh',
        category: 'Private Tertiary',
        licenseNo: 'UP-MED-2026-0941',
        submittedDate: '01 Aug 2026',
        beds: 180,
        status: 'pending',
        documents: ['NABH_Accreditation.pdf', 'Fire_Safety_Certificate.pdf', 'Pollution_Clearance.pdf']
      },
      {
        id: 'REQ-8892',
        hospitalName: 'Metro City Hospital & Trauma Center',
        city: 'Kanpur',
        state: 'Uttar Pradesh',
        category: 'Private General',
        licenseNo: 'UP-MED-2026-1102',
        submittedDate: '22 Aug 2026',
        beds: 120,
        status: 'pending',
        documents: ['Registration_Certificate.pdf', 'Building_Permit.pdf']
      },
      {
        id: 'REQ-8893',
        hospitalName: 'Care Plus Super Speciality',
        city: 'Patna',
        state: 'Bihar',
        category: 'Private Tertiary',
        licenseNo: 'BR-HEALTH-2026-4410',
        submittedDate: '24 Aug 2026',
        beds: 250,
        status: 'pending',
        documents: ['NABH_Entry_Level.pdf', 'Clinical_Establishment_Act_License.pdf']
      }
    ]

    // 6. OPD Queue
    this.opdQueue = [
      { id: 'OPD-101', patientId: 'MK-8472-9812-3345', patientName: 'Rahul Kumar', doctorId: 'DOC-001', doctorName: 'Dr. Sharma', token: 1, time: '09:30 AM', type: 'OPD', status: 'in-progress', redFlag: true },
      { id: 'OPD-102', patientId: 'MK-3310-5521-9981', patientName: 'Priya Sharma', doctorId: 'DOC-001', doctorName: 'Dr. Sharma', token: 2, time: '10:15 AM', type: 'OPD', status: 'waiting', redFlag: false },
      { id: 'OPD-103', patientId: 'MK-7890-2233-1156', patientName: 'Arjun Singh', doctorId: 'DOC-001', doctorName: 'Dr. Sharma', token: 3, time: '11:00 AM', type: 'Follow-up', status: 'waiting', redFlag: false }
    ]

    // 7. Prescriptions
    this.prescriptions = [
      {
        id: 'RX-901',
        patientId: 'MK-8472-9812-3345',
        doctorId: 'DOC-001',
        doctorName: 'Dr. Sharma',
        hospitalName: 'City Hospital, Lucknow',
        date: '15 Jul 2026',
        diagnosis: 'Essential Hypertension + Exertional Dyspnea',
        medicines: [
          { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily (Morning)', duration: '30 days' },
          { name: 'Salbutamol Inhaler', dosage: '100mcg', frequency: 'SOS (As needed)', duration: '60 days' }
        ],
        advice: 'Low sodium diet, monitor BP daily in the morning, avoid heavy exertion.'
      }
    ]

    // 8. Documents
    this.documents = [
      { id: 'DOC-F-001', patientId: 'MK-8472-9812-3345', name: '12-Lead ECG Report', date: '28 Aug 2026', type: 'ECG', size: '1.8 MB', status: 'processed', url: '/uploads/sample_ecg.pdf' },
      { id: 'DOC-F-002', patientId: 'MK-8472-9812-3345', name: 'Complete Blood Count (CBC)', date: '25 Apr 2026', type: 'Lab', size: '850 KB', status: 'processed', url: '/uploads/sample_cbc.pdf' }
    ]

    // 9. Consent Artifacts
    this.consentArtifacts = [
      {
        id: 'CNS-001',
        patientId: 'MK-8472-9812-3345',
        granteeId: 'ORG-001',
        granteeName: 'City Hospital — Lucknow',
        scopes: ['vitals', 'lab_reports', 'prescriptions', 'clinical_summaries'],
        validFrom: '2026-01-01T00:00:00Z',
        validTo: '2027-01-01T00:00:00Z',
        status: 'ACTIVE',
        signature: 'JWS_SHA256_MOCK_SIGNATURE_MK_8472'
      }
    ]

    // 10. Audit Logs
    this.auditLogs = [
      {
        id: 'AUD-001',
        actorId: 'usr_doc_001',
        actorName: 'Dr. Sharma',
        actorRole: 'Doctor',
        action: 'READ_PATIENT_CASE',
        resourceId: 'MK-8472-9812-3345',
        ipAddress: '192.168.1.45',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        hash: this.calculateHash('GENESIS', 'usr_doc_001', 'READ_PATIENT_CASE', 'MK-8472-9812-3345')
      }
    ]
  }

  calculateHash(prevHash, actorId, action, resourceId) {
    return crypto.createHash('sha256').update(`${prevHash}:${actorId}:${action}:${resourceId}:${Date.now()}`).digest('hex')
  }

  logAccess(actorId, actorName, actorRole, action, resourceId, ipAddress = '127.0.0.1') {
    const prevLog = this.auditLogs[this.auditLogs.length - 1]
    const prevHash = prevLog ? prevLog.hash : 'GENESIS_BLOCK_HASH'
    const newHash = this.calculateHash(prevHash, actorId, action, resourceId)

    const logEntry = {
      id: `AUD-${Date.now()}`,
      actorId,
      actorName,
      actorRole,
      action,
      resourceId,
      ipAddress,
      timestamp: new Date().toISOString(),
      previousHash: prevHash,
      hash: newHash
    }

    this.auditLogs.unshift(logEntry)
    return logEntry
  }
}

export const db = new DatabaseStore()
