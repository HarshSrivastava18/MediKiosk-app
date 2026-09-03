import { useState } from 'react'
import { Users, Search, Plus, Shield, UserCheck, Lock, MoreVertical } from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'

const platformUsers = [
  { id: 'USR-101', name: 'Dr. Sharma', email: 'sharma.cardio@cityhospital.org', role: 'Doctor (Cardiology)', org: 'City Hospital - Lucknow', status: 'active', lastActive: '10 mins ago' },
  { id: 'USR-102', name: 'Alok Gupta', email: 'admin@cityhospital-lucknow.org', role: 'Hospital Admin', org: 'City Hospital - Lucknow', status: 'active', lastActive: '2 mins ago' },
  { id: 'USR-103', name: 'Rahul Kumar', email: 'rahul.k93@gmail.com', role: 'Patient', org: 'National Registry', status: 'active', lastActive: 'Today, 10:30 AM' },
  { id: 'USR-104', name: 'Dr. Verma', email: 'verma.pulmo@apollo.org', role: 'Doctor (Pulmonology)', org: 'Apollo Clinic', status: 'active', lastActive: 'Yesterday' },
  { id: 'USR-105', name: 'Sunil Mathur', email: 's.mathur@gov.bihar.health', role: 'State Health Auditor', org: 'Govt of Bihar', status: 'inactive', lastActive: '3 days ago' },
]

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const filtered = platformUsers.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role.toLowerCase().includes(roleFilter.toLowerCase())
    return matchSearch && matchRole
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Platform Users & Access Governance</h1>
          <p className="text-sm text-slate-500 mt-0.5">RBAC roles, authentication credentials, and account statuses across MediKiosk</p>
        </div>
        <Button variant="primary" size="sm">
          <Plus size={14} /> Provision New Account
        </Button>
      </div>

      <Card>
        <CardBody className="py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Input
              icon={Search}
              placeholder="Search user by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-72 text-xs py-1.5"
            />

            <div className="flex gap-1">
              {['all', 'admin', 'doctor', 'patient'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    roleFilter === r ? 'bg-violet-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3">User & Email</th>
                <th className="text-left px-4 py-3">Assigned Role</th>
                <th className="text-left px-4 py-3">Organization Context</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Last Active</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-semibold text-slate-800 text-xs">
                    <p>{user.name}</p>
                    <p className="font-normal text-[11px] text-slate-400">{user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-violet-900 bg-violet-50/50 px-2 py-1 rounded">
                    {user.role}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{user.org}</td>
                  <td className="px-4 py-3 text-xs">
                    <Badge variant={user.status === 'active' ? 'success' : 'inactive'} dot>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{user.lastActive}</td>
                  <td className="px-5 py-3 text-right">
                    <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  )
}
