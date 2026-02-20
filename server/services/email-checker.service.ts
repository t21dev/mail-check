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

function smtpCheck(mxHost: string, email: string): Promise<SmtpResult> {
  return new Promise((resolve) => {
    const timeout = 10000;
    let step = 0;
    let resolved = false;

    const done = (result: SmtpResult) => {
      if (resolved) return;
      resolved = true;
      socket.destroy();
      resolve(result);
    };

    const socket = net.createConnection(25, mxHost);
    socket.setTimeout(timeout);

    socket.on('timeout', () => done({ deliverable: false, responseCode: null, error: 'timeout' }));
    socket.on('error', (err) => done({ deliverable: false, responseCode: null, error: err.message }));

    socket.on('data', (data) => {
      const response = data.toString();
      const code = parseInt(response.substring(0, 3), 10);

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
        done({
          deliverable: code === 250,
          responseCode: code,
        });
      }
    });
  });
}

export async function checkEmail(email: string): Promise<EmailResult> {
  email = email.trim().toLowerCase();

  const syntax = checkSyntax(email);
  if (!syntax.valid) {
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

  if (!mx.found) {
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
    smtp = await smtpCheck(mxHost, email);
  } catch {
    smtp = { deliverable: false, responseCode: null, error: 'connection failed' };
  }

  let isCatchAll = false;
  try {
    const randomEmail = `test-${Date.now()}-${Math.random().toString(36).slice(2)}@${domain}`;
    const catchAllResult = await smtpCheck(mxHost, randomEmail);
    isCatchAll = catchAllResult.deliverable;
  } catch {
    // ignore catch-all check failures
  }

  let reachable: EmailResult['reachable'] = 'unknown';
  if (smtp.deliverable && !isCatchAll) {
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
