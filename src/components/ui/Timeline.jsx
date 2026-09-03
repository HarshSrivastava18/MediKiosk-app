import { cn } from '../../lib/utils'
import {
  Activity, FileText, Pill, Stethoscope, Calendar, Upload, FlaskConical
} from 'lucide-react'

const typeConfig = {
  Visit:        { icon: Stethoscope, color: 'bg-blue-100 text-blue-600',    dot: 'bg-blue-500' },
  Document:     { icon: FileText,    color: 'bg-violet-100 text-violet-600', dot: 'bg-violet-500' },
  Prescription: { icon: Pill,        color: 'bg-emerald-100 text-emerald-600', dot: 'bg-emerald-500' },
  Lab:          { icon: FlaskConical,color: 'bg-amber-100 text-amber-600',   dot: 'bg-amber-500' },
  Upload:       { icon: Upload,      color: 'bg-cyan-100 text-cyan-600',     dot: 'bg-cyan-500' },
  default:      { icon: Activity,    color: 'bg-slate-100 text-slate-600',   dot: 'bg-slate-400' },
}

export default function Timeline({ events, className }) {
  return (
    <div className={cn('flex flex-col', className)}>
      {events.map((event, idx) => {
        const config = typeConfig[event.type] || typeConfig.default
        const Icon = config.icon
        const isLast = idx === events.length - 1
        return (
          <div key={idx} className="flex gap-4">
            {/* Left spine */}
            <div className="flex flex-col items-center">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', config.color)}>
                <Icon size={14} />
              </div>
              {!isLast && <div className="w-px flex-1 bg-slate-200 my-1" />}
            </div>

            {/* Content */}
            <div className={cn('pb-5 flex-1', isLast && 'pb-0')}>
              <p className="text-xs text-slate-400 mb-0.5">{event.date}</p>
              <p className="text-sm font-semibold text-slate-800">
                {event.summary || event.label}
              </p>
              {event.hospital && (
                <p className="text-xs text-slate-500 mt-0.5">{event.hospital}</p>
              )}
              {event.type === 'Visit' && (
                <span className={cn('inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium', config.color)}>
                  {event.type}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
