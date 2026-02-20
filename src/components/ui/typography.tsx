import { cn } from "@/lib/utils"

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

export function H1({ className, children, ...props }: TypographyProps) {
  return (
    <h1
      className={cn("text-3xl sm:text-4xl font-bold tracking-tight text-foreground", className)}
      {...props}
    >
      {children}
    </h1>
  )
}

export function H2({ className, children, ...props }: TypographyProps) {
  return (
    <h2
      className={cn("text-xl sm:text-2xl font-semibold tracking-tight text-foreground", className)}
      {...props}
    >
      {children}
    </h2>
  )
}

export function H3({ className, children, ...props }: TypographyProps) {
  return (
    <h3
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export function Paragraph({ className, children, ...props }: TypographyProps) {
  return (
    <p
      className={cn("text-sm text-muted-foreground leading-relaxed", className)}
      {...props}
    >
      {children}
    </p>
  )
}

export function Label({ className, children, ...props }: TypographyProps) {
  return (
    <span
      className={cn("text-xs font-medium uppercase tracking-wider text-muted-foreground", className)}
      {...props}
    >
      {children}
    </span>
  )
}

export function Mono({ className, children, ...props }: TypographyProps) {
  return (
    <span
      className={cn("font-mono text-sm", className)}
      {...props}
    >
      {children}
    </span>
  )
}
