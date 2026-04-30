import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookieOptions: {
      // 30 days. Without an explicit Max-Age, @supabase/ssr v0.8 leaves
      // cookies as session-only and the browser deletes them on close —
      // user is forced to log in again. See G-AUTH-1.
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    },
  }
)
