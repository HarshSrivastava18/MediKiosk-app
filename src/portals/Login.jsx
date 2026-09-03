import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Activity,
  Heart,
  Stethoscope,
  Building2,
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Shield,
  KeyRound,
  ArrowLeft
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { DEMO_CREDENTIALS } from '../data/authUsers'

const ROLES = [
  {
    key: 'patient',
    label: 'Patient',
    icon: Heart,
    color: 'from-blue-600 to-blue-700',
    activeTab: 'bg-blue-600 text-white shadow-md',
    badge: 'Patient Access',
    idPlaceholder: 'MK-8472-9812-3345 or email',
    idLabel: 'Patient Global ID / Email',
    targetPath: '/patient'
  },
  {
    key: 'doctor',
    label: 'Doctor',
    icon: Stethoscope,
    color: 'from-slate-800 to-slate-900',
    activeTab: 'bg-slate-900 text-white shadow-md',
    badge: 'Clinician Access',
    idPlaceholder: 'DOC-001 or doctor@hospital.org',
    idLabel: 'Medical License ID / Email',
    targetPath: '/doctor'
  },
  {
    key: 'hospital',
    label: 'Hospital Admin',
    icon: Building2,
    color: 'from-emerald-700 to-emerald-800',
    activeTab: 'bg-emerald-700 text-white shadow-md',
    badge: 'Facility Admin',
    idPlaceholder: 'ORG-001 or admin@hospital.org',
    idLabel: 'Facility Code / Admin Email',
    targetPath: '/hospital'
  },
  {
    key: 'admin',
    label: 'Super Admin',
    icon: ShieldCheck,
    color: 'from-violet-700 to-violet-900',
    activeTab: 'bg-violet-700 text-white shadow-md',
    badge: 'National Oversight',
    idPlaceholder: 'admin@medikiosk.in or SA-001',
    idLabel: 'Gov ID / Administrator Email',
    targetPath: '/admin'
  }
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const defaultRole = location.state?.role || 'patient'
  const redirectPath = location.state?.from || null
  const redirectError = location.state?.error || ''

  const [selectedRole, setSelectedRole] = useState(defaultRole)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState(redirectError)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const currentRoleConfig = ROLES.find((r) => r.key === selectedRole) || ROLES[0]
  const demoData = DEMO_CREDENTIALS[selectedRole]
  const RoleIcon = currentRoleConfig.icon

  const handleFillDemo = () => {
    if (demoData) {
      setIdentifier(demoData.identifier)
      setPassword(demoData.password)
      setError('')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    setTimeout(() => {
      const result = login(selectedRole, identifier, password)

      if (result.success) {
        setIsSuccess(true)
        setTimeout(() => {
          setIsLoading(false)
          setIsSuccess(false)
          navigate(redirectPath || currentRoleConfig.targetPath)
        }, 600)
      } else {
        setIsLoading(false)
        setError(result.error || 'Authentication failed. Please check your credentials.')
      }
    }, 450)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/30 flex flex-col justify-between">
      {/* Header */}
      <header className="px-6 sm:px-8 py-5 flex items-center justify-between border-b border-slate-200/60 bg-white/60 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-sm">
            <Activity size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">MEDIKIOSK</h1>
            <p className="text-[11px] text-slate-500 -mt-0.5">National Health Platform</p>
          </div>
        </Link>

        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </header>

      {/* Main Login Box */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200/70 overflow-hidden">
          {/* Header Banner */}
          <div className={`bg-gradient-to-r ${currentRoleConfig.color} px-6 pt-6 pb-5 text-white`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                <RoleIcon size={24} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-white/95">
                    {currentRoleConfig.badge}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-white/80">
                    <Shield size={12} /> Secure Auth
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white mt-0.5">
                  Portal Login Required
                </h2>
              </div>
            </div>
            <p className="text-xs text-white/80 mt-2">
              Please authenticate with verified credentials to enter the {currentRoleConfig.label} portal.
            </p>
          </div>

          {/* Role Switcher */}
          <div className="px-6 pt-4 pb-2 bg-slate-50/80 border-b border-slate-200/60">
            <p className="text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
              Select Portal Role
            </p>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-200/70 rounded-xl">
              {ROLES.map((r) => {
                const Icon = r.icon
                const isSelected = selectedRole === r.key
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => {
                      setSelectedRole(r.key)
                      setError('')
                    }}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                      isSelected ? r.activeTab : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <Icon size={14} className="flex-shrink-0" />
                    <span className="truncate">{r.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            {demoData && (
              <div className="mb-5 p-3 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between gap-3">
                <div className="text-xs text-amber-900">
                  <span className="font-bold flex items-center gap-1">
                    <Sparkles size={13} className="text-amber-600" /> Demo Credentials Available:
                  </span>
                  <p className="text-[11px] text-amber-800/90 font-mono mt-0.5 truncate">
                    {demoData.identifier} • {demoData.password}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="flex-shrink-0 px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  1-Click Fill
                </button>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2.5 text-xs">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {currentRoleConfig.idLabel}
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder={currentRoleConfig.idPlaceholder}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password / PIN
                  </label>
                  <button
                    type="button"
                    onClick={handleFillDemo}
                    className="text-[11px] text-brand-600 hover:underline font-medium cursor-pointer"
                  >
                    Need password hint?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <KeyRound size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your security password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Remember session</span>
                </label>

                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Lock size={11} /> 256-bit Encrypted
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className={`w-full py-3 rounded-xl text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                  isSuccess
                    ? 'bg-emerald-600 hover:bg-emerald-600'
                    : 'bg-slate-900 hover:bg-brand-600'
                } disabled:opacity-80`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 size={18} className="text-white" />
                    <span>Access Granted! Entering Portal...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In & Enter Portal</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-slate-400 border-t border-slate-200/50 bg-white/40">
        MediKiosk — National Health Platform • Production Prototype Architecture
      </footer>
    </div>
  )
}
