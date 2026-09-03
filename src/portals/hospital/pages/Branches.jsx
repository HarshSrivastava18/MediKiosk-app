import { useState } from 'react'
import { Plus, Edit2, Eye, MapPin } from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Table from '../../../components/ui/Table'
import { hospitalBranches } from '../../../data/hospitals'

// Extend mock data with extra fields for display
const branches = [
  ...hospitalBranches,
  { id: 'BR-004', name: 'Agra Branch', location: 'Sadar, Agra', departments: 2, doctors: 3, opd: 64, status: 'inactive' },
]

const columns = [
  {
    key: 'name',
    label: 'Branch Name',
    render: (val, row) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <MapPin size={15} className="text-emerald-600" />
        </div>
        <div>
          <p className="font-medium text-slate-800">{val}</p>
          <p className="text-xs text-slate-400">{row.id}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'location',
    label: 'Location',
    render: val => <span className="text-slate-600 text-sm">{val}</span>,
  },
  {
    key: 'departments',
    label: 'Departments',
    render: val => (
      <span className="inline-flex items-center justify-center w-8 h-6 bg-violet-100 text-violet-700 rounded-full text-xs font-semibold">
        {val}
      </span>
    ),
  },
  {
    key: 'doctors',
    label: 'Doctors',
    render: val => (
      <span className="inline-flex items-center justify-center w-8 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
        {val}
      </span>
    ),
  },
  {
    key: 'opd',
    label: 'OPD Today',
    render: val => <span className="font-semibold text-emerald-600">{val}</span>,
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
    render: (_, row) => (
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

export default function Branches() {
  const [search, setSearch] = useState('')

  const filtered = branches.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.location.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Branches</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage all hospital branches across locations</p>
        </div>
        <Button variant="success">
          <Plus size={16} />
          Add Branch
        </Button>
      </div>

      {/* Summary pills */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'Total Branches', value: branches.length, color: 'bg-slate-100 text-slate-700' },
          { label: 'Active', value: branches.filter(b => b.status === 'active').length, color: 'bg-emerald-100 text-emerald-700' },
          { label: 'Inactive', value: branches.filter(b => b.status === 'inactive').length, color: 'bg-slate-100 text-slate-500' },
          { label: 'Total OPD Today', value: branches.reduce((s, b) => s + b.opd, 0), color: 'bg-blue-100 text-blue-700' },
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
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-700">All Branches</h3>
            <input
              type="text"
              placeholder="Search branches..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-52"
            />
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <Table columns={columns} data={filtered} emptyMessage="No branches found" />
        </CardBody>
      </Card>
    </div>
  )
}
