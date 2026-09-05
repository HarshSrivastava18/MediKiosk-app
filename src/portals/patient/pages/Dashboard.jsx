import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home,
  Stethoscope,
  FileText,
  Building2,
  Activity,
  Shield,
  ChevronRight,
  Heart,
  Pill,
  AlertTriangle,
  Upload,
  Calendar,
  FlaskConical,
  Zap,
  Users,
  Database,
  CheckCircle2,
  Clock,
  UserCheck,
  Sparkles,
} from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Avatar from '../../../components/ui/Avatar'
import { useCurrentPatient } from '../useCurrentPatient'
import { api } from '../../../lib/api'

const quickActions = [
  {
    title: 'Get My Case Prepared',
    description: 'AI-powered case preparation for your next hospital visit',
    icon: Zap,
    gradient: 'from-blue-600 to-blue-700',
    textColor: 'text-white',
    descColor: 'text-blue-100',
    btnLabel: 'Start Now →',
    btnStyle: 'bg-white text-blue-700 hover:bg-blue-50 font-semibold px-4 py-1.5 rounded-lg text-sm transition-colors cursor-pointer',
    to: '/patient/my-case',
  },
  {
    title: 'My Health Records',
    description: 'View your complete medical history and vitals',
    icon: Activity,
    gradient: 'from-emerald-500 to-emerald-600',
    textColor: 'text-white',
    descColor: 'text-emerald-100',
    btnLabel: 'View Records',
    btnStyle: 'bg-white text-emerald-700 hover:bg-emerald-50 font-semibold px-4 py-1.5 rounded-lg text-sm transition-colors cursor-pointer',
    to: '/patient/health-records',
  },
  {
    title: 'My Documents',
    description: 'Access all uploaded reports and prescriptions',
    icon: FileText,
    gradient: 'from-violet-500 to-violet-600',
    textColor: 'text-white',
    descColor: 'text-violet-100',
    btnLabel: 'View Documents',
    btnStyle: 'bg-white text-violet-700 hover:bg-violet-50 font-semibold px-4 py-1.5 rounded-lg text-sm transition-colors cursor-pointer',
    to: '/patient/documents',
  },
  {
    title: 'Hospital Visits',
    description: 'Track your past and upcoming hospital visits',
    icon: Building2,
    gradient: 'from-amber-500 to-amber-600',
    textColor: 'text-white',
    descColor: 'text-amber-100',
    btnLabel: 'View Visits',
    btnStyle: 'bg-white text-amber-700 hover:bg-amber-50 font-semibold px-4 py-1.5 rounded-lg text-sm transition-colors cursor-pointer',
    to: '/patient/hospital-visits',
  },
]

