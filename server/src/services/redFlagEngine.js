import { emitRedFlagAlert } from './socketService.js'
import { db } from '../db/store.js'

/**
 * Clinical Red-Flag Deterministic & Risk Stratification Rules Engine
 * Evaluates symptoms, vitals, and chronic history for acute clinical hazards.
 */
export function evaluateRedFlags({ patientId, symptoms = [], vitals = {}, chronicConditions = [] }) {
  const flags = []
  let severity = 'NONE'

  const symptomStr = Array.isArray(symptoms) ? symptoms.join(' ').toLowerCase() : (symptoms || '').toLowerCase()
  const bpSys = vitals?.bp ? parseInt(vitals.bp.split('/')[0], 10) : 120
  const bpDia = vitals?.bp ? parseInt(vitals.bp.split('/')[1], 10) : 80
  const spo2 = vitals?.spo2 ? parseInt(vitals.spo2, 10) : 98
  const pulse = vitals?.pulse ? parseInt(vitals.pulse, 10) : 75

  // 1. Acute Coronary / Cardiac Red Flags
  const hasChestPain = symptomStr.includes('chest pain') || symptomStr.includes('angina') || symptomStr.includes('radiating')
  const hasBreathlessness = symptomStr.includes('breathless') || symptomStr.includes('shortness of breath') || symptomStr.includes('dyspnea')

  if (hasChestPain && hasBreathlessness) {
    flags.push({
      code: 'RF-CARD-01',
      title: 'Acute Coronary Syndrome / Ischemia Hazard',
      description: 'Concurrent chest pain with acute breathlessness reported. Immediate ECG and cardiac triage required.',
      severity: 'HIGH'
    })
    severity = 'HIGH'
  } else if (hasChestPain) {
    flags.push({
      code: 'RF-CARD-02',
      title: 'Chest Pain Evaluation',
      description: 'Unexplained chest discomfort reported. Priority cardiac monitoring suggested.',
      severity: 'MEDIUM'
    })
    if (severity !== 'HIGH') severity = 'MEDIUM'
  }

  // 2. Respiratory & Hypoxia
  if (spo2 < 92) {
    flags.push({
      code: 'RF-RESP-01',
      title: 'Severe Hypoxia Alert',
      description: `Peripheral SpO2 reading is dangerously low (${spo2}%). Supplemental O2 assessment needed immediately.`,
      severity: 'HIGH'
    })
    severity = 'HIGH'
  } else if (spo2 < 95) {
    flags.push({
      code: 'RF-RESP-02',
      title: 'Borderline Low SpO2',
      description: `SpO2 reading is ${spo2}%. Respiratory monitoring indicated.`,
      severity: 'MEDIUM'
    })
    if (severity !== 'HIGH') severity = 'MEDIUM'
  }

  // 3. Hypertensive Crisis or Severe Hypotension
  if (bpSys >= 180 || bpDia >= 110) {
    flags.push({
      code: 'RF-HTN-01',
      title: 'Hypertensive Urgency / Crisis',
      description: `Blood pressure reading (${bpSys}/${bpDia} mmHg) is critically elevated. Evaluate for end-organ damage.`,
      severity: 'HIGH'
    })
    severity = 'HIGH'
  } else if (bpSys < 90) {
    flags.push({
      code: 'RF-HYPO-01',
      title: 'Severe Hypotension Alert',
      description: `Systolic BP < 90 mmHg (${bpSys} mmHg). Check for hypovolemia or hemodynamic shock.`,
      severity: 'HIGH'
    })
    severity = 'HIGH'
  }

  // 4. Neurological & Stroke (FAST criteria)
  if (symptomStr.includes('slurred speech') || symptomStr.includes('facial droop') || symptomStr.includes('arm weakness') || symptomStr.includes('sudden numbness')) {
    flags.push({
      code: 'RF-NEURO-01',
      title: 'Acute Stroke Alert (FAST positive)',
      description: 'Acute neurological deficits detected. Urgent non-contrast CT brain scan required within thrombolysis window.',
      severity: 'HIGH'
    })
    severity = 'HIGH'
  }

  const result = {
    active: flags.length > 0,
    severity,
    label: flags.length > 0 ? flags.map((f) => f.title).join(' • ') : '',
    flags,
    evaluatedAt: new Date().toISOString()
  }

  // If patientId is provided, update patient record and emit real-time WebSocket alert
  if (patientId) {
    const patient = db.patients.find((p) => p.id === patientId)
    if (patient) {
      patient.redFlag = result
    }

    if (result.active && severity === 'HIGH') {
      emitRedFlagAlert({
        patientId,
        patientName: patient?.name || 'Unknown Patient',
        severity: result.severity,
        label: result.label,
        flags: result.flags,
        vitals
      })
    }
  }

  return result
}
