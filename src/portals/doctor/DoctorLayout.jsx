import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Calendar,
  FileText,
  ArrowRightLeft,
  BarChart3,
  MessageSquare,
  Settings,
  Search,
  Bell,
  ChevronDown,
  Activity,
  X,
  Stethoscope,
  LogOut,
} from 'lucide-react'
import { patients } from '../../data/patients'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { label: 'Dashboard',      icon: LayoutDashboard, to: '/doctor',            end: true },
  { label: "Today's Cases",  icon: ClipboardList,   to: '/doctor',            end: true },
  { label: 'Appointments',   icon: Calendar,        to: '/doctor',            end: true },
  { label: 'Reports',        icon: FileText,        to: '/doctor',            end: true },
  { label: 'Referrals',      icon: ArrowRightLeft,  to: '/doctor/referrals'              },
  { label: 'Analytics',      icon: BarChart3,       to: '/doctor/analytics'              },
  { label: 'Messages',       icon: MessageSquare,   to: '/doctor/messages'               },
  { label: 'Settings',       icon: Settings,        to: '/doctor',            end: true  },
]

export default function DoctorLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)

  const doctorName = user?.name || 'Dr. Sharma'
  const doctorSpecialty = user?.details?.specialty || 'Cardiology'
  const doctorOrg = user?.org || 'City Hospital, Lucknow'
  const doctorInitials = doctorName.replace('Dr. ', '').split(' ').map(n => n[0]).join('').slice(0, 2) || 'DS'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const searchResults = searchQuery.length >= 2
    ? patients.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone.includes(searchQuery)
      )
    : []

  const handlePatientSelect = (patient) => {
    navigate(`/doctor/patient/${patient.id}`)
    setSearchOpen(false)
    setSearchQuery('')
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 bg-slate-900 flex flex-col h-full">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-700/60">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Activity size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">MediKiosk</p>
              <p className="text-slate-400 text-xs">Doctor Portal</p>
            </div>
          </div>

          {/* Doctor info card */}
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/40">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {doctorInitials}
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">{doctorName}</p>
                <p className="text-slate-400 text-xs truncate">{doctorSpecialty}</p>
                <p className="text-slate-500 text-xs truncate">{doctorOrg}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
          {navItems.map(item => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                ${isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`
              }
            >
              <item.icon size={17} className="flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Patients quick link */}
        <div className="px-3 pb-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/70 transition-all duration-150 cursor-pointer"
          >
            <Users size={17} className="flex-shrink-0" />
            Patients
          </button>
        </div>

        {/* Sign out link */}
        <div className="px-3 pb-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800/70 transition-all duration-150 cursor-pointer"
          >
            <LogOut size={15} className="flex-shrink-0" />
            Sign Out
          </button>
        </div>

        {/* Bottom brand */}
        <div className="px-5 py-2.5 border-t border-slate-700/60">
          <p className="text-slate-600 text-xs text-center">MediKiosk v2.1</p>
        </div>
      </aside>

      {/* ── Main Area ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4 flex-shrink-0">

          {/* Patient Search Bar */}
          <div className="flex-1 max-w-xl relative">
            <div
              className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-text hover:border-brand-400 transition-colors duration-150"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={15} className="text-slate-400 flex-shrink-0" />
              <span className="text-sm text-slate-400 flex-1">
                Search patient (Name / ID / Phone)
              </span>
              <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-xs text-slate-400 font-mono">
                Ctrl+K
              </kbd>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors">
              <Bell size={16} className="text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>

            {/* Doctor profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {doctorInitials}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-slate-800 leading-tight">{doctorName}</p>
                  <p className="text-xs text-slate-500">{doctorSpecialty}</p>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-card-lg border border-slate-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800">{doctorName}</p>
                    <p className="text-xs text-slate-500">{doctorSpecialty} · {doctorOrg}</p>
                    <p className="text-xs text-slate-500">{user?.id || 'DOC-001'}</p>
                  </div>
                  {['My Profile', 'Availability', 'Notifications', 'Help & Support'].map(item => (
                    <button
                      key={item}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      {item}
                    </button>
                  ))}
                  <div className="border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
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

      {/* ── Global Patient Search Modal ──────────────────────────── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => { setSearchOpen(false); setSearchQuery('') }} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-card-lg border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
              <Search size={16} className="text-slate-400 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search patient by Name, ID, or Phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent"
              />
              <button onClick={() => { setSearchOpen(false); setSearchQuery('') }}>
                <X size={16} className="text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            {searchQuery.length < 2 && (
              <div className="px-4 py-8 text-center text-sm text-slate-400">
                <Search size={24} className="mx-auto mb-2 text-slate-300" />
                Type at least 2 characters to search
              </div>
            )}

            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-slate-400">
                No patients found for "{searchQuery}"
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                {searchResults.map(patient => (
                  <button
                    key={patient.id}
                    onClick={() => handlePatientSelect(patient)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-semibold text-sm flex-shrink-0">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800">{patient.name}</p>
                        {patient.redFlag?.active && (
                          <span className="text-xs font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">Red Flag</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{patient.id} · {patient.age}y {patient.gender} · {patient.phone}</p>
                    </div>
                    <Stethoscope size={14} className="text-slate-300 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}

            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-400">Press <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-xs font-mono">Esc</kbd> to close</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
