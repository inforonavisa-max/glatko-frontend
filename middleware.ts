import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { updateSession } from '@/supabase/middleware';
import { enforceRateLimit } from '@/lib/rateLimit';
import { routing } from '@/i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

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

    return supabaseResponse;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
