import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { email, name, phone } = await req.json();

  if (!email || !name) {
    return NextResponse.json({ error: 'email and name are required' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabaseUser = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabaseUser.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabaseUser.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  const { data, error } = await (supabaseAdmin.auth.admin as {
    inviteUserByEmail: (email: string, options: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>
  }).inviteUserByEmail(email, {
    data: { name, phone: phone ?? '', role: 'trainer' },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });

  if (error) {
    return NextResponse.json({ error: (error as { message: string }).message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
