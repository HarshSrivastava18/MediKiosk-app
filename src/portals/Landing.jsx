import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  Building2,
  Stethoscope,
  ShieldCheck,
  ArrowRight,
  Heart,
  UserPlus,
  FileCheck,
  Sparkles,
  Shield,
  Clock,
  LogIn,
  LogOut,
  User,
  KeyRound
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import LoginModal from '../components/auth/LoginModal'

const portals = [
  {
    key: 'patient',
    path: '/patient',
    title: 'Patient Platform',
    subtitle: 'Your Health, Your Control',
    description: 'AI-powered case-taking, health records, document management, and consent control.',
    icon: Heart,
    gradient: 'from-blue-600 to-blue-700',
    badge: 'Patient',
    badgeColor: 'bg-blue-100 text-blue-700',
    features: ['AI Interview', 'Health Timeline', 'Document Upload', 'Consent Manager'],
    regPath: '/patient/register',
    regLabel: 'Register Patient ID',
  },
  {
    key: 'doctor',
    path: '/doctor',
    title: 'Doctor Portal',
    subtitle: 'Clinical Decision Support',
    description: 'Full patient context, AI case summaries, red-flag alerts, and clinical workflow tools.',
    icon: Stethoscope,
    gradient: 'from-slate-800 to-slate-900',
    badge: 'Doctor',
    badgeColor: 'bg-slate-100 text-slate-700',
    features: ['AI Case Summary', 'Red-Flag Engine', 'Prescription Tool', 'Referral Management'],
  },
  {
    key: 'hospital',
    path: '/hospital',
    title: 'Hospital Admin',
    subtitle: 'Organization Management',
    description: 'Manage branches, departments, staff, and patient flow across your entire hospital network.',
    icon: Building2,
    gradient: 'from-emerald-700 to-emerald-800',
    badge: 'Hospital',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    features: ['Branch Management', 'Department Structure', 'Staff Directory', 'OPD Dashboard'],
    regPath: '/hospital/register',
    regLabel: 'Register Facility',
  },
  {
    key: 'admin',
    path: '/admin',
    title: 'Super Admin',
    subtitle: 'National Health Oversight',
    description: 'Verify hospitals, monitor the national network, manage policies and audit logs.',
    icon: ShieldCheck,
    gradient: 'from-violet-700 to-violet-900',
    badge: 'Super Admin',
    badgeColor: 'bg-violet-100 text-violet-700',
    features: ['Hospital Verification', 'National Analytics', 'Role Management', 'Audit Logs'],
    verifyPath: '/admin/verification',
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [activeLoginRole, setActiveLoginRole] = useState('patient')

  const handleEnterPortal = (portal) => {
    // If authenticated as this specific role, navigate directly
    if (isAuthenticated && user?.role === portal.key) {
      navigate(portal.path)
    } else {
      // Require credentials
      setActiveLoginRole(portal.key)
      setIsLoginModalOpen(true)
    }
  }

  const handleVerificationEngineClick = () => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin/verification')
    } else {
      setActiveLoginRole('admin')
      setIsLoginModalOpen(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/30 flex flex-col">
      {/* Header */}
      <header className="px-6 sm:px-8 py-5 flex items-center justify-between border-b border-slate-200/60 bg-white/60 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-sm">
            <Activity size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">MEDIKIOSK</h1>
            <p className="text-[11px] text-slate-500 -mt-0.5">National Health Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleVerificationEngineClick}
            className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <Clock size={13} className="text-amber-600" />
            <span>Verification Queue</span>
            <span className="bg-amber-200 text-amber-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold">142</span>
          </button>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-xs bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-800 truncate max-w-[120px]">{user.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase font-bold">
                  {user.role}
                </span>
              </div>
              <button
                onClick={() => navigate(user.portalPath || `/${user.role}`)}
                className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Dashboard
              </button>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setActiveLoginRole('patient')
                setIsLoginModalOpen(true)
              }}
              className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-brand-600 transition-colors shadow-sm cursor-pointer"
            >
              <KeyRound size={14} />
              <span>Portal Login</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-700">System Live</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="text-center px-4 pt-10 pb-10 max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-semibold border border-brand-100 shadow-sm">
          <Sparkles size={13} />
          Unified 5-Layer National Healthcare Architecture
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Your Health, <span className="text-brand-600">Your Control.</span>
        </h2>

        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          A unified national ecosystem connecting patients, clinicians, hospitals, and national health authorities through AI-powered case summaries and zero-trust credentials.
        </p>

        {/* Quick Registration & Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/patient/register')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-bold shadow-md hover:bg-brand-700 hover:shadow-lg transition-all cursor-pointer"
          >
            <UserPlus size={16} />
            Register Patient (Get Global ID)
          </button>

          <button
            onClick={() => navigate('/hospital/register')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-bold shadow-md hover:bg-emerald-800 hover:shadow-lg transition-all cursor-pointer"
          >
            <Building2 size={16} />
            Register Hospital / Clinic
          </button>

          <button
            onClick={handleVerificationEngineClick}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-sm font-bold shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
          >
            <FileCheck size={16} className="text-violet-600" />
            Hospital Verification Engine
          </button>
        </div>
      </div>

      {/* Portal Cards */}
      <div className="px-4 sm:px-8 pb-16 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {portals.map((portal) => {
            const Icon = portal.icon
            const isCurrentLoggedInRole = isAuthenticated && user?.role === portal.key

            return (
              <div
                key={portal.key}
                className="group bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden hover:shadow-card-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top gradient */}
                  <div className={`bg-gradient-to-br ${portal.gradient} p-5 flex flex-col items-start`}>
                    <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                      <Icon size={22} className="text-white" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${portal.badgeColor} mb-1`}>
                      {portal.badge}
                    </span>
                    <h3 className="text-base font-bold text-white">{portal.title}</h3>
                    <p className="text-xs text-white/80">{portal.subtitle}</p>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">{portal.description}</p>
                    <ul className="space-y-1 mb-4">
                      {portal.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-[11px] text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-4 pt-0 space-y-2">
                  {portal.regPath && (
                    <button
                      onClick={() => navigate(portal.regPath)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      <UserPlus size={13} /> {portal.regLabel}
                    </button>
                  )}

                  <button
                    onClick={() => handleEnterPortal(portal)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl group-hover:bg-brand-600 transition-colors duration-200 cursor-pointer shadow-sm"
                  >
                    {isCurrentLoggedInRole ? (
                      <>
                        <span>Enter Portal</span>
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </>
                    ) : (
                      <>
                        <KeyRound size={13} />
                        <span>Enter Portal (Login)</span>
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Auth Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        initialRole={activeLoginRole}
      />

      {/* Footer */}
      <footer className="text-center pb-8 text-xs text-slate-400">
        MediKiosk — National Health Platform • Production Prototype Architecture
      </footer>
    </div>
  )
}
