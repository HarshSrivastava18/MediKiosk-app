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
} from 'lucide-react'
import StatCard from '../../../components/ui/StatCard'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Avatar from '../../../components/ui/Avatar'
import Table from '../../../components/ui/Table'
import { todaysCases } from '../../../data/doctors'
import { patients } from '../../../data/patients'

const stats = [
  { label: "Today's Cases",      value: '8',   icon: ClipboardList, color: 'blue',   trend: 'up',   trendLabel: '2 more than yesterday' },
  { label: 'OPD Patients',       value: '218', icon: Users,         color: 'emerald', trend: 'up',  trendLabel: '+12 this week' },
  { label: 'IP Patients',        value: '48',  icon: Activity,      color: 'violet', trend: 'down', trendLabel: '3 discharged today' },
  { label: 'New Registrations',  value: '32',  icon: LayoutDashboard, color: 'amber', trend: 'up',  trendLabel: 'This week' },
  { label: 'Lab Tests',          value: '156', icon: FlaskConical,  color: 'slate',  trend: 'up',   trendLabel: 'Ordered this month' },
  { label: 'Referrals Sent',     value: '12',  icon: ArrowRightLeft, color: 'blue',  trend: null },
  { label: 'Referrals Received', value: '7',   icon: TrendingUp,    color: 'emerald', trend: null },
]

const statusConfig = {
  'in-progress': { variant: 'blue',    label: 'In Progress' },
  'waiting':     { variant: 'warning', label: 'Waiting' },
  'scheduled':   { variant: 'default', label: 'Scheduled' },
}

const caseColumns = [
  { key: 'time',        label: 'Time',         width: '90px' },
  {
    key: 'patientName',
    label: 'Patient Name',
    render: (val, row) => (
      <div className="flex items-center gap-2.5">
        <Avatar name={val} size="sm" />
        <div>
          <p className="font-semibold text-slate-800 text-sm">{val}</p>
          <p className="text-xs text-slate-400">{row.patientId}</p>
        </div>
      </div>
    ),
  },
  { key: 'patientId',   label: 'Patient ID',   render: (val) => <span className="font-mono text-xs text-slate-500">{val}</span> },
  {
    key: 'type',
    label: 'Type',
    render: (val) => (
      <Badge variant={val === 'OPD' ? 'primary' : 'purple'}>{val}</Badge>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    render: (val) => {
      const cfg = statusConfig[val] || statusConfig['scheduled']
      return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
    },
  },
  {
    key: 'redFlag',
    label: 'Red Flag',
    render: (val) => val ? (
      <div className="flex items-center gap-1.5 text-red-600 font-semibold text-xs">
        <AlertTriangle size={13} className="animate-pulse" />
        Red Flag
      </div>
    ) : (
      <span className="text-slate-300 text-xs">—</span>
    ),
  },
]

const quickSearchPatients = patients.slice(0, 5)

export default function DoctorDashboard() {
  const navigate = useNavigate()

  const handleCaseRowClick = (row) => {
    navigate(`/doctor/patient/${row.patientId}`)
  }

  return (
    <div className="p-6 space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Good morning, Dr. Sharma 👋</h1>
          <p className="text-sm text-slate-500 mt-0.5">Wednesday, 2 Sep 2026 · City Hospital, Lucknow Branch</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Calendar size={14} />
            View Schedule
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

        {/* Today's Cases Table */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ClipboardList size={15} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Today's Cases</p>
                    <p className="text-xs text-slate-500">{todaysCases.length} patients scheduled</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <Table
                columns={caseColumns}
                data={todaysCases}
                onRowClick={handleCaseRowClick}
                emptyMessage="No cases scheduled for today"
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
