import { NextRequest, NextResponse } from 'next/server';
import { checkEmail } from '@/server/services/email-checker.service';
import { checkRateLimit } from '@/server/services/rate-limiter.service';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? '127.0.0.1';

  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests, please try again later.' },
      { status: 429 }
    );
  }

  let body: { emails?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const { emails } = body;

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return NextResponse.json(
      { error: 'Please provide an array of emails' },
      { status: 400 }
    );
  }

  if (emails.length > 100) {
    return NextResponse.json(
      { error: 'Maximum 100 emails per request' },
      { status: 400 }
    );
  }

  try {
    console.log(`[api/check] Processing ${emails.length} emails from ${ip}`);
    const start = Date.now();
    const results = await Promise.all(emails.map(email => checkEmail(email)));
    console.log(`[api/check] Done: ${emails.length} emails in ${Date.now() - start}ms`);
    return NextResponse.json({ results });
  } catch (err) {
    console.error(`[api/check] Error:`, err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
