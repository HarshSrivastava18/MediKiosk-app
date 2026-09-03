import { cn } from '../../lib/utils'

const variants = {
  default: 'bg-slate-100 text-slate-700',
  primary: 'bg-brand-100 text-brand-700',
  success: 'bg-emerald-100 text-emerald-700',
  danger: 'bg-red-100 text-red-700',
  warning: 'bg-amber-100 text-amber-700',
  purple: 'bg-violet-100 text-violet-700',
  blue: 'bg-blue-100 text-blue-700',
  approved: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-slate-100 text-slate-500',
}

export default function Badge({ children, variant = 'default', dot = false, className }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
      variants[variant],
      className
    )}>
      {dot && <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        variant === 'success' || variant === 'approved' || variant === 'active' ? 'bg-emerald-500' :
        variant === 'danger' || variant === 'rejected' ? 'bg-red-500' :
        variant === 'warning' || variant === 'pending' ? 'bg-amber-500' :
        'bg-slate-400'
      )} />}
      {children}
    </span>
  )
}
