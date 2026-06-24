-- 088_anon_execute_lockdown.sql  (audit Sprint #136)
-- Locks down anon/authenticated EXECUTE on SECURITY DEFINER functions that no
-- legitimate logged-out (or cross-user) app path calls. ACLs are explicit
-- (anon/authenticated/service_role) — REVOKE FROM anon,authenticated leaves
-- postgres + service_role intact, so the admin-client (service_role) call paths
-- (dispatch, waitlist, translation, admin RPCs, health/career reads) keep working.
--
-- FILES-ONLY: NOT applied to prod by this commit. 088_rollback.sql reverses every
-- grant for instant recovery. Apply via apply_migration after merge; then run the
-- POST-APPLY lock-flow smoke test (see PR) and rollback immediately if anything breaks.
--
-- IDEMPOTENT: REVOKE/GRANT/ALTER are re-runnable no-ops when already applied.
--
-- Classification (call site verified by grep, file:line in PR): A=trigger,
-- B=backend/service-role/internal, Q1=service-role admin/helper, Q2=flag-gated
-- vertical reads (service-role), C=authenticated user-action (guard), D=public read (untouched).

-- ───────────────── A — TRIGGER functions → REVOKE anon + authenticated ─────────────────
-- (Triggers run with the table owner's rights; no role needs REST EXECUTE.)
REVOKE EXECUTE ON FUNCTION public.glatko_on_quote_completion_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.glatko_populate_profile_email() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.glatko_update_pro_rating_from_quote_reviews() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.glatko_update_pro_response_metrics() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- ───────────────── B — backend / service-role / internal → REVOKE anon + authenticated ─────────────────
-- dispatch/waitlist: match-dispatch.ts via createAdminClient (service_role); translation:
-- openai-translator.ts via createAdminClient; get_request_matches: internal (no app caller,
-- PERFORMed by dispatch); ensure_customer_profile: internal (PERFORMed, migr 030).
REVOKE EXECUTE ON FUNCTION public.glatko_dispatch_request_notifications(p_request_id uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.glatko_activate_waitlist(p_request_id uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.glatko_find_pending_waitlist_activations(p_min_age_minutes integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.glatko_save_translation(p_source_text text, p_source_locale text, p_target_locale text, p_translated_text text, p_model text, p_token_input integer, p_token_output integer, p_cost_usd numeric, p_cache_key text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.glatko_lookup_translation(p_cache_key text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.glatko_get_request_matches(p_request_id uuid, p_limit integer, p_primary_count integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.glatko_ensure_customer_profile(p_user_id uuid, p_locale text) FROM PUBLIC, anon, authenticated;

-- ───────────────── Q1 — service-role admin/helpers (admin.rpc) → REVOKE anon + authenticated ─────────────────
REVOKE EXECUTE ON FUNCTION public.glatko_admin_set_tier(p_professional_id uuid, p_tier verification_tier, p_documents jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.glatko_launch_metrics() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.glatko_calculate_profile_completion(p_professional_id uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.glatko_check_tier_eligibility(p_professional_id uuid) FROM PUBLIC, anon, authenticated;

-- ───────────────── Q2 — flag-gated vertical reads (service-role; verticals OFF/404) → REVOKE anon + authenticated ─────────────────
-- ⚠️ re-GRANT at vertical launch: when health/career go live with anon-facing reads,
--    re-GRANT EXECUTE (scoped to anon and/or authenticated as needed) + run a public
--    smoke-test. Currently called only via createAdminClient (saglik/queries.ts,
--    kariyer/queries.ts); definer fns bypass RLS on health tables, so anon-exec is a
--    latent leak regardless of return shape.
REVOKE EXECUTE ON FUNCTION public.career_list_sectors(p_locale text) FROM PUBLIC, anon, authenticated;  -- re-GRANT at vertical launch
REVOKE EXECUTE ON FUNCTION public.health_get_availability_inputs(p_provider_id uuid, p_service_id uuid, p_location_id uuid, p_from timestamp with time zone, p_to timestamp with time zone) FROM PUBLIC, anon, authenticated;  -- re-GRANT at vertical launch
REVOKE EXECUTE ON FUNCTION public.health_get_availability_inputs_by_specialty(p_specialty_slug text, p_from timestamp with time zone, p_to timestamp with time zone) FROM PUBLIC, anon, authenticated;  -- re-GRANT at vertical launch
REVOKE EXECUTE ON FUNCTION public.health_get_booking_options(p_slug text, p_locale text) FROM PUBLIC, anon, authenticated;  -- re-GRANT at vertical launch
REVOKE EXECUTE ON FUNCTION public.health_get_provider(p_slug text, p_locale text) FROM PUBLIC, anon, authenticated;  -- re-GRANT at vertical launch
REVOKE EXECUTE ON FUNCTION public.health_list_specialties(p_locale text) FROM PUBLIC, anon, authenticated;  -- re-GRANT at vertical launch
REVOKE EXECUTE ON FUNCTION public.health_providers_by_specialty(p_specialty_slug text, p_locale text) FROM PUBLIC, anon, authenticated;  -- re-GRANT at vertical launch
REVOKE EXECUTE ON FUNCTION public.health_search_providers(p_specialty_slug text, p_locale text, p_city text, p_langs text[], p_mode text, p_lat double precision, p_lng double precision, p_radius_m integer) FROM PUBLIC, anon, authenticated;  -- re-GRANT at vertical launch

-- ───────────────── C — authenticated user-actions (auth.uid()/is_admin guard) → REVOKE anon ONLY (keep authenticated) ─────────────────
REVOKE EXECUTE ON FUNCTION public.glatko_get_or_create_thread(p_request_id uuid, p_professional_id uuid, p_initial_quote_id uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.glatko_mark_thread_read(p_thread_id uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.glatko_pro_mark_complete(p_quote_id uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.glatko_customer_confirm_completion(p_quote_id uuid, p_confirmed boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.glatko_pro_respond_to_review(p_review_id uuid, p_response text) FROM PUBLIC, anon;
-- check_founding_customer: request-service action, called only inside if(customerId) → authenticated.
REVOKE EXECUTE ON FUNCTION public.glatko_check_founding_customer(p_user_id uuid) FROM PUBLIC, anon;
-- Re-GRANT authenticated explicitly (safety net: if any C fn was PUBLIC-only, the
-- REVOKE PUBLIC above would have stripped authenticated too).
GRANT EXECUTE ON FUNCTION public.glatko_get_or_create_thread(p_request_id uuid, p_professional_id uuid, p_initial_quote_id uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.glatko_mark_thread_read(p_thread_id uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.glatko_pro_mark_complete(p_quote_id uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.glatko_customer_confirm_completion(p_quote_id uuid, p_confirmed boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.glatko_pro_respond_to_review(p_review_id uuid, p_response text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.glatko_check_founding_customer(p_user_id uuid) TO authenticated;

-- ───────────────── D — PUBLIC READ → UNTOUCHED ─────────────────
-- glatko_search, get_auth_methods (login UX), glatko_founding_counts (anon FoundingCounter),
-- glatko_provider_count_by_category_city, glatko_get_request_questions,
-- glatko_get_pro_application_questions, glatko_liquid_combinations, is_admin (RLS dependency).

-- ───────────────── 0.4 — search_path ─────────────────
-- is_admin: body is fully schema-qualified (public.profiles + auth.uid()) → safe.
ALTER FUNCTION public.is_admin() SET search_path = public, pg_temp;
-- handle_new_user: DEFERRED (auth.users signup trigger). Body is fully qualified
-- (only public.profiles) so it IS safe to add, but deferred per the "defer risky" rule;
-- include in a follow-up after a real-signup smoke-test if desired.

-- ───────────────── Storage: stop anon ENUMERATION of job photos ─────────────────
-- glatko-request-photos is a PUBLIC bucket → object URLs serve without any policy;
-- this broad public SELECT policy only enables LISTING/enumeration of all job photos
-- (possible PII). Dropping it stops anon enumeration; direct URL access is unaffected.
-- insert/update/delete remain owner-scoped (request_photos_owner_*).
DROP POLICY IF EXISTS "request_photos_public_select" ON storage.objects;
