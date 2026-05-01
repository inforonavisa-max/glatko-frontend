import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/supabase/middleware';
import { enforceRateLimit } from '@/lib/rateLimit';
import { locales, routing } from '@/i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

const HREFLANG_LOCALES = ['tr', 'en', 'de', 'it', 'ru', 'uk', 'sr', 'me', 'ar'] as const;
const HREFLANG_MAP: Record<string, string> = {
  me: 'sr-ME',
  sr: 'sr-RS',
};

const PRIVATE_BARE_PREFIXES = [
  '/dashboard',
  '/inbox',
  '/pro/dashboard',
  '/admin',
  '/settings',
  '/review',
];

function isLocaleSegment(seg: string): boolean {
  return (locales as readonly string[]).includes(seg);
}

/** HTTP Link header alternates — no JS; skip private app routes. */
function addHreflangHeaders(response: NextResponse, pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return;

  const maybeLocale = segments[0];
  if (!isLocaleSegment(maybeLocale)) return;

  const bare = '/' + segments.slice(1).join('/');
  if (
    PRIVATE_BARE_PREFIXES.some((p) => bare === p || bare.startsWith(`${p}/`))
  ) {
    return;
  }

  const cleanPath = bare === '/' ? '' : bare;

  const links = HREFLANG_LOCALES.map((l) => {
    const tag = HREFLANG_MAP[l] ?? l;
    return `<https://glatko.app/${l}${cleanPath}>; rel="alternate"; hreflang="${tag}"`;
  });
  links.push(`<https://glatko.app/en${cleanPath}>; rel="alternate"; hreflang="x-default"`);

  response.headers.set('Link', links.join(', '));
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-pathname', pathname);
    const requestWithPath = new NextRequest(request.url, {
        headers: requestHeaders,
    });

    if (pathname.startsWith('/api/') || pathname.startsWith('/auth/')) {
        const limited = await enforceRateLimit(request);
        if (limited) return limited;
        return await updateSession(requestWithPath);
    }

    const limited = await enforceRateLimit(request);
    if (limited) return limited;

    const intlResponse = intlMiddleware(requestWithPath);

    const supabaseResponse = await updateSession(requestWithPath);

    if (intlResponse.headers.get('location')) {
        return intlResponse;
    }

    intlResponse.headers.forEach((value, key) => {
        supabaseResponse.headers.set(key, value);
    });

    intlResponse.cookies.getAll().forEach((cookie) => {
        supabaseResponse.cookies.set(cookie.name, cookie.value);
    });

    addHreflangHeaders(supabaseResponse, pathname);

    return supabaseResponse;
}

export const config = {
    matcher: [
        // Skip Next internals, sitemap/robots, image assets, AND font assets
        // (G-CAT-4: /fonts/*.ttf is fetched same-origin by next/og handlers,
        // and would otherwise be 307'd into a locale-prefixed 404).
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|fonts/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ttf|otf|woff|woff2)$).*)',
    ],
};
