-- 088_rollback.sql  — emergency reverse of 088_anon_execute_lockdown.sql
-- Restores every EXECUTE grant + the storage list policy + is_admin search_path,
-- for instant recovery if the POST-APPLY smoke test fails. IDEMPOTENT.
-- Run: apply_migration (or execute_sql) with this body.

-- ── Reverse A + B + Q1 + Q2 (revoke-both → GRANT anon + authenticated) ──
GRANT EXECUTE ON FUNCTION public.glatko_on_quote_completion_change() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.glatko_populate_profile_email() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.glatko_update_pro_rating_from_quote_reviews() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.glatko_update_pro_response_metrics() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.glatko_dispatch_request_notifications(p_request_id uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.glatko_activate_waitlist(p_request_id uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.glatko_find_pending_waitlist_activations(p_min_age_minutes integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.glatko_save_translation(p_source_text text, p_source_locale text, p_target_locale text, p_translated_text text, p_model text, p_token_input integer, p_token_output integer, p_cost_usd numeric, p_cache_key text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.glatko_lookup_translation(p_cache_key text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.glatko_get_request_matches(p_request_id uuid, p_limit integer, p_primary_count integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.glatko_ensure_customer_profile(p_user_id uuid, p_locale text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.glatko_admin_set_tier(p_professional_id uuid, p_tier verification_tier, p_documents jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.glatko_launch_metrics() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.glatko_calculate_profile_completion(p_professional_id uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.glatko_check_tier_eligibility(p_professional_id uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.career_list_sectors(p_locale text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.health_get_availability_inputs(p_provider_id uuid, p_service_id uuid, p_location_id uuid, p_from timestamp with time zone, p_to timestamp with time zone) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.health_get_availability_inputs_by_specialty(p_specialty_slug text, p_from timestamp with time zone, p_to timestamp with time zone) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.health_get_booking_options(p_slug text, p_locale text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.health_get_provider(p_slug text, p_locale text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.health_list_specialties(p_locale text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.health_providers_by_specialty(p_specialty_slug text, p_locale text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.health_search_providers(p_specialty_slug text, p_locale text, p_city text, p_langs text[], p_mode text, p_lat double precision, p_lng double precision, p_radius_m integer) TO anon, authenticated;

-- ── Reverse C (revoke-anon-only → GRANT anon back) ──
GRANT EXECUTE ON FUNCTION public.glatko_get_or_create_thread(p_request_id uuid, p_professional_id uuid, p_initial_quote_id uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.glatko_mark_thread_read(p_thread_id uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.glatko_pro_mark_complete(p_quote_id uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.glatko_customer_confirm_completion(p_quote_id uuid, p_confirmed boolean) TO anon;
GRANT EXECUTE ON FUNCTION public.glatko_pro_respond_to_review(p_review_id uuid, p_response text) TO anon;
GRANT EXECUTE ON FUNCTION public.glatko_check_founding_customer(p_user_id uuid) TO anon;

-- ── Reverse search_path ──
ALTER FUNCTION public.is_admin() RESET search_path;

-- ── Reverse storage list policy ──
DROP POLICY IF EXISTS "request_photos_public_select" ON storage.objects;
CREATE POLICY "request_photos_public_select" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'glatko-request-photos');
