import { Suspense } from 'react'
import { GlowBox, Pill } from '@/components/ui/box'
import { H1, Paragraph } from '@/components/ui/typography'
import { ThemeToggle } from '@/components/theme-toggle'
import { CheckTabs } from '@/components/check-tabs'
import { ShieldCheck, Github, CheckCheck } from 'lucide-react'

const REPO_URL = 'https://github.com/t21dev/mail-check'

export default function Home() {
  return (
    <div className="min-h-screen bg-background grid-bg relative overflow-hidden">
      {/* Top accent line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-cyan-accent to-transparent" />

      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12 sm:py-20 relative">
        {/* Header */}
        <header className="text-center space-y-4 mb-10 opacity-0 animate-fade-up">
          <Pill>
            <ShieldCheck className="h-3 w-3" />
            MX + SMTP Validation
          </Pill>
          <br />
          <H1 className="inline-flex items-center gap-2 justify-center">
            mail-check
            <CheckCheck className="h-7 w-7 sm:h-8 sm:w-8 text-cyan-accent" />
          </H1>
          <Paragraph className="max-w-md mx-auto">
            Check if email addresses exist — without sending them.
          </Paragraph>
        </header>

        {/* Main card */}
        <GlowBox className="opacity-0 animate-fade-up stagger-2">
          <Suspense>
            <CheckTabs />
          </Suspense>
        </GlowBox>

        {/* Footer */}
        <footer className="text-center mt-8 space-y-3 opacity-0 animate-fade-up stagger-4">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-cyan-accent transition-colors font-mono"
          >
            <Github className="h-3.5 w-3.5" />
            t21dev/mail-check
          </a>
          <p className="text-[11px] text-muted-foreground/30 font-mono">
            Rate limited to 100 req / 10 min per IP
          </p>
        </footer>
      </div>
    </div>
  )
}
