'use client'

import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { statusConfig } from './result-badge'

const statuses = ['safe', 'risky', 'invalid', 'unknown'] as const

export function StatusLegend() {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
      >
        <HelpCircle className="h-3.5 w-3.5" />
        What do these statuses mean?
      </button>
      {open ? (
        <div className="mt-2 grid gap-2 text-xs animate-fade-in">
          {statuses.map(key => {
            const s = statusConfig[key]
            return (
              <div key={key} className="flex items-start gap-2">
                <span className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${s.dot}`} />
                <div>
                  <span className={`font-medium ${s.text}`}>{s.label}</span>
                  <span className="text-muted-foreground ml-1.5">{s.description}</span>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
