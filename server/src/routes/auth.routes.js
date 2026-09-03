import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config/index.js'
import { db } from '../db/store.js'
import { authenticate } from '../middleware/auth.js'
import { emitVerificationUpdate } from '../services/socketService.js'

const router = Router()

// Temporary in-memory OTP cache: { [phone]: { otp, idType, idNumber, expiresAt } }
const otpStore = new Map()

/**
 * POST /api/auth/send-otp
 * Generates and dispatches a 6-digit OTP for Aadhaar/ABHA/Mobile verification
 */
router.post('/send-otp', (req, res) => {
  const { phone, idType = 'phone', idNumber = '' } = req.body

  if (!phone) {
    return res.status(400).json({ success: false, error: 'Mobile number is required to receive OTP.' })
  }

  const cleanPhone = phone.trim().replace(/[^0-9]/g, '').slice(-10)
  // In demo/test mode, use deterministic 123456 or generate 6-digit random code
  const otpCode = cleanPhone === '9876543210' ? '123456' : String(Math.floor(100000 + Math.random() * 900000))
  const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

  otpStore.set(cleanPhone, {
    otp: otpCode,
    idType,
    idNumber,
    expiresAt
  })

  console.log(`[SMS Gateway Mock] Dispatched OTP ${otpCode} to mobile number: +91-${cleanPhone} (Source: ${idType})`)

  return res.json({
    success: true,
    message: `OTP successfully sent via SMS to +91-******${cleanPhone.slice(-4)}`,
    phone: cleanPhone,
    idType,
    // Returned in response for sandbox testing ease
    debugOtp: otpCode
  })
})

/**
 * POST /api/auth/verify-otp
 * Validates the 6-digit OTP against Aadhaar/ABHA registry and returns KYC attributes
 */
router.post('/verify-otp', (req, res) => {
  const { phone, otp, idType = 'phone', idNumber = '' } = req.body

  if (!phone || !otp) {
    return res.status(400).json({ success: false, error: 'Phone number and OTP code are required.' })
  }

  const cleanPhone = phone.trim().replace(/[^0-9]/g, '').slice(-10)
  const cleanOtp = String(otp).trim()
  const cached = otpStore.get(cleanPhone)

  // Validate OTP (allow 123456 as master test OTP or match cached)
  const isValid = cleanOtp === '123456' || (cached && cached.otp === cleanOtp && cached.expiresAt > Date.now())

  if (!isValid) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or expired OTP code. Please enter the 6-digit verification code.'
    })
  }

  // Clear OTP from cache
  otpStore.delete(cleanPhone)

  // Mock NHA ABDM / UIDAI KYC demographic resolution
  const kycData = {
    verified: true,
    authSource: idType === 'aadhaar' ? 'UIDAI Aadhaar e-KYC' : idType === 'abha' ? 'NHA ABDM ABHA Registry' : 'Mobile OTP Authentication',
    idNumber: idNumber || `${cleanPhone}`,
    fullName: idType === 'aadhaar' ? 'Rahul Kumar' : idType === 'abha' ? 'Priya Sharma' : 'Verified Citizen',
    dob: '1993-03-15',
    gender: 'Male',
    bloodGroup: 'O+',
    address: 'Sector 21, Indira Nagar, Lucknow, Uttar Pradesh - 226016'
  }

  return res.json({
    success: true,
    message: 'Identity proof successfully verified with National Health Gateway',
    kycData
  })
})

/**
 * POST /api/auth/login
 * Universal login for all 4 roles (Patient, Doctor, Hospital Admin, Super Admin)
 * Supports email, phone, Global ID (MK-...), Doctor ID (DOC-...), or Facility Code (ORG-...)
 */
router.post('/login', (req, res) => {
  const { role, identifier, password } = req.body

  if (!identifier || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide both your identifier/email and password.'
    })
  }

  const cleanId = identifier.trim().toLowerCase()
  const cleanPass = password.trim()

  const matchedUser = db.users.find((u) => {
    const matchRole = role ? u.role.toLowerCase() === role.toLowerCase() : true
    const matchId =
      u.identifier.toLowerCase() === cleanId ||
      u.username.toLowerCase() === cleanId ||
      u.entityId?.toLowerCase() === cleanId ||
      (u.phone && u.phone === cleanId)
    const matchPass = u.password === cleanPass

    return matchRole && matchId && matchPass
  })

  if (!matchedUser) {
    return res.status(401).json({
      success: false,
      error: `Invalid credentials for ${role ? role.toUpperCase() : 'this'} portal. Please verify your ID/email and password.`
    })
  }

  // Fetch full patient data if patient role
  let patientDetails = null
  if (matchedUser.role === 'patient') {
    patientDetails = db.patients.find((p) => p.id === matchedUser.entityId || p.userId === matchedUser.id)
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      id: matchedUser.id,
      role: matchedUser.role,
      name: matchedUser.name,
      entityId: matchedUser.entityId,
      org: matchedUser.org
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  )

  // Log tamper-evident audit record
  db.logAccess(
    matchedUser.id,
    matchedUser.name,
    matchedUser.role,
    'USER_LOGIN_SUCCESS',
    matchedUser.entityId || matchedUser.id,
    req.ip || '127.0.0.1'
  )

  return res.json({
    success: true,
    message: 'Authentication successful',
    token,
    user: {
      id: matchedUser.id,
      identifier: matchedUser.identifier,
      name: matchedUser.name,
      role: matchedUser.role,
      entityId: matchedUser.entityId,
      org: matchedUser.org,
      phone: matchedUser.phone,
      details: patientDetails || {}
    }
  })
})

