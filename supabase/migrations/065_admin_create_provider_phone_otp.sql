-- ═══════════════════════════════════════════════════════════════════════════
-- G-ADMIN-PROMOTE-PHONE-OTP migration 065: unblock phone-OTP users in the
-- admin provider-create RPC (root-cause fix).
-- ═══════════════════════════════════════════════════════════════════════════
-- glatko_admin_create_provider (migration 048) used profiles.email IS NULL as
-- a proxy for "profile not found". A phone-OTP signup legitimately has a real
-- profiles row with NULL email (its identifiers live on auth.users), so the
-- RPC hard-blocked every phone-OTP promote with a misleading "Profile not
-- found". This made phone-only users impossible to promote through the RPC,
-- and PR #115 worked around it with an app-layer direct write — not durable.
--
-- This migration fixes the root cause IN the RPC so promote and create share
-- the one atomic write path again. CREATE OR REPLACE, signature UNCHANGED
-- (payload jsonb) — no caller changes required.
--
-- ── Exactly two behaviour changes (everything else byte-identical) ─────────
--   1. Profile existence is checked by ROW existence (IF NOT FOUND), not by
--      email-null. So "row exists but email is NULL" (phone-OTP) now proceeds
--      instead of returning NOT_FOUND. This is the previously-100%-broken path.
--   2. When profiles.email / profiles.phone are NULL, contact is sourced from
--      auth.users (no new RPC parameter). A user with NEITHER email nor phone
--      anywhere returns a real NO_CONTACT error (phone-OTP users always have a
--      phone, so they pass).
--
-- v_actual_email / v_actual_phone feed ONLY the existence + contact + email-
-- match guards. They never feed the INSERT/UPDATE (those read payload values),
-- so for any user that already had an email the resulting rows are identical
-- to migration 048. The email-match guard is unchanged for email users
-- (v_actual_email = profiles.email as before).
--
-- DO NOT re-apply blindly; CREATE OR REPLACE makes it idempotent.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.glatko_admin_create_provider(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  v_user_id          uuid;
  v_expected_email   text;
  v_actual_email     text;
  v_actual_phone     text;
  v_auth_email       text;
  v_auth_phone       text;
  v_slug             text;
  v_existing_slug_business text;
  v_is_founding      boolean;
  v_founding_number  int;
  v_verified_at      timestamptz;
  v_primary_count    int;
  v_service          jsonb;
BEGIN
  -- ─── Extract + basic shape guards ────────────────────────────────────
  v_user_id   := NULLIF(payload->>'user_id', '')::uuid;
  v_slug      := NULLIF(payload->>'slug', '');
  v_is_founding := COALESCE((payload->>'is_founding_provider')::boolean, false);
  v_expected_email := NULLIF(payload->>'expected_email', '');

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'user_id required', 'code', 'INVALID_INPUT');
  END IF;

  IF v_slug IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'slug required', 'code', 'INVALID_INPUT');
  END IF;

  IF jsonb_typeof(payload->'services') <> 'array'
     OR jsonb_array_length(payload->'services') < 1 THEN
    RETURN jsonb_build_object('success', false, 'error', 'At least one service required', 'code', 'INVALID_INPUT');
  END IF;

  SELECT count(*) INTO v_primary_count
  FROM jsonb_array_elements(payload->'services') AS s
  WHERE (s->>'is_primary')::boolean = true;

  IF v_primary_count <> 1 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   format('Exactly one primary service required (got %s)', v_primary_count),
      'code',    'INVALID_INPUT'
    );
  END IF;

  -- ─── Pre-flight: profile existence + contact resolution ──────────────
  -- Check ROW existence directly. A phone-OTP signup has a real profiles row
  -- with NULL email, so email-null is NOT a valid "missing profile" proxy.
  SELECT email, phone INTO v_actual_email, v_actual_phone
  FROM public.profiles WHERE id = v_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Profile not found for user_id', 'code', 'NOT_FOUND');
  END IF;

  -- Contact fallback: phone-OTP users carry NULL email/phone in profiles —
  -- their identifiers live on auth.users. Source from there when profiles is
  -- sparse so the match guard still has an email and we can confirm contact.
  IF v_actual_email IS NULL OR v_actual_phone IS NULL THEN
    SELECT au.email, au.phone INTO v_auth_email, v_auth_phone
    FROM auth.users au WHERE au.id = v_user_id;
    v_actual_email := COALESCE(v_actual_email, v_auth_email);
    v_actual_phone := COALESCE(v_actual_phone, v_auth_phone);
  END IF;

  -- A user with NEITHER email nor phone anywhere has no contact — real error.
  IF v_actual_email IS NULL AND v_actual_phone IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User has no email or phone contact', 'code', 'NO_CONTACT');
  END IF;

  -- Email-match guard: only when the caller asserts an expected email AND the
  -- user actually has one. Unchanged for email users (phone-OTP passes empty).
  IF v_expected_email IS NOT NULL AND v_actual_email IS NOT NULL
     AND v_actual_email <> v_expected_email THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   format('Email mismatch: expected %s, got %s', v_expected_email, v_actual_email),
      'code',    'EMAIL_MISMATCH'
    );
  END IF;

  -- ─── Pre-flight: no duplicate pro profile ────────────────────────────
  IF EXISTS (SELECT 1 FROM public.glatko_professional_profiles WHERE id = v_user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'Provider profile already exists for this user',
      'code',    'DUPLICATE_PRO'
    );
  END IF;

  -- ─── Pre-flight: slug uniqueness ─────────────────────────────────────
  SELECT business_name INTO v_existing_slug_business
  FROM public.glatko_professional_profiles WHERE slug = v_slug;
  IF v_existing_slug_business IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   format('Slug already taken: %s (used by "%s")', v_slug, v_existing_slug_business),
      'code',    'DUPLICATE_SLUG'
    );
  END IF;

  -- ─── Compute founding number (race protected by partial unique index) ─
  IF v_is_founding THEN
    SELECT COALESCE(MAX(founding_provider_number), 0) + 1
    INTO v_founding_number
    FROM public.glatko_professional_profiles
    WHERE is_founding_provider = true;
  END IF;

  -- ─── Compute verified_at if marking verified ─────────────────────────
  IF COALESCE((payload->>'is_verified')::boolean, false) THEN
    v_verified_at := now();
  END IF;

  -- ─── Update profiles row (phone, city, full_name, locale, avatar) ────
  UPDATE public.profiles
  SET
    phone            = COALESCE(NULLIF(payload->>'phone', ''),            phone),
    city             = COALESCE(NULLIF(payload->>'city_display', ''),     city),
    full_name        = COALESCE(NULLIF(payload->>'full_name', ''),        full_name),
    preferred_locale = COALESCE(NULLIF(payload->>'preferred_locale', ''), preferred_locale),
    avatar_url       = COALESCE(NULLIF(payload->>'avatar_url', ''),       avatar_url),
    updated_at       = now()
  WHERE id = v_user_id;

  -- ─── Insert glatko_professional_profiles ─────────────────────────────
  INSERT INTO public.glatko_professional_profiles (
    id, business_name, slug, phone, bio,
    hourly_rate_min, hourly_rate_max, years_experience,
    location_city, service_radius_km, languages,
    is_verified, verified_at, is_active,
    verification_status, verification_tier,
    insurance_status, portfolio_images,
    is_founding_provider, founding_provider_at, founding_provider_number
  ) VALUES (
    v_user_id,
    NULLIF(payload->>'business_name', ''),
    v_slug,
    NULLIF(payload->>'phone', ''),
    NULLIF(payload->>'bio', ''),
    NULLIF(payload->>'hourly_rate_min', '')::numeric,
    NULLIF(payload->>'hourly_rate_max', '')::numeric,
    NULLIF(payload->>'years_experience', '')::int,
    NULLIF(payload->>'location_city', ''),
    COALESCE(NULLIF(payload->>'service_radius_km', '')::int, 25),
    COALESCE(
      ARRAY(SELECT jsonb_array_elements_text(payload->'languages')),
      ARRAY['en']::text[]
    ),
    COALESCE((payload->>'is_verified')::boolean, false),
    v_verified_at,
    COALESCE((payload->>'is_active')::boolean, true),
    COALESCE(NULLIF(payload->>'verification_status', ''), 'pending'),
    COALESCE(NULLIF(payload->>'verification_tier', ''), 'basic')::verification_tier,
    COALESCE(NULLIF(payload->>'insurance_status', ''), 'none'),
    COALESCE(
      ARRAY(SELECT jsonb_array_elements_text(payload->'portfolio_images')),
      ARRAY[]::text[]
    ),
    v_is_founding,
    CASE WHEN v_is_founding THEN now() ELSE NULL END,
    v_founding_number
  );

  -- ─── Insert glatko_pro_services rows ─────────────────────────────────
  FOR v_service IN SELECT * FROM jsonb_array_elements(payload->'services')
  LOOP
    INSERT INTO public.glatko_pro_services (professional_id, category_id, is_primary)
    VALUES (
      v_user_id,
      (v_service->>'category_id')::uuid,
      COALESCE((v_service->>'is_primary')::boolean, false)
    );
  END LOOP;

  RETURN jsonb_build_object(
    'success',         true,
    'provider_id',     v_user_id,
    'founding_number', v_founding_number,
    'slug',            v_slug
  );

EXCEPTION
  WHEN unique_violation THEN
    -- Most likely the partial unique index on founding_provider_number
    -- (concurrent admins promoting two founding pros at the same time),
    -- or someone snuck a slug between our pre-flight check and INSERT,
    -- or the PK (a pro row appeared between the DUPLICATE_PRO check and
    -- the INSERT — e.g. the public become-a-pro wizard upserting by id).
    RETURN jsonb_build_object(
      'success', false,
      'error',   SQLERRM,
      'code',    'UNIQUE_VIOLATION'
    );
  WHEN foreign_key_violation THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'Invalid foreign key: ' || SQLERRM,
      'code',    'FK_VIOLATION'
    );
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   SQLERRM,
      'code',    SQLSTATE
    );
END;
$function$;

-- Re-assert execute grants (service_role only; see migration 048 SECURITY
-- note). CREATE OR REPLACE preserves grants, but re-stating is explicit and
-- idempotent.
REVOKE ALL ON FUNCTION public.glatko_admin_create_provider(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.glatko_admin_create_provider(jsonb) TO service_role;
