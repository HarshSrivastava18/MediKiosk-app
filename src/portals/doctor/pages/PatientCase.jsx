import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Plus,
  FileText,
  Activity,
  Heart,
  Thermometer,
  User,
  Phone,
  Calendar,
  ClipboardList,
  Stethoscope,
  FlaskConical,
  Pill,
  ArrowRightLeft,
  Upload,
  Eye,
  Edit3,
  Brain,
  ChevronRight,
  Clock,
  MapPin,
  Droplets,
  Zap,
  Shield,
  StickyNote,
} from 'lucide-react'
import Card, { CardHeader, CardBody, CardFooter } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Avatar from '../../../components/ui/Avatar'
import Tabs from '../../../components/ui/Tabs'
import Timeline from '../../../components/ui/Timeline'
import RedFlagBanner from '../../../components/ui/RedFlagBanner'
import { getPatient } from '../../../data/patients'

// ─── Vitals Card ────────────────────────────────────────────────────────────
function VitalCard({ label, value, icon: Icon, color, unit, normal }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-100 shadow-card p-4 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={16} />
        </div>
        <Badge variant={normal ? 'success' : 'warning'} dot className="text-xs">
          {normal ? 'Normal' : 'Elevated'}
        </Badge>
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        {unit && <p className="text-xs text-slate-400">{unit}</p>}
      </div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
    </div>
  )
}

// ─── Action Row ──────────────────────────────────────────────────────────────
function ActionRow({ icon: Icon, label, color = 'text-brand-600 bg-brand-50', onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group text-left"
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={13} />
      </div>
      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 flex-1">{label}</span>
      <ChevronRight size={13} className="text-slate-300 group-hover:text-slate-400" />
    </button>
  )
}

