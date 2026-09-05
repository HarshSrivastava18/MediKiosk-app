import { useState, useEffect } from 'react'
import {
  Building2,
  Grid3X3,
  Stethoscope,
  Users,
  ChevronDown,
  ChevronRight,
  Activity,
  Bed,
  UserPlus,
  FlaskConical,
  ArrowRightLeft,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
  Eye,
  Search,
  X,
  Filter,
  Send,
  Sparkles
} from 'lucide-react'
import StatCard from '../../../components/ui/StatCard'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import { api } from '../../../lib/api'
import { hospitalBranches, hospitalDepartments } from '../../../data/hospitals'

const todayOverview = [
  { label: 'OPD Patients',       value: 218, icon: Activity,       color: 'blue',    trend: 'up',   trendLabel: '+12 vs yesterday' },
  { label: 'IP Patients',        value: 48,  icon: Bed,            color: 'violet',  trend: 'up',   trendLabel: '+3 vs yesterday' },
  { label: 'New Registrations',  value: 32,  icon: UserPlus,       color: 'emerald', trend: 'up',   trendLabel: '+8 vs yesterday' },
  { label: 'Lab Tests',          value: 156, icon: FlaskConical,   color: 'amber',   trend: 'down', trendLabel: '-5 vs yesterday' },
  { label: 'Referrals Sent',     value: 12,  icon: ArrowRightLeft, color: 'slate',   trend: null,   trendLabel: '' },
  { label: 'Referrals Received', value: 7,   icon: ArrowRightLeft, color: 'red',     trend: null,   trendLabel: '' },
]

const orgTree = [
  {
    id: 'root',
    label: 'City Hospital',
    type: 'hospital',
    children: [
      {
        id: 'br-lko',
        label: 'Lucknow Branch',
        type: 'branch',
        departments: [
          { name: 'Cardiology',  doctors: 5 },
          { name: 'Neurology',   doctors: 4 },
          { name: 'Emergency',   doctors: 3 },
        ],
      },
      {
        id: 'br-del',
        label: 'Delhi Branch',
        type: 'branch',
        departments: [
          { name: 'Orthopedics', doctors: 4 },
          { name: 'General Medicine', doctors: 2 },
        ],
      },
      {
        id: 'br-knp',
        label: 'Kanpur Branch',
        type: 'branch',
        departments: [
          { name: 'ENT',        doctors: 2 },
          { name: 'Pediatrics', doctors: 2 },
        ],
      },
    ],
  },
]

function OrgNode({ node, depth = 0 }) {
  const [open, setOpen] = useState(depth === 0)
  const hasDeps = node.departments && node.departments.length > 0
  const hasChildren = node.children && node.children.length > 0

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 w-full text-left hover:bg-slate-50 rounded-lg py-1.5 transition-colors"
        style={{ paddingLeft: `${depth * 16 + 8}px`, paddingRight: 8 }}
      >
        {(hasChildren || hasDeps) ? (
          open
            ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
            : <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
        ) : (
          <span className="w-3.5 flex-shrink-0" />
        )}
        {node.type === 'hospital' && <Activity size={14} className="text-emerald-600 flex-shrink-0" />}
        {node.type === 'branch' && <Building2 size={14} className="text-blue-500 flex-shrink-0" />}
        <span className={`text-sm font-medium ${
          node.type === 'hospital' ? 'text-emerald-700' : 'text-slate-700'
        }`}>
          {node.label}
        </span>
        {node.type === 'branch' && (
          <span className="ml-auto text-xs text-slate-400">{node.departments?.length} depts</span>
        )}
      </button>

      {open && hasChildren && node.children.map(child => (
        <OrgNode key={child.id} node={child} depth={depth + 1} />
      ))}

      {open && hasDeps && node.departments.map(dep => (
        <div
          key={dep.name}
          className="flex items-center gap-2 py-1 hover:bg-slate-50 rounded-lg transition-colors"
          style={{ paddingLeft: `${(depth + 1) * 16 + 8}px`, paddingRight: 8 }}
        >
          <span className="w-3.5 flex-shrink-0" />
          <Grid3X3 size={13} className="text-violet-400 flex-shrink-0" />
          <span className="text-sm text-slate-600">{dep.name}</span>
          <span className="ml-auto text-xs text-slate-400">{dep.doctors} drs</span>
        </div>
      ))}
    </div>
  )
}

