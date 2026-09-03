import { Router } from 'express'
import { db } from '../db/store.js'
import { authenticate } from '../middleware/auth.js'
import { requireRole } from '../middleware/rbac.js'

const router = Router()

/**
 * GET /api/patient/me
 * Returns the profile, vitals, chronic conditions, and emergency details of the logged-in patient
 */
router.get('/me', authenticate, requireRole('patient', 'doctor', 'admin'), (req, res) => {
  const patient = db.patients.find((p) => p.userId === req.user.id || p.id === req.user.entityId)

  if (!patient) {
    return res.status(404).json({ success: false, error: 'Patient profile not found.' })
  }

  db.logAccess(req.user.id, req.user.name, req.user.role, 'READ_PROFILE', patient.id, req.ip)

  return res.json({
    success: true,
    patient
  })
})

/**
 * PUT /api/patient/profile
 * Updates patient profile demographics, emergency contact, or vitals
 */
router.put('/profile', authenticate, requireRole('patient'), (req, res) => {
  const patient = db.patients.find((p) => p.userId === req.user.id || p.id === req.user.entityId)

  if (!patient) {
    return res.status(404).json({ success: false, error: 'Patient profile not found.' })
  }

  const { phone, address, bloodGroup, emergencyContact, vitals } = req.body

  if (phone) patient.phone = phone
  if (address) patient.address = address
  if (bloodGroup) patient.bloodGroup = bloodGroup
  if (emergencyContact) {
    patient.emergencyContact = {
      ...patient.emergencyContact,
      ...emergencyContact
    }
  }
  if (vitals) {
    patient.vitals = {
      ...patient.vitals,
      ...vitals,
      recordedAt: new Date().toISOString()
    }
  }

  db.logAccess(req.user.id, req.user.name, 'patient', 'UPDATE_PROFILE', patient.id, req.ip)

  return res.json({
    success: true,
    message: 'Profile updated successfully',
    patient
  })
})

/**
 * GET /api/patient/timeline
 * Aggregates clinical history (visits, prescriptions, documents, reports) into chronological order
 */
router.get('/timeline', authenticate, (req, res) => {
  const patientId = req.query.patientId || req.user.entityId

  const patient = db.patients.find((p) => p.id === patientId)
  if (!patient) {
    return res.status(404).json({ success: false, error: 'Patient not found.' })
  }

  const patientPrescriptions = db.prescriptions
    .filter((r) => r.patientId === patientId)
    .map((rx) => ({
      id: rx.id,
      date: rx.date,
      type: 'Prescription',
      title: `Prescription by ${rx.doctorName}`,
      hospital: rx.hospitalName,
      diagnosis: rx.diagnosis,
      medicines: rx.medicines
    }))

  const patientDocs = db.documents
    .filter((d) => d.patientId === patientId)
    .map((doc) => ({
      id: doc.id,
      date: doc.date,
      type: 'Document',
      title: doc.name,
      docType: doc.type,
      size: doc.size,
      status: doc.status
    }))

  const baseTimeline = patient.timeline || [
    { date: '15 Jul 2026', type: 'Visit', title: 'Chest Pain Evaluation & OPD Consultation', hospital: 'City Hospital, Lucknow', doctor: 'Dr. Sharma' }
  ]

  const combinedTimeline = [
    ...baseTimeline,
    ...patientDocs,
    ...patientPrescriptions
  ]

  db.logAccess(req.user.id, req.user.name, req.user.role, 'READ_TIMELINE', patientId, req.ip)

  return res.json({
    success: true,
    patientId,
    timeline: combinedTimeline
  })
})

/**
 * GET /api/patient/prescriptions
 */
router.get('/prescriptions', authenticate, (req, res) => {
  const patientId = req.query.patientId || req.user.entityId
  const rxList = db.prescriptions.filter((p) => p.patientId === patientId)

  return res.json({
    success: true,
    prescriptions: rxList
  })
})

/**
 * GET /api/patient/documents
 */
router.get('/documents', authenticate, (req, res) => {
  const patientId = req.query.patientId || req.user.entityId
  const docs = db.documents.filter((d) => d.patientId === patientId)

  return res.json({
    success: true,
    documents: docs
  })
})

/**
 * POST /api/patient/documents
 */
router.post('/documents', authenticate, (req, res) => {
  const { name, type, size } = req.body
  const patientId = req.user.entityId || 'MK-8472-9812-3345'

  const newDoc = {
    id: `DOC-F-${Date.now().toString().slice(-4)}`,
    patientId,
    name: name || 'Medical Document',
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    type: type || 'General Report',
    size: size || '1.2 MB',
    status: 'processed',
    url: '/uploads/sample_doc.pdf'
  }

  db.documents.push(newDoc)
  db.logAccess(req.user.id, req.user.name, req.user.role, 'UPLOAD_DOCUMENT', newDoc.id, req.ip)

  return res.status(201).json({
    success: true,
    message: 'Document uploaded and indexed successfully',
    document: newDoc
  })
})

export default router
