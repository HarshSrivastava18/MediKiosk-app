import { useState } from 'react'
import {
  Mic,
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
  ChevronLeft,
  Stethoscope,
  Zap,
} from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'

const STEPS = ['Prepare', 'AI Interview', 'Documents', 'Summary']

// ── Step 1 ────────────────────────────────────────────────────────────────────
function StepPrepare({ onNext }) {
  const [chosen, setChosen] = useState(null)

  return (
    <div className="flex flex-col items-center gap-8 py-10">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
          <Stethoscope size={28} className="text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Prepare My Case</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-sm">
          Tell us about your health concern. Our AI will prepare a structured case summary for your doctor.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-xl">
        {/* Voice */}
        <button
          onClick={() => setChosen('voice')}
          className={[
            'flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all duration-150',
            chosen === 'voice'
              ? 'border-blue-600 bg-blue-50 shadow-lg'
              : 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-md',
          ].join(' ')}
        >
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${chosen === 'voice' ? 'bg-blue-600' : 'bg-slate-100'}`}>
            <Mic size={30} className={chosen === 'voice' ? 'text-white' : 'text-slate-500'} />
          </div>
          <div className="text-center">
            <p className={`font-bold text-base ${chosen === 'voice' ? 'text-blue-700' : 'text-slate-700'}`}>Voice Mode</p>
            <p className="text-slate-500 text-xs mt-1">Speak naturally — AI will listen and guide you</p>
          </div>
          {chosen === 'voice' && (
            <span className="flex items-center gap-1 text-xs text-blue-600 font-semibold">
              <CheckCircle size={13} /> Selected
            </span>
          )}
        </button>

        {/* Chat */}
        <button
          onClick={() => setChosen('chat')}
          className={[
            'flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all duration-150',
            chosen === 'chat'
              ? 'border-blue-600 bg-blue-50 shadow-lg'
              : 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-md',
          ].join(' ')}
        >
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${chosen === 'chat' ? 'bg-blue-600' : 'bg-slate-100'}`}>
            <MessageSquare size={30} className={chosen === 'chat' ? 'text-white' : 'text-slate-500'} />
          </div>
          <div className="text-center">
            <p className={`font-bold text-base ${chosen === 'chat' ? 'text-blue-700' : 'text-slate-700'}`}>Chat Mode</p>
            <p className="text-slate-500 text-xs mt-1">Type your symptoms at your own pace</p>
          </div>
          {chosen === 'chat' && (
            <span className="flex items-center gap-1 text-xs text-blue-600 font-semibold">
              <CheckCircle size={13} /> Selected
            </span>
          )}
        </button>
      </div>

      <Button
        disabled={!chosen}
        onClick={onNext}
        className="px-10"
      >
        Continue <ChevronRight size={16} />
      </Button>
    </div>
  )
}

// ── Step 2 ────────────────────────────────────────────────────────────────────
const chatMessages = [
  { from: 'ai',   text: 'Hello Rahul 👋 I\'m your AI health assistant. Let\'s prepare your case for the doctor. When did the pain begin?' },
  { from: 'user', text: 'Yesterday evening, around 6 PM.' },
  { from: 'ai',   text: 'I see. How would you rate the severity of the pain?' },
]