export default function HospitalDashboard() {
  const [summaries, setSummaries] = useState([])
  const [loadingSummaries, setLoadingSummaries] = useState(true)
  const [filterStatus, setFilterStatus] = useState('pending') // 'pending', 'assigned', 'all'
  const [reviewModalSummary, setReviewModalSummary] = useState(null)
  const [assignModalSummary, setAssignModalSummary] = useState(null)

  const [doctorsList, setDoctorsList] = useState([])
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [assignNotes, setAssignNotes] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)
  const [actionMessage, setActionMessage] = useState(null)

  const fetchSummaries = async () => {
    try {
      const data = await api.hospital.getSummaries(filterStatus)
      setSummaries(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Failed to load patient summaries:', e)
    } finally {
      setLoadingSummaries(false)
    }
  }

  const fetchDoctors = async () => {
    setLoadingDoctors(true)
    try {
      const docs = await api.hospital.getDoctors()
      setDoctorsList(Array.isArray(docs) ? docs : [])
      if (docs?.length > 0 && !selectedDoctorId) {
        setSelectedDoctorId(docs[0].staff_id)
      }
    } catch (e) {
      console.error('Failed to load hospital doctors:', e)
    } finally {
      setLoadingDoctors(false)
    }
  }

  useEffect(() => {
    fetchSummaries()
    const timer = setInterval(fetchSummaries, 6000)
    return () => clearInterval(timer)
  }, [filterStatus])

  const handleOpenAssignModal = (summary) => {
    setAssignModalSummary(summary)
    fetchDoctors()
  }

  const handleConfirmAssignment = async () => {
    if (!assignModalSummary || !selectedDoctorId) return
    setIsAssigning(true)
    try {
      const assignment = await api.hospital.assignDoctor(
        assignModalSummary.summary_id,
        selectedDoctorId,
        assignNotes
      )
      setActionMessage({
        type: 'success',
        text: `Doctor ${assignment.doctor_name} (${assignment.doctor_specialty}) successfully allocated to patient ${assignModalSummary.patient_name}!`
      })
      setAssignModalSummary(null)
      if (reviewModalSummary && reviewModalSummary.summary_id === assignModalSummary.summary_id) {
        setReviewModalSummary({
          ...reviewModalSummary,
          status: 'Doctor Assigned',
          assignment
        })
      }
      fetchSummaries()
    } catch (err) {
      console.error('Doctor allocation failed:', err)
      setActionMessage({
        type: 'error',
        text: err.message || 'Failed to allocate doctor.'
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const pendingCount = summaries.filter(s => s.status === 'Pending Hospital Review').length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">City Hospital — Lucknow</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Hospital Administration &amp; Clinical Allocation ·{' '}
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="active" dot>PostgreSQL 16 Live</Badge>
          <span className="font-mono text-xs text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-md">
            ORG-001
          </span>
        </div>
      </div>

      {actionMessage && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between shadow-xs ${
          actionMessage.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2.5">
            {actionMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending Triage" value={pendingCount} icon={Clock} color="amber" trend="up" trendLabel="Awaiting doctor allocation" />
        <StatCard label="Departments" value={11} icon={Grid3X3} color="violet" trend="up" trendLabel="Across all branches" />
        <StatCard label="Active Doctors" value={24} icon={Stethoscope} color="emerald" trend="up" trendLabel="Clinical staff available" />
        <StatCard label="Total Staff" value={156} icon={Users} color="blue" trend="up" trendLabel="+8 this month" />
      </div>

      {/* ── PATIENT SUMMARIES & DOCTOR ALLOCATION WORKFLOW SECTION ── */}
      <Card className="border-slate-200 shadow-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-800">Patient Medical Summaries Queue</h2>
                  {pendingCount > 0 && (
                    <Badge variant="danger" className="text-[11px] animate-pulse">
                      {pendingCount} Pending Review
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Real-time patient checkup summaries submitted to this hospital for physician allocation
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  filterStatus === 'pending'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending Review ({pendingCount})
              </button>
              <button
                onClick={() => setFilterStatus('assigned')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  filterStatus === 'assigned'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Doctor Assigned
              </button>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  filterStatus === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Summaries
              </button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Summary ID &amp; Chief Complaint</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Doctor</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loadingSummaries ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                      <Clock size={20} className="mx-auto mb-2 animate-spin text-slate-400" />
                      Loading patient summaries from PostgreSQL...
                    </td>
                  </tr>
                ) : summaries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                      No patient medical summaries found for the selected filter.
                    </td>
                  </tr>
                ) : (
                  summaries.map((s) => {
                    const isUrgent = s.priority === 'Urgent' || s.red_flags?.active
                    const isPending = s.status === 'Pending Hospital Review'
                    return (
                      <tr key={s.summary_id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold text-slate-800">{s.patient_name}</p>
                            <p className="text-xs text-slate-400 font-mono">{s.patient_id}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div>
                            <span className="text-xs font-mono font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                              {s.summary_id}
                            </span>
                            <p className="text-xs text-slate-700 mt-1 font-medium truncate" title={s.chief_complaint}>
                              {s.chief_complaint}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-500">
                          {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          }) : 'Recent'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <Badge variant={isUrgent ? 'danger' : 'success'} className="font-semibold text-xs">
                            {isUrgent ? 'Urgent' : 'Normal'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <Badge variant={isPending ? 'warning' : 'success'} dot className="text-xs">
                            {s.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {s.assignment?.doctor_name ? (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                              <UserCheck size={13} className="text-emerald-600" />
                              <span>{s.assignment.doctor_name} ({s.assignment.doctor_specialty || s.assignment.doctor_department})</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Unallocated</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setReviewModalSummary(s)}
                          >
                            <Eye size={13} />
                            Review
                          </Button>
                          <Button
                            size="sm"
                            variant={isPending ? 'primary' : 'outline'}
                            onClick={() => handleOpenAssignModal(s)}
                          >
                            <UserCheck size={13} />
                            {s.assignment ? 'Re-assign' : 'Assign Doctor'}
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* ── SUMMARY REVIEW MODAL ── */}
      {reviewModalSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Patient Clinical Intake Review
                  </h3>
                  <Badge variant={reviewModalSummary.priority === 'Urgent' ? 'danger' : 'success'}>
                    {reviewModalSummary.priority} Priority
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Summary ID: <span className="font-mono font-bold text-slate-700">{reviewModalSummary.summary_id}</span> · Target Hospital: {reviewModalSummary.hospital_name}
                </p>
              </div>
              <button
                onClick={() => setReviewModalSummary(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-sm">
              {/* Red Flag Alert */}
              {reviewModalSummary.red_flags?.active && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={18} className="text-red-600" />
                    <p className="text-xs font-bold uppercase tracking-wider text-red-800">
                      Rule-Based Clinical Red Flag: {reviewModalSummary.red_flags.title}
                    </p>
                  </div>
                  <p className="text-xs text-red-700 font-medium">
                    {reviewModalSummary.red_flags.description}
                  </p>
                </div>
              )}

              {/* Patient Profile */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Patient Name</p>
                  <p className="text-slate-800 font-bold text-sm mt-0.5">{reviewModalSummary.patient_name}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Patient ID</p>
                  <p className="text-slate-800 font-mono font-medium mt-0.5">{reviewModalSummary.patient_id}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Age / Gender</p>
                  <p className="text-slate-800 font-medium mt-0.5">{reviewModalSummary.patient_age || '33 yrs'} · {reviewModalSummary.patient_gender || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Contact</p>
                  <p className="text-slate-800 font-medium mt-0.5">{reviewModalSummary.contact_phone || 'N/A'}</p>
                </div>
              </div>

              {/* Chief Complaint */}
              <div className="border border-slate-200 rounded-xl p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Chief Complaint &amp; Severity
                </p>
                <p className="text-slate-800 font-semibold text-base">{reviewModalSummary.chief_complaint}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                  <span>Duration: <strong>{reviewModalSummary.duration || '2 days'}</strong></span>
                  <span>•</span>
                  <span>Pain Score: <strong>{reviewModalSummary.pain_score || 6}/10 ({reviewModalSummary.severity_label || 'Moderate'})</strong></span>
                </div>
              </div>

              {/* Reported Symptoms */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Reported Symptoms &amp; Probing
                </p>
                <div className="flex flex-wrap gap-2">
                  {(reviewModalSummary.symptoms || []).map((symp, i) => (
                    <span key={i} className="bg-violet-50 text-violet-800 border border-violet-200 px-3 py-1 rounded-lg text-xs font-semibold">
                      {symp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Medical History & Meds */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Medical History</p>
                  <ul className="text-xs text-slate-700 space-y-1">
                    {(reviewModalSummary.medical_history || []).map((h, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Active Medications</p>
                  <ul className="text-xs text-slate-700 space-y-1">
                    {(reviewModalSummary.current_medications || []).map((m, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Known Allergies</p>
                  <ul className="text-xs text-slate-700 space-y-1">
                    {(reviewModalSummary.allergies || []).map((a, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Uploaded Documents */}
              {(reviewModalSummary.uploaded_documents || []).length > 0 && (
                <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200 text-xs">
                  <p className="font-bold text-amber-900 uppercase tracking-wider text-[10px] mb-1">
                    Uploaded Medical Documents &amp; Reports
                  </p>
                  <p className="text-slate-700">
                    {reviewModalSummary.uploaded_documents.map(d => d.name || d).join(', ')}
                  </p>
                </div>
              )}

              {/* AI Generated Intake Summary / SOAP */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-blue-600" />
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    AI Clinical Synthesis &amp; Physician SOAP Notes
                  </p>
                </div>
                {reviewModalSummary.soap ? (
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <p><strong>[S] Subjective:</strong> {reviewModalSummary.soap.subjective}</p>
                    <p><strong>[O] Objective:</strong> {reviewModalSummary.soap.objective}</p>
                    <p><strong>[A] Assessment:</strong> {reviewModalSummary.soap.assessment}</p>
                    <p><strong>[P] Plan:</strong> {reviewModalSummary.soap.plan?.join(' ')}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-700">{reviewModalSummary.ai_summary || 'No additional SOAP synthesized.'}</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <Button variant="secondary" onClick={() => setReviewModalSummary(null)}>
                Close Review
              </Button>
              <div className="flex items-center gap-3">
                {reviewModalSummary.assignment ? (
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 size={15} />
                    Assigned to {reviewModalSummary.assignment.doctor_name}
                  </span>
                ) : (
                  <span className="text-xs text-amber-600 font-medium">Doctor not yet allocated</span>
                )}
                <Button
                  variant="primary"
                  onClick={() => {
                    handleOpenAssignModal(reviewModalSummary)
                  }}
                >
                  <UserCheck size={15} />
                  {reviewModalSummary.assignment ? 'Change Assigned Doctor' : 'Assign Doctor Now'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DOCTOR ALLOCATION MODAL ── */}
      {assignModalSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Allocate Doctor to Patient
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Patient: <strong className="text-slate-700">{assignModalSummary.patient_name}</strong> · Priority: <span className={assignModalSummary.priority === 'Urgent' ? 'text-red-600 font-bold' : 'text-emerald-700 font-bold'}>{assignModalSummary.priority}</span>
                </p>
              </div>
              <button
                onClick={() => setAssignModalSummary(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Doctors list */}
            <div className="p-5 overflow-y-auto space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
                  Select Specialist Doctor ({doctorsList.length} Available at this Hospital)
                </label>
                {loadingDoctors ? (
                  <p className="text-xs text-slate-400 text-center py-4">Loading available hospital doctors...</p>
                ) : doctorsList.length === 0 ? (
                  <p className="text-xs text-red-500 text-center py-4">No active doctors registered for this hospital.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {doctorsList.map((doc) => {
                      const isSelected = selectedDoctorId === doc.staff_id
                      return (
                        <div
                          key={doc.staff_id}
                          onClick={() => setSelectedDoctorId(doc.staff_id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-brand-600 bg-blue-50/70 ring-2 ring-brand-500/20 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="selectedDoctor"
                              checked={isSelected}
                              onChange={() => setSelectedDoctorId(doc.staff_id)}
                              className="text-brand-600 focus:ring-brand-500"
                            />
                            <div>
                              <p className="text-sm font-bold text-slate-800">{doc.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {doc.specialty || doc.department} · {doc.experience}y exp · ★ {doc.rating}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              doc.status === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {doc.status}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Workload: <strong>{doc.active_workload} active cases</strong>
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Assignment Notes */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                  Clinical Intake Notes (Optional)
                </label>
                <textarea
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="e.g. Urgent ECG needed, priority review upon arrival..."
                  rows={2}
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <Button variant="secondary" onClick={() => setAssignModalSummary(null)} disabled={isAssigning}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmAssignment}
                disabled={isAssigning || !selectedDoctorId}
                className="gap-2"
              >
                <UserCheck size={16} />
                {isAssigning ? 'Allocating...' : 'Confirm Doctor Allocation'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Today's Overview */}
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-3">Today's Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {todayOverview.map(item => (
            <StatCard
              key={item.label}
              label={item.label}
              value={item.value}
              icon={item.icon}
              color={item.color}
              trend={item.trend}
              trendLabel={item.trendLabel}
            />
          ))}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Org tree */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-700">Organisation Structure</h3>
              <span className="text-xs text-slate-400">City Hospital Network</span>
            </div>
          </CardHeader>
          <CardBody className="py-2">
            {orgTree.map(node => (
              <OrgNode key={node.id} node={node} />
            ))}
          </CardBody>
        </Card>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-slate-700">Branch OPD Today</h3>
            </CardHeader>
            <CardBody className="space-y-4 py-3">
              {hospitalBranches.map(branch => {
                const pct = Math.round((branch.opd / 300) * 100)
                return (
                  <div key={branch.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{branch.name}</span>
                      <span className="text-sm font-bold text-emerald-600">{branch.opd}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{branch.location}</p>
                  </div>
                )
              })}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-slate-700">Department Activity</h3>
            </CardHeader>
            <CardBody className="p-0">
              {hospitalDepartments.map(dept => (
                <div key={dept.id} className="flex items-center justify-between px-5 py-2.5 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{dept.name}</p>
                    <p className="text-xs text-slate-400">{dept.branch}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{dept.doctors} drs</span>
                    <Badge variant="active" dot>Active</Badge>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
