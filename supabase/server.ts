import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const MIN_SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

export function mergeSessionCookieOptions(options: CookieOptions): CookieOptions {
  const maxAge =
    options.maxAge != null
      ? Math.max(options.maxAge, MIN_SESSION_COOKIE_MAX_AGE)
      : MIN_SESSION_COOKIE_MAX_AGE
  return {
    ...options,
    path: options.path ?? '/',
    sameSite: options.sameSite ?? 'lax',
    maxAge,
  }
}

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key || process.env.NEXT_PHASE === 'phase-production-build') {
        return createServerClient(
            url || 'http://localhost:54321',
            key || 'dummy-key',
            { cookies: { get: () => undefined, set: () => {}, remove: () => {} } }
        )
    }

    const cookieStore = cookies()

    return createServerClient(
        url,
        key,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...mergeSessionCookieOptions(options) })
                    } catch {
                        // Server Component context
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options })
                    } catch {
                        // Server Component context
                    }
                },
            },
        }
    )
}

export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
        return createSupabaseClient('http://localhost:54321', 'dummy-key')
    }

    return createSupabaseClient(
        url,
        key,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )
}
