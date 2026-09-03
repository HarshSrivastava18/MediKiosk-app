import { useState } from 'react'
import { Plus, Search, Clock, CheckCircle2, Loader2, UserCheck } from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Avatar from '../../../components/ui/Avatar'
import StatCard from '../../../components/ui/StatCard'

const opdQueue = [
  { token: 'T-001', name: 'Rahul Kumar',   doctor: 'Dr. Sharma', department: 'Cardiology', time: '09:15 AM', status: 'done' },
  { token: 'T-002', name: 'Priya Mehta',   doctor: 'Dr. Patel',  department: 'Neurology',  time: '09:30 AM', status: 'done' },
  { token: 'T-003', name: 'Arjun Singh',   doctor: 'Dr. Sharma', department: 'Cardiology', time: '09:45 AM', status: 'done' },
  { token: 'T-004', name: 'Anita Gupta',   doctor: 'Dr. Mehta',  department: 'Emergency',  time: '10:00 AM', status: 'in-progress' },
  { token: 'T-005', name: 'Suresh Verma',  doctor: 'Dr. Patel',  department: 'Neurology',  time: '10:15 AM', status: 'waiting' },
  { token: 'T-006', name: 'Meera Joshi',   doctor: 'Dr. Sharma', department: 'Cardiology', time: '10:30 AM', status: 'waiting' },
  { token: 'T-007', name: 'Deepak Tiwari', doctor: 'Dr. Mehta',  department: 'Emergency',  time: '10:45 AM', status: 'waiting' },
  { token: 'T-008', name: 'Kavita Sinha',  doctor: 'Dr. Patel',  department: 'Neurology',  time: '11:00 AM', status: 'waiting' },
  { token: 'T-009', name: 'Ravi Pandey',   doctor: 'Dr. Sharma', department: 'Cardiology', time: '11:15 AM', status: 'waiting' },
  { token: 'T-010', name: 'Geeta Mishra',  doctor: 'Dr. Mehta',  department: 'Emergency',  time: '11:30 AM', status: 'waiting' },
]

const statusConfig = {
  'done':        { label: 'Done',        variant: 'success', icon: CheckCircle2, iconColor: 'text-emerald-500' },
  'in-progress': { label: 'In Progress', variant: 'primary', icon: Loader2,     iconColor: 'text-blue-500' },
  'waiting':     { label: 'Waiting',     variant: 'warning', icon: Clock,        iconColor: 'text-amber-500' },
}

export default function Reception() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = opdQueue.filter(p => {
    const searchMatch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.token.toLowerCase().includes(search.toLowerCase()) ||
      p.doctor.toLowerCase().includes(search.toLowerCase())
    const statusMatch = filterStatus === 'all' || p.status === filterStatus
    return searchMatch && statusMatch
  })

  const total    = opdQueue.length
  const waiting  = opdQueue.filter(p => p.status === 'waiting').length
  const inProg   = opdQueue.filter(p => p.status === 'in-progress').length
  const done     = opdQueue.filter(p => p.status === 'done').length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">OPD Reception</h1>
          <p className="text-sm text-slate-500 mt-0.5">Today's outpatient queue — Lucknow Branch</p>
        </div>
        <Button variant="success">
          <Plus size={16} />
          Register New Patient
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total OPD"   value={total}   icon={UserCheck}    color="blue"    />
        <StatCard label="Waiting"     value={waiting} icon={Clock}        color="amber"   />
        <StatCard label="In Progress" value={inProg}  icon={Loader2}      color="violet"  />
        <StatCard label="Completed"   value={done}    icon={CheckCircle2} color="emerald" />
      </div>

      {/* Queue progress bar */}
      <Card>
        <CardBody className="py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Queue Progress</span>
            <span className="text-xs text-slate-500">{done} of {total} completed</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
            <div className="h-full bg-emerald-500" style={{ width: `${(done / total) * 100}%` }} />
            <div className="h-full bg-blue-500" style={{ width: `${(inProg / total) * 100}%` }} />
            <div className="h-full bg-amber-400" style={{ width: `${(waiting / total) * 100}%` }} />
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Completed</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />In Progress</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Waiting</span>
          </div>
        </CardBody>
      </Card>

      {/* Queue table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="font-semibold text-slate-700">Today's OPD Queue</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                {['all', 'waiting', 'in-progress', 'done'].map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      filterStatus === s ? 'bg-white shadow-sm text-slate-700' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {s === 'all' ? 'All' : s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-40"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Token', 'Patient', 'Doctor', 'Department', 'Time', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(patient => {
                  const cfg = statusConfig[patient.status]
                  const StatusIcon = cfg.icon
                  return (
                    <tr key={patient.token} className={`transition-colors ${patient.status === 'in-progress' ? 'bg-blue-50/40' : 'hover:bg-slate-50/80'}`}>
                      <td className="px-4 py-3">
                        <span className="font-bold text-emerald-600">{patient.token}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={patient.name} size="sm" />
                          <span className="font-medium text-slate-700">{patient.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{patient.doctor}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded-full text-xs">{patient.department}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{patient.time}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <StatusIcon size={13} className={cfg.iconColor} />
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {patient.status === 'waiting' && (
                          <button className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
                            Call In
                          </button>
                        )}
                        {patient.status === 'in-progress' && (
                          <button className="text-xs font-medium text-emerald-600 hover:text-emerald-800 transition-colors">
                            Complete
                          </button>
                        )}
                        {patient.status === 'done' && (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-sm">No patients found</div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
