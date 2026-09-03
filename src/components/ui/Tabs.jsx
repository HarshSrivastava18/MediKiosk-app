import { useState } from 'react'
import { cn } from '../../lib/utils'

export default function Tabs({ tabs, defaultTab, className, contentClassName }) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.key)

  const activeTab = tabs.find(t => t.key === active)

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-150',
              active === tab.key
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={cn('pt-4', contentClassName)}>
        {activeTab?.content}
      </div>
    </div>
  )
}
