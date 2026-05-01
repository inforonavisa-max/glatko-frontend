-- ============================================================================
-- 023_glatko_request_status_pending.sql
-- G-REQ-1: Allow `status='pending_moderation'` on glatko_service_requests.
--
-- The existing CHECK constraint enumerates the production lifecycle
-- (draft → published → bidding → … → completed/cancelled). G-REQ-1's
-- admin moderation flow needs an extra entry-state, `pending_moderation`,
-- in which freshly-submitted requests sit until an admin approves them
-- (and they flip to `published` for pros to bid on).
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
    'cancelled'
  ));

COMMIT;
