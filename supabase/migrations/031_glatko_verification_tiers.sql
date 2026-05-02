-- ═══════════════════════════════════════════════════════════════════════════
-- G-PRO-2 Faz 4: Verification Tiers (Basic / Business / Professional)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Three orthogonal axes on a pro profile:
--   - verification_status (existing): pending → approved (admin gate)
--   - is_founding_provider (G-LAUNCH-1): first 50 approved pros (immutable)
--   - verification_tier (NEW): Basic / Business / Professional
--
-- Tier requirements (eligibility, enforced at admin moderation):
--   - Basic: profile complete + admin approval (default for everyone)
--   - Business: + business_registration document verified
--   - Professional: + license verified AND insurance verified
--
-- Founding pros default to Basic — tier is independent of founding
-- status (a Founding pro can be Basic / Business / Professional and
-- both flags surface separately on the public profile).
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. Enum ──────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_tier') THEN
    CREATE TYPE public.verification_tier AS ENUM (
      'basic',
      'business',
      'professional'
    );
  END IF;
END $$;

-- ─── 2. Profile columns ───────────────────────────────────────────────────

DO $$
BEGIN
  ALTER TABLE public.glatko_professional_profiles
    ADD COLUMN IF NOT EXISTS verification_tier public.verification_tier
      DEFAULT 'basic',
    ADD COLUMN IF NOT EXISTS tier_upgraded_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS tier_documents JSONB
      DEFAULT '{}'::jsonb;
END $$;

CREATE INDEX IF NOT EXISTS idx_pro_verification_tier
  ON public.glatko_professional_profiles (verification_tier)
  WHERE verification_status = 'approved';

COMMENT ON COLUMN public.glatko_professional_profiles.verification_tier IS
'G-PRO-2 Faz 4: orthogonal to verification_status (admin gate) and
is_founding_provider (first-50). Defaults to ''basic''. Admin sets
business / professional after verifying the corresponding documents.';

COMMENT ON COLUMN public.glatko_professional_profiles.tier_documents IS
'G-PRO-2 Faz 4: per-document verification metadata. Shape:
{
  "business_registration": { "verified": bool, "verified_at": ISO, "admin": email },
  "license":               { "verified": bool, "verified_at": ISO, "admin": email },
  "insurance":             { "verified": bool, "verified_at": ISO, "admin": email },
  "tax_certificate":       { "verified": bool, "verified_at": ISO, "admin": email }
}
Drives VerificationProofModal docs grid + glatko_check_tier_eligibility.';

-- ─── 3. Eligibility RPC (callable from pro dashboard) ────────────────────

CREATE OR REPLACE FUNCTION public.glatko_check_tier_eligibility(
  p_professional_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_docs JSONB;
  v_business_verified BOOLEAN;
  v_license_verified BOOLEAN;
  v_insurance_verified BOOLEAN;
  v_eligible_tier verification_tier;
BEGIN
  SELECT tier_documents INTO v_docs
  FROM glatko_professional_profiles
  WHERE id = p_professional_id;

  IF v_docs IS NULL THEN
    v_docs := '{}'::jsonb;
  END IF;

  v_business_verified := COALESCE(
    (v_docs->'business_registration'->>'verified')::BOOLEAN,
    false
  );
  v_license_verified := COALESCE(
    (v_docs->'license'->>'verified')::BOOLEAN,
    false
  );
  v_insurance_verified := COALESCE(
    (v_docs->'insurance'->>'verified')::BOOLEAN,
    false
  );

  IF v_license_verified AND v_insurance_verified THEN
    v_eligible_tier := 'professional';
  ELSIF v_business_verified THEN
    v_eligible_tier := 'business';
  ELSE
    v_eligible_tier := 'basic';
  END IF;

  RETURN json_build_object(
    'eligible_tier', v_eligible_tier,
    'business_verified', v_business_verified,
    'license_verified', v_license_verified,
    'insurance_verified', v_insurance_verified,
    'next_tier_requirements',
    CASE v_eligible_tier
      WHEN 'basic' THEN json_build_object(
        'next', 'business',
        'requires', json_build_array('business_registration')
      )
      WHEN 'business' THEN json_build_object(
        'next', 'professional',
        'requires', json_build_array('license', 'insurance')
      )
      ELSE json_build_object(
        'next', null,
        'requires', json_build_array()
      )
    END
  );
END;
$$;

REVOKE ALL ON FUNCTION public.glatko_check_tier_eligibility(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.glatko_check_tier_eligibility(UUID)
  TO authenticated;

COMMENT ON FUNCTION public.glatko_check_tier_eligibility IS
'G-PRO-2 Faz 4: returns the highest tier the pro currently qualifies for
plus the next tier''s missing-document checklist. Admin still has to
flip the row via glatko_admin_set_tier — eligibility is only the hint.';

-- ─── 4. Admin set-tier RPC ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.glatko_admin_set_tier(
  p_professional_id UUID,
  p_tier verification_tier,
  p_documents JSONB DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  UPDATE public.glatko_professional_profiles
  SET
    verification_tier = p_tier,
    tier_upgraded_at = NOW(),
    tier_documents = COALESCE(p_documents, tier_documents)
  WHERE id = p_professional_id;

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.glatko_admin_set_tier(
  UUID, verification_tier, JSONB
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.glatko_admin_set_tier(
  UUID, verification_tier, JSONB
) TO authenticated;

COMMENT ON FUNCTION public.glatko_admin_set_tier IS
'G-PRO-2 Faz 4: admin-only manual tier override. Pass p_documents to
also update the tier_documents JSONB in the same call (atomic).';
