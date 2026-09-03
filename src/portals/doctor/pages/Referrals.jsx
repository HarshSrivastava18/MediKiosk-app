import { useState } from 'react'
import {
  ArrowRightLeft,
  Plus,
  Search,
  Eye,
  Calendar,
  Hospital,
  User,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
} from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Avatar from '../../../components/ui/Avatar'
import Table from '../../../components/ui/Table'

const sentReferrals = [
  {
    id: 'REF-001',
    date: '28 Aug 2026',
    patientName: 'Rahul Kumar',
    patientId: 'MK-8472-9812-3345',
    referredTo: 'KGMU, Lucknow',
    referredDoctor: 'Dr. Patel (Neurology)',
    specialty: 'Neurology',
    reason: 'Chest pain evaluation, possible cardiac origin',
    status: 'pending',
    urgency: 'high',
  },
  {
    id: 'REF-002',
    date: '25 Aug 2026',
    patientName: 'Priya Sharma',
    patientId: 'MK-3310-5521-9981',
    referredTo: 'Apollo Hospital, Lucknow',
    referredDoctor: 'Dr. Mehta (Endocrinology)',
    specialty: 'Endocrinology',
    reason: 'Uncontrolled Type 2 Diabetes, specialist review',
    status: 'accepted',
    urgency: 'moderate',
  },
  {
    id: 'REF-003',
    date: '20 Aug 2026',
    patientName: 'Arjun Singh',
    patientId: 'MK-7890-2233-1156',
    referredTo: 'City Hospital, Lucknow',
    referredDoctor: 'Dr. Gupta (Pulmonology)',
    specialty: 'Pulmonology',
    reason: 'COPD exacerbation management',
    status: 'completed',
    urgency: 'moderate',
  },
  {
    id: 'REF-004',
    date: '15 Aug 2026',
    patientName: 'Meera Joshi',
    patientId: 'MK-4421-6678-2290',
    referredTo: 'Medanta, Lucknow',
    referredDoctor: 'Dr. Singh (Cardiology)',
    specialty: 'Cardiology',
    reason: 'Palpitations, atrial fibrillation workup',
    status: 'completed',
    urgency: 'high',
  },
  {
    id: 'REF-005',
    date: '10 Aug 2026',
    patientName: 'Sanjay Verma',
    patientId: 'MK-5512-8899-3301',
    referredTo: 'Ram Manohar Lohia Hospital',
    referredDoctor: 'Dr. Rao (Nephrology)',
    specialty: 'Nephrology',
    reason: 'Elevated creatinine, renal function assessment',
    status: 'rejected',
    urgency: 'low',
  },
]

const receivedReferrals = [
  {
    id: 'REF-IN-001',
    date: '01 Sep 2026',
    patientName: 'Karan Kapoor',
    patientId: 'MK-9911-3322-5511',
    referredFrom: 'Dr. Ravi Kumar (GP), Lucknow',
    fromHospital: 'Sanjivani Clinic',
    specialty: 'Cardiology',
    reason: 'Chest pain + ECG changes, cardiology opinion needed',
    status: 'pending',
    urgency: 'high',
  },
  {
    id: 'REF-IN-002',
    date: '29 Aug 2026',
    patientName: 'Sunita Devi',
    patientId: 'MK-8822-4433-6611',
    referredFrom: 'Dr. Anita Joshi (Internal Medicine)',
    fromHospital: 'Gomti Medical Centre',
    specialty: 'Cardiology',
    reason: 'Hypertension management, suspected secondary cause',
    status: 'accepted',
    urgency: 'moderate',
  },
  {
    id: 'REF-IN-003',
    date: '22 Aug 2026',
    patientName: 'Vinod Kumar',
    patientId: 'MK-7733-5544-7722',
    referredFrom: 'Dr. Pradeep Singh (Emergency)',
    fromHospital: 'City Hospital, Lucknow',
    specialty: 'Cardiology',
    reason: 'Post-MI follow-up, 3 months',
    status: 'completed',
    urgency: 'low',
  },
  {
    id: 'REF-IN-004',
    date: '18 Aug 2026',
    patientName: 'Ananya Mishra',
    patientId: 'MK-6644-6655-8833',
    referredFrom: 'Dr. Kumar (Gynaecology)',
    fromHospital: 'Sahara Hospital, Lucknow',
    specialty: 'Cardiology',
    reason: 'Peripartum cardiomyopathy screening',
    status: 'pending',
    urgency: 'moderate',
  },
]

const statusConfig = {
  pending:   { variant: 'warning', label: 'Pending',   icon: Clock },
  accepted:  { variant: 'blue',    label: 'Accepted',  icon: CheckCircle },
  completed: { variant: 'success', label: 'Completed', icon: CheckCircle },
  rejected:  { variant: 'danger',  label: 'Rejected',  icon: XCircle },
}

