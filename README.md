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

## Live

[https://mail-check.t21.dev](https://mail-check.t21.dev)

## CLI

```bash
npx tsx cli.js user@gmail.com              # single check
npx tsx cli.js a@test.com b@test.com       # multiple
npx tsx cli.js --csv sample.csv            # CSV file
npx tsx cli.js --json user@gmail.com       # JSON output
```

## How It Works

mail-check connects directly to mail servers via SMTP (port 25) to verify if a mailbox exists — without actually sending an email.

```
Your server
    │
    │ DNS lookup → MX records
    ▼
Gmail / Outlook / Yahoo MX servers
    │
    │ SMTP handshake (EHLO → MAIL FROM → RCPT TO)
    ▼
250 OK = exists, 550 = doesn't exist
```

The app performs these checks in order:

1. **Syntax** — validates email format
2. **MX lookup** — finds the domain's mail servers
3. **SMTP probe** — connects to the mail server and checks if the mailbox accepts mail
4. **Flags** — detects catch-all domains and disposable email providers

## SMTP & Port 25

> **SMTP verification requires outbound port 25.** Most cloud platforms (Railway, Vercel, Render, AWS, etc.) block this port to prevent spam abuse. The hosted version at [mail-check.t21.dev](https://mail-check.t21.dev) may show limited SMTP results due to this restriction.
>
> **For full accuracy, run mail-check locally or self-host on a VPS** where port 25 is open.

## Self-Hosting

### Run Locally

The easiest way to get full SMTP verification — most home/office ISPs don't block port 25.

```bash
git clone https://github.com/t21dev/mail-check.git
cd mail-check
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). SMTP checks will work out of the box.

### Deploy on a VPS

For a persistent setup, deploy on any VPS with port 25 open. Providers like **Hetzner**, **DigitalOcean**, or **BuyVM** ($2–5/mo) work well.

```bash
git clone https://github.com/t21dev/mail-check.git
cd mail-check
npm install
npm run build
npm start
```

Or use Docker:

```bash
docker build -t mail-check .
docker run -p 3000:3000 mail-check
```

### Cloud Platforms (limited)

You can deploy to Railway, Vercel, Netlify, etc., but SMTP verification will be unavailable since these platforms block port 25. The app gracefully falls back to syntax + MX + disposable detection only — SMTP results will show as `unknown`.

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
