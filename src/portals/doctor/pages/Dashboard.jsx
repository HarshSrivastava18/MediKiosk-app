import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Calendar,
  FileText,
  ArrowRightLeft,
  Activity,
  AlertTriangle,
  Search,
  TrendingUp,
  FlaskConical,
  RefreshCw,
  Clock,
  CheckCircle2,
  Stethoscope,
  Building2,
  FileCheck
} from 'lucide-react'
import StatCard from '../../../components/ui/StatCard'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Avatar from '../../../components/ui/Avatar'
import Table from '../../../components/ui/Table'
import { todaysCases as fallbackTodaysCases } from '../../../data/doctors'
import { patients } from '../../../data/patients'
import { useAuth } from '../../../context/AuthContext'
import { api } from '../../../lib/api'

const statusConfig = {
  'Assigned':        { variant: 'blue',    label: 'Assigned' },
  'In Consultation': { variant: 'purple',  label: 'In Consultation' },
  'Consultation':    { variant: 'purple',  label: 'In Consultation' },
  'Completed':       { variant: 'success', label: 'Completed' },
  'in-progress':     { variant: 'blue',    label: 'In Progress' },
  'waiting':         { variant: 'warning', label: 'Waiting' },
  'scheduled':       { variant: 'default', label: 'Scheduled' },
}

