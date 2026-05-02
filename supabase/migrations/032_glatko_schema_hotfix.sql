-- ═══════════════════════════════════════════════════════════════════════════
-- G-REQ-2 Faz 0: PR #19 sırasında keşfedilen schema bug'larının fix'i
-- ═══════════════════════════════════════════════════════════════════════════
--
-- 1. insurance_status CHECK constraint:
--    G-PRO-1 wizard 'business' ve 'professional' pillerini kullanıyor
--    ama mevcut CHECK sadece 'none' / 'self_reported' / 'verified' kabul
--    ediyor. Wizard ile DB arasındaki uyumsuzluk INSERT'leri kırıyor;
--    yeni değerleri whitelist'e ekliyoruz.
--
-- 2. profiles.email auto-populate trigger:
--    Manuel INSERT'lerde profiles.email NULL kalmamalı (test data setup
--    ve admin seed yolları için). auth.users'taki email'i otomatik
--    kopyalayan BEFORE INSERT trigger.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. insurance_status CHECK genişlet ────────────────────────────────────

ALTER TABLE public.glatko_professional_profiles
  DROP CONSTRAINT IF EXISTS glatko_professional_profiles_insurance_status_check;

ALTER TABLE public.glatko_professional_profiles
  ADD CONSTRAINT glatko_professional_profiles_insurance_status_check
  CHECK (
    insurance_status IS NULL
    OR insurance_status IN (
      'none',
      'self_reported',
      'verified',
      'private',
      'business',
      'professional'
    )
  );

-- ─── 2. Profiles email auto-populate trigger ──────────────────────────────

CREATE OR REPLACE FUNCTION public.glatko_populate_profile_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NEW.email IS NULL THEN
    SELECT email INTO NEW.email
    FROM auth.users
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_populate_profile_email ON public.profiles;
CREATE TRIGGER trg_populate_profile_email
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.glatko_populate_profile_email();

COMMENT ON FUNCTION public.glatko_populate_profile_email IS
'G-REQ-2 Faz 0: backfills profiles.email from auth.users when an INSERT
omits the email (manual seed / admin scripts). Existing automatic
public.handle_new_user trigger already supplies email for the standard
signup flow — this trigger is the safety net for direct DB writes.';
