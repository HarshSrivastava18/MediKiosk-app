import { Router } from 'express'
import { db } from '../db/store.js'
import { authenticate } from '../middleware/auth.js'
import { requireRole } from '../middleware/rbac.js'
import { emitQueueUpdate } from '../services/socketService.js'

const router = Router()

/**
 * GET /api/hospital/dashboard
 */
router.get('/dashboard', authenticate, requireRole('hospital', 'admin'), (req, res) => {
  const hospitalId = req.user.entityId || 'ORG-001'
  const hospital = db.hospitals.find((h) => h.id === hospitalId) || db.hospitals[0]
  const branches = db.branches.filter((b) => b.hospitalId === hospitalId || b.hospitalId === 'ORG-001')

  return res.json({
    success: true,
    hospital,
    metrics: {
      totalBranches: branches.length,
      totalDoctors: hospital.doctorsCount,
      totalDepartments: hospital.departmentsCount,
      totalStaff: hospital.staffCount,
      activeOpdToday: branches.reduce((acc, b) => acc + b.currentOpd, 0)
    },
    branches
  })
})

/**
 * GET /api/hospital/branches
 */
router.get('/branches', authenticate, requireRole('hospital', 'admin'), (req, res) => {
  const hospitalId = req.user.entityId || 'ORG-001'
  const branches = db.branches.filter((b) => b.hospitalId === hospitalId || b.hospitalId === 'ORG-001')

  return res.json({
    success: true,
    branches
  })
})

/**
 * POST /api/hospital/branches
 */
router.post('/branches', authenticate, requireRole('hospital'), (req, res) => {
  const { name, location, departments = 4, doctors = 6, opdCapacity = 150 } = req.body

  if (!name || !location) {
    return res.status(400).json({ success: false, error: 'Branch name and location are required.' })
  }

  const newBranch = {
    id: `BR-00${db.branches.length + 1}`,
    hospitalId: req.user.entityId || 'ORG-001',
    name,
    location,
    departments,
    doctors,
    opdCapacity,
    currentOpd: 0,
    status: 'active'
  }

  db.branches.push(newBranch)
  db.logAccess(req.user.id, req.user.name, 'hospital', 'CREATE_BRANCH', newBranch.id, req.ip)

  return res.status(201).json({
    success: true,
    message: 'Branch created successfully',
    branch: newBranch
  })
})

/**
 * GET /api/hospital/departments
 */
router.get('/departments', authenticate, requireRole('hospital', 'admin'), (req, res) => {
  return res.json({
    success: true,
    departments: db.departments
  })
})

/**
 * GET /api/hospital/reception/queue
 */
router.get('/reception/queue', authenticate, requireRole('hospital', 'doctor', 'admin'), (req, res) => {
  return res.json({
    success: true,
    queue: db.opdQueue
  })
})

/**
 * PATCH /api/hospital/reception/queue/:id
 */
router.patch('/reception/queue/:id', authenticate, requireRole('hospital', 'doctor'), (req, res) => {
  const { id } = req.params
  const { status } = req.body

  const item = db.opdQueue.find((q) => q.id === id)
  if (!item) {
    return res.status(404).json({ success: false, error: 'Queue item not found.' })
  }

  item.status = status || item.status
  emitQueueUpdate(req.user.entityId, item)

  return res.json({
    success: true,
    message: 'OPD queue status updated',
    item
  })
})

export default router
