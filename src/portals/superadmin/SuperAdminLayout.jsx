import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Building2, ShieldCheck, Network, Users, Lock,
  BarChart3, FileText, ScrollText, Settings, Bell, ChevronDown,
  Activity, Shield, LogOut
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'

const navLinks = [
  { label: 'Dashboard',         icon: LayoutDashboard, to: '/admin',          end: true },
  { label: 'Hospitals',         icon: Building2,       to: '/admin/hospitals' },
  { label: 'Verification',      icon: ShieldCheck,     to: '/admin/verification' },
  { label: 'Organizations',     icon: Network,         to: '/admin/hospitals' },
  { label: 'Users',             icon: Users,           to: '/admin/users' },
  { label: 'Roles & Permissions', icon: Lock,          to: '/admin/users' },
  { label: 'Analytics',         icon: BarChart3,       to: '/admin/analytics' },
  { label: 'Policies',          icon: FileText,        to: '/admin' },
  { label: 'Audit Logs',        icon: ScrollText,      to: '/admin/audit' },
  { label: 'Settings',          icon: Settings,        to: '/admin/settings' },
]

export default function SuperAdminLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const adminName = user?.name || 'Administrator'
  const adminEmail = user?.username || 'admin@medikiosk.in'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-violet-900 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-violet-800/50">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Activity size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-base">MEDIKIOSK</span>
          </div>
          <div className="flex items-center gap-1.5 ml-10">
            <Shield size={11} className="text-violet-300" />
            <span className="text-violet-300 text-xs font-medium">Super Admin</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navLinks.map(link => {
            const Icon = link.icon
            return (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn('sidebar-link', isActive ? 'sidebar-link-active' : 'sidebar-link-inactive')
                }
              >
                <Icon size={16} />
                <span className="text-sm">{link.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom user & sign out */}
        <div className="px-3 pb-4 space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-violet-950/40 rounded-lg">
            <div className="w-7 h-7 bg-violet-600 rounded-full flex items-center justify-center text-xs text-white font-bold">
              {adminName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{adminName}</p>
              <p className="text-violet-300 text-[11px] truncate">{adminEmail}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-violet-300 hover:bg-violet-800/60 hover:text-white transition-all cursor-pointer"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 gap-4 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Shield size={14} className="text-violet-600" />
            <span className="font-medium text-slate-700">Super Admin</span>
            <span>/ National Health Platform</span>
          </div>
          <div className="flex-1" />
          <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell size={18} className="text-slate-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center text-xs text-white font-bold">
                {adminName[0]}
              </div>
              <span className="text-sm font-medium text-slate-700 truncate max-w-[120px]">{adminName}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-card-lg border border-slate-100 z-50 overflow-hidden py-1">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-800">{adminName}</p>
                  <p className="text-[11px] text-slate-400">{adminEmail}</p>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    navigate('/admin/settings')
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Admin Settings
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
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
