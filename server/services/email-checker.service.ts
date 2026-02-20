import dns from 'dns';
import net from 'net';
import tls from 'tls';
import os from 'os';
import type { EmailResult } from '@/types';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const EHLO_HOSTNAME = process.env.EHLO_HOSTNAME || os.hostname() || '[127.0.0.1]';
const MAIL_FROM = process.env.MAIL_FROM || 'verify@mail-check.t21.dev';
const SMTP_TIMEOUT = 10_000;

// ---------------------------------------------------------------------------
// Disposable domains
// ---------------------------------------------------------------------------

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'grr.la',
  'guerrillamail.info', 'guerrillamail.biz', 'guerrillamail.de',
  'guerrillamail.net', 'guerrillamail.org', 'spam4.me', 'trashmail.com',
  'trashmail.me', 'trashmail.net', 'trashmail.org', 'bugmenot.com',
  'mailnesia.com', 'maildrop.cc', 'dispostable.com', 'mailcatch.com',
  'mintemail.com', 'tempr.email', 'fakeinbox.com', 'emailondeck.com',
  'getnada.com', 'temp-mail.org', 'tempail.com', 'mohmal.com',
  'burnermail.io', 'discard.email', 'discardmail.com', 'discardmail.de',
  'drdrb.net', 'einrot.com', 'emailgo.de', 'mailfa.tk',
  'mailfree.ga', 'mailfree.gq', 'mailfree.ml', 'mailfreeonline.com',
  'mailinator.net', 'mailinator.org', 'mailinator2.com',
  'mailnull.com', 'mailsac.com', 'mailtemp.info', 'mailtothis.com',
  'mailtrash.net', 'meltmail.com', 'moakt.com', 'mytemp.email',
  'mytempmail.com', 'mytrashmail.com', 'neverbox.com', 'no-spam.ws',
  'nospammail.net', 'nowmymail.com', 'tempail.com',
  'temp-mail.io', 'tempmailo.com', 'tmpmail.org', 'tmpmail.net',
  'guerrillamailblock.com', '10minutemail.com', 'throwaway.email',
  'trashmail.io', 'wegwerfmail.de', 'spamgourmet.com',
]);

// ---------------------------------------------------------------------------
// Provider detection
// ---------------------------------------------------------------------------

type EmailProvider = 'gmail' | 'outlook' | 'yahoo' | 'other';

function detectProvider(mxRecords: string[]): EmailProvider {
  const joined = mxRecords.join(' ').toLowerCase();
  if (joined.includes('google.com') || joined.includes('googlemail.com')) return 'gmail';
  if (joined.includes('outlook.com') || joined.includes('microsoft.com') ||
      joined.includes('hotmail.com') || joined.includes('live.com') ||
      joined.includes('.protection.outlook.com')) return 'outlook';
  if (joined.includes('yahoodns.net') || joined.includes('yahoo.com')) return 'yahoo';
  return 'other';
}

// ---------------------------------------------------------------------------
// Syntax check
// ---------------------------------------------------------------------------

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function checkSyntax(email: string): { valid: boolean } {
  return { valid: EMAIL_REGEX.test(email) };
}

// ---------------------------------------------------------------------------
// MX check
// ---------------------------------------------------------------------------

async function checkMx(domain: string): Promise<{ found: boolean; records: string[] }> {
  try {
    const records = await dns.promises.resolveMx(domain);
    records.sort((a, b) => a.priority - b.priority);
    return {
      found: records.length > 0,
      records: records.map(r => r.exchange),
    };
  } catch {
    return { found: false, records: [] };
  }
}

// ---------------------------------------------------------------------------
// Port 25 diagnostic (cached, runs once)
// ---------------------------------------------------------------------------

let port25Status: 'open' | 'blocked' | 'unknown' = 'unknown';
let port25Checked = false;

