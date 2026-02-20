import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GlowBox, Pill } from '@/components/ui/box'
import { H1, Paragraph } from '@/components/ui/typography'
import { SingleCheck } from './components/SingleCheck'
import { BulkCheck } from './components/BulkCheck'
import { ThemeToggle } from './components/ThemeToggle'
import { Mail, Users, ShieldCheck, Github } from 'lucide-react'

const REPO_URL = 'https://github.com/t21dev/mail-check'

function App() {
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
          <H1>mail-check</H1>
          <Paragraph className="max-w-md mx-auto">
            Verify deliverability of any email address through DNS and SMTP protocol checks.
          </Paragraph>
        </header>

        {/* Main card */}
        <GlowBox className="opacity-0 animate-fade-up stagger-2">
          <Tabs defaultValue="single">
            <div className="border-b border-border px-1 pt-1">
              <TabsList className="w-full bg-transparent gap-1 h-auto p-0">
                <TabsTrigger
                  value="single"
                  className="flex-1 flex items-center justify-center gap-2 rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-cyan-accent data-[state=active]:bg-cyan-subtle data-[state=active]:text-cyan-accent px-4 py-2.5 text-sm font-medium transition-all"
                >
                  <Mail className="h-4 w-4" />
                  Single
                </TabsTrigger>
                <TabsTrigger
                  value="bulk"
                  className="flex-1 flex items-center justify-center gap-2 rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-cyan-accent data-[state=active]:bg-cyan-subtle data-[state=active]:text-cyan-accent px-4 py-2.5 text-sm font-medium transition-all"
                >
                  <Users className="h-4 w-4" />
                  Bulk
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-5 sm:p-6">
              <TabsContent value="single" className="mt-0">
                <SingleCheck />
              </TabsContent>
              <TabsContent value="bulk" className="mt-0">
                <BulkCheck />
              </TabsContent>
            </div>
          </Tabs>
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

export default App
