import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  Home,
  Stethoscope,
  Activity,
  FileText,
  Building2,
  Pill,
  FlaskConical,
  Shield,
  Settings,
  Bell,
  ChevronDown,
  Globe,
  LogOut,
  HeartPulse,
} from 'lucide-react'
import Avatar from '../../components/ui/Avatar'
import { useAuth } from '../../context/AuthContext'

const navLinks = [
  { label: 'Dashboard',         icon: Home,         to: '/patient',                end: true },
  { label: 'My Case',           icon: Stethoscope,  to: '/patient/my-case' },
  { label: 'Health Records',    icon: Activity,     to: '/patient/health-records' },
  { label: 'Documents',         icon: FileText,     to: '/patient/documents' },
  { label: 'Hospital Visits',   icon: Building2,    to: '/patient/hospital-visits' },
  { label: 'Prescriptions',     icon: Pill,         to: '/patient/prescriptions' },
  { label: 'Lab Reports',       icon: FlaskConical, to: '/patient/lab-reports' },
  { label: 'Consent & Sharing', icon: Shield,       to: '/patient/consent' },
  { label: 'Profile & Settings',icon: Settings,     to: '/patient/profile' },
]

export default function PatientLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const displayName = user?.name || 'Rahul Kumar'
  const displayId = user?.id || 'MK-8472-9812-3345'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* ────── Sidebar ────── */}
      <aside className="w-64 flex-shrink-0 bg-blue-700 flex flex-col h-full overflow-y-auto">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-blue-600/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <HeartPulse size={18} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">MediKiosk</span>
          </div>
        </div>

        {/* Patient identity */}
        <div className="px-4 py-4 border-b border-blue-600/60">
          <div className="flex items-center gap-3">
            <Avatar name={displayName} size="md" className="ring-2 ring-white/40" />
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{displayName}</p>
              <p className="text-blue-200 text-xs font-mono mt-0.5 truncate">{displayId}</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navLinks.map(({ label, icon: Icon, to, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white',
                ].join(' ')
              }
            >
              <Icon size={17} className="flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-blue-600/60">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-white/10 hover:text-white transition-all duration-150 w-full cursor-pointer"
          >
            <LogOut size={17} className="flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ────── Main area ────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
          <p className="text-slate-500 text-sm font-medium italic">
            Your Health, Your Control
          </p>

          <div className="flex items-center gap-3">
            {/* Language selector */}
            <button className="flex items-center gap-1.5 text-slate-500 text-sm hover:text-slate-700 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-100 border border-slate-200">
              <Globe size={15} />
              <span>English</span>
              <ChevronDown size={13} />
            </button>

            {/* Notification bell */}
            <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors border border-slate-200">
              <Bell size={17} className="text-slate-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>

            {/* User avatar with logout click */}
            <div className="flex items-center gap-2">
              <Avatar name={displayName} size="sm" className="cursor-pointer ring-2 ring-blue-100" />
              <button
                onClick={handleLogout}
                className="text-xs text-slate-400 hover:text-red-600 font-medium px-2 py-1 hover:bg-slate-50 rounded transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
