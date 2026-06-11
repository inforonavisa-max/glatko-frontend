-- ═══════════════════════════════════════════════════════════════
-- 062: G-REQ-2 — quote INSERT blocked by RLS via metrics trigger
-- ═══════════════════════════════════════════════════════════════
-- Bug (found by the FIRST real UI quote submission, 2026-06-11):
-- trg_update_response_metrics on glatko_request_quotes runs
-- glatko_update_pro_response_metrics() with INVOKER rights. The
-- authenticated pro has no INSERT/UPDATE policy on
-- glatko_pro_response_metrics (033 only grants SELECT own + admin all),
-- and no UPDATE policy on glatko_request_notifications (quote_id
-- backfill), so the trigger — and with it the whole quote INSERT —
-- fails with "new row violates row-level security policy".
--
-- R0's SQL smoke missed this because service-role bypasses RLS.
--
-- Fix: SECURITY DEFINER, matching the pattern of every sibling
-- trigger/RPC in 037/061 (rating trigger, completion change,
-- mark-complete, confirm-completion). Body unchanged. search_path
-- pinned per Supabase SECURITY DEFINER lint guidance.
--
-- Rollback:
--   ALTER FUNCTION public.glatko_update_pro_response_metrics()
--     SECURITY INVOKER;

ALTER FUNCTION public.glatko_update_pro_response_metrics()
  SECURITY DEFINER
  SET search_path = public;
