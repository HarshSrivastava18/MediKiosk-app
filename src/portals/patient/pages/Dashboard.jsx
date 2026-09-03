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
} from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Avatar from '../../../components/ui/Avatar'
import { patients } from '../../../data/patients'

const patient = patients[0]

const quickActions = [
  {
    title: 'Get My Case Prepared',
    description: 'AI-powered case preparation for your next hospital visit',
    icon: Zap,
    gradient: 'from-blue-600 to-blue-700',
    textColor: 'text-white',
    descColor: 'text-blue-100',
    btnLabel: 'Start Now →',
    btnStyle: 'bg-white text-blue-700 hover:bg-blue-50 font-semibold px-4 py-1.5 rounded-lg text-sm transition-colors',
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
    btnStyle: 'bg-white text-emerald-700 hover:bg-emerald-50 font-semibold px-4 py-1.5 rounded-lg text-sm transition-colors',
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
    btnStyle: 'bg-white text-violet-700 hover:bg-violet-50 font-semibold px-4 py-1.5 rounded-lg text-sm transition-colors',
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
    btnStyle: 'bg-white text-amber-700 hover:bg-amber-50 font-semibold px-4 py-1.5 rounded-lg text-sm transition-colors',
    to: '/patient/hospital-visits',
  },
]

const healthSummaryRows = [
  { label: 'Conditions',  value: patient.conditions.length,  color: 'bg-red-50 border-red-200',    icon: Heart,     iconClass: 'text-red-500 bg-red-100',    valClass: 'text-red-700' },
  { label: 'Medications', value: patient.medications.length, color: 'bg-blue-50 border-blue-200',  icon: Pill,      iconClass: 'text-blue-500 bg-blue-100',  valClass: 'text-blue-700' },
  { label: 'Allergies',   value: patient.allergies.length,   color: 'bg-amber-50 border-amber-200',icon: AlertTriangle, iconClass: 'text-amber-500 bg-amber-100', valClass: 'text-amber-700' },
  { label: 'Surgeries',   value: 0,                          color: 'bg-slate-50 border-slate-200',icon: Activity,  iconClass: 'text-slate-400 bg-slate-100', valClass: 'text-slate-600' },
]

const recentActivity = [
  { id: 1, icon: FlaskConical, iconBg: 'bg-amber-100 text-amber-600', label: 'Blood Report uploaded',           date: '02 Jun 2026', sub: 'Lab — City Hospital, Lucknow' },
  { id: 2, icon: FileText,     iconBg: 'bg-violet-100 text-violet-600', label: 'Prescription uploaded',          date: '10 Feb 2026', sub: 'Amlodipine 5mg renewed' },
  { id: 3, icon: Building2,    iconBg: 'bg-blue-100 text-blue-600',   label: 'Hospital visit — Chest pain',     date: '15 Jul 2026', sub: 'City Hospital, Lucknow' },
  { id: 4, icon: Zap,          iconBg: 'bg-emerald-100 text-emerald-600', label: 'AI case generated',            date: '15 Jul 2026', sub: 'Chief complaint: Chest pain + Breathlessness' },
  { id: 5, icon: Activity,     iconBg: 'bg-blue-100 text-blue-600',   label: 'Follow-up visit — Hypertension',  date: '18 Apr 2026', sub: 'City Hospital, Lucknow' },
]

export default function PatientDashboard() {
  const navigate = useNavigate()

  return (
    <div className="p-6 space-y-6">

      {/* ── Greeting row ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Good Morning, Rahul 👋</h1>
          <p className="text-slate-500 text-sm mt-1">Here's your health summary for today.</p>
        </div>
        <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
          MK-8472-9812-3345
        </span>
      </div>

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
              <h2 className="text-sm font-semibold text-slate-800">Recent Activity</h2>
              <Badge variant="blue">Last 90 days</Badge>
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

            {/* Vitals mini strip */}
            <div className="mt-2 pt-3 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Latest Vitals</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Blood Pressure', value: patient.vitals.bp, unit: 'mmHg', color: 'text-red-600' },
                  { label: 'Pulse',          value: patient.vitals.pulse, unit: 'bpm', color: 'text-blue-600' },
                  { label: 'SpO₂',          value: `${patient.vitals.spo2}%`, unit: '', color: 'text-emerald-600' },
                  { label: 'Weight',         value: patient.vitals.weight, unit: '', color: 'text-amber-600' },
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
          className="flex-shrink-0 bg-white text-blue-700 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors whitespace-nowrap"
        >
          Manage Consent
        </button>
      </div>
    </div>
  )
}
