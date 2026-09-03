import { evaluateRedFlags } from './redFlagEngine.js'

/**
 * AI Case-Taking, SOAP Summarization & Clinical Structuring Service
 */
export async function generateClinicalSoapSummary({
  patientName,
  age,
  gender,
  symptoms = [],
  duration = '2 days',
  vitals = {},
  pastHistory = [],
  currentMedications = []
}) {
  // Synthesize clinical SOAP format summary
  const symptomList = Array.isArray(symptoms) ? symptoms.join(', ') : symptoms
  const pastList = Array.isArray(pastHistory) ? pastHistory.join(', ') : pastHistory
  const medList = Array.isArray(currentMedications) ? currentMedications.join(', ') : currentMedications

  // Evaluate red flags
  const redFlagEval = evaluateRedFlags({
    symptoms,
    vitals,
    chronicConditions: pastHistory
  })

  const subjective = `Patient ${patientName}, a ${age}-year-old ${gender}, presents with primary complaints of ${symptomList} persisting for approximately ${duration}. Known past medical history includes ${pastList || 'Nil reported'}. Current medications: ${medList || 'None'}.`

  const objective = `Vitals on examination: BP ${vitals.bp || '120/80'} mmHg, Pulse ${vitals.pulse || '76'} bpm, SpO2 ${vitals.spo2 || '98'}%, Temp ${vitals.temp || '98.6°F'}, Weight ${vitals.weight || '70 kg'}.`

  const assessment = redFlagEval.active
    ? `Clinical risk stratification indicates ${redFlagEval.severity} priority flags: ${redFlagEval.label}. Requires immediate clinical evaluation and confirmatory diagnostic tests.`
    : `Stable presentation. Symptoms consistent with early-stage outpatient evaluation. Differential diagnoses to be confirmed by attending physician.`

  const plan = [
    'Confirm vitals stability and clinical history.',
    redFlagEval.severity === 'HIGH' ? 'Immediate 12-lead ECG, troponin, and continuous SpO2 monitoring.' : 'Routine baseline blood chemistry (CBC, Metabolic Panel).',
    'Review medication adherence and adjust ongoing therapy.',
    'Counsel patient regarding warning signs and follow-up timeline.'
  ]

  return {
    patientName,
    summaryGeneratedAt: new Date().toISOString(),
    redFlags: redFlagEval,
    soap: {
      subjective,
      objective,
      assessment,
      plan
    },
    keyClinicalHighlights: [
      `Primary Complaint: ${symptomList}`,
      `Risk Level: ${redFlagEval.severity}`,
      `Vitals: BP ${vitals.bp || '120/80'} | SpO2 ${vitals.spo2 || '98'}%`
    ]
  }
}

/**
 * AI Lab Report OCR / Structured Extraction Simulator
 */
export async function parseLabDocument({ filename, docType = 'Lab' }) {
  if (docType === 'ECG') {
    return {
      docType: 'ECG',
      rhythm: 'Sinus Rhythm',
      heartRate: 74,
      prInterval: '160 ms',
      qrsDuration: '88 ms',
      qtcInterval: '410 ms',
      stSegment: 'Normal, no acute ST-elevation or depression detected',
      interpretation: 'Normal 12-Lead Electrocardiogram'
    }
  }

  // Standard Lab / Blood report
  return {
    docType: 'Complete Blood Count & Metabolic Profile',
    parameters: [
      { name: 'Hemoglobin', value: '14.2 g/dL', normalRange: '13.0 - 17.0', status: 'normal' },
      { name: 'WBC Count', value: '7,400 /uL', normalRange: '4,000 - 11,000', status: 'normal' },
      { name: 'Platelets', value: '240,000 /uL', normalRange: '150,000 - 450,000', status: 'normal' },
      { name: 'Fasting Blood Glucose', value: '108 mg/dL', normalRange: '70 - 99', status: 'elevated' },
      { name: 'HbA1c', value: '6.2%', normalRange: '< 5.7%', status: 'elevated' },
      { name: 'Serum Creatinine', value: '0.9 mg/dL', normalRange: '0.7 - 1.3', status: 'normal' }
    ],
    summaryNote: 'Slightly elevated glycemic markers (HbA1c 6.2%). Kidney function and complete blood count within standard reference limits.'
  }
}
