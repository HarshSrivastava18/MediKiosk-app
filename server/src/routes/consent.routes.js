import { Router } from 'express'
import { db } from '../db/store.js'
import { authenticate } from '../middleware/auth.js'
import { requireRole } from '../middleware/rbac.js'

const router = Router()

/**
 * GET /api/consent/active
 */
router.get('/active', authenticate, (req, res) => {
  const patientId = req.query.patientId || req.user.entityId
  const activeConsents = db.consentArtifacts.filter((c) => c.patientId === patientId)

  return res.json({
    success: true,
    consents: activeConsents
  })
})

/**
 * POST /api/consent/grant
 */
router.post('/grant', authenticate, requireRole('patient'), (req, res) => {
  const { granteeId, granteeName, scopes, validDays = 365 } = req.body
  const patientId = req.user.entityId || 'MK-8472-9812-3345'

  const validFrom = new Date()
  const validTo = new Date()
  validTo.setDate(validTo.getDate() + validDays)

  const newConsent = {
    id: `CNS-${Date.now().toString().slice(-4)}`,
    patientId,
    granteeId: granteeId || 'ORG-001',
    granteeName: granteeName || 'City Hospital — Lucknow',
    scopes: scopes || ['vitals', 'prescriptions', 'lab_reports'],
    validFrom: validFrom.toISOString(),
    validTo: validTo.toISOString(),
    status: 'ACTIVE',
    signature: `JWS_SHA256_PATIENT_SIG_${patientId}_${Date.now()}`
  }

  db.consentArtifacts.push(newConsent)
  db.logAccess(req.user.id, req.user.name, 'patient', 'GRANT_CONSENT', newConsent.id, req.ip)

  return res.status(201).json({
    success: true,
    message: 'Time-bounded zero-trust consent granted successfully.',
    consent: newConsent
  })
})

/**
 * POST /api/consent/revoke/:id
 */
router.post('/revoke/:id', authenticate, requireRole('patient'), (req, res) => {
  const { id } = req.params
  const consent = db.consentArtifacts.find((c) => c.id === id)

  if (!consent) {
    return res.status(404).json({ success: false, error: 'Consent artifact not found.' })
  }

  consent.status = 'REVOKED'
  consent.revokedAt = new Date().toISOString()
  db.logAccess(req.user.id, req.user.name, 'patient', 'REVOKE_CONSENT', id, req.ip)

  return res.json({
    success: true,
    message: 'Consent access revoked immediately.',
    consent
  })
})

export default router