async function checkPort25(): Promise<'open' | 'blocked'> {
  if (port25Checked) return port25Status as 'open' | 'blocked';
  port25Checked = true;

  return new Promise((resolve) => {
    // Try connecting to Gmail's MX on port 25 — the most reliable test
    const s = net.createConnection(25, 'gmail-smtp-in.l.google.com');
    s.setTimeout(5000);
    s.on('connect', () => {
      port25Status = 'open';
      s.destroy();
      console.log('[diag] Port 25 outbound: OPEN');
      resolve('open');
    });
    s.on('timeout', () => {
      port25Status = 'blocked';
      s.destroy();
      console.log('[diag] Port 25 outbound: BLOCKED (timeout)');
      resolve('blocked');
    });
    s.on('error', (err) => {
      port25Status = 'blocked';
      s.destroy();
      console.log(`[diag] Port 25 outbound: BLOCKED (${err.message})`);
      resolve('blocked');
    });
  });
}

// Run on startup
checkPort25();

// ---------------------------------------------------------------------------
// SMTP helpers
// ---------------------------------------------------------------------------

interface SmtpResult {
  deliverable: boolean;
  responseCode: number | null;
  error?: string;
}

function getLastSmtpLine(data: string): string {
  const lines = data.split(/\r?\n/).filter(l => l.length > 0);
  return lines[lines.length - 1] ?? '';
}

function isSmtpFinal(data: string): boolean {
  const last = getLastSmtpLine(data);
  return last.length >= 4 && last.charAt(3) !== '-';
}

// ---------------------------------------------------------------------------
// SMTP check — with STARTTLS, proper EHLO, better error classification
// ---------------------------------------------------------------------------

