import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/supabase/server';
import { trySendCustomerWelcomeEmail } from '@/lib/email/customer-welcome';
import { defaultLocale } from '@/i18n/routing';

function resolveBaseUrl(request: NextRequest): string {
  const url = new URL(request.url);
  return url.origin;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const rawNext = url.searchParams.get('next') ?? '/';
  const next =
    rawNext.startsWith('/') && !rawNext.startsWith('//') && rawNext.length <= 512
      ? rawNext
      : '/';

  const baseUrl = resolveBaseUrl(request);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnon) {
    return NextResponse.redirect(`${baseUrl}/${defaultLocale}/login?error=auth-callback-failed`);
  }

  if (code) {
    const response = NextResponse.redirect(`${baseUrl}${next}`);
    const supabase = createServerClient(supabaseUrl, supabaseAnon, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user;
        if (user?.id) {
          const fullName =
            (user.user_metadata?.full_name as string | undefined) ??
            (user.user_metadata?.name as string | undefined) ??
            null;
          const admin = createAdminClient();
          await admin.from('profiles').upsert({
            id: user.id,
            full_name: fullName,
            updated_at: new Date().toISOString(),
          });
          await trySendCustomerWelcomeEmail(user.id);
        }
      } catch {
        // Non-blocking
      }
      return response;
    }
  }

  return NextResponse.redirect(`${baseUrl}/${defaultLocale}/login?error=auth-callback-failed`);
}
