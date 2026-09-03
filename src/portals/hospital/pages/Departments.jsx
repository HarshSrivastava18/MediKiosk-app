import { useState } from 'react'
import { Plus, Edit2, Eye, ChevronDown } from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Table from '../../../components/ui/Table'
import { hospitalDepartments, hospitalBranches } from '../../../data/hospitals'

// Extended department data
const allDepartments = [
  ...hospitalDepartments,
  { id: 'DEP-006', name: 'ENT',          branch: 'Kanpur Branch', doctors: 2, nurses: 3, status: 'active' },
  { id: 'DEP-007', name: 'Pediatrics',   branch: 'Kanpur Branch', doctors: 2, nurses: 4, status: 'active' },
  { id: 'DEP-008', name: 'Radiology',    branch: 'Delhi Branch',  doctors: 3, nurses: 2, status: 'active' },
  { id: 'DEP-009', name: 'Pharmacy',     branch: 'Lucknow Branch',doctors: 0, nurses: 2, status: 'active' },
  { id: 'DEP-010', name: 'Dermatology',  branch: 'Delhi Branch',  doctors: 2, nurses: 3, status: 'inactive' },
  { id: 'DEP-011', name: 'Psychiatry',   branch: 'Delhi Branch',  doctors: 1, nurses: 2, status: 'active' },
]

const branchOptions = ['All Branches', ...hospitalBranches.map(b => b.name), 'Kanpur Branch']

const columns = [
  {
    key: 'name',
    label: 'Department',
    render: (val, row) => (
      <div>
        <p className="font-medium text-slate-800">{val}</p>
        <p className="text-xs text-slate-400">{row.id}</p>
      </div>
    ),
  },
  {
    key: 'branch',
    label: 'Branch',
    render: val => (
      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{val}</span>
    ),
  },
  {
    key: 'doctors',
    label: 'Doctors',
    render: val => (
      <span className="inline-flex items-center justify-center w-7 h-6 bg-violet-100 text-violet-700 rounded-full text-xs font-semibold">
        {val}
      </span>
    ),
  },
  {
    key: 'nurses',
    label: 'Nurses',
    render: val => (
      <span className="inline-flex items-center justify-center w-7 h-6 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold">
        {val}
      </span>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    render: val => (
      <Badge variant={val === 'active' ? 'active' : 'inactive'} dot>
        {val === 'active' ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
  {
    key: 'actions',
    label: 'Actions',
    render: () => (
      <div className="flex items-center gap-1">
        <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
          <Eye size={15} />
        </button>
        <button className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors">
          <Edit2 size={15} />
        </button>
      </div>
    ),
  },
]

export default function Departments() {
  const [selectedBranch, setSelectedBranch] = useState('All Branches')
  const [search, setSearch] = useState('')

  const filtered = allDepartments.filter(d => {
    const branchMatch = selectedBranch === 'All Branches' || d.branch === selectedBranch
    const searchMatch = d.name.toLowerCase().includes(search.toLowerCase())
    return branchMatch && searchMatch
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Departments</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage departments across all branches</p>
        </div>
        <Button variant="success">
          <Plus size={16} />
          Add Department
        </Button>
      </div>

      {/* Summary pills */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'Total', value: allDepartments.length, color: 'bg-slate-100 text-slate-700' },
          { label: 'Active', value: allDepartments.filter(d => d.status === 'active').length, color: 'bg-emerald-100 text-emerald-700' },
          { label: 'Total Doctors', value: allDepartments.reduce((s, d) => s + d.doctors, 0), color: 'bg-violet-100 text-violet-700' },
          { label: 'Total Nurses', value: allDepartments.reduce((s, d) => s + d.nurses, 0), color: 'bg-pink-100 text-pink-700' },
        ].map(pill => (
          <div key={pill.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${pill.color}`}>
            <span className="font-bold">{pill.value}</span>
            <span>{pill.label}</span>
          </div>
        ))}
      </div>

      {/* Table card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 flex-wrap justify-between">
            <h3 className="font-semibold text-slate-700">All Departments ({filtered.length})</h3>
            <div className="flex items-center gap-2">
              {/* Branch filter */}
              <div className="relative">
                <select
                  value={selectedBranch}
                  onChange={e => setSelectedBranch(e.target.value)}
                  className="appearance-none border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {branchOptions.map(b => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <input
                type="text"
                placeholder="Search departments..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48"
              />
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <Table columns={columns} data={filtered} emptyMessage="No departments found" />
        </CardBody>
      </Card>
    </div>
  )
}
