import { cn } from "@/lib/utils"

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Box({ className, children, ...props }: BoxProps) {
  return (
    <div
      className={cn("rounded-lg border border-border bg-surface/50 p-3", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function GlowBox({ className, children, ...props }: BoxProps) {
  return (
    <div
      className={cn("rounded-xl border border-border bg-card/80 backdrop-blur-sm glow-border", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function Surface({ className, children, ...props }: BoxProps) {
  return (
    <div
      className={cn("rounded-lg bg-surface-overlay px-4 py-2", className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface PillProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Pill({ className, children, ...props }: PillProps) {
  return (
    <div
      className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-accent/20 bg-cyan-subtle text-cyan-accent text-xs font-mono tracking-wider uppercase", className)}
      {...props}
    >
      {children}
    </div>
  )
}
