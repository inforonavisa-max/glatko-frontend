import createIntlMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/supabase/middleware';
import { enforceRateLimit } from '@/lib/rateLimit';
import { routing } from '@/i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith('/api/') || pathname.startsWith('/auth/')) {
        const limited = await enforceRateLimit(request);
        if (limited) return limited;
        return await updateSession(request);
    }

    const limited = await enforceRateLimit(request);
    if (limited) return limited;

    const intlResponse = intlMiddleware(request);

    const supabaseResponse = await updateSession(request);

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
