export const AUTH_USERS = [
  {
    id: 'MK-8472-9812-3345',
    username: 'rahul.k93@gmail.com',
    password: 'patient123',
    role: 'patient',
    name: 'Rahul Kumar',
    portalPath: '/patient',
    title: 'Patient',
    org: 'National Health Registry',
    phone: '9876543210',
    avatar: null,
    details: {
      dob: '1993-03-15',
      bloodGroup: 'O+',
      age: 32,
      gender: 'Male',
      address: 'Sector 21, Lucknow, UP'
    }
  },
  {
    id: 'MK-3310-5521-9981',
    username: 'priya.sharma@gmail.com',
    password: 'patient123',
    role: 'patient',
    name: 'Priya Sharma',
    portalPath: '/patient',
    title: 'Patient',
    org: 'National Health Registry',
    phone: '9812345678',
    avatar: null,
    details: {
      dob: '1981-07-22',
      bloodGroup: 'B+',
      age: 45,
      gender: 'Female',
      address: 'Gomti Nagar, Lucknow, UP'
    }
  },
  {
    id: 'DOC-001',
    username: 'sharma.cardio@cityhospital.org',
    password: 'doctor123',
    role: 'doctor',
    name: 'Dr. Sharma',
    portalPath: '/doctor',
    title: 'Senior Cardiologist',
    org: 'City Hospital - Lucknow',
    phone: '9812300001',
    avatar: null,
    details: {
      department: 'Cardiology',
      specialty: 'Cardiology',
      branch: 'Lucknow Branch',
      experience: 15
    }
  },
  {
    id: 'DOC-002',
    username: 'patel.neuro@cityhospital.org',
    password: 'doctor123',
    role: 'doctor',
    name: 'Dr. Patel',
    portalPath: '/doctor',
    title: 'Consultant Neurologist',
    org: 'City Hospital - Lucknow',
    phone: '9812300002',
    avatar: null,
    details: {
      department: 'Neurology',
      specialty: 'Neurology',
      branch: 'Lucknow Branch',
      experience: 12
    }
  },
  {
    id: 'ORG-001',
    username: 'admin@cityhospital.org',
    password: 'hospital123',
    role: 'hospital',
    name: 'Alok Gupta',
    portalPath: '/hospital',
    title: 'Hospital Administrator',
    org: 'City Hospital — Lucknow',
    phone: '9812399999',
    avatar: null,
    details: {
      facilityId: 'ORG-001',
      facilityName: 'City Hospital — Lucknow',
      facilityType: 'Private Tertiary Care',
      city: 'Lucknow'
    }
  },
  {
    id: 'SA-001',
    username: 'admin@medikiosk.in',
    password: 'admin123',
    role: 'admin',
    name: 'Administrator',
    portalPath: '/admin',
    title: 'National Health Administrator',
    org: 'Ministry of Health / MediKiosk Authority',
    phone: '9800000001',
    avatar: null,
    details: {
      accessLevel: 'Tier-1 National Root',
      scope: 'All States & Union Territories'
    }
  }
]

export const DEMO_CREDENTIALS = {
  patient: {
    role: 'patient',
    roleLabel: 'Patient Platform',
    identifier: 'rahul.k93@gmail.com',
    altIdentifier: 'MK-8472-9812-3345',
    password: 'patient123',
    name: 'Rahul Kumar',
    description: 'Access personal health timeline, AI case reports, consent manager, and documents.'
  },
  doctor: {
    role: 'doctor',
    roleLabel: 'Doctor Portal',
    identifier: 'sharma.cardio@cityhospital.org',
    altIdentifier: 'DOC-001',
    password: 'doctor123',
    name: 'Dr. Sharma (Cardiology)',
    description: 'Clinical decision support, patient case views, red-flag alert engine, and prescription tool.'
  },
  hospital: {
    role: 'hospital',
    roleLabel: 'Hospital Admin',
    identifier: 'admin@cityhospital.org',
    altIdentifier: 'ORG-001',
    password: 'hospital123',
    name: 'Alok Gupta (City Hospital)',
    description: 'Organization structure, branches, doctor roster, staff governance, and OPD management.'
  },
  admin: {
    role: 'admin',
    roleLabel: 'Super Admin',
    identifier: 'admin@medikiosk.in',
    altIdentifier: 'SA-001',
    password: 'admin123',
    name: 'National Administrator',
    description: 'National hospital verification engine, network audit logs, user security, and policy management.'
  }
}
