/**
 * MediKiosk Adaptive Clinical Chat Engine
 *
 * Implements a dual-mode clinical triage architecture:
 * 1. Tier 1 (Deterministic Triage Engine): 100% Free, ZERO API Quota, instantaneous,
 *    safe clinical state machine based on OPQRST emergency triage protocols.
 * 2. Tier 2 (Optional Gemini Flash API): Activated only if an API key is provided,
 *    equipped with strict token limits (max 80 tokens) and auto-fallback on HTTP 429 quota exhaustion.
 */

// ── Medical Symptom Vocabulary & Intent Patterns ─────────────────────────────
const SYMPTOM_PATTERNS = [
  {
    category: 'CARDIAC',
    keywords: ['chest pain', 'chest tightness', 'angina', 'palpitation', 'heart racing', 'chhati me dard', 'seene me dard', 'dil ki dhadkan'],
    redFlagRisk: 'HIGH',
    initialFollowUp: 'Does the chest discomfort radiate to your left arm, shoulder, neck, or jaw? Are you feeling sweaty or breathless?'
  },
  {
    category: 'RESPIRATORY',
    keywords: ['breathless', 'short of breath', 'dyspnea', 'cough', 'wheezing', 'saans', 'khansi', 'asthma attack', 'choking'],
    redFlagRisk: 'MEDIUM',
    initialFollowUp: 'Is the breathlessness worse when lying flat, or does it happen during rest? Do you have any phlegm or fever with the cough?'
  },
  {
    category: 'NEUROLOGICAL',
    keywords: ['headache', 'dizzy', 'fainting', 'blackout', 'seizure', 'sir dard', 'chakkar', 'slurred speech', 'weakness', 'numbness'],
    redFlagRisk: 'HIGH',
    initialFollowUp: 'Did this headache start suddenly like a thunderclap? Have you noticed any vision blurring, weakness in your arms, or difficulty speaking?'
  },
  {
    category: 'ABDOMINAL',
    keywords: ['stomach pain', 'belly pain', 'abdominal', 'nausea', 'vomiting', 'loose motions', 'diarrhea', 'pet dard', 'ulti', 'gas'],
    redFlagRisk: 'LOW',
    initialFollowUp: 'Where exactly is the abdominal pain (upper right, lower right, or general)? Does eating make it better or worse?'
  },
  {
    category: 'FEVER',
    keywords: ['fever', 'chills', 'shivering', 'high temp', 'bukhar', 'thand', 'garmi'],
    redFlagRisk: 'MEDIUM',
    initialFollowUp: 'How many days have you had the fever? Have you noticed any body rashes, joint aches, or burning when urinating?'
  },
  {
    category: 'TRAUMA_ORTHO',
    keywords: ['fall', 'injury', 'fracture', 'bone', 'joint pain', 'knee pain', 'back pain', 'chot', 'giri', 'kamar dard'],
    redFlagRisk: 'LOW',
    initialFollowUp: 'Are you able to bear weight or move the affected joint? Was there any direct impact or swelling?'
  }
]

