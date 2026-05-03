-- ═══════════════════════════════════════════════════════════════════════════
-- G-ADMIN-1 migration 045: admin action audit log
-- ═══════════════════════════════════════════════════════════════════════════
-- Captures every destructive admin action (approve/reject/ban/role-change/etc.)
-- for compliance and debugging. UI for viewing logs ships in G-AUDIT-1
-- (post-launch).
--
-- Design notes:
--   - admin_email frozen on the row (not derived via JOIN) so the audit
--     survives admin profile deletions.
--   - target_id is nullable because some actions (e.g. bulk operations)
--     may not target a specific row.
--   - payload + reason capture context that the action_type alone cannot
--     express; both are JSONB / TEXT so we don't have to evolve the
--     schema for new action shapes.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.glatko_admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  admin_email TEXT NOT NULL,
  action_type TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id UUID,
  payload JSONB,
  reason TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_admin
  ON public.glatko_admin_audit_log(admin_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_target
  ON public.glatko_admin_audit_log(target_table, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action
  ON public.glatko_admin_audit_log(action_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_created
  ON public.glatko_admin_audit_log(created_at DESC);

ALTER TABLE public.glatko_admin_audit_log ENABLE ROW LEVEL SECURITY;

-- service-role (admin REST clients) full access
CREATE POLICY "service_role_all" ON public.glatko_admin_audit_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- authenticated users can read THEIR OWN audit entries (self-history view)
CREATE POLICY "admin_read_own" ON public.glatko_admin_audit_log
  FOR SELECT TO authenticated
  USING (admin_user_id = auth.uid());

COMMENT ON TABLE public.glatko_admin_audit_log IS
  'G-ADMIN-1: Audit log of all destructive admin actions. UI in G-AUDIT-1 post-launch.';
