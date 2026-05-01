-- ============================================================================
-- 025_glatko_request_status_rejected.sql
-- G-REQ-1 Faz 8: Add 'rejected' status to glatko_service_requests.
--
-- The admin moderation panel needs a distinct entry-state alongside
-- 'cancelled': 'cancelled' is a user-initiated close, while 'rejected'
-- is an admin-initiated denial of a pending submission. They surface
-- different copy in user notifications and analytics.
-- ============================================================================

BEGIN;

ALTER TABLE public.glatko_service_requests
  DROP CONSTRAINT IF EXISTS glatko_service_requests_status_check;

ALTER TABLE public.glatko_service_requests
  ADD CONSTRAINT glatko_service_requests_status_check
  CHECK (status IN (
    'draft',
    'pending_moderation',
    'published',
    'bidding',
    'assigned',
    'in_progress',
    'completed',
    'reviewed',
    'closed',
    'expired',
    'cancelled',
    'rejected'
  ));

COMMIT;