function smtpCheck(mxHost: string, email: string): Promise<SmtpResult> {
  return new Promise((resolve) => {
    let step = 0;
    let resolved = false;
    let buffer = '';
    let activeSocket: net.Socket;
    let starttlsSupported = false;

    const done = (result: SmtpResult) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(hardTimer);
      try { activeSocket.destroy(); } catch { /* noop */ }
      resolve(result);
    };

    const hardTimer = setTimeout(() => {
      console.log(`[smtp] Hard timeout for ${email} via ${mxHost}`);
      done({ deliverable: false, responseCode: null, error: 'timeout' });
    }, SMTP_TIMEOUT + 3000);

    const rawSocket = net.createConnection(25, mxHost);
    activeSocket = rawSocket;
    rawSocket.setTimeout(SMTP_TIMEOUT);

    rawSocket.on('connect', () => {
      console.log(`[smtp] Connected to ${mxHost}:25 for ${email}`);
    });

    rawSocket.on('timeout', () => {
      console.log(`[smtp] Timeout for ${email} via ${mxHost} at step ${step}`);
      done({ deliverable: false, responseCode: null, error: 'timeout' });
    });

    rawSocket.on('error', (err) => {
      console.log(`[smtp] Error for ${email} via ${mxHost}: ${err.message}`);
      const msg = err.message.toLowerCase();
      const error = msg.includes('econnrefused') ? 'port25_blocked'
        : msg.includes('econnreset') ? 'connection_reset'
        : msg.includes('etimedout') ? 'timeout'
        : err.message;
      done({ deliverable: false, responseCode: null, error });
    });

    rawSocket.on('close', () => {
      done({ deliverable: false, responseCode: null, error: 'connection_closed' });
    });

    function handleData(data: Buffer) {
      buffer += data.toString();
      if (!isSmtpFinal(buffer)) return;

      const response = buffer.trim();
      buffer = '';
      const lastLine = getLastSmtpLine(response);
      const code = parseInt(lastLine.substring(0, 3), 10);
      console.log(`[smtp] ${email} step=${step} code=${code} resp=${response.substring(0, 150)}`);

      // Step 0: Banner (220)
      if (step === 0) {
        if (code === 220) {
          step = 1;
          activeSocket.write(`EHLO ${EHLO_HOSTNAME}\r\n`);
        } else {
          done({ deliverable: false, responseCode: code, error: 'banner_rejected' });
        }
        return;
      }

      // Step 1: EHLO response — check for STARTTLS
      if (step === 1) {
        if (code === 250) {
          starttlsSupported = /STARTTLS/i.test(response);
          if (starttlsSupported) {
            step = 2; // send STARTTLS
            activeSocket.write('STARTTLS\r\n');
          } else {
            // No TLS, proceed unencrypted
            step = 4; // MAIL FROM
            activeSocket.write(`MAIL FROM:<${MAIL_FROM}>\r\n`);
          }
        } else {
          done({ deliverable: false, responseCode: code, error: 'ehlo_rejected' });
        }
        return;
      }

      // Step 2: STARTTLS response (220 = ready to start TLS)
      if (step === 2) {
        if (code === 220) {
          // Upgrade to TLS
          const tlsSocket = tls.connect(
            { socket: rawSocket, servername: mxHost, rejectUnauthorized: false },
            () => {
              activeSocket = tlsSocket;
              tlsSocket.on('data', handleData);
              tlsSocket.on('error', (err) => {
                console.log(`[smtp] TLS error for ${email}: ${err.message}`);
                done({ deliverable: false, responseCode: null, error: 'tls_error' });
              });
              // RFC requires re-sending EHLO after STARTTLS
              step = 3;
              tlsSocket.write(`EHLO ${EHLO_HOSTNAME}\r\n`);
            }
          );
          tlsSocket.on('error', (err) => {
            console.log(`[smtp] TLS handshake error for ${email}: ${err.message}`);
            done({ deliverable: false, responseCode: null, error: 'tls_error' });
          });
        } else {
          // STARTTLS failed, try without TLS
          step = 4;
          activeSocket.write(`MAIL FROM:<${MAIL_FROM}>\r\n`);
        }
        return;
      }

      // Step 3: post-TLS EHLO response
      if (step === 3) {
        if (code === 250) {
          step = 4;
          activeSocket.write(`MAIL FROM:<${MAIL_FROM}>\r\n`);
        } else {
          done({ deliverable: false, responseCode: code, error: 'ehlo_after_tls_rejected' });
        }
        return;
      }

      // Step 4: MAIL FROM response
      if (step === 4) {
        if (code === 250) {
          step = 5;
          activeSocket.write(`RCPT TO:<${email}>\r\n`);
        } else {
          done({ deliverable: false, responseCode: code, error: 'mail_from_rejected' });
        }
        return;
      }

      // Step 5: RCPT TO response — the actual verification
      if (step === 5) {
        step = 6;
        activeSocket.write('QUIT\r\n');

        // Classify the response
        if (code === 250 || code === 251) {
          done({ deliverable: true, responseCode: code });
          return;
        }

        // IP/policy block — not a mailbox issue
        if (response.match(/5\.7\.\d|blocked|blacklist|spamhaus|barracuda|denied|reject/i)) {
          done({ deliverable: false, responseCode: code, error: 'ip_blocked' });
          return;
        }

        // Temporary failures (4xx) — greylisting, rate limiting
        if (code >= 400 && code < 500) {
          done({ deliverable: false, responseCode: code, error: 'greylisted' });
          return;
        }

        // Permanent failures (5xx) — mailbox doesn't exist
        done({ deliverable: false, responseCode: code });
        return;
      }

      // Step 6: QUIT ack — ignore
    }

    rawSocket.on('data', handleData);
  });
}

// ---------------------------------------------------------------------------
// Try multiple MX hosts
// ---------------------------------------------------------------------------

async function smtpCheckAllMx(mxRecords: string[], email: string): Promise<SmtpResult> {
  for (const mxHost of mxRecords.slice(0, 3)) {
    const result = await smtpCheck(mxHost, email);

    // Definitive answer — use it
    if (result.deliverable) return result;
    if (result.responseCode !== null && result.responseCode >= 500) return result;

    // Connectivity issue — try next MX
    if (result.error === 'timeout' || result.error === 'port25_blocked' ||
        result.error === 'connection_reset' || result.error === 'connection_closed') {
      console.log(`[smtp] ${mxHost} unreachable, trying next MX...`);
      continue;
    }

    // Any other coded response — use it
    if (result.responseCode !== null) return result;
  }

  return { deliverable: false, responseCode: null, error: 'all_mx_failed' };
}

// ---------------------------------------------------------------------------
// Main email check
// ---------------------------------------------------------------------------

