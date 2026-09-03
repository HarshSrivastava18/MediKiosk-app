import { useState } from 'react'
import { FileBarChart, Download, Calendar, Filter, Users, Stethoscope, ArrowUpRight, TrendingUp } from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const monthlyData = [
  { month: 'Jan', opd: 4200, ipd: 680, surgeries: 140 },
  { month: 'Feb', opd: 4600, ipd: 720, surgeries: 165 },
  { month: 'Mar', opd: 5100, ipd: 810, surgeries: 190 },
  { month: 'Apr', opd: 4900, ipd: 790, surgeries: 175 },
  { month: 'May', opd: 5800, ipd: 940, surgeries: 220 },
  { month: 'Jun', opd: 6200, ipd: 1020, surgeries: 245 },
  { month: 'Jul', opd: 6700, ipd: 1150, surgeries: 280 },
]

const generatedReports = [
  { id: 'REP-2026-07', title: 'Monthly Clinical Audit & Bed Occupancy Report', date: '31 Jul 2026', size: '2.4 MB', type: 'PDF' },
  { id: 'REP-2026-06', title: 'Department-wise OPD Consultation Breakdown', date: '30 Jun 2026', size: '1.8 MB', type: 'XLSX' },
  { id: 'REP-2026-05', title: 'AI Red-Flag Incident & Emergency Triage Log', date: '31 May 2026', size: '950 KB', type: 'PDF' },
  { id: 'REP-2026-04', title: 'Inter-Hospital Referral Outflow & Inflow Summary', date: '30 Apr 2026', size: '1.2 MB', type: 'PDF' },
]

export default function HospitalReports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Hospital Analytics & Clinical Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">Automated departmental metrics, patient volumes, and compliance exports</p>
        </div>
        <Button variant="primary" size="sm">
          <Download size={14} /> Export Custom Report
        </Button>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="section-title">Monthly Patient Footfall (OPD vs IPD)</h3>
              <Badge variant="primary">2026 YTD</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="opd" name="OPD Visits" fill="#059669" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ipd" name="IPD Admissions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Quick KPI stats */}
        <div className="space-y-4">
          <Card className="p-4 bg-emerald-50/60 border border-emerald-200">
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">Avg Daily OPD</p>
            <p className="text-2xl font-bold text-emerald-900 mt-1">218 Patients</p>
            <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1">
              <TrendingUp size={12} /> +14% growth vs last quarter
            </p>
          </Card>

          <Card className="p-4 bg-blue-50/60 border border-blue-200">
            <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Bed Occupancy Rate</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">84.6%</p>
            <p className="text-xs text-blue-700 mt-1">Optimal operational capacity</p>
          </Card>

          <Card className="p-4 bg-violet-50/60 border border-violet-200">
            <p className="text-xs font-semibold text-violet-800 uppercase tracking-wide">Avg Triage Wait Time</p>
            <p className="text-2xl font-bold text-violet-900 mt-1">8.5 Mins</p>
            <p className="text-xs text-violet-700 mt-1">Accelerated by AI Case Summaries</p>
          </Card>
        </div>
      </div>

      {/* Generated Reports List */}
      <Card>
        <CardHeader>
          <h3 className="section-title">Ready-to-Download Monthly Audits</h3>
        </CardHeader>
        <CardBody className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3">Report Document</th>
                <th className="text-left px-4 py-3">Date Generated</th>
                <th className="text-left px-4 py-3">File Format</th>
                <th className="text-left px-4 py-3">Size</th>
                <th className="text-right px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {generatedReports.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3.5 font-semibold text-slate-800 text-xs flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileBarChart size={15} />
                    </div>
                    <span>{r.title}</span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{r.date}</td>
                  <td className="px-4 py-3.5 text-xs">
                    <Badge variant={r.type === 'PDF' ? 'primary' : 'success'}>{r.type}</Badge>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{r.size}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Button variant="secondary" size="sm" className="text-xs">
                      <Download size={13} /> Download
                    </Button>
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