export default function PatientDashboard() {
  const navigate = useNavigate()
  const { patient } = useCurrentPatient()
  const [allocationStatus, setAllocationStatus] = useState(null)
  const [statusLoading, setStatusLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function loadStatus() {
      try {
        const res = await api.patient.getSummaryStatus()
        if (isMounted) setAllocationStatus(res)
      } catch (e) {
        console.warn('Could not load summary status:', e)
      } finally {
        if (isMounted) setStatusLoading(false)
      }
    }
    loadStatus()
    const interval = setInterval(loadStatus, 4000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [patient.id])

  const firstName = patient.name.split(' ')[0] || 'User'
  const conditionsCount = patient.conditions ? patient.conditions.length : 0
  const medicationsCount = patient.medications ? patient.medications.length : 0
  const allergiesCount = patient.allergies ? patient.allergies.length : 0

  const STAGES = [
    { id: 'Draft', label: 'Draft' },
    { id: 'Submitted', label: 'Submitted' },
    { id: 'Pending Hospital Review', label: 'Pending Hospital Review' },
    { id: 'Doctor Assigned', label: 'Doctor Assigned' },
    { id: 'Consultation', label: 'Consultation' }
  ]

  const currentStatus = allocationStatus?.status || 'Draft'
  let currentStageIndex = 0
  if (currentStatus === 'Submitted') currentStageIndex = 1
  else if (currentStatus === 'Pending Hospital Review') currentStageIndex = 2
  else if (currentStatus === 'Doctor Assigned') currentStageIndex = 3
  else if (['Consultation', 'In Consultation', 'Completed'].includes(currentStatus)) currentStageIndex = 4

  const healthSummaryRows = [
    { label: 'Conditions',  value: conditionsCount,  color: 'bg-red-50 border-red-200',    icon: Heart,     iconClass: 'text-red-500 bg-red-100',    valClass: 'text-red-700' },
    { label: 'Medications', value: medicationsCount, color: 'bg-blue-50 border-blue-200',  icon: Pill,      iconClass: 'text-blue-500 bg-blue-100',  valClass: 'text-blue-700' },
    { label: 'Allergies',   value: allergiesCount,   color: 'bg-amber-50 border-amber-200',icon: AlertTriangle, iconClass: 'text-amber-500 bg-amber-100', valClass: 'text-amber-700' },
    { label: 'Surgeries',   value: 0,                color: 'bg-slate-50 border-slate-200',icon: Activity,  iconClass: 'text-slate-400 bg-slate-100', valClass: 'text-slate-600' },
  ]

  const recentActivity = patient.timeline?.length > 0 ? patient.timeline.map((item, idx) => ({
    id: idx,
    icon: item.type === 'Prescription' ? Pill : item.type === 'Document' ? FileText : item.type === 'Registration' ? Shield : Building2,
    iconBg: item.type === 'Prescription' ? 'bg-violet-100 text-violet-600' : item.type === 'Document' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600',
    label: item.title || item.label || item.summary || 'Clinical Record',
    date: item.date || 'Recent',
    sub: item.hospital || item.summary || 'National Health System'
  })) : [
    { id: 1, icon: Shield, iconBg: 'bg-emerald-100 text-emerald-600', label: 'Global Patient ID Active', date: 'Today', sub: 'National Health Authority' }
  ]

  return (
    <div className="p-6 space-y-6">

      {/* ── Greeting row ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome, {firstName} 👋</h1>
          <p className="text-slate-500 text-sm mt-1">Live health summary read directly from PostgreSQL.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm">
            <Database size={13} className="text-emerald-600 animate-pulse" />
            <span>PostgreSQL 16 Live</span>
          </span>
          <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold font-mono">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            {patient.id}
          </span>
        </div>
      </div>

      {/* ── Real-Time Medical Summary & Doctor Allocation Status Card ── */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/40 shadow-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Stethoscope size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Medical Summary &amp; Doctor Allocation Status
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time clinical triage &amp; hospital review pipeline
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  currentStatus === 'Doctor Assigned'
                    ? 'success'
                    : currentStatus === 'Pending Hospital Review'
                    ? 'warning'
                    : 'default'
                }
                className="font-bold text-xs"
              >
                {currentStatus}
              </Badge>
              {allocationStatus?.summary_id && (
                <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {allocationStatus.summary_id}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {/* Stepper progress */}
          <div className="grid grid-cols-5 gap-1 pt-1 pb-3">
            {STAGES.map((stg, i) => {
              const isDone = i < currentStageIndex
              const isCurrent = i === currentStageIndex
              return (
                <div key={stg.id} className="flex flex-col items-center text-center">
                  <div className="w-full flex items-center">
                    <div className={`flex-1 h-1 ${i === 0 ? 'invisible' : isDone || isCurrent ? 'bg-blue-600' : 'bg-slate-200'}`} />
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isDone
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isDone ? <CheckCircle2 size={14} /> : i + 1}
                    </div>
                    <div className={`flex-1 h-1 ${i === STAGES.length - 1 ? 'invisible' : isDone ? 'bg-blue-600' : 'bg-slate-200'}`} />
                  </div>
                  <span className={`text-[11px] mt-2 font-medium leading-tight ${isCurrent ? 'text-blue-700 font-bold' : isDone ? 'text-slate-700' : 'text-slate-400'}`}>
                    {stg.label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Allocation Detail Block */}
          {allocationStatus?.doctor_name ? (
            <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <UserCheck size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-800">{allocationStatus.doctor_name}</h3>
                    <Badge variant="success" className="text-[10px]">Allocated</Badge>
                  </div>
                  <p className="text-xs font-medium text-emerald-700 mt-0.5">
                    {allocationStatus.doctor_specialty || 'Specialist'} · {allocationStatus.doctor_department || 'Outpatient Department'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <Building2 size={12} className="text-slate-400" />
                    <span>{allocationStatus.hospital_name || 'Hospital Network'}</span>
                    {allocationStatus.assignment_timestamp && (
                      <>
                        <span>•</span>
                        <Clock size={12} className="text-slate-400" />
                        <span>{new Date(allocationStatus.assignment_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate('/patient/my-case')}
                >
                  View Case Summary
                </Button>
              </div>
            </div>
          ) : allocationStatus?.status === 'Pending Hospital Review' ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
              <Clock size={18} className="text-amber-600 flex-shrink-0 mt-0.5 animate-spin" />
              <div className="text-xs">
                <p className="font-bold text-amber-900">
                  Case Under Hospital Review
                </p>
                <p className="text-amber-700 mt-0.5">
                  Your medical summary has been transmitted to {allocationStatus.hospital_name || 'the Hospital'}. Clinical staff is reviewing your symptoms and will allocate a specialist physician shortly.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">No active hospital submission. </span>
                Generate an AI-powered case summary before visiting the hospital.
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate('/patient/my-case')}
              >
                Start Case Intake →
              </Button>
            </div>
          )}
        </CardBody>
      </Card>


      {/* ── Quick action cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <div
              key={action.title}
              className={`bg-gradient-to-br ${action.gradient} rounded-card p-5 flex flex-col gap-3 shadow-card`}
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Icon size={20} className={action.textColor} />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold text-sm ${action.textColor}`}>{action.title}</h3>
                <p className={`text-xs mt-1 leading-relaxed ${action.descColor}`}>{action.description}</p>
              </div>
              <button
                onClick={() => navigate(action.to)}
                className={action.btnStyle}
              >
                {action.btnLabel}
              </button>
            </div>
          )
        })}
      </div>

      {/* ── Bottom two-column layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Activity — 2 cols wide */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Recent Medical Activity</h2>
              <Badge variant="blue">Updated Live</Badge>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <ul className="divide-y divide-slate-50">
              {recentActivity.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.id} className="flex items-start gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${item.iconBg}`}>
                      <Icon size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{item.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{item.sub}</p>
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5">{item.date}</span>
                  </li>
                )
              })}
            </ul>
          </CardBody>
        </Card>

        {/* Health Summary — 1 col */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-800">Health Summary</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {healthSummaryRows.map((row) => {
              const Icon = row.icon
              return (
                <div
                  key={row.label}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${row.color}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${row.iconClass}`}>
                      <Icon size={14} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{row.label}</span>
                  </div>
                  <span className={`text-lg font-bold ${row.valClass}`}>{row.value}</span>
                </div>
              )
            })}

            {/* PostgreSQL Clinical Detail Lists */}
            {patient.conditions?.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                  <span>Diagnosed Conditions</span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">patient_conditions</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {patient.conditions.map((c, i) => (
                    <span key={i} className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-md font-medium">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {patient.medications?.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                  <span>Active Medications</span>
                  <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-mono">patient_medications</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {patient.medications.map((m, i) => (
                    <span key={i} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md font-medium">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {patient.allergies?.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                  <span>Known Allergies</span>
                  <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-mono">patient_allergies</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {patient.allergies.map((a, i) => (
                    <span key={i} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md font-medium">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Vitals mini strip */}
            <div className="mt-2 pt-3 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Latest Vitals</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Blood Pressure', value: patient.vitals?.bp || '120/80', unit: 'mmHg', color: 'text-red-600' },
                  { label: 'Pulse',          value: patient.vitals?.pulse || 74,    unit: 'bpm',  color: 'text-blue-600' },
                  { label: 'SpO₂',          value: `${patient.vitals?.spo2 || 98}%`, unit: '',    color: 'text-emerald-600' },
                  { label: 'Weight',         value: patient.vitals?.weight || '70 kg', unit: '',   color: 'text-amber-600' },
                ].map((v) => (
                  <div key={v.label} className="bg-slate-50 rounded-lg px-2.5 py-2">
                    <p className="text-xs text-slate-500 truncate">{v.label}</p>
                    <p className={`font-bold text-sm ${v.color}`}>{v.value} <span className="text-xs font-normal text-slate-400">{v.unit}</span></p>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* ── Consent banner ── */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-card p-5 flex items-center justify-between gap-4 shadow-card">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Control who can access your health information</h3>
            <p className="text-blue-100 text-xs mt-0.5 leading-relaxed">
              You are in control — Grant, deny, or review access anytime. Your data stays yours.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/patient/consent')}
          className="flex-shrink-0 bg-white text-blue-700 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors whitespace-nowrap cursor-pointer"
        >
          Manage Consent
        </button>
      </div>
    </div>
  )
}
