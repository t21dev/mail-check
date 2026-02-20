# mail-check

## Project Overview
Node.js + React web app for checking if email addresses exist. Uses MX lookup and SMTP validation.
GitHub: https://github.com/t21dev/mail-check

## Tech Stack
- **Frontend**: React + TypeScript + Vite + shadcn/ui + Tailwind CSS v4
- **Backend**: Express (TypeScript, run via tsx) on port 3001
- **CLI**: `tsx cli.js` - uses server/email-checker.ts directly

## Key Commands
- `npm run dev` - Start both backend and frontend dev servers
- `npm run build` - Build frontend for production
- `npm start` - Run production server (serves built frontend)
- `npm run check` - CLI shortcut (`tsx cli.js`)

## Project Structure
- `server/index.ts` - Express API server (rate limited: 100 req / 10 min per IP)
- `server/email-checker.ts` - Core email validation logic (syntax, MX, SMTP, disposable)
- `src/` - React frontend (TypeScript)
- `src/types.ts` - Shared TypeScript interfaces
- `src/components/ui/` - shadcn components (auto-generated, don't edit)
- `cli.js` - CLI entry point
- `Dockerfile` - Multi-stage Docker build for Railway deployment

## Conventions
- Frontend: TypeScript (.tsx)
- Backend: TypeScript (run with tsx, no compilation step)
- Path alias: `@/` maps to `src/`
- API endpoint: `POST /api/check` with `{ emails: string[] }`
- Vite proxies `/api` to `localhost:3001` in dev
- Bulk check limit: 100 emails per request (frontend), 100 per API call (server)
