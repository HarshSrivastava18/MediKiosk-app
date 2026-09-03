import { AlertTriangle, Zap } from 'lucide-react'

export default function RedFlagBanner({ label, show = true }) {
  if (!show) return null
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold animate-pulse">
      <AlertTriangle size={14} className="flex-shrink-0" />
      <span>RED FLAG</span>
      <span className="font-normal text-red-100 text-xs">— {label}</span>
    </div>
  )
}

export function UrgencyBadge({ level }) {
  const styles = {
    high: 'bg-red-100 text-red-700 border border-red-200',
    moderate: 'bg-amber-100 text-amber-700 border border-amber-200',
    low: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${styles[level] || styles.low}`}>
      <Zap size={10} />
      {level?.charAt(0).toUpperCase() + level?.slice(1)} Urgency
    </span>
  )
}