export class ClinicalInterviewSession {
  constructor({ language = 'en-IN', patientName = 'Patient' } = {}) {
    this.language = language
    this.patientName = patientName
    this.stepIndex = 0
    this.history = []

    // Clinical Case Accumulator
    this.caseData = {
      patientName,
      chiefComplaint: '',
      symptoms: [],
      category: 'GENERAL',
      duration: '',
      severityLabel: 'Moderate',
      painScore: 5,
      associatedSymptoms: [],
      medicalHistory: [],
      currentMedications: [],
      redFlags: {
        active: false,
        severity: 'NONE',
        title: '',
        description: ''
      }
    }

    // Initial greeting message
    this.messages = [
      {
        id: 'msg-init',
        from: 'ai',
        text: this.getGreeting(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]
  }

  getGreeting() {
    if (this.language === 'hi-IN') {
      return `नमस्ते ${this.patientName} 🙏 मैं आपका MediKiosk स्वास्थ्य सहायक हूँ। आज आपको क्या परेशानी या लक्षण महसूस हो रहे हैं?`
    }
    return `Hello ${this.patientName} 👋 I am your MediKiosk AI clinical assistant. What primary symptom or health concern brings you to the hospital today?`
  }

  getQuickReplies() {
    switch (this.stepIndex) {
      case 0: // Chief complaint quick suggestions
        if (this.language === 'hi-IN') {
          return ['सीने में दर्द (Chest Pain)', 'सांस लेने में तकलीफ़', 'तेज़ बुखार (Fever)', 'पेट में दर्द (Stomach Pain)', 'सिरदर्द व चक्कर']
        }
        return ['Chest Discomfort / Pain', 'Shortness of Breath', 'Fever & Body Ache', 'Severe Stomach Pain', 'Persistent Headache']

      case 1: // Follow-up on complaint
        return ['Yes, radiating pain', 'Severe discomfort', 'Mild & manageable', 'No other sensations']

      case 2: // Duration
        if (this.language === 'hi-IN') {
          return ['आज सुबह से (Today)', '1-2 दिन से (1-2 Days)', 'लगभग एक हफ्ता (1 Week)', 'काफी समय से (Chronic)']
        }
        return ['Started today', '1 to 2 days ago', 'About a week', 'More than 2 weeks']

      case 3: // Severity
        return ['Mild (1-3)', 'Moderate (4-6)', 'Severe (7-9)', 'Extreme (10)']

      case 4: // Past history / meds
        if (this.language === 'hi-IN') {
          return ['हाई बीपी (BP / Hypertension)', 'डायबिटीज (Diabetes)', 'अस्थमा (Asthma)', 'कोई पुरानी बीमारी नहीं (None)']
        }
        return ['Hypertension (BP)', 'Type 2 Diabetes', 'Asthma / Respiratory', 'No prior conditions']

      default:
        return ['Review Summary', 'Proceed to Documents']
    }
  }

  /**
   * Evaluates clinical red flags based on accumulated symptom text
   */
  evaluateRedFlags(text) {
    const lower = (text + ' ' + this.caseData.chiefComplaint + ' ' + this.caseData.symptoms.join(' ')).toLowerCase()

    // 1. Acute Coronary Syndrome
    const hasChestPain = lower.includes('chest pain') || lower.includes('angina') || lower.includes('chhati me dard') || lower.includes('seene me dard')
    const hasRadiationOrBreath = lower.includes('breath') || lower.includes('saans') || lower.includes('arm') || lower.includes('jaw') || lower.includes('sweat')

    if (hasChestPain && hasRadiationOrBreath) {
      this.caseData.redFlags = {
        active: true,
        severity: 'HIGH',
        title: 'Acute Coronary Syndrome Hazard',
        description: 'Concurrent chest discomfort and breathlessness/radiation detected. Immediate 12-lead ECG and emergency triage required.'
      }
      return
    }

    if (hasChestPain) {
      this.caseData.redFlags = {
        active: true,
        severity: 'MEDIUM',
        title: 'Priority Cardiac Monitoring',
        description: 'Unexplained chest discomfort reported. Physician evaluation recommended promptly.'
      }
      return
    }

    // 2. Stroke / FAST
    if (lower.includes('slurred speech') || lower.includes('facial droop') || lower.includes('arm weakness') || lower.includes('thunderclap')) {
      this.caseData.redFlags = {
        active: true,
        severity: 'HIGH',
        title: 'Acute Neurological Deficit Alert (FAST)',
        description: 'Acute neurological signs detected. Urgent non-contrast CT brain scan protocol indicated.'
      }
      return
    }

    // 3. Severe Hypoxia / Respiratory Distress
    if (lower.includes('gasping') || lower.includes('cannot breathe') || lower.includes('choking') || lower.includes('blue lips')) {
      this.caseData.redFlags = {
        active: true,
        severity: 'HIGH',
        title: 'Severe Respiratory Distress Hazard',
        description: 'Severe hypoxia or airway compromise suspected. Supplemental oxygen triage mandated.'
      }
    }
  }

  /**
   * Process a message from user and advance the clinical state
   */
  async processUserMessage(userText) {
    const cleanText = (userText || '').trim()
    if (!cleanText) return null

    // Record user message
    const userMsg = {
      id: `user-${Date.now()}`,
      from: 'user',
      text: cleanText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    this.messages.push(userMsg)
    this.history.push({ role: 'user', content: cleanText })

    // Step-by-step clinical state transition
    let replyText = ''

    if (this.stepIndex === 0) {
      // Phase 1: Chief Complaint
      this.caseData.chiefComplaint = cleanText
      this.caseData.symptoms.push(cleanText)

      // Identify category
      let matchedCategory = null
      const lower = cleanText.toLowerCase()
      for (const pattern of SYMPTOM_PATTERNS) {
        if (pattern.keywords.some(k => lower.includes(k))) {
          matchedCategory = pattern
          this.caseData.category = pattern.category
          break
        }
      }

      this.evaluateRedFlags(cleanText)

      if (matchedCategory) {
        replyText = `${matchedCategory.initialFollowUp}`
      } else {
        replyText = this.language === 'hi-IN'
          ? `समझ गया। क्या यह दर्द या तकलीफ़ लगातार हो रही है, या रुक-रुक कर आ रही है?`
          : `I understand. Has this discomfort been continuous, or does it come and go in episodes?`
      }
      this.stepIndex = 1

    } else if (this.stepIndex === 1) {
      // Phase 2: Onset & Associated features
      this.caseData.associatedSymptoms.push(cleanText)
      this.evaluateRedFlags(cleanText)

      replyText = this.language === 'hi-IN'
        ? `यह परेशानी आपको कब से हो रही है? (जैसे: आज सुबह से, 2 दिन से, या एक हफ्ते से)`
        : `Approximately when did these symptoms first begin? (e.g., this morning, 2 days ago, or over a week)`
      this.stepIndex = 2

    } else if (this.stepIndex === 2) {
      // Phase 3: Duration
      this.caseData.duration = cleanText

      replyText = this.language === 'hi-IN'
        ? `दर्द या परेशानी की तीव्रता को आप 1 से 10 के पैमाने पर कितना आंकेंगे? (या Mild, Moderate, Severe)`
        : `On a severity scale from 1 (mild) to 10 (extreme), how intense is your discomfort right now?`
      this.stepIndex = 3

    } else if (this.stepIndex === 3) {
      // Phase 4: Severity
      const scoreMatch = cleanText.match(/\d+/)
      const score = scoreMatch ? parseInt(scoreMatch[0], 10) : (cleanText.toLowerCase().includes('severe') ? 8 : 5)
      this.caseData.painScore = Math.min(Math.max(score, 1), 10)
      this.caseData.severityLabel = this.caseData.painScore >= 7 ? 'Severe' : this.caseData.painScore >= 4 ? 'Moderate' : 'Mild'

      replyText = this.language === 'hi-IN'
        ? `धन्यवाद। क्या आपका कोई पुराना मेडिकल इतिहास है (जैसे हाई बीपी, शुगर, अस्थमा)? और क्या आप वर्तमान में कोई नियमित दवाइयां ले रहे हैं?`
        : `Thank you. Do you have any pre-existing medical conditions (such as Hypertension, Diabetes, or Asthma), and are you currently taking any regular medications?`
      this.stepIndex = 4

    } else if (this.stepIndex === 4) {
      // Phase 5: Past history and medications
      this.caseData.medicalHistory.push(cleanText)

      replyText = this.language === 'hi-IN'
        ? `बहुत बढ़िया! मैंने आपका केस पूरी तरह तैयार कर लिया है। अब हम अगले चरण में आपकी पुरानी रिपोर्ट्स अपलोड कर सकते हैं, या सीधे डॉक्टर के लिए केस सारांश देख सकते हैं।`
        : `Excellent! I have compiled your clinical case details. We can now upload any existing medical documents or proceed directly to review your AI Case Summary for the doctor.`
      this.stepIndex = 5

    } else {
      // Subsequent turns
      replyText = this.language === 'hi-IN'
        ? `आपकी अतिरिक्त जानकारी केस फाइल में जोड़ दी गई है। जारी रखने के लिए नीचे 'Next' पर क्लिक करें।`
        : `I've noted this additional detail in your case file. Click 'Continue' to attach lab reports or review your doctor summary.`
    }

    // Optional Gemini Flash enhancement if API key is present
    const enhancedReply = await this.tryGeminiEnhancement(cleanText, replyText)
    const finalReply = enhancedReply || replyText

    const aiMsg = {
      id: `ai-${Date.now()}`,
      from: 'ai',
      text: finalReply,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    this.messages.push(aiMsg)
    this.history.push({ role: 'assistant', content: finalReply })

    return aiMsg
  }

  /**
   * Strict quota-preserving Gemini API call.
   * If not configured or fails (429 Quota Exceeded), safely returns null to keep deterministic reply.
   */
  async tryGeminiEnhancement(userText, fallbackText) {
    const apiKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || ''
    if (!apiKey) return null // Zero external calls if no key configured

    try {
      // Strict budget: max 80 tokens, low temperature, compact prompt
      const prompt = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `You are a clinical intake assistant for a hospital kiosk. Patient said: "${userText}".
Current interview step: ${this.stepIndex}.
Respond with ONE brief, empathetic clinical question (under 30 words) in ${this.language === 'hi-IN' ? 'Hindi' : 'English'}.
Do not diagnose. Ask only relevant clinical intake questions.`
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 80,
          temperature: 0.2
        }
      }

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prompt)
      })

      if (!res.ok) {
        console.warn(`[Gemini API] Status ${res.status}: Using quota-safe deterministic fallback.`)
        return null
      }

      const data = await res.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
      return text ? text.trim() : null
    } catch (e) {
      console.warn('[Gemini API] Quota or connection issue, fell back to local engine:', e.message)
      return null
    }
  }

  /**
   * Generates a complete SOAP clinical summary ready for the Doctor portal
   */
  generateSoapSummary() {
    const { patientName, chiefComplaint, symptoms, duration, painScore, severityLabel, associatedSymptoms, medicalHistory, redFlags } = this.caseData

    const complaintStr = chiefComplaint || symptoms[0] || 'General fatigue and malaise'
    const durationStr = duration || 'Recently reported'
    const associatedStr = associatedSymptoms.length > 0 ? associatedSymptoms.join(', ') : 'None volunteered'
    const historyStr = medicalHistory.length > 0 ? medicalHistory.join('; ') : 'Nil significant reported'

    const subjective = `Patient presents with chief complaint of "${complaintStr}" persisting for ${durationStr}. Rated severity: ${severityLabel} (${painScore}/10). Associated findings: ${associatedStr}. Past medical history and medication context: ${historyStr}.`

    const objective = `Kiosk preliminary triage assessment. Pain score: ${painScore}/10 (${severityLabel}). Red-flag screening: ${redFlags.active ? redFlags.severity + ' RISK' : 'NORMAL'}.`

    const assessment = redFlags.active
      ? `Priority clinical flag detected: ${redFlags.title}. ${redFlags.description}`
      : `Stable presentation consistent with outpatient intake. Differential diagnoses to be evaluated by attending physician.`

    const plan = [
      'Attending physician physical examination & vitals verification.',
      redFlags.severity === 'HIGH' ? 'STAT 12-lead ECG, troponin markers, or emergency imaging as clinically indicated.' : 'Routine outpatient baseline diagnostics as needed.',
      'Review medication regimen and provide symptomatic relief.'
    ]

    return {
      patientName,
      generatedAt: new Date().toISOString(),
      chiefComplaint: complaintStr,
      duration: durationStr,
      painScore,
      severityLabel,
      associatedSymptoms: associatedSymptoms.length > 0 ? associatedSymptoms : ['None volunteered'],
      historyOfPresentIllness: `${complaintStr} for ${durationStr}. Associated with ${associatedStr}. Discomfort rated at ${painScore}/10 (${severityLabel}).`,
      relevantHistory: medicalHistory.length > 0 ? medicalHistory : ['No prior chronic conditions volunteered'],
      redFlags,
      soap: {
        subjective,
        objective,
        assessment,
        plan
      }
    }
  }
}
