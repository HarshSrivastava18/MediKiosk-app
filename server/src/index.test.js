import test from 'node:test'
import assert from 'node:assert'
import { db } from './db/store.js'
import { evaluateRedFlags } from './services/redFlagEngine.js'
import { generateClinicalSoapSummary } from './services/aiService.js'

test('Database Store: contains initial seeded personas', () => {
  assert.strictEqual(db.users.length >= 5, true)
  assert.strictEqual(db.patients.length >= 2, true)
  assert.strictEqual(db.doctors.length >= 2, true)
  assert.strictEqual(db.hospitals.length >= 2, true)
  assert.strictEqual(db.verificationQueue.length >= 3, true)
})

test('Auth: Multi-Identifier Login verification', () => {
  // Test by Email
  const userByEmail = db.users.find(u => u.identifier === 'rahul.k93@gmail.com' && u.password === 'patient123')
  assert.ok(userByEmail)
  assert.strictEqual(userByEmail.role, 'patient')

  // Test by Global ID
  const userByGlobalId = db.users.find(u => u.entityId === 'DOC-001' && u.password === 'doctor123')
  assert.ok(userByGlobalId)
  assert.strictEqual(userByGlobalId.role, 'doctor')

  // Test Hospital Admin Login
  const hospAdmin = db.users.find(u => u.identifier === 'admin@cityhospital.org' && u.password === 'hospital123')
  assert.ok(hospAdmin)
  assert.strictEqual(hospAdmin.role, 'hospital')

  // Test Super Admin Login
  const superAdmin = db.users.find(u => u.identifier === 'admin@medikiosk.in' && u.password === 'admin123')
  assert.ok(superAdmin)
  assert.strictEqual(superAdmin.role, 'admin')
})

test('Red Flag Engine: triggers acute cardiac alert on chest pain + breathlessness', () => {
  const result = evaluateRedFlags({
    symptoms: ['acute chest pain', 'breathlessness'],
    vitals: { bp: '140/90', spo2: '96', pulse: '95' }
  })

  assert.strictEqual(result.active, true)
  assert.strictEqual(result.severity, 'HIGH')
})

test('Red Flag Engine: triggers hypoxia alert when SpO2 < 92%', () => {
  const result = evaluateRedFlags({
    symptoms: ['fever'],
    vitals: { bp: '120/80', spo2: '89', pulse: '80' }
  })

  assert.strictEqual(result.active, true)
  assert.strictEqual(result.severity, 'HIGH')
})

test('AI Service: generates structured SOAP clinical summary', async () => {
  const summary = await generateClinicalSoapSummary({
    patientName: 'Rahul Kumar',
    age: 32,
    gender: 'Male',
    symptoms: ['Chest tightness', 'Dyspnea on exertion'],
    vitals: { bp: '138/88', pulse: 92, spo2: 97 }
  })

  assert.ok(summary.soap.subjective)
  assert.ok(summary.soap.objective)
  assert.ok(summary.soap.assessment)
  assert.strictEqual(summary.soap.plan.length >= 3, true)
})

test('Audit Log: creates SHA-256 chained tamper-evident records', () => {
  const initialCount = db.auditLogs.length
  const newLog = db.logAccess('usr_test', 'Tester', 'admin', 'TEST_ACTION', 'RES-001')

  assert.strictEqual(db.auditLogs.length, initialCount + 1)
  assert.ok(newLog.hash)
  assert.ok(newLog.previousHash)
})
