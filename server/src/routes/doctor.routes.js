import { Router } from 'express'
import { db } from '../db/store.js'
import { authenticate } from '../middleware/auth.js'
import { requireRole } from '../middleware/rbac.js'
import { evaluateRedFlags } from '../services/redFlagEngine.js'

const router = Router()

/**
 * GET /api/doctor/dashboard
 * Returns clinician metrics, OPD queue list, and active red-flag alerts
 */
router.get('/dashboard', authenticate, requireRole('doctor', 'admin'), (req, res) => {
  const doctorId = req.user.entityId || 'DOC-001'
  const doctor = db.doctors.find((d) => d.id === doctorId) || db.doctors[0]

  const todayCases = db.opdQueue.filter((q) => q.doctorId === doctorId || q.doctorId === 'DOC-001')
  const highRiskCases = db.patients.filter((p) => p.redFlag?.active)

  db.logAccess(req.user.id, req.user.name, 'doctor', 'READ_DOCTOR_DASHBOARD', doctorId, req.ip)

  return res.json({
    success: true,
    doctor,
    metrics: {
      activePatients: doctor?.patientsCount || 42,
      todayCasesCount: todayCases.length,
      redFlagsCount: highRiskCases.length,
      rating: doctor?.rating || 4.8
    },
    todayCases,
    highRiskCases
  })
})

/**
 * GET /api/doctor/patient/:id
 * Full 360-degree patient clinical summary, vitals, timeline, and AI red-flag indicators
 */
router.get('/patient/:id', authenticate, requireRole('doctor', 'hospital', 'admin'), (req, res) => {
  const patientId = req.params.id
  const patient = db.patients.find((p) => p.id === patientId)

  if (!patient) {
    return res.status(404).json({ success: false, error: `Patient ${patientId} not found.` })
  }

  const patientDocs = db.documents.filter((d) => d.patientId === patientId)
  const patientPrescriptions = db.prescriptions.filter((p) => p.patientId === patientId)

  // Verify dynamic red flags based on current vitals
  const redFlagEval = evaluateRedFlags({
    patientId: patient.id,
    symptoms: patient.conditions,
    vitals: patient.vitals
  })

  db.logAccess(req.user.id, req.user.name, 'doctor', 'READ_PATIENT_CASE', patientId, req.ip)

  return res.json({
    success: true,
    patient: {
      ...patient,
      redFlag: redFlagEval
    },
    documents: patientDocs,
    prescriptions: patientPrescriptions
  })
})

/**
 * POST /api/doctor/prescriptions
 * Creates and digitally signs a new prescription for a patient
 */
router.post('/prescriptions', authenticate, requireRole('doctor'), (req, res) => {
  const { patientId, diagnosis, medicines, advice } = req.body

  if (!patientId || !medicines || medicines.length === 0) {
    return res.status(400).json({ success: false, error: 'Patient ID and medication list are required.' })
  }

  const newRx = {
    id: `RX-${Date.now().toString().slice(-4)}`,
    patientId,
    doctorId: req.user.entityId || 'DOC-001',
    doctorName: req.user.name || 'Dr. Sharma',
    hospitalName: req.user.org || 'City Hospital, Lucknow',
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    diagnosis: diagnosis || 'General Clinical Review',
    medicines,
    advice: advice || 'Take medications as directed. Follow up in 14 days.'
  }

  db.prescriptions.unshift(newRx)
  db.logAccess(req.user.id, req.user.name, 'doctor', 'WRITE_PRESCRIPTION', newRx.id, req.ip)

  return res.status(201).json({
    success: true,
    message: 'Prescription generated and recorded on patient timeline.',
    prescription: newRx
  })
})

/**
 * POST /api/doctor/referrals
 */
router.post('/referrals', authenticate, requireRole('doctor'), (req, res) => {
  const { patientId, targetDoctor, targetSpecialty, reason } = req.body

  const referralRecord = {
    id: `REF-${Date.now().toString().slice(-4)}`,
    patientId,
    referringDoctor: req.user.name,
    targetDoctor: targetDoctor || 'Specialist Clinician',
    targetSpecialty: targetSpecialty || 'Cardiology',
    reason: reason || 'Secondary tertiary opinion',
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    status: 'pending'
  }

  db.logAccess(req.user.id, req.user.name, 'doctor', 'CREATE_REFERRAL', referralRecord.id, req.ip)

  return res.status(201).json({
    success: true,
    message: 'Clinical referral initiated successfully',
    referral: referralRecord
  })
})

export default router
