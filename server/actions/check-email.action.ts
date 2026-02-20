'use server';

import { checkEmail } from '@/server/services/email-checker.service';
import type { EmailResult } from '@/types';

export async function checkEmails(emails: string[]): Promise<{ results?: EmailResult[]; error?: string }> {
  if (!emails || emails.length === 0) {
    return { error: 'Please provide an array of emails' };
  }

  if (emails.length > 100) {
    return { error: 'Maximum 100 emails per request' };
  }

  try {
    const results = await Promise.all(emails.map(email => checkEmail(email)));
    return { results };
  } catch {
    return { error: 'Internal server error' };
  }
}
