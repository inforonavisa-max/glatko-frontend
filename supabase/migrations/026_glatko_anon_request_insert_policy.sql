-- ═══════════════════════════════════════════════════════════════════════════
-- G-REQ-1 Hotfix: Anonim user insert için RLS policy
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Migration 021'de glatko_service_requests anonymous_email kolonu eklendi
-- ama anon user insert için RLS policy eklenmedi.
--
-- Sonuç: Anonim wizard submit RLS reddedildiği için DB'ye yazılamıyor,
-- silent fail (action error catch eder, email firing'a ulaşmaz).
--
-- Bu migration anonim INSERT'e izin verir, üç güvenlik koşulu enforce edilir:
--   1. customer_id IS NULL          (kimlik bypass yasak)
--   2. anonymous_email IS NOT NULL  (email zorunlu)
--   3. status = 'pending_moderation' (auto-publish bypass yasak)
--
-- Moderation gate korunur: anon user direkt published row yaratamaz.
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Anonymous can submit pending requests"
  ON public.glatko_service_requests;

CREATE POLICY "Anonymous can submit pending requests"
  ON public.glatko_service_requests
  FOR INSERT
  TO anon
  WITH CHECK (
    customer_id IS NULL
    AND anonymous_email IS NOT NULL
    AND status = 'pending_moderation'
  );
