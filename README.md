# mail-check

<p align="center">
  <img src="public/favicon.svg" width="64" height="64" alt="mail-check" />
</p>

<p align="center">
  <strong>Verify if email addresses actually exist — without sending them.</strong>
  <br />
  <a href="https://mail-check.t21.dev">mail-check.t21.dev</a>
</p>

## Features

- Single and bulk email validation (up to 100 per request)
- MX record lookup + SMTP mailbox probing
- Disposable & catch-all email detection
- IP-block aware (detects Spamhaus/blacklist rejections)
- CSV import / export for bulk results
- PWA with offline detection
- IP-based rate limiting (100 req / 10 min)

## Quick Start

```bash
git clone https://github.com/t21dev/mail-check.git
cd mail-check
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Live

[https://mail-check.t21.dev](https://mail-check.t21.dev)

## CLI

```bash
npx tsx cli.js user@gmail.com              # single check
npx tsx cli.js a@test.com b@test.com       # multiple
npx tsx cli.js --csv sample.csv            # CSV file
npx tsx cli.js --json user@gmail.com       # JSON output
```

## Deploy

Push to any platform that supports Next.js — Vercel, Railway, Netlify, etc.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Fonts**: Outfit + JetBrains Mono

## Project Structure

```
app/
  layout.tsx          Root layout
  page.tsx            Home page
  api/check/route.ts  POST endpoint for email checking
server/
  services/           Core logic (email-checker, rate-limiter)
  actions/            Server Action wrappers
components/           SingleCheck, BulkCheck, ResultBadge, ThemeToggle
types/                Shared TypeScript interfaces
cli.js                CLI entry point
```

## API

**POST https://mail-check.t21.dev/api/check**

```json
{ "emails": ["test@gmail.com"] }
```

Returns results with reachability status: `safe`, `risky`, `invalid`, or `unknown`.

## License

MIT