// ─── AI Case Summary Tab ─────────────────────────────────────────────────────
function AICaseSummaryTab({ patient }) {
  const [liveCase, setLiveCase] = useState(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('medikiosk_active_case_summary')
      if (saved) {
        setLiveCase(JSON.parse(saved))
      }
    } catch (e) {
      // ignore
    }
  }, [])

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

      {/* Left: AI Summary */}
      <div className="xl:col-span-2 space-y-4">

        {/* AI disclaimer banner */}
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <Brain size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-800">AI Generated Case Summary</p>
            <p className="text-xs text-amber-700 mt-0.5">Requires Physician Review — AI suggestions are not a diagnosis and must not be treated as clinical advice.</p>
          </div>
        </div>

        {/* Main summary card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-brand-100 rounded-lg flex items-center justify-center">
                  <ClipboardList size={13} className="text-brand-600" />
                </div>
                <p className="font-semibold text-slate-800">Clinical Overview</p>
              </div>
              {liveCase ? (
                <Badge variant="success" dot>Live Kiosk Intake Received</Badge>
              ) : (
                <Badge variant="primary" dot>AI Processed</Badge>
              )}
            </div>
          </CardHeader>
          <CardBody className="space-y-5">

            {/* Chief Complaint */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Chief Complaint</p>
              <p className="text-sm text-slate-800 font-medium bg-slate-50 rounded-lg px-3 py-2">
                {liveCase?.chiefComplaint || patient?.complaint || 'Chest pain for 2 days'}
              </p>
            </div>

            {/* History of Present Illness */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">History of Present Illness</p>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-lg px-3 py-2">
                {liveCase?.historyOfPresentIllness || liveCase?.soap?.subjective || 'Intermittent chest discomfort since yesterday, increases on exertion with associated breathlessness. Patient reports discomfort radiating to the left arm during episodes. No fever, no cough. Episodes last 5–10 minutes and are relieved by rest.'}
              </p>
            </div>

            {/* Associated Symptoms */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Associated Symptoms</p>
              <div className="flex flex-wrap gap-2">
                {(liveCase?.associatedSymptoms || ['Breathlessness', 'Fatigue', 'Diaphoresis', 'Mild Nausea']).map(s => (
                  <Badge key={s} variant="warning">{s}</Badge>
                ))}
              </div>
            </div>

            {/* Relevant History */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Relevant History</p>
              <div className="space-y-1.5">
                {(liveCase?.relevantHistory || ['Hypertension (diagnosed 2 years ago, on Amlodipine 5mg)', 'Mild Asthma (controlled, on Salbutamol PRN)', 'No prior cardiac events reported']).map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />
                    {h}
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Key Findings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Zap size={13} className="text-emerald-600" />
              </div>
              <p className="font-semibold text-slate-800">Key Findings</p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Pain Type',     value: liveCase ? (liveCase.painScore >= 7 ? 'Severe / Radiating' : 'Moderate / Pressure') : 'Sharp / Pressure-like' },
                { label: 'Severity',      value: liveCase ? `${liveCase.severityLabel} (${liveCase.painScore}/10)` : 'Moderate (6/10)' },
                { label: 'Duration',      value: liveCase?.duration || '2 Days' },
                { label: 'Risk Stratification', value: liveCase?.redFlags?.severity ? `${liveCase.redFlags.severity} Risk` : 'High Risk' },
                { label: 'Intake Engine',  value: 'Google Speech + Triage' },
                { label: 'API Quota Used', value: '0 Tokens (Free Native)' },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 font-medium mb-0.5">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-800">{item.value}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* AI Suggestions — clearly not a diagnosis */}
        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader className="border-amber-200 bg-amber-50/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Brain size={13} className="text-amber-600" />
                </div>
                <p className="font-semibold text-amber-900">AI Suggestions</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold bg-amber-100 px-2 py-1 rounded-full">
                <AlertTriangle size={11} />
                NOT a Diagnosis
              </div>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="bg-white rounded-xl border border-amber-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Possible Category</p>
                <Badge variant="danger">Cardiac</Badge>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Recommended Actions</p>
                <div className="space-y-1.5">
                  {[
                    'Further cardiac evaluation required',
                    'ECG — 12-lead (urgent)',
                    'Serum Troponin I / T',
                    'CBC, CMP, BNP',
                    'Chest X-ray if indicated',
                  ].map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                      {a}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertTriangle size={12} className="flex-shrink-0" />
                AI suggestions are for informational purposes only. Clinical judgment of the treating physician takes precedence.
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Right: Documents + Actions sidebar */}
      <div className="space-y-4">

        {/* Relevant Documents */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-violet-100 rounded-lg flex items-center justify-center">
                <FileText size={13} className="text-violet-600" />
              </div>
              <p className="font-semibold text-slate-800">Relevant Documents</p>
            </div>
          </CardHeader>
          <CardBody className="space-y-2">
            {(patient.documents || []).map(doc => (
              <div key={doc.id} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer group">
                <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center flex-shrink-0">
                  <FileText size={13} className="text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{doc.name}</p>
                  <p className="text-xs text-slate-400">{doc.date}</p>
                </div>
                <Badge variant={doc.type === 'ECG' ? 'blue' : doc.type === 'Lab' ? 'warning' : 'purple'} className="text-xs flex-shrink-0">
                  {doc.type}
                </Badge>
                <Eye size={13} className="text-slate-300 group-hover:text-brand-500 flex-shrink-0 transition-colors" />
              </div>
            ))}
          </CardBody>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              <Eye size={13} />
              View All Documents
            </Button>
          </CardFooter>
        </Card>

        {/* Edit Summary */}
        <Button variant="secondary" size="md" className="w-full">
          <Edit3 size={14} />
          Edit Summary
        </Button>
      </div>
    </div>
  )
}

// ─── Timeline Tab ─────────────────────────────────────────────────────────────
function TimelineTab({ patient }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
            <Clock size={13} className="text-blue-600" />
          </div>
          <p className="font-semibold text-slate-800">Patient Timeline</p>
        </div>
      </CardHeader>
      <CardBody>
        {patient.timeline && patient.timeline.length > 0 ? (
          <Timeline events={patient.timeline} />
        ) : (
          <p className="text-sm text-slate-400 text-center py-8">No timeline events recorded yet.</p>
        )}
      </CardBody>
    </Card>
  )
}

// ─── Documents Tab ────────────────────────────────────────────────────────────
function DocumentsTab({ patient }) {
  const typeColors = { ECG: 'blue', Lab: 'warning', Prescription: 'purple', Imaging: 'emerald' }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">{(patient.documents || []).length} document(s)</p>
        <Button variant="primary" size="sm">
          <Upload size={13} />
          Upload Document
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {(patient.documents || []).map(doc => (
          <Card key={doc.id} hoverable>
            <CardBody className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                  <FileText size={18} className="text-slate-500" />
                </div>
                <Badge variant={typeColors[doc.type] || 'default'}>{doc.type}</Badge>
              </div>
              <div>
                <p className="font-semibold text-slate-800">{doc.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{doc.date}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1">
                  <Eye size={12} />
                  View
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit3 size={12} />
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
        {(!patient.documents || patient.documents.length === 0) && (
          <div className="col-span-full text-center py-12 text-slate-400">
            <FileText size={32} className="mx-auto mb-2 text-slate-200" />
            No documents uploaded yet
          </div>
        )}
      </div>
    </div>
  )
}

// ─── History Tab ──────────────────────────────────────────────────────────────
function HistoryTab({ patient }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

      {/* Medical Conditions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center">
              <Activity size={13} className="text-red-600" />
            </div>
            <p className="font-semibold text-slate-800">Medical Conditions</p>
          </div>
        </CardHeader>
        <CardBody className="space-y-2">
          {(patient.conditions || []).map((c, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                <p className="text-sm font-medium text-slate-800">{c}</p>
              </div>
              <Badge variant="danger" className="text-xs">Active</Badge>
            </div>
          ))}
          {(!patient.conditions || patient.conditions.length === 0) && (
            <p className="text-sm text-slate-400 text-center py-4">No conditions recorded</p>
          )}
        </CardBody>
      </Card>

      {/* Current Medications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Pill size={13} className="text-emerald-600" />
            </div>
            <p className="font-semibold text-slate-800">Current Medications</p>
          </div>
        </CardHeader>
        <CardBody className="space-y-2">
          {(patient.medications || []).map((m, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="flex items-center gap-2">
                <Pill size={13} className="text-emerald-500 flex-shrink-0" />
                <p className="text-sm font-medium text-slate-800">{m}</p>
              </div>
              <Badge variant="success" className="text-xs">Active</Badge>
            </div>
          ))}
          {(!patient.medications || patient.medications.length === 0) && (
            <p className="text-sm text-slate-400 text-center py-4">No medications recorded</p>
          )}
        </CardBody>
      </Card>

      {/* Allergies */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle size={13} className="text-amber-600" />
            </div>
            <p className="font-semibold text-slate-800">Known Allergies</p>
          </div>
        </CardHeader>
        <CardBody>
          {(patient.allergies || []).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {patient.allergies.map((a, i) => (
                <Badge key={i} variant="warning" className="text-sm px-3 py-1">
                  <AlertTriangle size={11} />
                  {a}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-emerald-600 font-medium">No known allergies ✓</p>
          )}
        </CardBody>
      </Card>

      {/* Demographics */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-100 rounded-lg flex items-center justify-center">
              <User size={13} className="text-brand-600" />
            </div>
            <p className="font-semibold text-slate-800">Demographics</p>
          </div>
        </CardHeader>
        <CardBody className="space-y-2.5">
          {[
            { icon: User,       label: 'Date of Birth', value: patient.dob },
            { icon: Droplets,   label: 'Blood Group',   value: patient.bloodGroup },
            { icon: Phone,      label: 'Phone',         value: patient.phone },
            { icon: MapPin,     label: 'Address',       value: patient.address },
          ].map(item => (
            <div key={item.label} className="flex items-start gap-2.5">
              <div className="w-6 h-6 bg-slate-100 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                <item.icon size={11} className="text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400">{item.label}</p>
                <p className="text-sm font-medium text-slate-800">{item.value}</p>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  )
}

// ─── Vitals Tab ───────────────────────────────────────────────────────────────
function VitalsTab({ patient }) {
  const v = patient.vitals || {}
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-800">Latest Vitals</p>
          <p className="text-xs text-slate-500 mt-0.5">Recorded during last kiosk visit · {patient.lastVisit}</p>
        </div>
        <Badge variant="success" dot>Recorded at Kiosk</Badge>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        <VitalCard label="Blood Pressure" value={v.bp}     icon={Heart}       color="bg-red-100 text-red-600"     unit="mmHg"  normal={parseInt(v.bp) < 140} />
        <VitalCard label="Pulse Rate"     value={v.pulse}  icon={Activity}    color="bg-rose-100 text-rose-600"   unit="bpm"   normal={v.pulse < 100} />
        <VitalCard label="SpO₂"           value={`${v.spo2}%`} icon={Zap}     color="bg-blue-100 text-blue-600"  unit="Oxygen Sat" normal={v.spo2 >= 96} />
        <VitalCard label="Temperature"    value={v.temp}   icon={Thermometer} color="bg-amber-100 text-amber-600" unit="Fahrenheit" normal={true} />
        <VitalCard label="Weight"         value={v.weight} icon={User}        color="bg-violet-100 text-violet-600" unit="Body weight" normal={true} />
        <VitalCard label="Height"         value={v.height} icon={Activity}    color="bg-emerald-100 text-emerald-600" unit="Body height" normal={true} />
      </div>
      <Card>
        <CardBody>
          <p className="text-xs text-slate-400 text-center">
            Vitals are recorded automatically at the kiosk. Any discrepancy should be re-checked manually.
          </p>
        </CardBody>
      </Card>
    </div>
  )
}

// ─── Clinical Notes Tab ───────────────────────────────────────────────────────
function ClinicalNotesTab({ patient }) {
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)

  const previousNotes = [
    { date: '15 Jul 2026', author: 'Dr. Sharma', note: 'Patient presents with chest pain. ECG ordered. Troponin levels to be assessed. Advised rest and hydration.', type: 'Consultation' },
    { date: '18 Apr 2026', author: 'Dr. Sharma', note: 'Follow-up for hypertension. BP controlled on Amlodipine. Advised low-sodium diet. Next review in 3 months.', type: 'Follow-up' },
    { date: '10 Feb 2026', author: 'Dr. Mehta', note: 'Routine check. All vitals stable. Prescription renewed. Patient reports no adverse effects.', type: 'Review' },
  ]

  return (
    <div className="space-y-5">
      {/* Add new note */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-100 rounded-lg flex items-center justify-center">
              <StickyNote size={13} className="text-brand-600" />
            </div>
            <p className="font-semibold text-slate-800">Add Clinical Note</p>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          <textarea
            value={note}
            onChange={e => { setNote(e.target.value); setSaved(false) }}
            placeholder="Enter clinical observations, findings, plan of care, or follow-up instructions..."
            rows={5}
            className="w-full text-sm text-slate-700 placeholder-slate-400 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 resize-none transition"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Adding as <span className="font-semibold text-slate-600">Dr. Sharma</span> · {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => { setNote(''); setSaved(false) }}>Clear</Button>
              <Button variant="primary" size="sm" onClick={() => { if (note.trim()) setSaved(true) }}>
                <Plus size={13} />
                Save Note
              </Button>
            </div>
          </div>
          {saved && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              <CheckCircle size={13} />
              Clinical note saved successfully
            </div>
          )}
        </CardBody>
      </Card>

      {/* Previous notes */}
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-3">Previous Clinical Notes</p>
        <div className="space-y-3">
          {previousNotes.map((n, i) => (
            <Card key={i}>
              <CardBody>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-xs">
                      DS
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{n.author}</p>
                      <p className="text-xs text-slate-400">{n.date}</p>
                    </div>
                  </div>
                  <Badge variant="default">{n.type}</Badge>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{n.note}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Actions Sidebar ─────────────────────────────────────────────────────────
function ActionsSidebar() {
  const actions = [
    { icon: StickyNote,     label: 'Add Clinical Notes',  color: 'text-brand-600 bg-brand-50' },
    { icon: Stethoscope,    label: 'Add Diagnosis',       color: 'text-emerald-600 bg-emerald-50' },
    { icon: Pill,           label: 'Add Prescription',    color: 'text-violet-600 bg-violet-50' },
    { icon: FlaskConical,   label: 'Add Investigation',   color: 'text-amber-600 bg-amber-50' },
    { icon: Calendar,       label: 'Create Follow-up',    color: 'text-blue-600 bg-blue-50' },
    { icon: ArrowRightLeft, label: 'Refer to Doctor',     color: 'text-rose-600 bg-rose-50' },
    { icon: ArrowRightLeft, label: 'Refer to Hospital',   color: 'text-red-600 bg-red-50' },
    { icon: FileText,       label: 'Request Reports',     color: 'text-cyan-600 bg-cyan-50' },
    { icon: Upload,         label: 'Upload Document',     color: 'text-slate-600 bg-slate-100' },
  ]
  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-100 rounded-lg flex items-center justify-center">
            <Plus size={13} className="text-brand-600" />
          </div>
          <p className="font-semibold text-slate-800">Quick Actions</p>
        </div>
      </CardHeader>
      <CardBody className="space-y-0.5 p-3">
        {actions.map(action => (
          <ActionRow key={action.label} {...action} />
        ))}
      </CardBody>
    </Card>
  )
}

// ─── Main PatientCase Component ───────────────────────────────────────────────
export default function PatientCase() {
  const { id } = useParams()
  const navigate = useNavigate()
  const patient = getPatient(id)

  const tabs = [
    {
      key: 'ai-summary',
      label: '🤖 AI Case Summary',
      content: <AICaseSummaryTab patient={patient} />,
    },
    {
      key: 'timeline',
      label: '📅 Timeline',
      content: <TimelineTab patient={patient} />,
    },
    {
      key: 'documents',
      label: '📄 Documents',
      content: <DocumentsTab patient={patient} />,
    },
    {
      key: 'history',
      label: '🏥 History',
      content: <HistoryTab patient={patient} />,
    },
    {
      key: 'vitals',
      label: '❤️ Vitals',
      content: <VitalsTab patient={patient} />,
    },
    {
      key: 'notes',
      label: '📝 Clinical Notes',
      content: <ClinicalNotesTab patient={patient} />,
    },
  ]

  return (
    <div className="p-6 space-y-5">

      {/* Back button */}
      <button
        onClick={() => navigate('/doctor')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 font-medium transition-colors"
      >
        <ArrowLeft size={15} />
        Back to Dashboard
      </button>

      {/* Patient Header */}
      <div className="bg-white rounded-card shadow-card border border-slate-100">
        <div className="p-5">
          <div className="flex flex-col lg:flex-row lg:items-start gap-5">

            {/* Left: Avatar + basic info */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <Avatar name={patient.name} size="xl" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-slate-900">{patient.name}</h2>
                  <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" aria-label="Verified patient" />
                  <Badge variant="default" className="font-mono text-xs">{patient.id}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-3">
                  <span className="flex items-center gap-1"><User size={13} />{patient.age} years · {patient.gender}</span>
                  <span className="flex items-center gap-1"><Phone size={13} />{patient.phone}</span>
                  <span className="flex items-center gap-1"><Droplets size={13} />{patient.bloodGroup}</span>
                  <span className="flex items-center gap-1"><Calendar size={13} />Last visit: {patient.lastVisit}</span>
                </div>

                {/* Red Flag + Consent */}
                <div className="flex flex-wrap items-center gap-2">
                  {patient.redFlag?.active && (
                    <RedFlagBanner label={patient.redFlag.label} show />
                  )}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    patient.consent === 'Authorised'
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-100 text-amber-700 border border-amber-200'
                  }`}>
                    <Shield size={11} />
                    Consent: {patient.consent}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Quick stats */}
            <div className="flex flex-row lg:flex-col gap-2 lg:items-end flex-shrink-0">
              <div className="flex gap-2">
                <div className="text-center bg-brand-50 rounded-xl px-4 py-2.5 border border-brand-100">
                  <p className="text-lg font-bold text-brand-700">{patient.conditions?.length || 0}</p>
                  <p className="text-xs text-brand-600">Conditions</p>
                </div>
                <div className="text-center bg-emerald-50 rounded-xl px-4 py-2.5 border border-emerald-100">
                  <p className="text-lg font-bold text-emerald-700">{patient.medications?.length || 0}</p>
                  <p className="text-xs text-emerald-600">Medications</p>
                </div>
                <div className="text-center bg-violet-50 rounded-xl px-4 py-2.5 border border-violet-100">
                  <p className="text-lg font-bold text-violet-700">{patient.documents?.length || 0}</p>
                  <p className="text-xs text-violet-600">Documents</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content: Tabs + Actions Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">

        {/* Tabs — 3 columns wide */}
        <div className="xl:col-span-3">
          <Card>
            <CardBody className="p-0">
              <Tabs
                tabs={tabs}
                defaultTab="ai-summary"
                contentClassName="px-5 pb-5"
              />
            </CardBody>
          </Card>
        </div>

        {/* Actions sidebar — 1 column wide */}
        <div className="xl:col-span-1">
          <ActionsSidebar />
        </div>
      </div>
    </div>
  )
}
