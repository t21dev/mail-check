#!/usr/bin/env node

// This CLI uses tsx to run the TypeScript email-checker module
// Usage: npx tsx cli.js user@gmail.com

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkEmail } from './server/services/email-checker.service.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage:');
  console.log('  npx tsx cli.js user@gmail.com              # single check');
  console.log('  npx tsx cli.js a@test.com b@test.com       # multiple');
  console.log('  npx tsx cli.js --csv emails.csv            # CSV file');
  console.log('  npx tsx cli.js --json user@gmail.com       # JSON output');
  process.exit(0);
}

let jsonOutput = false;
let csvFile = null;
const emails = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--json') {
    jsonOutput = true;
  } else if (args[i] === '--csv' && args[i + 1]) {
    csvFile = args[++i];
  } else if (!args[i].startsWith('--')) {
    emails.push(args[i]);
  }
}

async function run() {
  if (csvFile) {
    const filePath = path.resolve(csvFile);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      const parts = line.split(',');
      for (const part of parts) {
        const trimmed = part.trim().replace(/^["']|["']$/g, '');
        if (trimmed.includes('@')) {
          emails.push(trimmed);
        }
      }
    }
  }

  if (emails.length === 0) {
    console.error('No email addresses provided.');
    process.exit(1);
  }

  console.log(`Checking ${emails.length} email(s)...\n`);

  for (const email of emails) {
    const result = await checkEmail(email);

    if (jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      const statusColors = {
        safe: '\x1b[32m',
        risky: '\x1b[33m',
        invalid: '\x1b[31m',
        unknown: '\x1b[90m',
      };
      const color = statusColors[result.reachable] || '\x1b[0m';
      const reset = '\x1b[0m';

      console.log(`${color}[${result.reachable.toUpperCase()}]${reset} ${result.email}`);
      console.log(`  Syntax:     ${result.syntax.valid ? 'Valid' : 'Invalid'}`);
      console.log(`  MX Records: ${result.mx.found ? result.mx.records.join(', ') : 'None'}`);
      console.log(`  SMTP:       ${result.smtp.deliverable ? 'Deliverable' : 'Not deliverable'} (code: ${result.smtp.responseCode || 'N/A'})`);
      console.log(`  Catch-all:  ${result.isCatchAll ? 'Yes' : 'No'}`);
      console.log(`  Disposable: ${result.isDisposable ? 'Yes' : 'No'}`);
      console.log();
    }
  }
}

run().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
