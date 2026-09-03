import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  Users,
  Stethoscope,
  ArrowRightLeft,
  TrendingUp,
  Calendar,
  Activity,
  Award,
  Clock,
} from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import StatCard from '../../../components/ui/StatCard'
import Badge from '../../../components/ui/Badge'
import Avatar from '../../../components/ui/Avatar'

const consultationsPerDay = [
  { day: 'Mon', consultations: 9,  opd: 6, ipd: 3 },
  { day: 'Tue', consultations: 12, opd: 8, ipd: 4 },
  { day: 'Wed', consultations: 8,  opd: 5, ipd: 3 },
  { day: 'Thu', consultations: 14, opd: 10, ipd: 4 },
  { day: 'Fri', consultations: 11, opd: 7, ipd: 4 },
  { day: 'Sat', consultations: 7,  opd: 5, ipd: 2 },
  { day: 'Sun', consultations: 4,  opd: 3, ipd: 1 },
]

const patientTypeBreakdown = [
  { name: 'OPD',       value: 218, color: '#2563EB' },
  { name: 'In-Patient', value: 48, color: '#7C3AED' },
  { name: 'Follow-up',  value: 86, color: '#059669' },
  { name: 'Emergency',  value: 12, color: '#DC2626' },
]

const monthlyReferrals = [
  { month: 'Apr', sent: 8,  received: 5 },
  { month: 'May', sent: 12, received: 7 },
  { month: 'Jun', sent: 9,  received: 11 },
  { month: 'Jul', sent: 15, received: 8 },
  { month: 'Aug', sent: 11, received: 6 },
  { month: 'Sep', sent: 12, received: 7 },
]

const topDiagnoses = [
  { label: 'Hypertension',        count: 48, pct: 28 },
  { label: 'Coronary Artery Disease', count: 32, pct: 18 },
  { label: 'Heart Failure',       count: 24, pct: 14 },
  { label: 'Arrhythmia',          count: 18, pct: 10 },
  { label: 'Angina Pectoris',     count: 16, pct: 9 },
  { label: 'Cardiomyopathy',      count: 12, pct: 7 },
]

const recentAchievements = [
  { icon: Award,   label: '500+ Patients Consulted',   sub: 'This quarter',    color: 'bg-amber-100 text-amber-600' },
  { icon: TrendingUp, label: 'Top Rated Doctor',      sub: '4.8 / 5.0 rating', color: 'bg-emerald-100 text-emerald-600' },
  { icon: Clock,   label: 'Avg. 18 min consultation',  sub: 'Below avg. wait time', color: 'bg-blue-100 text-blue-600' },
]

const COLORS = ['#2563EB', '#7C3AED', '#059669', '#DC2626']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-card-lg border border-slate-100 px-3 py-2 text-xs">
        <p className="font-semibold text-slate-700 mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color }} className="font-medium">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function DoctorAnalytics() {
  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">Dr. Sharma · Cardiology · September 2026</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Patients"          value="364"  icon={Users}         color="blue"   trend="up"   trendLabel="+48 this quarter" />
        <StatCard label="Avg. Consultations/Day"  value="9.2"  icon={Stethoscope}   color="emerald" trend="up"   trendLabel="+1.5 vs last month" />
        <StatCard label="Referrals This Month"    value="19"   icon={ArrowRightLeft} color="violet" trend="down" trendLabel="3 fewer than Aug" />
        <StatCard label="Satisfaction Score"      value="4.8★" icon={Award}         color="amber"  trend="up"   trendLabel="All-time high" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Consultations line chart */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                  <Activity size={15} className="text-brand-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Consultations This Week</p>
                  <p className="text-xs text-slate-500">OPD + In-patient breakdown</p>
                </div>
              </div>
              <Badge variant="primary">This Week</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={consultationsPerDay} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Line type="monotone" dataKey="opd"  name="OPD"       stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4, fill: '#2563EB' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="ipd"  name="In-Patient" stroke="#7C3AED" strokeWidth={2.5} dot={{ r: 4, fill: '#7C3AED' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="consultations" name="Total" stroke="#059669" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Patient type pie */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                <Users size={15} className="text-violet-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Patient Types</p>
                <p className="text-xs text-slate-500">This month</p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={patientTypeBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {patientTypeBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val, name) => [val, name]} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-1">
              {patientTypeBreakdown.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-xs text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Referrals bar chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <ArrowRightLeft size={15} className="text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Monthly Referrals</p>
                <p className="text-xs text-slate-500">Sent vs Received (last 6 months)</p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyReferrals} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="sent"     name="Sent"     fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="received" name="Received" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Top Diagnoses */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Activity size={15} className="text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Top Diagnoses</p>
                <p className="text-xs text-slate-500">Cardiology cases — YTD 2026</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            {topDiagnoses.map((d, i) => (
              <div key={d.label}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-slate-700">{d.label}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{d.count} cases</span>
                    <span className="text-xs font-bold text-slate-600">{d.pct}%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${d.pct}%`,
                      backgroundColor: ['#2563EB', '#7C3AED', '#DC2626', '#D97706', '#059669', '#0891B2'][i],
                    }}
                  />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      {/* Achievements + Schedule summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {recentAchievements.map(a => (
          <Card key={a.label}>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${a.color}`}>
                  <a.icon size={18} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{a.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{a.sub}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}
