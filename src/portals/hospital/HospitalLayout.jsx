import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Grid3X3,
  Stethoscope,
  Users,
  MonitorDot,
  FlaskConical,
  Pill,
  ArrowRightLeft,
  FileBarChart,
  Settings,
  Bell,
  ChevronDown,
  Activity,
  LogOut,
} from 'lucide-react'
import Avatar from '../../components/ui/Avatar'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { label: 'Dashboard',   icon: LayoutDashboard, to: '/hospital',             end: true },
  { label: 'Branches',    icon: Building2,        to: '/hospital/branches' },
  { label: 'Departments', icon: Grid3X3,          to: '/hospital/departments' },
  { label: 'Doctors',     icon: Stethoscope,      to: '/hospital/doctors' },
  { label: 'Staff',       icon: Users,            to: '/hospital/staff' },
  { label: 'Reception',   icon: MonitorDot,       to: '/hospital/reception' },
  { label: 'Laboratory',  icon: FlaskConical,     to: '/hospital',            placeholder: true },
  { label: 'Pharmacy',    icon: Pill,             to: '/hospital',            placeholder: true },
  { label: 'Referrals',   icon: ArrowRightLeft,   to: '/hospital',            placeholder: true },
  { label: 'Reports',     icon: FileBarChart,     to: '/hospital/reports' },
  { label: 'Settings',    icon: Settings,         to: '/hospital/settings' },
]

export default function HospitalLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [hospitalOpen, setHospitalOpen] = useState(false)
  const [adminMenuOpen, setAdminMenuOpen] = useState(false)

  const adminName = user?.name || 'Alok Gupta'
  const facilityName = user?.details?.facilityName || 'City Hospital — Lucknow'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-emerald-800 flex flex-col">
        {/* Logo + Hospital selector */}
        <div className="px-4 pt-5 pb-3 border-b border-emerald-700">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Activity size={18} className="text-emerald-700" />
            </div>
            <span className="text-white font-bold text-base tracking-tight">MediKiosk</span>
          </div>

          {/* Hospital selector */}
          <button
            onClick={() => setHospitalOpen(o => !o)}
            className="w-full flex items-center justify-between bg-emerald-700/60 hover:bg-emerald-700 text-white rounded-lg px-3 py-2.5 transition-colors duration-150 cursor-pointer"
          >
            <div className="text-left">
              <p className="text-xs font-semibold text-emerald-200 leading-none mb-0.5">HOSPITAL</p>
              <p className="text-sm font-medium leading-none truncate">{facilityName}</p>
            </div>
            <ChevronDown
              size={16}
              className={`flex-shrink-0 text-emerald-300 transition-transform duration-150 ${hospitalOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {hospitalOpen && (
            <div className="mt-1.5 bg-emerald-900 rounded-lg overflow-hidden text-sm">
              {['City Hospital — Lucknow', 'Apollo Clinic — Lucknow', 'Jeevan Hospital — Jaipur'].map(h => (
                <button
                  key={h}
                  onClick={() => setHospitalOpen(false)}
                  className="w-full text-left px-3 py-2 text-emerald-200 hover:bg-emerald-700 hover:text-white transition-colors duration-100"
                >
                  {h}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {navItems.map(({ label, icon: Icon, to, end, placeholder }) => (
            <NavLink
              key={label + to}
              to={to}
              end={end}
              onClick={e => placeholder && e.preventDefault()}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive && !placeholder
                    ? 'bg-white text-emerald-800'
                    : 'text-emerald-100 hover:bg-emerald-700/60 hover:text-white',
                  placeholder ? 'opacity-50 cursor-not-allowed' : '',
                ].join(' ')
              }
            >
              <Icon size={17} className="flex-shrink-0" />
              <span>{label}</span>
              {placeholder && (
                <span className="ml-auto text-[10px] font-semibold bg-emerald-700/50 text-emerald-300 px-1.5 py-0.5 rounded-full">
                  Soon
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar footer & sign out */}
        <div className="px-3 py-3 border-t border-emerald-700 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-emerald-200 hover:bg-emerald-700 hover:text-white transition-all duration-150 cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
          <p className="text-[11px] text-emerald-400 text-center">Hospital Admin v1.0</p>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div>
            <p className="text-sm font-semibold text-slate-700">{facilityName}</p>
            <p className="text-xs text-slate-400">Hospital Admin Portal • {adminName}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Admin chip dropdown */}
            <div className="relative">
              <button
                onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
              >
                <Avatar name={adminName} size="xs" />
                <span className="text-sm font-medium text-slate-700 truncate max-w-[120px]">{adminName}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {adminMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-card-lg border border-slate-100 z-50 overflow-hidden py-1">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-800">{adminName}</p>
                    <p className="text-[11px] text-slate-400">{user?.id || 'ORG-001'}</p>
                  </div>
                  <button
                    onClick={() => {
                      setAdminMenuOpen(false)
                      navigate('/hospital/settings')
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Hospital Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors font-medium border-t border-slate-100 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
