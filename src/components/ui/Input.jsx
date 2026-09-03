import { cn } from '../../lib/utils'

export default function Input({
  label,
  error,
  icon: Icon,
  className,
  wrapperClassName,
  ...props
}) {
  return (
    <div className={cn('flex flex-col gap-1', wrapperClassName)}>
      {label && (
        <label className="text-xs font-medium text-slate-600">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon size={16} />
          </div>
        )}
        <input
          className={cn(
            'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800',
            'placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
            'transition-all duration-150',
            Icon && 'pl-9',
            error && 'border-red-400 focus:ring-red-400',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
