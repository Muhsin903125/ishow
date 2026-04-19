import type { EmailType } from './sender';

export async function notify(
  type: EmailType,
  to: string,
  data: Record<string, string | number | undefined>
) {
  try {
    await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, to, data }),
    });
  } catch {
    // Non-blocking — never throw on email failure
  }
}
