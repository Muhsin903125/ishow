import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — IMPORTANT: do not add code between createServerClient and getUser
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const hasDemoSession = request.cookies.get('ishow_demo_auth')?.value === '1';
  const allowDemoSession =
    (process.env.ENABLE_DEMO_AUTH === 'true' ||
      process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH === 'true') &&
    process.env.NODE_ENV !== 'production';
  const allowPlaywrightDemoBypass =
    process.env.PLAYWRIGHT === 'true' &&
    allowDemoSession &&
    request.nextUrl.searchParams.get('demo') === '1';

  // Public paths that don't require auth
  const publicPaths = [
    '/',
    '/about',
    '/contact',
    '/faq',
    '/services',
    '/content',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/privacy',
    '/terms',
    '/auth/callback',
  ];
  const isPublic = publicPaths.some(
    (p) =>
      pathname === p ||
      pathname.startsWith('/auth/') ||
      (p === '/content' && pathname.startsWith('/content/'))
  );

  if (
    !user &&
    !(allowDemoSession && hasDemoSession) &&
    !allowPlaywrightDemoBypass &&
    !isPublic
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
