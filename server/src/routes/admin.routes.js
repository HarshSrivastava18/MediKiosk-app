import { Router } from 'express'
import { db } from '../db/store.js'
import { authenticate } from '../middleware/auth.js'
import { requireRole } from '../middleware/rbac.js'
import { emitVerificationUpdate } from '../services/socketService.js'

const router = Router()

/**
 * GET /api/admin/dashboard
 */
router.get('/dashboard', authenticate, requireRole('admin'), (req, res) => {
  return res.json({
    success: true,
    metrics: {
      registeredHospitals: db.hospitals.length,
      pendingVerifications: db.verificationQueue.filter((v) => v.status === 'pending').length,
      activeDoctors: db.doctors.length,
      registeredPatients: db.patients.length,
      auditLogEntries: db.auditLogs.length
    },
    hospitals: db.hospitals,
    verificationQueue: db.verificationQueue
  })
})

/**
 * GET /api/admin/verification/queue
 */
router.get('/verification/queue', authenticate, requireRole('admin'), (req, res) => {
  return res.json({
    success: true,
    totalCount: db.verificationQueue.length,
    pendingCount: db.verificationQueue.filter((v) => v.status === 'pending').length,
    queue: db.verificationQueue
  })
})

/**
 * POST /api/admin/verification/:id/decision
 * Approves or Rejects a hospital licensing application
 */
router.post('/verification/:id/decision', authenticate, requireRole('admin'), (req, res) => {
  const { id } = req.params
  const { action, comments } = req.body // action: 'approve' | 'reject'

  const request = db.verificationQueue.find((v) => v.id === id)
  if (!request) {
    return res.status(404).json({ success: false, error: 'Verification request not found.' })
  }

  if (action === 'approve') {
    request.status = 'approved'
    request.approvedAt = new Date().toISOString()
    request.approvedBy = req.user.name

    // Create a new approved Hospital record in directory
    const newHospitalId = `ORG-00${db.hospitals.length + 1}`
    const newHospital = {
      id: newHospitalId,
      name: request.hospitalName,
      city: request.city,
      state: request.state,
      type: request.category,
      status: 'approved',
      regDate: new Date().toISOString().split('T')[0],
      branchesCount: 1,
      doctorsCount: 0,
      departmentsCount: 0,
      staffCount: 0
    }

    db.hospitals.push(newHospital)
    db.logAccess(req.user.id, req.user.name, 'admin', 'APPROVE_HOSPITAL_LICENSE', newHospitalId, req.ip)
    emitVerificationUpdate({ requestId: id, status: 'approved', hospital: newHospital })

    return res.json({
      success: true,
      message: `Hospital license approved. Facility ID assigned: ${newHospitalId}`,
      hospital: newHospital,
      request
    })
  } else {
    request.status = 'rejected'
    request.rejectedAt = new Date().toISOString()
    request.rejectionReason = comments || 'Regulatory compliance documentation incomplete.'

    db.logAccess(req.user.id, req.user.name, 'admin', 'REJECT_HOSPITAL_LICENSE', id, req.ip)
    emitVerificationUpdate({ requestId: id, status: 'rejected', reason: request.rejectionReason })

    return res.json({
      success: true,
      message: 'Hospital application rejected.',
      request
    })
  }
})

/**
 * GET /api/admin/audit-logs
 * Returns tamper-proof chained audit trail
 */
router.get('/audit-logs', authenticate, requireRole('admin'), (req, res) => {
  return res.json({
    success: true,
    totalLogs: db.auditLogs.length,
    logs: db.auditLogs
  })
})

/**
 * GET /api/admin/users
 */
router.get('/users', authenticate, requireRole('admin'), (req, res) => {
  const sanitizedUsers = db.users.map(({ password, ...u }) => u)
  return res.json({
    success: true,
    users: sanitizedUsers
  })
})

export default router
