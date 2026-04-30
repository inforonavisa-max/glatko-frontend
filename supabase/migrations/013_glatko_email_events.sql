-- G-DELIVERABILITY-1: track Resend webhook events for deliverability monitoring,
-- bounce handling, and spam-complaint tracking. Service-role only — no RLS
-- policies for end users; we never want a customer reading other customers'
-- email history.
CREATE TABLE IF NOT EXISTS public.email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'sent',
    'delivered',
    'delivery_delayed',
    'opened',
    'clicked',
    'bounced',
    'complained'
  )),
  recipient TEXT NOT NULL,
  bounce_type TEXT CHECK (bounce_type IN ('hard', 'soft')),
  bounce_message TEXT,
  tags JSONB,
  occurred_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_events_recipient
  ON public.email_events(recipient);
CREATE INDEX IF NOT EXISTS idx_email_events_event_type
  ON public.email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_occurred_at
  ON public.email_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_events_email_id
  ON public.email_events(email_id);

ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.email_events IS
'Email delivery events from Resend webhooks. Used for deliverability '
'monitoring, bounce handling, and spam complaint tracking. RLS: '
'service-role only — no end-user queries.';

-- Lookup helper: bounce webhook receives only the recipient email; we need
-- the auth.users.id to flag user_metadata. PostgREST cannot read auth.*
-- directly, so we expose a SECURITY DEFINER function locked to service_role.
CREATE OR REPLACE FUNCTION public.glatko_get_user_id_by_email(p_email TEXT)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT id FROM auth.users WHERE email = p_email LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.glatko_get_user_id_by_email(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.glatko_get_user_id_by_email(TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.glatko_get_user_id_by_email(TEXT) TO service_role;

COMMENT ON FUNCTION public.glatko_get_user_id_by_email(TEXT) IS
'Service-role-only lookup used by the Resend webhook handler to map a '
'bounce/complaint recipient back to its auth.users.id.';
