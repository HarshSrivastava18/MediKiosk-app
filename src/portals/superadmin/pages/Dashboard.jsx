import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Users, Stethoscope, ArrowRightLeft, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react'
import StatCard from '../../../components/ui/StatCard'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import { hospitals } from '../../../data/hospitals'

const stateData = [
  { state: 'Uttar Pradesh', count: 845, color: 'bg-brand-500' },
  { state: 'Maharashtra', count: 612, color: 'bg-violet-500' },
  { state: 'Rajasthan', count: 318, color: 'bg-emerald-500' },
  { state: 'Bihar', count: 312, color: 'bg-amber-500' },
  { state: 'Delhi', count: 256, color: 'bg-rose-500' },
  { state: 'Others', count: 115, color: 'bg-slate-400' },
]
const maxCount = Math.max(...stateData.map(s => s.count))

export default function SuperDashboard() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState(
    hospitals.filter(h => h.status === 'pending')
  )

  const handleApprove = (id) => {
    setRequests(prev => prev.filter(h => h.id !== id))
  }
  const handleReject = (id) => {
    setRequests(prev => prev.filter(h => h.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">National Overview</h1>
        <p className="text-sm text-slate-500 mt-0.5">Real-time snapshot of the MediKiosk national health network</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-card shadow-card border border-slate-100 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Registered Hospitals</p>
          <p className="text-3xl font-bold text-slate-800">2,458</p>
          <p className="text-xs text-slate-400 mt-1">Across all states</p>
        </div>
        <div className="bg-white rounded-card shadow-card border border-slate-100 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Approved</p>
          <p className="text-3xl font-bold text-emerald-600">2,201</p>
          <div className="flex items-center gap-1 mt-1">
            <CheckCircle size={12} className="text-emerald-500" />
            <p className="text-xs text-emerald-600">Active on platform</p>
          </div>
        </div>
        <div className="bg-white rounded-card shadow-card border border-slate-100 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Pending</p>
          <p className="text-3xl font-bold text-amber-600">142</p>
          <div className="flex items-center gap-1 mt-1">
            <Clock size={12} className="text-amber-500" />
            <p className="text-xs text-amber-600">Awaiting review</p>
          </div>
        </div>
        <div className="bg-white rounded-card shadow-card border border-slate-100 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Rejected</p>
          <p className="text-3xl font-bold text-red-600">115</p>
          <div className="flex items-center gap-1 mt-1">
            <XCircle size={12} className="text-red-500" />
            <p className="text-xs text-red-500">Did not qualify</p>
          </div>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value="1,25,430" icon={Users} color="blue" trend="up" trendLabel="+8.2% this month" />
        <StatCard label="Total Patients" value="86,54,213" icon={Users} color="violet" trend="up" trendLabel="+12.4% this month" />
        <StatCard label="Total Consultations" value="12,54,321" icon={Stethoscope} color="emerald" trend="up" trendLabel="+5.1% this month" />
        <StatCard label="Total Referrals" value="45,231" icon={ArrowRightLeft} color="amber" trend="up" trendLabel="+3.8% this month" />
      </div>

      {/* Bottom: Requests + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Requests */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="section-title">Hospital Registration Requests</h2>
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/verification')}>
                  View All Requests
                </Button>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {requests.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-sm">
                  <CheckCircle size={32} className="mx-auto mb-2 text-emerald-400" />
                  All requests reviewed!
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Hospital Name', 'State', 'Type', 'Status', 'Applied On', 'Action'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {requests.map(h => (
                      <tr key={h.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800">{h.name}</td>
                        <td className="px-4 py-3 text-slate-500">{h.state}</td>
                        <td className="px-4 py-3 text-slate-500">{h.type}</td>
                        <td className="px-4 py-3"><Badge variant="pending" dot>Pending</Badge></td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{h.regDate}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleApprove(h.id)}
                              className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(h.id)}
                              className="px-2.5 py-1 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Hospitals by State */}
        <div>
          <Card>
            <CardHeader>
              <h2 className="section-title">Hospitals by State</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {stateData.map(s => (
                  <div key={s.state}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600 font-medium">{s.state}</span>
                      <span className="text-xs font-bold text-slate-800">{s.count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.color}`}
                        style={{ width: `${(s.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