/**
 * GET /api/auth/me
 * Retrieves current authenticated user context
 */
router.get('/me', authenticate, (req, res) => {
  const user = db.users.find((u) => u.id === req.user.id)
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' })
  }

  let patientDetails = null
  if (user.role === 'patient') {
    patientDetails = db.patients.find((p) => p.id === user.entityId || p.userId === user.id)
  }

  return res.json({
    success: true,
    user: {
      id: user.id,
      identifier: user.identifier,
      name: user.name,
      role: user.role,
      entityId: user.entityId,
      org: user.org,
      phone: user.phone,
      details: patientDetails || {}
    }
  })
})

/**
 * POST /api/auth/register-patient
 * Comprehensive Patient Registration Engine
 * Generates permanent Global Health ID and login credentials
 */
router.post('/register-patient', (req, res) => {
  const {
    name,
    phone,
    email,
    dob,
    gender,
    bloodGroup,
    address,
    conditions = [],
    allergies = [],
    currentMeds = '',
    emergencyContact = {},
    password = 'patient123'
  } = req.body

  if (!name || !phone) {
    return res.status(400).json({ success: false, error: 'Name and phone number are required.' })
  }

  // Check if phone or email already registered
  const existingUser = db.users.find(
    (u) => (phone && u.phone === phone) || (email && u.identifier.toLowerCase() === email.toLowerCase())
  )

  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: 'A user with this mobile number or email address is already registered. Please sign in.'
    })
  }

  const random4 = () => Math.floor(1000 + Math.random() * 9000)
  const patientId = `MK-${random4()}-${random4()}-${random4()}`
  const userId = `usr_pat_${Date.now()}`
  const userIdentifier = email ? email.trim() : phone.trim()

  const newUser = {
    id: userId,
    identifier: userIdentifier,
    username: userIdentifier,
    password: password.trim() || 'patient123',
    role: 'patient',
    name,
    entityId: patientId,
    org: 'National Health Registry',
    phone,
    createdAt: new Date().toISOString()
  }

  const parsedConditions = Array.isArray(conditions) ? conditions : conditions ? [conditions] : []
  const parsedAllergies = Array.isArray(allergies) ? allergies : allergies ? [allergies] : []

  const newPatient = {
    id: patientId,
    userId,
    name,
    age: dob ? new Date().getFullYear() - new Date(dob).getFullYear() : 30,
    gender: gender || 'Unspecified',
    phone,
    email: email || '',
    dob: dob || '1995-01-01',
    bloodGroup: bloodGroup || 'O+',
    address: address || '',
    conditions: parsedConditions,
    allergies: parsedAllergies,
    currentMeds: currentMeds || '',
    medications: currentMeds ? currentMeds.split(',').map((m) => m.trim()) : [],
    emergencyContact: {
      name: emergencyContact.name || 'Emergency Contact',
      relation: emergencyContact.relation || 'Family',
      phone: emergencyContact.phone || phone
    },
    timeline: [
      {
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        type: 'Registration',
        hospital: 'National Health Authority',
        summary: 'Global Patient ID registered and activated.'
      }
    ],
    documents: [],
    redFlag: { active: false, label: '', severity: 'NONE' },
    consentStatus: 'Authorised',
    vitals: {
      bp: '120/80',
      pulse: 72,
      spo2: 98,
      temp: '98.6°F',
      weight: '70 kg',
      height: "5'8\"",
      recordedAt: new Date().toISOString()
    }
  }

  db.users.push(newUser)
  db.patients.push(newPatient)

  db.logAccess(userId, name, 'patient', 'REGISTER_PATIENT', patientId, req.ip)

  return res.status(201).json({
    success: true,
    message: 'Global Patient ID generated and credentials provisioned successfully.',
    patientId,
    credentials: {
      identifier: userIdentifier,
      globalId: patientId,
      defaultPassword: password.trim() || 'patient123'
    },
    patient: newPatient
  })
})

