import { useState } from 'react'
import { Search, Filter, Eye, Settings2 } from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { hospitals } from '../../../data/hospitals'

export default function Hospitals() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = hospitals.filter(h => {
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.state.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || h.status === filterStatus
    return matchSearch && matchStatus
  })

  const statusVariant = (s) => s === 'approved' ? 'approved' : s === 'pending' ? 'pending' : 'rejected'

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Hospitals</h1>
          <p className="text-sm text-slate-500 mt-0.5">All registered healthcare organizations</p>
        </div>
        <Button size="sm">+ Add Hospital</Button>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="py-3">
          <div className="flex flex-wrap gap-3 items-center">
            <Input
              icon={Search}
              placeholder="Search hospitals…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-64"
            />
            <div className="flex gap-1">
              {['all', 'approved', 'pending', 'rejected'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    filterStatus === s
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Table */}
      <Card>
        <CardBody className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Hospital Name', 'City', 'State', 'Type', 'Status', 'Branches', 'Doctors', 'Registered', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(h => (
                <tr key={h.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-800">{h.name}</td>
                  <td className="px-4 py-3 text-slate-500">{h.city}</td>
                  <td className="px-4 py-3 text-slate-500">{h.state}</td>
                  <td className="px-4 py-3 text-slate-500">{h.type}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant(h.status)} dot>{h.status}</Badge></td>
                  <td className="px-4 py-3 text-slate-600">{h.branches}</td>
                  <td className="px-4 py-3 text-slate-600">{h.doctors}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{h.regDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-brand-600"><Eye size={14} /></button>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-brand-600"><Settings2 size={14} /></button>
                    </div>
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
