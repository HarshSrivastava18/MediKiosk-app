import { useState } from 'react'
import { BarChart3, TrendingUp, Users, Building2, Stethoscope, ArrowRightLeft, Shield, Globe } from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import StatCard from '../../../components/ui/StatCard'
import Badge from '../../../components/ui/Badge'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const monthlyRegistrations = [
  { month: 'Sep 25', hospitals: 140, patients: 450000 },
  { month: 'Nov 25', hospitals: 320, patients: 920000 },
  { month: 'Jan 26', hospitals: 650, patients: 2100000 },
  { month: 'Mar 26', hospitals: 1100, patients: 4200000 },
  { month: 'May 26', hospitals: 1750, patients: 6300000 },
  { month: 'Jul 26', hospitals: 2200, patients: 7800000 },
  { month: 'Aug 26', hospitals: 2458, patients: 8654213 },
]

const stateConsultations = [
  { state: 'Uttar Pradesh', consultations: 420000 },
  { state: 'Maharashtra', consultations: 310000 },
  { state: 'Rajasthan', consultations: 190000 },
  { state: 'Bihar', consultations: 165000 },
  { state: 'Delhi', consultations: 120000 },
  { state: 'Others', consultations: 49321 },
]

export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">National Health Network Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">Macro epidemiological patterns, platform adoption metrics, and cross-hospital referral flows</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Health ID Grants" value="8.65M" icon={Users} color="violet" trend="up" trendLabel="+12.4% MoM" />
        <StatCard label="Networked Hospitals" value="2,458" icon={Building2} color="emerald" trend="up" trendLabel="+92 this month" />
        <StatCard label="Monthly AI Case Interrogations" value="1.25M" icon={Stethoscope} color="blue" trend="up" trendLabel="+21% MoM" />
        <StatCard label="Inter-Hospital Referrals" value="45.2K" icon={ArrowRightLeft} color="amber" trend="up" trendLabel="4.2% referral rate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Curve */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="section-title">National Adoption & Hospital Enrollment</h3>
              <Badge variant="purple">12 Months Trend</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRegistrations} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="hospitals" name="Verified Hospitals" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* State Breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="section-title">Consultations by State Jurisdiction</h3>
              <Badge variant="primary">Q3 2026</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stateConsultations} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="state" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="consultations" name="Completed Consultations" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
