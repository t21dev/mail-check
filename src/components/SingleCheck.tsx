import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ResultBadge } from './ResultBadge'
import { Mail, Loader2, Server, ChevronRight, Globe, Flag, AlertTriangle } from 'lucide-react'
import type { EmailResult, CheckResponse } from '@/types'
import type { LucideIcon } from 'lucide-react'

interface CheckItem {
  icon: LucideIcon
  label: string
  value: string
  ok: boolean
}

function ResultSkeleton({ email }: { email: string }) {
  return (
    <div className="space-y-3 animate-fade-up">
      <div className="flex items-center justify-between gap-3 px-1">
        <span className="font-mono text-sm text-foreground truncate">{email}</span>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-surface/50">
            <Skeleton className="h-7 w-7 rounded-md shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SingleCheck() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<EmailResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheck = useCallback(async () => {
    const trimmed = email.trim()
    if (!trimmed) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: [trimmed] }),
      })
      const data: CheckResponse = await res.json()
      if (data.error) {
        setError(data.error)
      } else if (data.results) {
        setResult(data.results[0])
      }
    } catch {
      setError('Failed to connect to the server')
    } finally {
      setLoading(false)
    }
  }, [email])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCheck()
  }, [handleCheck])

  const checks: CheckItem[] = result ? [
    {
      icon: Mail,
      label: 'Syntax',
      value: result.syntax.valid ? 'Valid' : 'Invalid',
      ok: result.syntax.valid,
    },
    {
      icon: Globe,
      label: 'MX Records',
      value: result.mx.found ? result.mx.records.join(', ') : 'None found',
      ok: result.mx.found,
    },
    {
      icon: Server,
      label: 'SMTP',
      value: `${result.smtp.deliverable ? 'Deliverable' : 'Not deliverable'}${result.smtp.responseCode ? ` (${result.smtp.responseCode})` : ''}`,
      ok: result.smtp.deliverable,
    },
    {
      icon: Flag,
      label: 'Flags',
      value: [result.isCatchAll && 'Catch-all', result.isDisposable && 'Disposable'].filter(Boolean).join(', ') || 'None',
      ok: !result.isCatchAll && !result.isDisposable,
    },
  ] : []

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9 bg-surface border-border font-mono text-sm h-10 placeholder:text-muted-foreground/40"
          />
        </div>
        <Button
          onClick={handleCheck}
          disabled={loading || !email.trim()}
          className="bg-cyan-accent hover:bg-cyan-accent/90 text-background font-medium h-10 px-5 transition-all"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Check
              <ChevronRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </div>

      {error ? (
        <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 animate-fade-in">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      {loading ? (
        <ResultSkeleton email={email.trim()} />
      ) : null}

      {result ? (
        <div className="space-y-3 animate-fade-up">
          <div className="flex items-center justify-between gap-3 px-1">
            <span className="font-mono text-sm text-foreground truncate">{result.email}</span>
            <ResultBadge status={result.reachable} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {checks.map((check, i) => {
              const Icon = check.icon
              return (
                <div
                  key={check.label}
                  className={`flex items-start gap-3 p-3 rounded-lg border bg-surface/50 opacity-0 animate-fade-up stagger-${i + 1}`}
                  style={{ borderColor: check.ok ? 'oklch(0.28 0.008 260)' : 'oklch(0.65 0.2 25 / 25%)' }}
                >
                  <div className={`mt-0.5 p-1.5 rounded-md ${check.ok ? 'bg-cyan-subtle text-cyan-accent' : 'bg-destructive/10 text-destructive'}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{check.label}</p>
                    <p className="text-sm text-foreground break-all mt-0.5">{check.value}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
