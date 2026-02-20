# mail-check

<p align="center">
  <img src="public/favicon.svg" width="64" height="64" alt="mail-check" />
</p>

<p align="center">
  Verify if email addresses actually exist — checks syntax, MX records, and SMTP deliverability in one shot.
</p>

## Features

- Single and bulk email validation
- MX record lookup + SMTP mailbox probing
- Disposable & catch-all email detection
- CSV import / export for bulk results
- IP-based rate limiting (100 req / 10 min)
- Dark-themed terminal-style UI

## Quick Start

```bash
git clone https://github.com/t21dev/mail-check.git
cd mail-check
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## CLI

```bash
npx tsx cli.js user@gmail.com              # single check
npx tsx cli.js a@test.com b@test.com       # multiple
npx tsx cli.js --csv sample.csv            # CSV file
npx tsx cli.js --json user@gmail.com       # JSON output
```

## Deploy with Docker

```bash
docker build -t mail-check .
docker run -p 3000:3000 mail-check
```

### Railway

Push this repo to Railway — the included `Dockerfile` handles everything.

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui
- **Backend**: Express (TypeScript, run via tsx)
- **Fonts**: Outfit + JetBrains Mono

## Project Structure

```
server/
  index.ts          Express API server
  email-checker.ts  Core validation logic (syntax, MX, SMTP, disposable)
src/
  App.tsx           Main layout with tabs
  components/       SingleCheck, BulkCheck, ResultBadge
  types.ts          Shared TypeScript interfaces
```

## API

**POST /api/check**

```json
{ "emails": ["test@gmail.com"] }
```

Returns results with reachability status: `safe`, `risky`, `invalid`, or `unknown`.

## License

MIT