export async function checkEmail(email: string): Promise<EmailResult> {
  const start = Date.now();
  email = email.trim().toLowerCase();
  console.log(`[check] Starting: ${email}`);

  // Syntax
  const syntax = checkSyntax(email);
  if (!syntax.valid) {
    console.log(`[check] Invalid syntax: ${email} (${Date.now() - start}ms)`);
    return {
      email, syntax,
      mx: { found: false, records: [] },
      smtp: { deliverable: false, responseCode: null },
      isCatchAll: false, isDisposable: false, reachable: 'invalid',
    };
  }

  const domain = email.split('@')[1];
  const isDisposable = DISPOSABLE_DOMAINS.has(domain);

  // MX
  const mx = await checkMx(domain);
  console.log(`[check] MX for ${domain}: found=${mx.found} records=[${mx.records.join(', ')}] (${Date.now() - start}ms)`);

  if (!mx.found) {
    console.log(`[check] No MX: ${email} (${Date.now() - start}ms)`);
    return {
      email, syntax, mx,
      smtp: { deliverable: false, responseCode: null },
      isCatchAll: false, isDisposable, reachable: 'invalid',
    };
  }

  // Check if port 25 is even available
  const portStatus = await checkPort25();
  if (portStatus === 'blocked') {
    console.log(`[check] Port 25 blocked, skipping SMTP for ${email} (${Date.now() - start}ms)`);
    const provider = detectProvider(mx.records);
    // We can't verify via SMTP, but we have MX + syntax + disposable info
    let reachable: EmailResult['reachable'] = 'unknown';
    if (isDisposable) reachable = 'risky';
    return {
      email, syntax, mx,
      smtp: { deliverable: false, responseCode: null, error: 'port25_blocked' } as EmailResult['smtp'],
      isCatchAll: false, isDisposable, reachable,
      provider,
    } as EmailResult;
  }

  const provider = detectProvider(mx.records);

  // SMTP — try all MX hosts
  let smtp: SmtpResult;
  try {
    console.log(`[check] SMTP check: ${email} (provider=${provider})`);
    smtp = await smtpCheckAllMx(mx.records, email);
    console.log(`[check] SMTP result: ${email} deliverable=${smtp.deliverable} code=${smtp.responseCode} error=${smtp.error} (${Date.now() - start}ms)`);
  } catch {
    console.log(`[check] SMTP failed: ${email} (${Date.now() - start}ms)`);
    smtp = { deliverable: false, responseCode: null, error: 'connection_failed' };
  }

  // Catch-all — only if SMTP worked and email was deliverable
  let isCatchAll = false;
  if (smtp.deliverable && !smtp.error) {
    try {
      const randomUser = `xq9z7k2m4p${Date.now()}`;
      const fakeEmail = `${randomUser}@${domain}`;
      console.log(`[check] Catch-all check: ${domain}`);
      const catchAllResult = await smtpCheck(mx.records[0], fakeEmail);
      isCatchAll = catchAllResult.deliverable;
      console.log(`[check] Catch-all result: ${domain} isCatchAll=${isCatchAll} (${Date.now() - start}ms)`);
    } catch {
      console.log(`[check] Catch-all failed: ${domain} (${Date.now() - start}ms)`);
    }
  }

  // Classify reachability
  let reachable: EmailResult['reachable'] = 'unknown';

  if (smtp.error === 'ip_blocked') {
    reachable = 'unknown';
    console.log(`[check] IP blocked, marking as unknown: ${email}`);
  } else if (smtp.error === 'greylisted') {
    reachable = 'unknown';
    console.log(`[check] Greylisted (4xx), marking as unknown: ${email}`);
  } else if (smtp.deliverable && !isCatchAll) {
    reachable = 'safe';
  } else if (smtp.deliverable && isCatchAll) {
    reachable = 'risky';
  } else if (!smtp.deliverable && smtp.responseCode !== null && smtp.responseCode >= 500) {
    reachable = 'invalid';
  } else if (isDisposable) {
    reachable = 'risky';
  }

  console.log(`[check] Done: ${email} => ${reachable} (${Date.now() - start}ms)`);

  return {
    email, syntax, mx,
    smtp: { deliverable: smtp.deliverable, responseCode: smtp.responseCode },
    isCatchAll, isDisposable, reachable,
  };
}
