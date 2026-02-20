import dns from 'dns';
import net from 'net';
import type { EmailResult } from '@/types';

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
  'drdrb.net', 'einrot.com', 'emailgo.de', 'emailisvalid.com',
  'emailsensei.com', 'emailtemporario.com.br', 'ephemail.net',
  'etranquil.com', 'etranquil.net', 'etranquil.org', 'evopo.com',
  'explodemail.com', 'fakemailgenerator.com', 'fastacura.com',
  'filzmail.com', 'fixmail.tk', 'flyspam.com', 'get-mail.cf',
  'getairmail.com', 'getonemail.com', 'getonemail.net',
  'gishpuppy.com', 'great-host.in', 'gsrv.co.uk', 'harakirimail.com',
  'hartbot.de', 'hatespam.org', 'hidemail.de', 'hidzz.com',
  'hmamail.com', 'hopemail.biz', 'ichimail.com', 'imails.info',
  'inbax.tk', 'inbox.si', 'incognitomail.com', 'incognitomail.net',
  'incognitomail.org', 'instant-mail.de', 'ip6.li',
  'irish2me.com', 'iwi.net', 'jetable.com', 'jetable.fr.nf',
  'jetable.net', 'jetable.org', 'jnxjn.com', 'jourrapide.com',
  'kasmail.com', 'kaspop.com', 'keepmymail.com', 'killmail.com',
  'killmail.net', 'klassmaster.com', 'klassmaster.net',
  'klzlk.com', 'koszmail.pl', 'kurzepost.de', 'lawlita.com',
  'letthemeatspam.com', 'lhsdv.com', 'lifebyfood.com', 'link2mail.net',
  'litedrop.com', 'lookugly.com', 'lortemail.dk', 'lr78.com',
  'lroid.com', 'lukop.dk', 'm21.cc', 'mail-temporaire.fr',
  'mail.by', 'mail.zp.ua', 'mail2rss.org', 'mail333.com',
  'mailbidon.com', 'mailblocks.com', 'mailbucket.org', 'mailcat.biz',
  'maildu.de', 'maileater.com', 'maileimer.de', 'mailexpire.com',
  'mailfa.tk', 'mailfree.ga', 'mailfree.gq', 'mailfree.ml',
  'mailfreeonline.com', 'mailguard.me', 'mailhazard.com', 'mailhazard.us',
  'mailhz.me', 'mailimate.com', 'mailin8r.com', 'mailinater.com',
  'mailinator.net', 'mailinator.org', 'mailinator2.com', 'mailincubator.com',
  'mailismagic.com', 'mailmate.com', 'mailme.ir', 'mailme.lv',
  'mailmetrash.com', 'mailmoat.com', 'mailms.com', 'mailnator.com',
  'mailnull.com', 'mailorg.org', 'mailpick.biz', 'mailproxsy.com',
  'mailquack.com', 'mailrock.biz', 'mailsac.com', 'mailscrap.com',
  'mailseal.de', 'mailshell.com', 'mailsiphon.com', 'mailslite.com',
  'mailtemp.info', 'mailtothis.com', 'mailtrash.net', 'mailtv.net',
  'mailtv.tv', 'mailzilla.com', 'mailzilla.org',
  'meinspamschutz.de', 'meltmail.com', 'messagebeamer.de',
  'mfsa.ru', 'mierdamail.com', 'migmail.pl', 'migumail.com',
  'mmmmail.com', 'moakt.com', 'mobi.web.id', 'mobileninja.co.uk',
  'mt2015.com', 'my10telemail.com', 'mycard.net.ua', 'mycleaninbox.net',
  'myemailboxy.com', 'mymail-in.net', 'mymailoasis.com', 'mynetstore.de',
  'mypacks.net', 'myphantom.com', 'mysamp.de',
  'mytemp.email', 'mytempmail.com', 'mytrashmail.com', 'nabala.com',
  'neomailbox.com', 'nepwk.com', 'nervmich.net', 'nervtansen.de',
  'netmails.com', 'netmails.net', 'neverbox.com', 'no-spam.ws',
  'nobulk.com', 'noclickemail.com', 'nogmailspam.info',
  'nomail2me.com', 'nomorespamemails.com', 'nonspam.eu', 'nonspammer.de',
  'noref.in', 'nospam4.us', 'nospamfor.us',
  'nospammail.net', 'nothingtoseehere.ca', 'nowmymail.com',
]);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function checkSyntax(email: string): { valid: boolean } {
  return { valid: EMAIL_REGEX.test(email) };
}

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
  // Final line has a space after the 3-digit code (e.g., "250 OK"), not a dash ("250-...")
  return last.length >= 4 && last.charAt(3) !== '-';
}

