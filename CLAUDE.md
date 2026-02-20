# mail-check

## Project Overview
Node.js + React web app for checking if email addresses exist. Uses MX lookup and SMTP validation.
GitHub: https://github.com/t21dev/mail-check

## Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack) with React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Server**: Next.js Route Handlers + Server Actions
- **CLI**: `tsx cli.js` - uses server/services/email-checker.service.ts directly

## Key Commands
- `npm run dev` - Start Next.js dev server
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run check` - CLI shortcut (`tsx cli.js`)

## Project Structure
- `app/layout.tsx` - Root layout (fonts, theme script, metadata)
- `app/page.tsx` - Home page
- `app/globals.css` - Tailwind v4 theme
- `app/api/check/route.ts` - POST Route Handler (rate limited: 100 req / 10 min per IP)
- `server/actions/check-email.action.ts` - Server Action wrapper
- `server/services/email-checker.service.ts` - Core email validation logic (syntax, MX, SMTP, disposable)
- `server/services/rate-limiter.service.ts` - In-memory IP-based rate limiter
- `components/` - React components (single-check, bulk-check, result-badge, theme-toggle)
- `components/ui/` - shadcn components (auto-generated, don't edit)
- `lib/utils.ts` - cn() utility
- `types/index.ts` - Shared TypeScript interfaces
- `cli.js` - CLI entry point
- `public/llms.txt` - LLM-friendly site description

## Conventions
- Frontend: TypeScript (.tsx)
- Server actions: `server/actions/*.action.ts`
- Server services: `server/services/*.service.ts`
- Path alias: `@/` maps to project root (`./`)
- API endpoint: `POST /api/check` with `{ emails: string[] }`
- Bulk check limit: 100 emails per request (frontend), 100 per API call (server)
- `"use client"` directive on interactive components (SingleCheck, BulkCheck, ThemeToggle)
- OG image generated dynamically via `app/opengraph-image.tsx`
- SEO metadata defined in `app/layout.tsx` (title, description, OG, Twitter cards)
