import { cn } from '../../lib/utils'

export default function Card({ children, className, onClick, hoverable = false }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-card shadow-card border border-slate-100',
        hoverable && 'cursor-pointer hover:shadow-card-md hover:-translate-y-0.5 transition-all duration-150',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('px-5 py-4 border-b border-slate-100', className)}>
      {children}
    </div>
  )
}

export function CardBody({ children, className }) {
  return (
    <div className={cn('px-5 py-4', className)}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className }) {
  return (
    <div className={cn('px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-card', className)}>
      {children}
    </div>
  )
}