function StepInterview({ onNext, onBack }) {
  const [pain, setPain] = useState(1)
  const painLabels = ['Mild', 'Moderate', 'Severe']
  const painColors = ['text-emerald-600', 'text-amber-600', 'text-red-600']

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto py-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-800">AI Interview</h2>
        <p className="text-slate-500 text-sm mt-1">Answer the questions to help AI build your case</p>
      </div>

      {/* Chat bubbles */}
      <div className="flex flex-col gap-4 bg-slate-50 rounded-2xl p-5 border border-slate-200 min-h-64">
        {chatMessages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.from === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Zap size={14} className="text-white" />
              </div>
            )}
            <div
              className={[
                'rounded-2xl px-4 py-2.5 text-sm max-w-xs leading-relaxed',
                msg.from === 'ai'
                  ? 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                  : 'bg-blue-600 text-white rounded-tr-sm',
              ].join(' ')}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Pain slider question */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Zap size={14} className="text-white" />
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 flex-1">
            <p className="text-sm text-slate-700 mb-3">How would you rate the pain?</p>
            <input
              type="range"
              min={0}
              max={2}
              step={1}
              value={pain}
              onChange={(e) => setPain(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs mt-1.5">
              {painLabels.map((l, i) => (
                <span
                  key={l}
                  className={`font-semibold ${i === pain ? painColors[i] : 'text-slate-400'}`}
                >
                  {l}
                </span>
              ))}
            </div>
            <div className={`mt-2 text-sm font-bold ${painColors[pain]}`}>
              Rated: {painLabels[pain]}
            </div>
          </div>
        </div>
      </div>

      {/* Tap & Speak button */}
      <div className="flex flex-col items-center gap-2">
        <button className="flex items-center gap-2.5 bg-blue-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-blue-700 transition-colors shadow-lg">
          <Mic size={18} />
          Tap &amp; Speak
        </button>
        <p className="text-xs text-slate-400">Or type your answer below and press Enter</p>
      </div>

      <div className="flex gap-2 mt-auto">
        <Button variant="secondary" onClick={onBack}>
          <ChevronLeft size={15} /> Back
        </Button>
        <Button className="flex-1" onClick={onNext}>
          Continue to Upload <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}

// ── Step 3 ────────────────────────────────────────────────────────────────────
const docTypes = ['Blood Report', 'ECG', 'Prescription', 'X-Ray', 'MRI Scan', 'USG Report', 'Other']

function StepDocuments({ onNext, onBack }) {
  const [docType, setDocType] = useState(docTypes[0])
  const [uploaded, setUploaded] = useState([
    { name: 'ECG_Report_Aug2026.pdf', type: 'ECG', size: '1.2 MB' },
    { name: 'Blood_Report_Apr2026.pdf', type: 'Blood Report', size: '0.8 MB' },
  ])

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto py-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-800">Upload Documents</h2>
        <p className="text-slate-500 text-sm mt-1">Attach relevant reports to strengthen your case</p>
      </div>

      {/* Dropzone */}
      <div className="border-2 border-dashed border-blue-300 bg-blue-50/40 rounded-2xl p-10 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
        <Upload size={32} className="text-blue-400 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-700">Drag &amp; drop files here, or</p>
        <div className="flex items-center justify-center gap-3 mt-3">
          <button className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Camera size={14} /> Camera
          </button>
          <button className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Image size={14} /> Gallery
          </button>
          <button className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Upload size={14} /> Browse Files
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-3">Accepted: PDF, JPG, PNG, DICOM — Max 20 MB per file</p>
      </div>

      {/* Doc type selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Document Type:</label>
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {docTypes.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Uploaded files */}
      {uploaded.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Attached Files</p>
          <ul className="space-y-2">
            {uploaded.map((f, i) => (
              <li key={i} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2.5">
                <FileText size={18} className="text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{f.name}</p>
                  <p className="text-xs text-slate-400">{f.type} · {f.size}</p>
                </div>
                <Badge variant="success" dot>Ready</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="secondary" onClick={onBack}>
          <ChevronLeft size={15} /> Back
        </Button>
        <Button className="flex-1" onClick={onNext}>
          Generate Case Summary <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}

// ── Step 4 ────────────────────────────────────────────────────────────────────
function StepSummary({ onBack }) {
  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto py-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
          <Zap size={22} className="text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">AI Case Summary</h2>
        <p className="text-slate-500 text-sm mt-1">Review before sending to your doctor</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Case Summary — Rahul Kumar</h3>
            <Badge variant="primary">AI Generated</Badge>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {[
            {
              label: 'Chief Complaint',
              color: 'border-blue-200 bg-blue-50',
              heading: 'text-blue-800',
              content: 'Chest pain and breathlessness starting yesterday evening (around 6 PM), rated as Moderate severity.',
            },
            {
              label: 'Associated Symptoms',
              color: 'border-violet-200 bg-violet-50',
              heading: 'text-violet-800',
              content: 'Mild palpitations, slight dizziness on exertion, no fever, no cough.',
            },
            {
              label: 'Relevant History',
              color: 'border-emerald-200 bg-emerald-50',
              heading: 'text-emerald-800',
              content: 'Known hypertension (on Amlodipine 5mg). Mild asthma (Salbutamol PRN). Allergy to Penicillin. Last BP: 138/88 mmHg.',
            },
            {
              label: 'Documents Used',
              color: 'border-amber-200 bg-amber-50',
              heading: 'text-amber-800',
              content: 'ECG Report (Aug 2026), Blood Report (Apr 2026) — both processed and attached.',
            },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
              <p className={`text-xs font-bold uppercase tracking-wide mb-1.5 ${s.heading}`}>{s.label}</p>
              <p className="text-sm text-slate-700 leading-relaxed">{s.content}</p>
            </div>
          ))}

          {/* Red Flag */}
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertTriangle size={15} className="text-red-600" />
              <p className="text-xs font-bold uppercase tracking-wide text-red-700">Red Flag Indicators</p>
            </div>
            <p className="text-sm text-red-700 leading-relaxed font-medium">
              Chest pain + Breathlessness in a hypertensive patient — requires urgent cardiac evaluation. Do not delay.
            </p>
          </div>
        </CardBody>
      </Card>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack}>
          <ChevronLeft size={15} /> Back
        </Button>
        <Button className="flex-1 gap-2">
          <Send size={16} />
          Send to Doctor
        </Button>
        <Button variant="outline" className="gap-2">
          <FileText size={16} />
          Download PDF
        </Button>
      </div>
    </div>
  )
}

// ── Main Wizard ───────────────────────────────────────────────────────────────
export default function MyCase() {
  const [step, setStep] = useState(0)

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  return (
    <div className="p-6">
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8 max-w-2xl mx-auto">
        {STEPS.map((label, i) => {
          const done = i < step
          const active = i === step
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={[
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
                    done   ? 'bg-emerald-500 border-emerald-500 text-white'
                           : active ? 'bg-blue-600 border-blue-600 text-white'
                           : 'bg-white border-slate-300 text-slate-400',
                  ].join(' ')}
                >
                  {done ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span className={`text-xs font-medium whitespace-nowrap ${active ? 'text-blue-600' : done ? 'text-emerald-600' : 'text-slate-400'}`}>
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

      {/* Step content */}
      <div className="max-w-2xl mx-auto">
        {step === 0 && <StepPrepare onNext={next} />}
        {step === 1 && <StepInterview onNext={next} onBack={back} />}
        {step === 2 && <StepDocuments onNext={next} onBack={back} />}
        {step === 3 && <StepSummary onBack={back} />}
      </div>
    </div>
  )
}
