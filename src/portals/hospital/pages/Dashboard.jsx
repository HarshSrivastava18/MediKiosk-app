import { useState } from 'react'
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
} from 'lucide-react'
import StatCard from '../../../components/ui/StatCard'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
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
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">City Hospital — Lucknow</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Hospital Admin Dashboard ·{' '}
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
        <Badge variant="active" dot>System Online</Badge>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Branches"    value={4}   icon={Building2}   color="blue"    trend="up" trendLabel="4 active branches" />
        <StatCard label="Departments" value={11}  icon={Grid3X3}     color="violet"  trend="up" trendLabel="Across all branches" />
        <StatCard label="Doctors"     value={24}  icon={Stethoscope} color="emerald" trend="up" trendLabel="+2 this month" />
        <StatCard label="Total Staff" value={156} icon={Users}       color="amber"   trend="up" trendLabel="+8 this month" />
      </div>

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