function smtpCheck(mxHost: string, email: string): Promise<SmtpResult> {
  return new Promise((resolve) => {
    const timeout = 8000;
    let step = 0;
    let resolved = false;
    let buffer = '';

    const done = (result: SmtpResult) => {
      if (resolved) return;
      resolved = true;
      socket.destroy();
      resolve(result);
    };

    // Hard deadline fallback in case socket events never fire
    const hardTimeout = setTimeout(() => {
      console.log(`[smtp] Hard timeout for ${email} via ${mxHost}`);
      done({ deliverable: false, responseCode: null, error: 'hard timeout' });
    }, timeout + 2000);

    const socket = net.createConnection(25, mxHost);
    socket.setTimeout(timeout);

    socket.on('connect', () => {
      console.log(`[smtp] Connected to ${mxHost}:25 for ${email}`);
    });

    socket.on('timeout', () => {
      console.log(`[smtp] Timeout for ${email} via ${mxHost} at step ${step}`);
      clearTimeout(hardTimeout);
      done({ deliverable: false, responseCode: null, error: 'timeout' });
    });

    socket.on('error', (err) => {
      console.log(`[smtp] Error for ${email} via ${mxHost}: ${err.message}`);
      clearTimeout(hardTimeout);
      done({ deliverable: false, responseCode: null, error: err.message });
    });

    socket.on('close', () => {
      clearTimeout(hardTimeout);
      done({ deliverable: false, responseCode: null, error: 'connection closed' });
    });

    socket.on('data', (data) => {
      buffer += data.toString();
      if (!isSmtpFinal(buffer)) return; // wait for full multi-line response

      const response = buffer.trim();
      buffer = '';
      const lastLine = getLastSmtpLine(response);
      const code = parseInt(lastLine.substring(0, 3), 10);
      console.log(`[smtp] ${email} step=${step} code=${code} response=${response.substring(0, 120)}`);

      if (step === 0 && code === 220) {
        step = 1;
        socket.write('EHLO mail.example.com\r\n');
      } else if (step === 1 && code === 250) {
        step = 2;
        socket.write('MAIL FROM:<check@example.com>\r\n');
      } else if (step === 2 && code === 250) {
        step = 3;
        socket.write(`RCPT TO:<${email}>\r\n`);
      } else if (step === 3) {
        step = 4;
        socket.write('QUIT\r\n');
        clearTimeout(hardTimeout);
        // 550 5.7.x = policy/IP block, not a mailbox issue
        const isIpBlocked = !!(code === 550 && response.match(/5\.7\.\d|blocked|blacklist|spamhaus|barracuda|denied/i));
        done({
          deliverable: code === 250,
          responseCode: code,
          error: isIpBlocked ? 'ip_blocked' : undefined,
        });
      }
    });
  });
}

export async function checkEmail(email: string): Promise<EmailResult> {
  const start = Date.now();
  email = email.trim().toLowerCase();
  console.log(`[check] Starting: ${email}`);

  const syntax = checkSyntax(email);
  if (!syntax.valid) {
    console.log(`[check] Invalid syntax: ${email} (${Date.now() - start}ms)`);
    return {
      email,
      syntax,
      mx: { found: false, records: [] },
      smtp: { deliverable: false, responseCode: null },
      isCatchAll: false,
      isDisposable: false,
      reachable: 'invalid',
    };
  }

  const domain = email.split('@')[1];
  const isDisposable = DISPOSABLE_DOMAINS.has(domain);
  const mx = await checkMx(domain);
  console.log(`[check] MX for ${domain}: found=${mx.found} records=[${mx.records.join(', ')}] (${Date.now() - start}ms)`);

  if (!mx.found) {
    console.log(`[check] No MX: ${email} (${Date.now() - start}ms)`);
    return {
      email,
      syntax,
      mx,
      smtp: { deliverable: false, responseCode: null },
      isCatchAll: false,
      isDisposable,
      reachable: 'invalid',
    };
  }

  const mxHost = mx.records[0];
  let smtp: SmtpResult;
  try {
    console.log(`[check] SMTP check: ${email} via ${mxHost}`);
    smtp = await smtpCheck(mxHost, email);
    console.log(`[check] SMTP result: ${email} deliverable=${smtp.deliverable} code=${smtp.responseCode} (${Date.now() - start}ms)`);
  } catch {
    console.log(`[check] SMTP failed: ${email} (${Date.now() - start}ms)`);
    smtp = { deliverable: false, responseCode: null, error: 'connection failed' };
  }

  let isCatchAll = false;
  // Skip catch-all check if IP is blocked or SMTP errored — no point retrying
  if (smtp.deliverable && !smtp.error) {
    try {
      const randomEmail = `test-${Date.now()}-${Math.random().toString(36).slice(2)}@${domain}`;
      console.log(`[check] Catch-all check: ${domain}`);
      const catchAllResult = await smtpCheck(mxHost, randomEmail);
      isCatchAll = catchAllResult.deliverable;
      console.log(`[check] Catch-all result: ${domain} isCatchAll=${isCatchAll} (${Date.now() - start}ms)`);
    } catch {
      console.log(`[check] Catch-all failed: ${domain} (${Date.now() - start}ms)`);
    }
  }

  let reachable: EmailResult['reachable'] = 'unknown';
  if (smtp.error === 'ip_blocked') {
    // Our IP is blocked by the mail server — can't determine deliverability
    reachable = 'unknown';
    console.log(`[check] IP blocked by ${mxHost}, marking as unknown: ${email}`);
  } else if (smtp.deliverable && !isCatchAll) {
    reachable = 'safe';
  } else if (smtp.deliverable && isCatchAll) {
    reachable = 'risky';
  } else if (!smtp.deliverable && smtp.responseCode !== null && smtp.responseCode >= 500) {
    reachable = 'invalid';
  } else if (isDisposable) {
    reachable = 'risky';
  }

  return {
    email,
    syntax,
    mx,
    smtp,
    isCatchAll,
    isDisposable,
    reachable,
  };
}
