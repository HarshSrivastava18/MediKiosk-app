import { Router } from 'express'
import { generateClinicalSoapSummary, parseLabDocument } from '../services/aiService.js'
import { evaluateRedFlags } from '../services/redFlagEngine.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

/**
 * POST /api/ai/intake-summary
 * Generates structured SOAP summary from raw patient symptom interview
 */
router.post('/intake-summary', async (req, res, next) => {
  try {
    const { patientName, age, gender, symptoms, duration, vitals, pastHistory, currentMedications } = req.body

    const summary = await generateClinicalSoapSummary({
      patientName: patientName || 'Anonymous Patient',
      age: age || 30,
      gender: gender || 'Unspecified',
      symptoms: symptoms || ['General fatigue'],
      duration: duration || '3 days',
      vitals: vitals || { bp: '120/80', pulse: 72, spo2: 98 },
      pastHistory: pastHistory || [],
      currentMedications: currentMedications || []
    })

    return res.json({
      success: true,
      data: summary
    })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/ai/red-flag-check
 * Evaluates real-time patient triage risk level
 */
router.post('/red-flag-check', (req, res) => {
  const { patientId, symptoms, vitals, chronicConditions } = req.body

  const evaluation = evaluateRedFlags({
    patientId,
    symptoms,
    vitals,
    chronicConditions
  })

  return res.json({
    success: true,
    evaluation
  })
})

/**
 * POST /api/ai/ocr-parser
 * Extracts structured clinical parameters from medical documents
 */
router.post('/ocr-parser', async (req, res, next) => {
  try {
    const { filename, docType } = req.body
    const result = await parseLabDocument({ filename, docType })

    return res.json({
      success: true,
      extractedData: result
    })
  } catch (err) {
    next(err)
  }
})

export default router
