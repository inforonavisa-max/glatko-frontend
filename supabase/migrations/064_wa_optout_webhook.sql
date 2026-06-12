-- ═══════════════════════════════════════════════════════════════
-- 064: G-WA-OPTOUT — inbound STOP webhook altyapısı
-- ═══════════════════════════════════════════════════════════════
-- Applied to prod 2026-06-12 via MCP apply_migration (Gate onaylı).
-- Verification: CHECK 4 değer ✓ (ihlal 0), RLS enabled + 0 policy ✓,
-- index ✓, RPC prosecdef=true + grantees yalnız postgres/service_role ✓,
-- RPC canlı test: '38268609165' ve '+38268609165' → b304164a ✓.
--
-- WhatsApp inbound (MO) opt-out: kullanıcı Glatko sender'ına STOP
-- yazınca app/api/webhooks/infobip-whatsapp bu altyapıyla suppress eder.
-- Send-layer değişikliği YOK — whatsappEligible zaten
-- profiles.messaging_opt_in === true şartı koşuyor (external-dispatch.ts).
--
-- Rollback:
--   ALTER TABLE public.profiles DROP CONSTRAINT profiles_opt_in_source_check;
--   ALTER TABLE public.profiles ADD CONSTRAINT profiles_opt_in_source_check
--     CHECK (opt_in_source IN ('signup','settings','manual'));
--   DROP TABLE public.wa_inbound_events;
--   DROP FUNCTION public.find_users_by_phone(text);

-- (a) opt_in_source CHECK += 'whatsapp_stop'
--     (prod'daki mevcut ad doğrulandı: profiles_opt_in_source_check, 059)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_opt_in_source_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_opt_in_source_check
  CHECK (opt_in_source IN ('signup','settings','manual','whatsapp_stop'));

-- (b) inbound audit tablosu — RLS açık, POLİTİKA YOK → yalnız service-role erişir
CREATE TABLE public.wa_inbound_events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  received_at      timestamptz NOT NULL DEFAULT now(),
  from_phone       text NOT NULL,
  message_text     text,
  matched_user_ids uuid[] NOT NULL DEFAULT '{}',
  action           text NOT NULL CHECK (action IN ('opt_out','optin_request','none')),
  raw              jsonb NOT NULL
);
ALTER TABLE public.wa_inbound_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX wa_inbound_events_received_at_idx
  ON public.wa_inbound_events (received_at DESC);

COMMENT ON TABLE public.wa_inbound_events IS
'G-WA-OPTOUT: Infobip WhatsApp inbound (MO) webhook audit log. Her inbound
mesaj bir satır: STOP eşleşmesi → action=opt_out (+ suppress edilen user
id''leri), START → optin_request (yalnız log, otomatik opt-in YOK), diğer
her şey → none. RLS politikasız → yalnız service-role.';

-- (c) telefon → user id(ler) — auth.users PostgREST'ten okunamadığı için
--     SECURITY DEFINER. auth.users.phone UNIQUE (users_phone_key) → pratikte
--     0/1 satır; SETOF savunmacı (+''lı/+''sız varyant ikisi de eşlenir).
CREATE OR REPLACE FUNCTION public.find_users_by_phone(p_phone text)
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth
AS $$
  SELECT id FROM auth.users
  WHERE phone = regexp_replace(trim(p_phone), '^\+', '')
     OR phone = '+' || regexp_replace(trim(p_phone), '^\+', '');
$$;
REVOKE EXECUTE ON FUNCTION public.find_users_by_phone(text) FROM PUBLIC, anon, authenticated;
