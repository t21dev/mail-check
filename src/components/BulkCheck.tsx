import { useState, useRef, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ResultBadge } from './ResultBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Search, AlertTriangle, FileText, Download } from 'lucide-react'
import Papa from 'papaparse'
import type { EmailResult, CheckResponse } from '@/types'

const MAX_EMAILS = 100
const BATCH_SIZE = 50

const parseEmails = (input: string): string[] =>
  input
    .split(/[\n,;]+/)
    .map(e => e.trim())
    .filter(e => e.includes('@'))

function exportCsv(results: EmailResult[]) {
  const header = 'Email,Status,MX Found,SMTP Deliverable,SMTP Code,Catch-All,Disposable'
  const rows = results.map(r =>
    [
      r.email,
      r.reachable,
      r.mx.found ? 'Yes' : 'No',
      r.smtp.deliverable ? 'Yes' : 'No',
      r.smtp.responseCode ?? '',
      r.isCatchAll ? 'Yes' : 'No',
      r.isDisposable ? 'Yes' : 'No',
    ].join(',')
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mail-check-results-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

async function checkBatch(emails: string[]): Promise<EmailResult[]> {
  const res = await fetch('/api/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emails }),
  })
  const data: CheckResponse = await res.json()
  if (data.error) throw new Error(data.error)
  return data.results ?? []
}

export function BulkCheck() {
  const [text, setText] = useState('')
  const [results, setResults] = useState<EmailResult[]>([])
  const [pendingEmails, setPendingEmails] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleCheck = useCallback(async () => {
    const allEmails = parseEmails(text)
    if (allEmails.length === 0) return

    if (allEmails.length > MAX_EMAILS) {
      setError(`Maximum ${MAX_EMAILS} emails per bulk check. You have ${allEmails.length}.`)
      return
    }

    setLoading(true)
    setError('')
    setResults([])
    setPendingEmails(allEmails)
    setProgress('')

    try {
      const allResults: EmailResult[] = []
      const totalBatches = Math.ceil(allEmails.length / BATCH_SIZE)

      for (let i = 0; i < allEmails.length; i += BATCH_SIZE) {
        const batch = allEmails.slice(i, i + BATCH_SIZE)
        const batchNum = Math.floor(i / BATCH_SIZE) + 1
        setProgress(`Batch ${batchNum}/${totalBatches}`)

        const batchResults = await checkBatch(batch)
        allResults.push(...batchResults)
        setResults([...allResults])
        setPendingEmails(allEmails.slice(i + BATCH_SIZE))
      }

      setProgress('')
      setPendingEmails([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to the server')
    } finally {
      setLoading(false)
      setProgress('')
      setPendingEmails([])
    }
  }, [text])

  const handleCsvUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      complete: (parsed: Papa.ParseResult<string[]>) => {
        const emails: string[] = []
        for (const row of parsed.data) {
          for (const cell of row) {
            const trimmed = String(cell).trim()
            if (trimmed.includes('@')) {
              emails.push(trimmed)
            }
          }
        }
        setText(emails.join('\n'))
      },
      error: () => setError('Failed to parse CSV file'),
    })

    e.target.value = ''
  }, [])

  const emailCount = useMemo(() => (text.trim() ? parseEmails(text).length : 0), [text])
  const overLimit = emailCount > MAX_EMAILS

  const summary = useMemo(() => {
    if (results.length === 0) return null
    return {
      safe: results.filter(r => r.reachable === 'safe').length,
      risky: results.filter(r => r.reachable === 'risky').length,
      invalid: results.filter(r => r.reachable === 'invalid').length,
      unknown: results.filter(r => r.reachable === 'unknown').length,
    }
  }, [results])

  return (
    <div className="space-y-4">
      <div className="relative">
        <Textarea
          placeholder="Paste emails — one per line, comma or semicolon separated..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          className="bg-surface border-border font-mono text-sm resize-none placeholder:text-muted-foreground/40"
        />
        {emailCount > 0 ? (
          <span className={`absolute bottom-2 right-2 text-xs font-mono px-1.5 py-0.5 rounded ${overLimit ? 'text-red-400 bg-red-400/10' : 'text-muted-foreground/50 bg-surface'}`}>
            {emailCount}/{MAX_EMAILS}
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={handleCheck}
          disabled={loading || !text.trim() || overLimit}
          className="bg-cyan-accent hover:bg-cyan-accent/90 text-background font-medium h-9 px-4 transition-all"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          {loading && progress ? progress : `Check ${emailCount > 0 ? `(${emailCount})` : 'All'}`}
        </Button>
        <Button
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={loading}
          className="border-border text-muted-foreground hover:text-foreground hover:border-cyan-accent/30 h-9"
        >
          <FileText className="h-4 w-4 mr-2" />
          CSV
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleCsvUpload}
        />
      </div>

      {loading ? (
        <div className="h-0.5 rounded-full overflow-hidden bg-surface-overlay">
          <div className="h-full scan-line" />
        </div>
      ) : null}

      {error ? (
        <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 animate-fade-in">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      {results.length > 0 || pendingEmails.length > 0 ? (
        <div className="space-y-3 animate-fade-up">
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="grid grid-cols-[1fr_80px] sm:grid-cols-[1fr_80px_60px_80px] md:grid-cols-[1fr_80px_60px_80px_100px] gap-px bg-surface-overlay px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
              <span>Email</span>
              <span>Status</span>
              <span className="hidden sm:block">MX</span>
              <span className="hidden sm:block">SMTP</span>
              <span className="hidden md:block">Flags</span>
            </div>

            <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
              {results.map((r, i) => (
                <div
                  key={r.email + i}
                  className="grid grid-cols-[1fr_80px] sm:grid-cols-[1fr_80px_60px_80px] md:grid-cols-[1fr_80px_60px_80px_100px] gap-px px-4 py-2.5 items-center result-row opacity-0 animate-fade-in"
                  style={{ animationDelay: `${Math.min(i * 30, 300)}ms`, animationFillMode: 'forwards' }}
                >
                  <span className="font-mono text-xs truncate pr-2">{r.email}</span>
                  <span><ResultBadge status={r.reachable} /></span>
                  <span className="hidden sm:block text-xs">
                    {r.mx.found ? (
                      <span className="text-cyan-accent">Yes</span>
                    ) : (
                      <span className="text-destructive">No</span>
                    )}
                  </span>
                  <span className="hidden sm:block text-xs">
                    {r.smtp.deliverable ? (
                      <span className="text-cyan-accent">Yes</span>
                    ) : (
                      <span className="text-destructive">No</span>
                    )}
                    {r.smtp.responseCode ? <span className="ml-1 text-muted-foreground/50">({r.smtp.responseCode})</span> : null}
                  </span>
                  <span className="hidden md:block text-xs text-muted-foreground">
                    {[r.isCatchAll && 'Catch-all', r.isDisposable && 'Disposable']
                      .filter(Boolean)
                      .join(', ') || '—'}
                  </span>
                </div>
              ))}
              {pendingEmails.slice(0, 5).map((email, i) => (
                <div
                  key={`pending-${email}-${i}`}
                  className="grid grid-cols-[1fr_80px] sm:grid-cols-[1fr_80px_60px_80px] md:grid-cols-[1fr_80px_60px_80px_100px] gap-px px-4 py-2.5 items-center"
                >
                  <span className="font-mono text-xs truncate pr-2 text-muted-foreground/40">{email}</span>
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <span className="hidden sm:block"><Skeleton className="h-4 w-8" /></span>
                  <span className="hidden sm:block"><Skeleton className="h-4 w-8" /></span>
                  <span className="hidden md:block"><Skeleton className="h-4 w-16" /></span>
                </div>
              ))}
              {pendingEmails.length > 5 ? (
                <div className="px-4 py-2 text-xs text-muted-foreground/40 font-mono text-center">
                  +{pendingEmails.length - 5} more pending...
                </div>
              ) : null}
            </div>

            {summary ? (
              <div className="border-t border-border bg-surface-overlay/50 px-4 py-2 flex items-center justify-between">
                <div className="flex gap-4 text-xs font-mono text-muted-foreground">
                  <span className="text-emerald-400">{summary.safe} safe</span>
                  <span className="text-amber-400">{summary.risky} risky</span>
                  <span className="text-red-400">{summary.invalid} invalid</span>
                  <span>{summary.unknown} unknown</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => exportCsv(results)}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-cyan-accent"
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Export CSV
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
