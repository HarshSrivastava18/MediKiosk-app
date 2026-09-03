import { useState } from 'react'
import { Plus, Edit2, Phone } from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Avatar from '../../../components/ui/Avatar'
import Table from '../../../components/ui/Table'
import Tabs from '../../../components/ui/Tabs'

const staffData = [
  { id: 'STF-001', name: 'Neha Singh',    role: 'Nurse',       department: 'Cardiology',     branch: 'Lucknow Branch', phone: '9870012301', status: 'active' },
  { id: 'STF-002', name: 'Rajesh Kumar',  role: 'Receptionist',department: 'Front Desk',     branch: 'Lucknow Branch', phone: '9870012302', status: 'active' },
  { id: 'STF-003', name: 'Sunita Rao',    role: 'Nurse',       department: 'Emergency',      branch: 'Lucknow Branch', phone: '9870012303', status: 'active' },
  { id: 'STF-004', name: 'Anil Sharma',   role: 'Lab Tech',    department: 'Laboratory',     branch: 'Lucknow Branch', phone: '9870012304', status: 'active' },
  { id: 'STF-005', name: 'Pooja Joshi',   role: 'Pharmacist',  department: 'Pharmacy',       branch: 'Lucknow Branch', phone: '9870012305', status: 'active' },
  { id: 'STF-006', name: 'Vivek Pandey',  role: 'Nurse',       department: 'Neurology',      branch: 'Lucknow Branch', phone: '9870012306', status: 'active' },
  { id: 'STF-007', name: 'Anita Mishra',  role: 'Receptionist',department: 'Front Desk',     branch: 'Delhi Branch',   phone: '9870012307', status: 'active' },
  { id: 'STF-008', name: 'Karan Gupta',   role: 'Lab Tech',    department: 'Laboratory',     branch: 'Delhi Branch',   phone: '9870012308', status: 'inactive' },
  { id: 'STF-009', name: 'Divya Tiwari',  role: 'Nurse',       department: 'Orthopedics',    branch: 'Delhi Branch',   phone: '9870012309', status: 'active' },
  { id: 'STF-010', name: 'Mohit Verma',   role: 'Pharmacist',  department: 'Pharmacy',       branch: 'Kanpur Branch',  phone: '9870012310', status: 'active' },
  { id: 'STF-011', name: 'Priya Shukla',  role: 'Nurse',       department: 'Pediatrics',     branch: 'Kanpur Branch',  phone: '9870012311', status: 'active' },
  { id: 'STF-012', name: 'Rahul Srivastava', role: 'Receptionist', department: 'Front Desk', branch: 'Kanpur Branch',  phone: '9870012312', status: 'active' },
]

const roleColors = {
  Nurse:       'purple',
  Receptionist: 'blue',
  'Lab Tech':  'amber',
  Pharmacist:  'success',
}

const columns = [
  {
    key: 'name',
    label: 'Name',
    render: (val, row) => (
      <div className="flex items-center gap-2.5">
        <Avatar name={val} size="sm" />
        <div>
          <p className="font-medium text-slate-800 text-sm">{val}</p>
          <p className="text-xs text-slate-400">{row.id}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'role',
    label: 'Role',
    render: val => <Badge variant={roleColors[val] || 'default'}>{val}</Badge>,
  },
  {
    key: 'department',
    label: 'Department',
    render: val => <span className="text-sm text-slate-600">{val}</span>,
  },
  {
    key: 'branch',
    label: 'Branch',
    render: val => <span className="text-xs text-slate-500">{val}</span>,
  },
  {
    key: 'phone',
    label: 'Phone',
    render: val => (
      <div className="flex items-center gap-1 text-sm text-slate-600">
        <Phone size={12} className="text-slate-400" />
        {val}
      </div>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    render: val => <Badge variant={val === 'active' ? 'active' : 'inactive'} dot>{val === 'active' ? 'Active' : 'Inactive'}</Badge>,
  },
  {
    key: 'actions',
    label: 'Actions',
    render: () => (
      <button className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors">
        <Edit2 size={15} />
      </button>
    ),
  },
]

function StaffTable({ data }) {
  return <Table columns={columns} data={data} emptyMessage="No staff members found" />
}

export default function Staff() {
  const tabData = [
    { key: 'all',         label: `All (${staffData.length})`,                               content: <StaffTable data={staffData} /> },
    { key: 'nurses',      label: `Nurses (${staffData.filter(s => s.role === 'Nurse').length})`,          content: <StaffTable data={staffData.filter(s => s.role === 'Nurse')} /> },
    { key: 'reception',   label: `Reception (${staffData.filter(s => s.role === 'Receptionist').length})`, content: <StaffTable data={staffData.filter(s => s.role === 'Receptionist')} /> },
    { key: 'lab',         label: `Lab (${staffData.filter(s => s.role === 'Lab Tech').length})`,           content: <StaffTable data={staffData.filter(s => s.role === 'Lab Tech')} /> },
    { key: 'pharmacy',    label: `Pharmacy (${staffData.filter(s => s.role === 'Pharmacist').length})`,    content: <StaffTable data={staffData.filter(s => s.role === 'Pharmacist')} /> },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Staff Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage all hospital staff members</p>
        </div>
        <Button variant="success">
          <Plus size={16} />
          Add Staff
        </Button>
      </div>

      {/* Summary */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'Total Staff', value: staffData.length, color: 'bg-slate-100 text-slate-700' },
          { label: 'Nurses', value: staffData.filter(s => s.role === 'Nurse').length, color: 'bg-violet-100 text-violet-700' },
          { label: 'Reception', value: staffData.filter(s => s.role === 'Receptionist').length, color: 'bg-blue-100 text-blue-700' },
          { label: 'Lab', value: staffData.filter(s => s.role === 'Lab Tech').length, color: 'bg-amber-100 text-amber-700' },
          { label: 'Pharmacy', value: staffData.filter(s => s.role === 'Pharmacist').length, color: 'bg-emerald-100 text-emerald-700' },
        ].map(pill => (
          <div key={pill.label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${pill.color}`}>
            <span className="font-bold">{pill.value}</span>
            <span>{pill.label}</span>
          </div>
        ))}
      </div>

      {/* Tabbed table */}
      <Card>
        <CardBody className="p-0">
          <Tabs tabs={tabData} defaultTab="all" contentClassName="pt-0" />
        </CardBody>
      </Card>
    </div>
  )
}