const quickSearchPatients = patients.slice(0, 5)

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [assignedCases, setAssignedCases] = useState([])
  const [loadingCases, setLoadingCases] = useState(true)
  const [activeTab, setActiveTab] = useState('all') // 'all', 'urgent', 'completed'

  const doctorName = user?.name || 'Dr. Sharma'
  const doctorId = user?.id || 'DOC-001'

  const fetchAssignments = async () => {
    setLoadingCases(true)
    try {
      const data = await api.doctor.getAssignments(doctorId)
      if (Array.isArray(data) && data.length > 0) {
        setAssignedCases(data)
      } else {
        // If no assignments returned, provide initial fallback or empty
        setAssignedCases([])
      }
    } catch (err) {
      console.warn('Could not fetch live doctor assignments, falling back:', err)
      setAssignedCases([])
    } finally {
      setLoadingCases(false)
    }
  }

  useEffect(() => {
    fetchAssignments()
  }, [doctorId])

  const handleCaseRowClick = (row) => {
    // Navigate with patient ID and pass summaryId / assignmentId in state or URL
    navigate(`/doctor/patient/${row.patient_id || row.patientId}`, {
      state: {
        assignmentId: row.assignment_id || row.assignmentId,
        summaryId: row.summary_id || row.summaryId
      }
    })
  }

  // Display items: combine live assignments (preferred) or mock cases if completely empty
  const displayCases = assignedCases.length > 0 ? assignedCases : fallbackTodaysCases.map(c => ({
    assignment_id: `ASN-MOCK-${c.id}`,
    summary_id: 'SUM-MOCK',
    patient_id: c.patientId,
    patient_name: c.patientName,
    chief_complaint: 'Routine follow-up / intake consultation',
    priority: c.redFlag ? 'Urgent' : 'Normal',
    status: c.status === 'in-progress' ? 'In Consultation' : (c.status === 'waiting' ? 'Assigned' : 'Scheduled'),
    assignment_timestamp: new Date().toISOString()
  }))

  const filteredCases = displayCases.filter(c => {
    if (activeTab === 'urgent') return (c.priority || '').toLowerCase() === 'urgent'
    if (activeTab === 'completed') return (c.status || '').toLowerCase() === 'completed'
    return true
  })

  const urgentCount = displayCases.filter(c => (c.priority || '').toLowerCase() === 'urgent').length
  const activeCount = displayCases.filter(c => ['assigned', 'in consultation', 'consultation'].includes((c.status || '').toLowerCase())).length

  const stats = [
    { label: "Assigned Patients", value: `${displayCases.length}`, icon: ClipboardList, color: 'blue', trend: 'up', trendLabel: `${urgentCount} urgent priority` },
    { label: 'Active In-Queue',    value: `${activeCount}`,         icon: Activity,      color: 'violet', trend: 'up', trendLabel: 'Pending review' },
    { label: 'OPD Patients',       value: '218',                     icon: Users,         color: 'emerald', trend: 'up', trendLabel: '+12 this week' },
    { label: 'IP Patients',        value: '48',                      icon: LayoutDashboard, color: 'slate', trend: 'down', trendLabel: '3 discharged today' },
    { label: 'Lab Tests Ordered',  value: '156',                     icon: FlaskConical,  color: 'blue',  trend: 'up', trendLabel: 'This month' },
    { label: 'Referrals Sent',     value: '12',                      icon: ArrowRightLeft, color: 'amber', trend: null },
    { label: 'Completed Today',    value: `${displayCases.filter(c => (c.status || '').toLowerCase() === 'completed').length || 4}`, icon: TrendingUp, color: 'emerald', trend: null },
  ]

  const caseColumns = [
    {
      key: 'assignment_timestamp',
      label: 'Assigned Time',
      width: '130px',
      render: (val) => {
        if (!val) return <span className="text-slate-400 text-xs">Today</span>
        try {
          const d = new Date(val)
          return (
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-700">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="text-[10px] text-slate-400">{d.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
            </div>
          )
        } catch {
          return <span className="text-xs text-slate-500">{val}</span>
        }
      }
    },
    {
      key: 'patient_name',
      label: 'Patient Name & ID',
      render: (val, row) => {
        const name = val || row.patientName || 'Unknown Patient'
        const pid = row.patient_id || row.patientId
        return (
          <div className="flex items-center gap-2.5">
            <Avatar name={name} size="sm" />
            <div>
              <p className="font-semibold text-slate-800 text-sm hover:text-brand-600 transition-colors">{name}</p>
              <p className="font-mono text-xs text-slate-400">{pid}</p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'chief_complaint',
      label: 'Chief Complaint / Allocation',
      render: (val, row) => (
        <div className="max-w-[240px]">
          <p className="text-xs font-medium text-slate-800 truncate" title={val || 'General Consultation'}>
            {val || 'General Consultation'}
          </p>
          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
            <Building2 size={10} />
            {row.hospital_name || 'City Hospital — Lucknow'}
          </p>
        </div>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      width: '110px',
      render: (val, row) => {
        const isUrgent = (val || '').toLowerCase() === 'urgent' || row.red_flags?.active || row.redFlag
        return isUrgent ? (
          <Badge variant="danger" className="animate-pulse flex items-center gap-1 w-fit">
            <AlertTriangle size={11} />
            Urgent
          </Badge>
        ) : (
          <Badge variant="default" className="text-slate-600">
            Normal
          </Badge>
        )
      }
    },
    {
      key: 'status',
      label: 'Status',
      width: '130px',
      render: (val) => {
        const cfg = statusConfig[val] || { variant: 'default', label: val || 'Assigned' }
        return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
      },
    },
    {
      key: 'actions',
      label: 'Action',
      width: '110px',
      render: (_, row) => (
        <Button
          variant="secondary"
          size="sm"
          className="text-xs py-1 px-2.5 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200"
          onClick={(e) => {
            e.stopPropagation()
            handleCaseRowClick(row)
          }}
        >
          <Stethoscope size={12} className="mr-1" />
          Review
        </Button>
      )
    }
  ]

  return (
    <div className="p-6 space-y-6">

      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Good morning, {doctorName} 👋</h1>
            <Badge variant="primary" className="text-xs font-mono">{doctorId}</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Today's Clinical Roster · City Hospital, Lucknow Branch · Connected to PostgreSQL
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchAssignments}
            disabled={loadingCases}
          >
            <RefreshCw size={14} className={loadingCases ? "animate-spin text-brand-600" : ""} />
            Refresh Cases
          </Button>
          <Button variant="primary" size="sm">
            <FileText size={14} />
            New Consultation
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-4">
        {stats.map(s => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            icon={s.icon}
            color={s.color}
            trend={s.trend}
            trendLabel={s.trendLabel}
          />
        ))}
      </div>

      {/* Main content row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Assigned Patients Table */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ClipboardList size={15} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Assigned Patient Queue</p>
                    <p className="text-xs text-slate-500">
                      {assignedCases.length > 0
                        ? `${assignedCases.length} patient(s) allocated by Hospital Administration`
                        : 'Scheduled patient consultations'}
                    </p>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({displayCases.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('urgent')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      activeTab === 'urgent' ? 'bg-white text-red-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Urgent ({urgentCount})
                  </button>
                  <button
                    onClick={() => setActiveTab('completed')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      activeTab === 'completed' ? 'bg-white text-emerald-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Completed
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <Table
                columns={caseColumns}
                data={filteredCases}
                onRowClick={handleCaseRowClick}
                emptyMessage={loadingCases ? "Loading assigned cases from database..." : "No patient assignments found matching current filter."}
              />
            </CardBody>
          </Card>
        </div>


        {/* Right sidebar panels */}
        <div className="flex flex-col gap-4">

          {/* Quick Patient Search */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Search size={15} className="text-emerald-600" />
                </div>
                <p className="font-semibold text-slate-800">Quick Patient Search</p>
              </div>
            </CardHeader>
            <CardBody className="space-y-1">
              {quickSearchPatients.map(patient => (
                <div
                  key={patient.id}
                  onClick={() => navigate(`/doctor/patient/${patient.id}`)}
                  className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <Avatar name={patient.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-slate-800 truncate group-hover:text-brand-600 transition-colors">{patient.name}</p>
                      {patient.redFlag?.active && <AlertTriangle size={11} className="text-red-500 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{patient.id} · {patient.age}y</p>
                  </div>
                  <Badge variant={patient.conditions.length > 0 ? 'warning' : 'success'} className="text-xs flex-shrink-0">
                    {patient.conditions.length} cond.
                  </Badge>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                  <Calendar size={15} className="text-violet-600" />
                </div>
                <p className="font-semibold text-slate-800">Upcoming Appointments</p>
              </div>
            </CardHeader>
            <CardBody className="space-y-2.5">
              {[
                { name: 'Rahul Kumar', time: '2:30 PM', type: 'Follow-up', flag: true },
                { name: 'Priya Sharma', time: '3:15 PM', type: 'OPD', flag: false },
                { name: 'Arjun Singh', time: '4:00 PM', type: 'Review', flag: false },
              ].map((appt, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Avatar name={appt.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{appt.name}</p>
                    <p className="text-xs text-slate-400">{appt.time} · {appt.type}</p>
                  </div>
                  {appt.flag && <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />}
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Referrals Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <ArrowRightLeft size={15} className="text-amber-600" />
                </div>
                <p className="font-semibold text-slate-800">Referrals</p>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              {[
                { label: 'Awaiting Action', count: 3, color: 'text-amber-600 bg-amber-50' },
                { label: 'Sent — Pending',  count: 5, color: 'text-blue-600 bg-blue-50' },
                { label: 'Completed',       count: 11, color: 'text-emerald-600 bg-emerald-50' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">{item.label}</p>
                  <span className={`text-sm font-bold px-2 py-0.5 rounded-lg ${item.color}`}>{item.count}</span>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-1" onClick={() => {}}>
                <ArrowRightLeft size={13} />
                Manage Referrals
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Recent Patients */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <Users size={15} className="text-slate-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Recent Patients</p>
                <p className="text-xs text-slate-500">Last seen by Dr. Sharma</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">View All Patients</Button>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <Table
            columns={[
              {
                key: 'name',
                label: 'Patient',
                render: (val, row) => (
                  <div className="flex items-center gap-2.5">
                    <Avatar name={val} size="sm" />
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{val}</p>
                      <p className="text-xs text-slate-400">{row.id}</p>
                    </div>
                  </div>
                ),
              },
              { key: 'age',      label: 'Age',      render: (val, row) => `${val}y · ${row.gender}` },
              { key: 'phone',    label: 'Phone' },
              { key: 'lastVisit', label: 'Last Visit' },
              {
                key: 'conditions',
                label: 'Conditions',
                render: (val) => (
                  <div className="flex flex-wrap gap-1">
                    {val.slice(0, 2).map(c => <Badge key={c} variant="default" className="text-xs">{c}</Badge>)}
                    {val.length > 2 && <Badge variant="default" className="text-xs">+{val.length - 2}</Badge>}
                  </div>
                ),
              },
              {
                key: 'redFlag',
                label: 'Status',
                render: (_, row) => row.redFlag?.active
                  ? <Badge variant="danger" dot>Red Flag</Badge>
                  : <Badge variant="success" dot>Normal</Badge>,
              },
            ]}
            data={patients}
            onRowClick={(row) => navigate(`/doctor/patient/${row.id}`)}
          />
        </CardBody>
      </Card>
    </div>
  )
}