/**
 * POST /api/auth/register-hospital
 * Institutional Healthcare Facility Registration & Verification Enqueue
 */
router.post('/register-hospital', (req, res) => {
  const {
    hospitalName,
    hospitalType = 'Private',
    regNumber,
    state,
    city,
    pincode,
    officialEmail,
    phone,
    medicalSuperintendent,
    branchesCount = 1,
    totalBeds = 100,
    icuBeds = 20,
    departments = [],
    documents = []
  } = req.body

  if (!hospitalName || !officialEmail || !regNumber) {
    return res.status(400).json({
      success: false,
      error: 'Hospital legal name, license number, and official email are required.'
    })
  }

  const trackingId = `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`

  const verificationEntry = {
    id: trackingId,
    hospitalName,
    city: city || 'Lucknow',
    state: state || 'Uttar Pradesh',
    category: hospitalType,
    licenseNo: regNumber,
    submittedDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    beds: parseInt(totalBeds, 10) || 100,
    icuBeds: parseInt(icuBeds, 10) || 20,
    branchesCount: parseInt(branchesCount, 10) || 1,
    status: 'pending',
    officialEmail,
    phone,
    medicalSuperintendent,
    departments,
    documents: documents.length > 0 ? documents : ['Clinical_Establishment_License.pdf', 'Pollution_Clearance.pdf']
  }

  db.verificationQueue.unshift(verificationEntry)
  emitVerificationUpdate({ requestId: trackingId, status: 'pending', hospitalName })

  db.logAccess('ANONYMOUS_HOSPITAL', hospitalName, 'hospital', 'REGISTER_HOSPITAL_APPLICATION', trackingId, req.ip)

  return res.status(201).json({
    success: true,
    message: 'Hospital application registered and submitted to National Verification Queue.',
    trackingId,
    application: verificationEntry
  })
})

/**
 * POST /api/auth/register-doctor
 * Clinician account creation under verified hospital
 */
router.post('/register-doctor', (req, res) => {
  const { name, email, phone, specialty, department, hospitalId, branch, password = 'doctor123' } = req.body

  if (!name || !email || !specialty) {
    return res.status(400).json({ success: false, error: 'Doctor name, email, and specialty are required.' })
  }

  const docId = `DOC-${String(db.doctors.length + 1).padStart(3, '0')}`
  const userId = `usr_doc_${Date.now()}`

  const newUser = {
    id: userId,
    identifier: email.trim().toLowerCase(),
    username: email.trim().toLowerCase(),
    password: password.trim() || 'doctor123',
    role: 'doctor',
    name,
    entityId: docId,
    org: hospitalId ? `Hospital ${hospitalId}` : 'City Hospital - Lucknow',
    phone: phone || '9812300099',
    createdAt: new Date().toISOString()
  }

  const newDoctor = {
    id: docId,
    name,
    specialty,
    department: department || specialty,
    hospitalId: hospitalId || 'ORG-001',
    branch: branch || 'Lucknow Branch',
    phone: phone || '9812300099',
    email,
    rating: 5.0,
    experience: 5,
    patientsCount: 0,
    activeCasesToday: 0
  }

  db.users.push(newUser)
  db.doctors.push(newDoctor)

  db.logAccess(userId, name, 'doctor', 'REGISTER_DOCTOR', docId, req.ip)

  return res.status(201).json({
    success: true,
    message: 'Doctor account provisioned successfully',
    docId,
    doctor: newDoctor,
    credentials: {
      identifier: email,
      docId,
      defaultPassword: password || 'doctor123'
    }
  })
})

/**
 * GET /api/auth/credentials-directory
 * Returns verified platform demo credentials for fast verification and testing
 */
router.get('/credentials-directory', (req, res) => {
  return res.json({
    success: true,
    accounts: [
      { role: 'patient', name: 'Rahul Kumar', identifier: 'rahul.k93@gmail.com', altId: 'MK-8472-9812-3345', password: 'patient123' },
      { role: 'patient', name: 'Priya Sharma', identifier: 'priya.sharma@gmail.com', altId: 'MK-3310-5521-9981', password: 'patient123' },
      { role: 'doctor', name: 'Dr. Sharma (Cardiology)', identifier: 'sharma.cardio@cityhospital.org', altId: 'DOC-001', password: 'doctor123' },
      { role: 'hospital', name: 'Alok Gupta (Hospital Admin)', identifier: 'admin@cityhospital.org', altId: 'ORG-001', password: 'hospital123' },
      { role: 'admin', name: 'National Administrator', identifier: 'admin@medikiosk.in', altId: 'SA-001', password: 'admin123' }
    ]
  })
})

export default router
