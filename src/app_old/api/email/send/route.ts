import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { sendEmail, type SendEmailPayload } from '@/lib/email/sender';

export async function POST(req: NextRequest) {
  try {
    // Verify the caller is authenticated
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json() as SendEmailPayload;
    if (!body.type || !body.to) {
      return NextResponse.json({ error: 'Missing type or to' }, { status: 400 });
    }

    // Inject site URL
    body.data = { ...body.data, siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000' };

    const ok = await sendEmail(body);
    return NextResponse.json({ ok });
  } catch (err) {
    console.error('[api/email/send]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
