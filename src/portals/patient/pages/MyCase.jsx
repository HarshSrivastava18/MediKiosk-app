import { useState, useEffect, useRef } from 'react'
import {
  Mic,
  MicOff,
  MessageSquare,
  Upload,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  FileText,
  Camera,
  Image,
  Send,
  Volume2,
  VolumeX,
  ChevronLeft,
  Stethoscope,
  Zap,
  Sparkles,
  Radio,
  RotateCcw,
  Check,
  Activity,
  ShieldCheck,
  Download
} from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import { useCurrentPatient } from '../useCurrentPatient'
import {
  speechRecognizer,
  isSpeechRecognitionSupported,
  SUPPORTED_LANGUAGES
} from '../../../services/speechRecognitionService'
import {
  speechSynthesizer,
  isSpeechSynthesisSupported
} from '../../../services/speechSynthesisService'
import { ClinicalInterviewSession } from '../../../services/clinicalChatEngine'

const STEPS = ['Prepare', 'AI Interview', 'Documents', 'Summary']

// ── Step 1: Mode & Language Selection ─────────────────────────────────────────
function StepPrepare({ onNext, mode, setMode, language, setLanguage }) {
  const isSpeechAvailable = isSpeechRecognitionSupported()

  const modes = [
    {
      id: 'voice',
      title: 'Voice Mode',
      badge: 'Priority 1',
      badgeColor: 'bg-blue-100 text-blue-700',
      description: 'Speak your symptoms naturally. Powered by Google Speech engine via Web Speech API.',
      quotaTag: 'Zero API Quota · 100% Free',
      icon: Mic
    },
    {
      id: 'chat',
      title: 'Chat Mode',
      badge: 'Priority 2',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      description: 'Interactive clinical intake chat with smart quick-reply medical suggestions.',
      quotaTag: 'Adaptive Triage Engine',
      icon: MessageSquare
    },
    {
      id: 'live',
      title: 'Live Voice Kiosk',
      badge: 'Priority 3',
      badgeColor: 'bg-violet-100 text-violet-700',
      description: 'Hands-free kiosk assistant. AI speaks questions aloud and listens continuously.',
      quotaTag: 'Continuous Speech Loop',
      icon: Radio
    }
  ]

  return (
    <div className="flex flex-col items-center gap-7 py-6">
      <div className="text-center max-w-lg">
        <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-3 shadow-sm">
          <Stethoscope size={28} className="text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Prepare My Case</h2>
        <p className="text-slate-500 text-sm mt-1.5">
          Tell us about your health concern. Our AI clinical triage engine will structure your case for the doctor before you enter the consultation room.
        </p>
      </div>

      {/* Language Selector */}
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Intake Language / भाषा चुनें
          </label>
          <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
            Zero API Cost
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {SUPPORTED_LANGUAGES.slice(0, 2).map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLanguage(l.code)}
              className={[
                'flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-all cursor-pointer',
                language === l.code
                  ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-sm'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              ].join(' ')}
            >
              <span>{l.label}</span>
              {language === l.code && <Check size={16} className="text-blue-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
        {modes.map((m) => {
          const Icon = m.icon
          const isSelected = mode === m.id
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={[
                'flex flex-col text-left p-5 rounded-2xl border-2 transition-all duration-150 cursor-pointer relative',
                isSelected
                  ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
              ].join(' ')}
            >
              <div className="flex items-center justify-between mb-3 w-full">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Icon size={22} />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.badgeColor}`}>
                  {m.badge}
                </span>
              </div>
              <h3 className={`font-bold text-sm mb-1 ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                {m.title}
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-3 flex-1">
                {m.description}
              </p>
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between w-full">
                <span className="text-[10px] font-semibold text-emerald-700">
                  {m.quotaTag}
                </span>
                {isSelected && <CheckCircle size={14} className="text-blue-600 flex-shrink-0" />}
              </div>
            </button>
          )
        })}
      </div>

      {!isSpeechAvailable && (
        <div className="w-full max-w-xl p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
          <AlertTriangle size={15} className="text-amber-600 flex-shrink-0" />
          <span>Note: Web Speech API is optimized for Google Chrome, Chromium &amp; Edge browsers. Chat mode is available on all platforms.</span>
        </div>
      )}

      <Button
        disabled={!mode}
        onClick={onNext}
        className="px-10 py-2.5 text-base font-semibold shadow-md"
      >
        Start Case Interview <ChevronRight size={18} />
      </Button>
    </div>
  )
}

// ── Step 2: Interactive AI Interview with Speech & Chatbot ────────────────────
function StepInterview({ onNext, onBack, mode, language, sessionRef, setCaseSummary }) {
  const { patient } = useCurrentPatient()
  const [messages, setMessages] = useState([])
  const [inputVal, setInputVal] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [isAudioMuted, setIsAudioMuted] = useState(mode === 'chat')
  const [isAiTyping, setIsAiTyping] = useState(false)
  const [activeRedFlag, setActiveRedFlag] = useState(null)
  const [quickReplies, setQuickReplies] = useState([])
  const [errorMessage, setErrorMessage] = useState('')

  const chatBottomRef = useRef(null)

  // Initialize clinical chat session on mount
  useEffect(() => {
    if (!sessionRef.current) {
      sessionRef.current = new ClinicalInterviewSession({
        language,
        patientName: patient?.name || 'Rahul Kumar'
      })
    }
    const session = sessionRef.current
    setMessages([...session.messages])
    setQuickReplies(session.getQuickReplies())
    setActiveRedFlag(session.caseData.redFlags.active ? session.caseData.redFlags : null)

    // If live or voice mode, speak initial greeting
    if ((mode === 'live' || mode === 'voice') && !isAudioMuted && session.messages.length > 0) {
      speechSynthesizer.speak(session.messages[0].text, { lang: language })
    }

    return () => {
      speechRecognizer.stop()
      speechSynthesizer.stop()
    }
  }, [language, mode, patient?.name])

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAiTyping, interimText])

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputVal || interimText).trim()
    if (!text || isAiTyping) return

    setInputVal('')
    setInterimText('')
    setErrorMessage('')

    // Stop listening while AI responds
    if (isListening) {
      speechRecognizer.stop()
      setIsListening(false)
    }

    const session = sessionRef.current
    if (!session) return

    // Show user message immediately
    setIsAiTyping(true)
    const userMsg = {
      id: `user-${Date.now()}`,
      from: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages((prev) => [...prev, userMsg])

    try {
      const aiReply = await session.processUserMessage(text)
      setMessages([...session.messages])
      setQuickReplies(session.getQuickReplies())

      // Check red flags
      if (session.caseData.redFlags.active) {
        setActiveRedFlag(session.caseData.redFlags)
      }

      // Update case summary in parent
      const summary = session.generateSoapSummary()
      setCaseSummary(summary)

      // Spoken output if voice/live mode is active and not muted
      if (!isAudioMuted && (mode === 'live' || mode === 'voice')) {
        speechSynthesizer.speak(aiReply.text, {
          lang: language,
          onEnd: () => {
            // In Live mode, auto-listen again after bot finishes speaking
            if (mode === 'live') {
              startSpeechRecognition()
            }
          }
        })
      }
    } catch (e) {
      console.error('Chat error:', e)
    } finally {
      setIsAiTyping(false)
    }
  }

  const startSpeechRecognition = () => {
    setErrorMessage('')
    speechSynthesizer.stop()

    const started = speechRecognizer.start({
      lang: language,
      onStart: () => {
        setIsListening(true)
      },
      onInterimResult: (text) => {
        setInterimText(text)
      },
      onFinalResult: (text) => {
        setInterimText('')
        handleSendMessage(text)
      },
      onError: (err) => {
        setIsListening(false)
        setErrorMessage(err.message || 'Speech recognition error')
      },
      onEnd: () => {
        setIsListening(false)
      }
    })

    if (!started) {
      setErrorMessage('Could not activate microphone. Please check browser permissions.')
    }
  }

  const stopSpeechRecognition = () => {
    speechRecognizer.stop()
    setIsListening(false)
    if (interimText) {
      handleSendMessage(interimText)
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopSpeechRecognition()
    } else {
      startSpeechRecognition()
    }
  }

  const handleFinishInterview = () => {
    if (sessionRef.current) {
      const summary = sessionRef.current.generateSoapSummary()
      setCaseSummary(summary)
      // Save for doctor portal preview
      try {
        localStorage.setItem('medikiosk_active_case_summary', JSON.stringify(summary))
      } catch (e) {
        // ignore
      }
    }
    onNext()
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto py-4">
      {/* Header & Controls */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">AI Clinical Interview</h2>
            <Badge variant="primary" dot className="text-xs">
              {mode === 'voice' ? 'Google Speech STT' : mode === 'live' ? 'Live Kiosk Loop' : 'Interactive Chat'}
            </Badge>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Language: <span className="font-semibold text-slate-700">{language === 'hi-IN' ? 'Hindi (हिंदी)' : 'English (India)'}</span> · Zero API Quota Consumed
          </p>
        </div>

        {/* Audio Mute/Unmute toggle */}
        <button
          onClick={() => {
            const next = !isAudioMuted
            setIsAudioMuted(next)
            if (next) speechSynthesizer.stop()
          }}
          className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
            isAudioMuted
              ? 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
              : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
          }`}
          title={isAudioMuted ? 'Unmute Audio Narration' : 'Mute Audio Narration'}
        >
          {isAudioMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          <span className="hidden sm:inline font-medium">{isAudioMuted ? 'Muted' : 'Audio On'}</span>
        </button>
      </div>

      {/* Real-Time Emergency Red-Flag Banner */}
      {activeRedFlag && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 flex items-start gap-3 shadow-sm animate-pulse">
          <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-red-700">
                {activeRedFlag.title}
              </p>
              <span className="bg-red-200 text-red-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {activeRedFlag.severity} TRIAGE
              </span>
            </div>
            <p className="text-xs text-red-700 mt-1 leading-relaxed font-medium">
              {activeRedFlag.description}
            </p>
          </div>
        </div>
      )}

      {/* Error Notice */}
      {errorMessage && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="font-bold text-amber-900 ml-2">×</button>
        </div>
      )}

      {/* Chat Messages Container */}
      <div className="flex flex-col gap-3.5 bg-slate-50/80 rounded-2xl p-4 border border-slate-200 h-96 overflow-y-auto shadow-inner">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {msg.from === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Zap size={15} className="text-white" />
              </div>
            )}
            <div
              className={[
                'rounded-2xl px-4 py-2.5 text-sm max-w-[85%] leading-relaxed shadow-sm',
                msg.from === 'ai'
                  ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                  : 'bg-blue-600 text-white rounded-tr-sm'
              ].join(' ')}
            >
              <p>{msg.text}</p>
              <p className={`text-[10px] mt-1 ${msg.from === 'ai' ? 'text-slate-400' : 'text-blue-200'} text-right`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}

        {/* Real-time Interim Voice Transcript */}
        {isListening && interimText && (
          <div className="flex gap-3 flex-row-reverse">
            <div className="rounded-2xl px-4 py-2 text-sm max-w-[85%] bg-blue-100 text-blue-800 border border-blue-300 italic animate-pulse rounded-tr-sm">
              <span className="text-xs font-semibold mr-1.5">Transcribing:</span>
              "{interimText}"
            </div>
          </div>
        )}

        {/* AI Typing Indicator */}
        {isAiTyping && (
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Zap size={14} className="text-white animate-pulse" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.15s]" />
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.3s]" />
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Quick Replies */}
      {quickReplies.length > 0 && !isAiTyping && (
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Suggested Responses (Click to send)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {quickReplies.map((reply) => (
              <button
                key={reply}
                type="button"
                onClick={() => handleSendMessage(reply)}
                className="text-xs bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer font-medium"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar & Microphone */}
      <div className="flex flex-col gap-2 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-sm">
        {/* Active Audio Waveform Visualizer */}
        {isListening && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50/80 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-bold text-blue-900">
                Listening... (Google Web Speech)
              </span>
            </div>
            <div className="flex items-center gap-1 h-6">
              <span className="w-1 bg-blue-600 rounded-full animate-soundwave-1" />
              <span className="w-1 bg-blue-500 rounded-full animate-soundwave-2" />
              <span className="w-1 bg-blue-700 rounded-full animate-soundwave-3" />
              <span className="w-1 bg-blue-400 rounded-full animate-soundwave-4" />
              <span className="w-1 bg-blue-600 rounded-full animate-soundwave-5" />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Microphone Tap Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={[
              'p-3 rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer flex-shrink-0',
              isListening
                ? 'bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-200 animate-pulse'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            ].join(' ')}
            title={isListening ? 'Click to stop listening' : 'Tap & Speak'}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Text input */}
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            placeholder={isListening ? 'Listening to your speech...' : 'Type your symptoms or click the microphone to speak...'}
            className="flex-1 bg-slate-50 border-0 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputVal.trim() && !interimText.trim()}
            className="p-3 rounded-xl bg-slate-900 text-white hover:bg-blue-600 disabled:opacity-30 disabled:hover:bg-slate-900 transition-colors cursor-pointer flex-shrink-0"
            title="Send Message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button variant="secondary" onClick={onBack}>
          <ChevronLeft size={16} /> Back
        </Button>
        <Button
          onClick={handleFinishInterview}
          className="flex-1 max-w-xs font-semibold shadow-sm"
        >
          Review &amp; Attach Reports <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}

// ── Step 3: Document Attachments ──────────────────────────────────────────────
const docTypes = ['Blood Report', 'ECG', 'Prescription', 'X-Ray', 'MRI Scan', 'USG Report', 'Other']

function StepDocuments({ onNext, onBack, uploaded, setUploaded }) {
  const [docType, setDocType] = useState(docTypes[0])

  const handleSimulateUpload = () => {
    const newDoc = {
      name: `${docType.replace(/\s+/g, '_')}_Intake_${new Date().getFullYear()}.pdf`,
      type: docType,
      size: '1.4 MB',
      date: 'Today'
    }
    setUploaded((prev) => [...prev, newDoc])
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto py-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-800">Upload Medical Documents</h2>
        <p className="text-slate-500 text-sm mt-1">Attach any recent laboratory reports, ECGs, or prescriptions to accompany your case</p>
      </div>

      {/* Dropzone */}
      <div
        onClick={handleSimulateUpload}
        className="border-2 border-dashed border-blue-300 bg-blue-50/40 rounded-2xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group"
      >
        <Upload size={32} className="text-blue-400 group-hover:text-blue-600 mx-auto mb-3 transition-colors" />
        <p className="text-sm font-semibold text-slate-700">Drag &amp; drop files here, or tap to attach</p>
        <div className="flex items-center justify-center gap-3 mt-3">
          <span className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-medium px-4 py-2 rounded-lg shadow-xs">
            <Camera size={14} /> Camera Scan
          </span>
          <span className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-medium px-4 py-2 rounded-lg shadow-xs">
            <Image size={14} /> Gallery
          </span>
          <span className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-medium px-4 py-2 rounded-lg">
            <Upload size={14} /> Browse Files
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-3">Supported formats: PDF, JPG, PNG, DICOM — Max 20 MB</p>
      </div>

      {/* Doc type selector */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
          Document Type:
        </label>
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {docTypes.map((t) => <option key={t}>{t}</option>)}
        </select>
        <Button size="sm" onClick={handleSimulateUpload}>
          Attach Doc
        </Button>
      </div>

      {/* Uploaded files */}
      {uploaded.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Attached Documents ({uploaded.length})</p>
          <ul className="space-y-2">
            {uploaded.map((f, i) => (
              <li key={i} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-xs">
                <FileText size={18} className="text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{f.name}</p>
                  <p className="text-xs text-slate-400">{f.type} · {f.size}</p>
                </div>
                <Badge variant="success" dot>OCR Ready</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button variant="secondary" onClick={onBack}>
          <ChevronLeft size={16} /> Back
        </Button>
        <Button className="flex-1" onClick={onNext}>
          Generate Final Case Summary <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}

// ── Step 4: Final AI Case Summary & Doctor Submission ─────────────────────────
function StepSummary({ onBack, caseSummary, uploaded, onSendToDoctor }) {
  const [submitted, setSubmitted] = useState(false)
  const [tokenNumber, setTokenNumber] = useState('')

  const summary = caseSummary || {
    patientName: 'Rahul Kumar',
    chiefComplaint: 'Chest pain and breathlessness',
    duration: '2 days',
    painScore: 6,
    severityLabel: 'Moderate',
    associatedSymptoms: ['Mild palpitations', 'Breathlessness on exertion'],
    relevantHistory: ['Hypertension (Amlodipine 5mg)', 'Mild Asthma'],
    redFlags: {
      active: true,
      severity: 'HIGH',
      title: 'Acute Coronary Syndrome Hazard',
      description: 'Concurrent chest pain with breathlessness reported. Immediate ECG and triage required.'
    },
    soap: {
      subjective: 'Patient reports chest pain with breathlessness persisting for 2 days. Severity rated moderate.',
      objective: 'Kiosk preliminary triage assessment. Risk level: HIGH.',
      assessment: 'Acute Coronary Syndrome Hazard requiring immediate physician review.',
      plan: ['STAT 12-lead ECG and continuous vitals monitoring.', 'Attending physician urgent review.']
    }
  }

  const handleSend = () => {
    const generatedToken = `OPD-${Math.floor(100 + Math.random() * 900)}`
    setTokenNumber(generatedToken)
    setSubmitted(true)
    if (onSendToDoctor) onSendToDoctor(summary, generatedToken)
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto py-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
          <Zap size={22} className="text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">AI Clinical Case Summary</h2>
        <p className="text-slate-500 text-sm mt-1">
          Synthesized from your interview and ready for attending physician review
        </p>
      </div>

      {submitted ? (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardBody className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Case Transmitted to Doctor!</h3>
              <p className="text-sm text-slate-600 mt-1">
                Your structured clinical case summary has been transferred to the Doctor Portal.
              </p>
            </div>
            <div className="inline-block bg-white border border-emerald-300 rounded-xl px-6 py-3 shadow-xs">
              <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Your OPD Queue Token</p>
              <p className="text-3xl font-extrabold text-emerald-700 mt-0.5">{tokenNumber}</p>
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Please take a seat in the waiting area. The doctor has already received your symptoms, vitals risk assessment, and clinical history.
            </p>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Clinical Intake — {summary.patientName}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Engine: Deterministic Triage Engine &amp; Web Speech STT (Zero Quota)
                </p>
              </div>
              <Badge variant={summary.redFlags?.active ? 'danger' : 'success'}>
                {summary.redFlags?.active ? `${summary.redFlags.severity} Risk` : 'Standard Intake'}
              </Badge>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            {/* Red Flag Warning */}
            {summary.redFlags?.active && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
                  <p className="text-xs font-bold uppercase tracking-wide text-red-700">
                    {summary.redFlags.title}
                  </p>
                </div>
                <p className="text-sm text-red-700 leading-relaxed font-medium">
                  {summary.redFlags.description}
                </p>
              </div>
            )}

            {/* Chief Complaint */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-800 mb-1">
                Chief Complaint &amp; Severity
              </p>
              <p className="text-sm text-slate-800 font-semibold">
                {summary.chiefComplaint}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
                <span>Duration: <strong>{summary.duration}</strong></span>
                <span>•</span>
                <span>Pain Score: <strong>{summary.painScore}/10 ({summary.severityLabel})</strong></span>
              </div>
            </div>

            {/* Associated Symptoms */}
            <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-violet-800 mb-1.5">
                Associated Symptoms &amp; Probing
              </p>
              <div className="flex flex-wrap gap-1.5">
                {summary.associatedSymptoms.map((s, idx) => (
                  <span key={idx} className="bg-white border border-violet-200 text-violet-800 text-xs px-2.5 py-1 rounded-md font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Past History */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-800 mb-1.5">
                Relevant Medical History &amp; Medications
              </p>
              <ul className="text-xs text-slate-700 space-y-1">
                {summary.relevantHistory.map((h, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* Documents Attached */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-800 mb-1.5">
                Attached Documents ({uploaded.length})
              </p>
              <p className="text-xs text-slate-700">
                {uploaded.map(u => u.name).join(', ') || 'No additional documents attached.'}
              </p>
            </div>

            {/* Structured SOAP Notes */}
            {summary.soap && (
              <div className="border-t border-slate-200 pt-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                  Physician SOAP Preview
                </p>
                <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <p><strong>[S] Subjective:</strong> {summary.soap.subjective}</p>
                  <p><strong>[O] Objective:</strong> {summary.soap.objective}</p>
                  <p><strong>[A] Assessment:</strong> {summary.soap.assessment}</p>
                  <p><strong>[P] Plan:</strong> {summary.soap.plan?.join(' ')}</p>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onBack}>
          <ChevronLeft size={16} /> Back
        </Button>
        {!submitted ? (
          <>
            <Button onClick={handleSend} className="flex-1 gap-2 font-bold shadow-md">
              <Send size={16} />
              Transmit Case to Doctor
            </Button>
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="gap-2"
            >
              <Download size={16} />
              Print / PDF
            </Button>
          </>
        ) : (
          <Button
            onClick={() => window.location.href = '/patient'}
            className="flex-1 font-bold"
          >
            Return to Dashboard
          </Button>
        )}
      </div>
    </div>
  )
}

// ── Main Wizard Coordinator ──────────────────────────────────────────────────
export default function MyCase() {
  const [step, setStep] = useState(0)
  const [mode, setMode] = useState('voice') // 'voice' | 'chat' | 'live'
  const [language, setLanguage] = useState('en-IN')
  const [caseSummary, setCaseSummary] = useState(null)
  const [uploaded, setUploaded] = useState([
    { name: 'ECG_Report_Aug2026.pdf', type: 'ECG', size: '1.2 MB', date: '28 Aug 2026' },
    { name: 'Blood_Report_Apr2026.pdf', type: 'Blood Report', size: '0.8 MB', date: '25 Apr 2026' }
  ])

  const sessionRef = useRef(null)

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  return (
    <div className="p-6 min-h-[calc(100vh-80px)]">
      {/* Wizard Step Breadcrumbs */}
      <div className="flex items-center gap-0 mb-8 max-w-2xl mx-auto">
        {STEPS.map((label, i) => {
          const done = i < step
          const active = i === step
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={[
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all shadow-xs',
                    done
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : active
                        ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100'
                        : 'bg-white border-slate-300 text-slate-400'
                  ].join(' ')}
                >
                  {done ? <CheckCircle size={15} /> : i + 1}
                </div>
                <span className={`text-xs font-medium whitespace-nowrap ${active ? 'text-blue-600 font-bold' : done ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all ${done ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step Components */}
      <div className="max-w-2xl mx-auto">
        {step === 0 && (
          <StepPrepare
            onNext={next}
            mode={mode}
            setMode={setMode}
            language={language}
            setLanguage={setLanguage}
          />
        )}
        {step === 1 && (
          <StepInterview
            onNext={next}
            onBack={back}
            mode={mode}
            language={language}
            sessionRef={sessionRef}
            setCaseSummary={setCaseSummary}
          />
        )}
        {step === 2 && (
          <StepDocuments
            onNext={next}
            onBack={back}
            uploaded={uploaded}
            setUploaded={setUploaded}
          />
        )}
        {step === 3 && (
          <StepSummary
            onBack={back}
            caseSummary={caseSummary}
            uploaded={uploaded}
            onSendToDoctor={(summary, token) => {
              console.log('Case successfully submitted to doctor queue:', { summary, token })
            }}
          />
        )}
      </div>
    </div>
  )
}
