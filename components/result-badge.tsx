interface StatusConfig {
  label: string
  dot: string
  text: string
  bg: string
  border: string
}

const statusConfig: Record<string, StatusConfig> = {
  safe: {
    label: 'Safe',
    dot: 'bg-emerald-400',
    text: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
  },
  risky: {
    label: 'Risky',
    dot: 'bg-amber-400',
    text: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
  },
  invalid: {
    label: 'Invalid',
    dot: 'bg-red-400',
    text: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/20',
  },
  unknown: {
    label: 'Unknown',
    dot: 'bg-zinc-500',
    text: 'text-zinc-400',
    bg: 'bg-zinc-500/10',
    border: 'border-zinc-500/20',
  },
}

interface ResultBadgeProps {
  status: string
}

export function ResultBadge({ status }: ResultBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.unknown
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium font-mono uppercase tracking-wide border ${config.bg} ${config.text} ${config.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot} ${status === 'safe' ? 'status-pulse' : ''}`} />
      {config.label}
    </span>
  )
}