const urgencyConfig = {
  high:     { variant: 'danger',  label: 'High' },
  moderate: { variant: 'warning', label: 'Moderate' },
  low:      { variant: 'default', label: 'Low' },
}

function ReferralTable({ data, type }) {
  const columns = [
    {
      key: 'date',
      label: 'Date',
      width: '100px',
      render: (val) => <span className="text-xs text-slate-500">{val}</span>,
    },
    {
      key: 'patientName',
      label: 'Patient',
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={val} size="sm" />
          <div>
            <p className="font-semibold text-slate-800 text-sm">{val}</p>
            <p className="text-xs text-slate-400 font-mono">{row.patientId}</p>
          </div>
        </div>
      ),
    },
    {
      key: type === 'sent' ? 'referredTo' : 'fromHospital',
      label: type === 'sent' ? 'Referred To' : 'Referred From',
      render: (val, row) => (
        <div>
          <p className="text-sm font-medium text-slate-800">{val}</p>
          <p className="text-xs text-slate-400">{type === 'sent' ? row.referredDoctor : row.referredFrom}</p>
        </div>
      ),
    },
    {
      key: 'specialty',
      label: 'Specialty',
      render: (val) => <Badge variant="purple">{val}</Badge>,
    },
    {
      key: 'urgency',
      label: 'Urgency',
      render: (val) => {
        const cfg = urgencyConfig[val] || urgencyConfig.low
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        const cfg = statusConfig[val] || statusConfig.pending
        return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
      },
    },
    {
      key: 'id',
      label: 'Action',
      render: () => (
        <Button variant="secondary" size="sm">
          <Eye size={12} />
          View
        </Button>
      ),
    },
  ]

  return <Table columns={columns} data={data} emptyMessage="No referrals found" />
}

function NewReferralModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-card-lg border border-slate-100 w-full max-w-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
              <ArrowRightLeft size={14} className="text-brand-600" />
            </div>
            <p className="font-semibold text-slate-800">New Referral</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <XCircle size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {[
            { label: 'Patient Name / ID', placeholder: 'Search patient...' },
            { label: 'Refer To (Hospital / Clinic)', placeholder: 'Hospital name...' },
            { label: 'Refer To Doctor', placeholder: 'Doctor name / specialty...' },
            { label: 'Reason for Referral', placeholder: 'Clinical reason...' },
          ].map(field => (
            <div key={field.label}>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">{field.label}</label>
              <input
                type="text"
                placeholder={field.placeholder}
                className="w-full text-sm text-slate-700 placeholder-slate-400 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition"
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Urgency</label>
            <div className="flex gap-2">
              {['High', 'Moderate', 'Low'].map(u => (
                <button key={u} className="flex-1 py-2 text-sm font-medium rounded-lg border border-slate-200 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 transition-colors">
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onClose}>
            <ArrowRightLeft size={13} />
            Send Referral
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function Referrals() {
  const [activeTab, setActiveTab] = useState('sent')
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')

  const sentFiltered = sentReferrals.filter(r =>
    !search || r.patientName.toLowerCase().includes(search.toLowerCase())
  )
  const receivedFiltered = receivedReferrals.filter(r =>
    !search || r.patientName.toLowerCase().includes(search.toLowerCase())
  )

  const pendingReceived = receivedReferrals.filter(r => r.status === 'pending').length

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Referrals</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage outgoing and incoming patient referrals</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <Plus size={15} />
          New Referral
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Sent',         value: sentReferrals.length,                                  color: 'bg-blue-50 border-blue-100 text-blue-700' },
          { label: 'Pending Action',     value: sentReferrals.filter(r => r.status === 'pending').length,  color: 'bg-amber-50 border-amber-100 text-amber-700' },
          { label: 'Received',           value: receivedReferrals.length,                              color: 'bg-violet-50 border-violet-100 text-violet-700' },
          { label: 'Awaiting Review',    value: pendingReceived,                                       color: 'bg-red-50 border-red-100 text-red-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-card border p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium opacity-75 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Tabs */}
            <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              {[
                { key: 'sent',     label: 'Sent Referrals',     count: sentReferrals.length },
                { key: 'received', label: 'Received Referrals', count: receivedReferrals.length },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-white text-brand-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === tab.key ? 'bg-brand-100 text-brand-700' : 'bg-slate-200 text-slate-500'
                  }`}>{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-xs">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patient..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition"
                />
              </div>
              <Button variant="secondary" size="sm">
                <Filter size={13} />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {activeTab === 'sent' ? (
            <ReferralTable data={sentFiltered} type="sent" />
          ) : (
            <ReferralTable data={receivedFiltered} type="received" />
          )}
        </CardBody>
      </Card>

      {showModal && <NewReferralModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
