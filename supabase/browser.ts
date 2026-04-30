import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    return createBrowserClient(
        url || 'http://localhost:54321',
        key || 'placeholder',
        {
            cookieOptions: {
                // 30 days. See G-AUTH-1: without Max-Age the @supabase/ssr
                // browser client leaves auth cookies session-only and they
                // are deleted on browser close.
                maxAge: 60 * 60 * 24 * 30,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
        }
    )
}
