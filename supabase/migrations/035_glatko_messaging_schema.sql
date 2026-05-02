-- ═══════════════════════════════════════════════════════════════════════════
-- G-MSG-1: In-app messaging — request × pro thread model
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Two new tables build the customer↔pro chat surface:
--
--   glatko_message_threads   — one row per (request, pro). Customer-initiated
--                              from the 3-quote view; uniquely keyed on the
--                              request+pro pair so the same conversation is
--                              never duplicated.
--   glatko_thread_messages   — message rows. Distinct from the legacy
--                              glatko_messages (conversation_id-based, used
--                              by the bid /inbox/) which we leave untouched.
--                              Both schemas can coexist; the new flow uses
--                              thread_id and the legacy flow uses
--                              conversation_id.
--
-- Why a new table instead of extending glatko_messages: the legacy table has
-- a NOT NULL conversation_id and `content` (vs. `body`); making it work
-- both ways would force optional columns and a column-name change that
-- ripples through ChatRoom.tsx + getUserConversations(). Cleaner to ship a
-- parallel surface for now and consolidate later.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. Threads ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.glatko_message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL
    REFERENCES public.glatko_service_requests(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL
    REFERENCES public.glatko_professional_profiles(id) ON DELETE CASCADE,
  customer_id UUID
    REFERENCES auth.users(id) ON DELETE SET NULL,

  initial_quote_id UUID
    REFERENCES public.glatko_request_quotes(id) ON DELETE SET NULL,

  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'archived', 'blocked')),

  -- Cached for inbox list — avoids LATERAL JOIN to last message every render.
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  last_message_sender_id UUID,

  customer_unread_count INTEGER NOT NULL DEFAULT 0
    CHECK (customer_unread_count >= 0),
  pro_unread_count INTEGER NOT NULL DEFAULT 0
    CHECK (pro_unread_count >= 0),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (request_id, professional_id)
);

CREATE INDEX IF NOT EXISTS idx_threads_customer
  ON public.glatko_message_threads (customer_id, last_message_at DESC NULLS LAST)
  WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_threads_pro
  ON public.glatko_message_threads (professional_id, last_message_at DESC NULLS LAST)
  WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_threads_request
  ON public.glatko_message_threads (request_id);

COMMENT ON TABLE public.glatko_message_threads IS
'G-MSG-1: customer↔pro chat thread, one per (request, pro) pair. Created by
glatko_get_or_create_thread RPC from the customer-initiated 3-quote view.';

-- ─── 2. Thread messages ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.glatko_thread_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL
    REFERENCES public.glatko_message_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL
    REFERENCES auth.users(id) ON DELETE CASCADE,

  body TEXT NOT NULL CHECK (length(btrim(body)) BETWEEN 1 AND 5000),
  body_locale TEXT NOT NULL,

  -- AI translation columns reserved for G-MSG-2; left NULL for now.
  translated_body TEXT,
  translated_locale TEXT,
  translation_provider TEXT,

  read_at TIMESTAMPTZ,

  -- Attachments parked for future; not rendered in PR #22.
  attachment_url TEXT,
  attachment_type TEXT
    CHECK (attachment_type IS NULL OR attachment_type IN ('image', 'pdf', 'audio')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_thread_messages_thread
  ON public.glatko_thread_messages (thread_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_thread_messages_unread
  ON public.glatko_thread_messages (thread_id, sender_id, read_at)
  WHERE read_at IS NULL;

COMMENT ON TABLE public.glatko_thread_messages IS
'G-MSG-1: chat message in a glatko_message_threads thread. Distinct from
the legacy glatko_messages (conversation_id, content) used by the
bid-based /inbox/.';

-- ─── 3. Trigger: message INSERT → thread cache + unread counters ──────────

CREATE OR REPLACE FUNCTION public.glatko_update_thread_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_customer_id UUID;
  v_professional_id UUID;
BEGIN
  SELECT customer_id, professional_id
  INTO v_customer_id, v_professional_id
  FROM public.glatko_message_threads
  WHERE id = NEW.thread_id;

  UPDATE public.glatko_message_threads
  SET
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.body, 100),
    last_message_sender_id = NEW.sender_id,
    customer_unread_count = CASE
      WHEN v_customer_id IS NOT NULL AND NEW.sender_id <> v_customer_id
        THEN customer_unread_count + 1
      ELSE customer_unread_count
    END,
    pro_unread_count = CASE
      WHEN NEW.sender_id <> v_professional_id
        THEN pro_unread_count + 1
      ELSE pro_unread_count
    END,
    updated_at = NOW()
  WHERE id = NEW.thread_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_thread_on_message
  ON public.glatko_thread_messages;
CREATE TRIGGER trg_update_thread_on_message
  AFTER INSERT ON public.glatko_thread_messages
  FOR EACH ROW EXECUTE FUNCTION public.glatko_update_thread_on_message();

-- ─── 4. updated_at touch trigger for threads ──────────────────────────────

CREATE OR REPLACE FUNCTION public.glatko_message_threads_touch()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_message_threads_touch
  ON public.glatko_message_threads;
CREATE TRIGGER trg_message_threads_touch
  BEFORE UPDATE ON public.glatko_message_threads
  FOR EACH ROW EXECUTE FUNCTION public.glatko_message_threads_touch();

-- ─── 5. Mark thread read RPC ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.glatko_mark_thread_read(p_thread_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_customer_id UUID;
  v_professional_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT customer_id, professional_id
  INTO v_customer_id, v_professional_id
  FROM public.glatko_message_threads
  WHERE id = p_thread_id;

  IF v_customer_id IS NULL AND v_professional_id IS NULL THEN
    RETURN false;
  END IF;

  IF v_user_id <> COALESCE(v_customer_id, '00000000-0000-0000-0000-000000000000'::UUID)
     AND v_user_id <> v_professional_id THEN
    RETURN false;
  END IF;

  UPDATE public.glatko_thread_messages
  SET read_at = NOW(),
      updated_at = NOW()
  WHERE thread_id = p_thread_id
    AND sender_id <> v_user_id
    AND read_at IS NULL;

  IF v_user_id = v_customer_id THEN
    UPDATE public.glatko_message_threads
    SET customer_unread_count = 0, updated_at = NOW()
    WHERE id = p_thread_id;
  ELSIF v_user_id = v_professional_id THEN
    UPDATE public.glatko_message_threads
    SET pro_unread_count = 0, updated_at = NOW()
    WHERE id = p_thread_id;
  END IF;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.glatko_mark_thread_read(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.glatko_mark_thread_read(UUID)
  TO authenticated, service_role;

COMMENT ON FUNCTION public.glatko_mark_thread_read IS
'G-MSG-1: marks unread messages in a thread as read for the caller, then
zeroes the caller-side unread counter on the thread. No-op if caller is
neither the customer nor the pro on the thread.';

-- ─── 6. Get-or-create thread RPC (customer-initiated only) ────────────────

CREATE OR REPLACE FUNCTION public.glatko_get_or_create_thread(
  p_request_id UUID,
  p_professional_id UUID,
  p_initial_quote_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_request_owner UUID;
  v_thread_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT customer_id INTO v_request_owner
  FROM public.glatko_service_requests
  WHERE id = p_request_id;

  IF v_request_owner IS NULL THEN
    RAISE EXCEPTION 'Request not found or anonymous (no customer)';
  END IF;
  IF v_request_owner <> v_user_id THEN
    RAISE EXCEPTION 'Forbidden: not request owner';
  END IF;

  SELECT id INTO v_thread_id
  FROM public.glatko_message_threads
  WHERE request_id = p_request_id
    AND professional_id = p_professional_id;

  IF v_thread_id IS NOT NULL THEN
    RETURN v_thread_id;
  END IF;

  INSERT INTO public.glatko_message_threads (
    request_id, professional_id, customer_id, initial_quote_id, status
  ) VALUES (
    p_request_id, p_professional_id, v_user_id, p_initial_quote_id, 'active'
  )
  RETURNING id INTO v_thread_id;

  RETURN v_thread_id;
END;
$$;

REVOKE ALL ON FUNCTION public.glatko_get_or_create_thread(UUID, UUID, UUID)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.glatko_get_or_create_thread(UUID, UUID, UUID)
  TO authenticated, service_role;

COMMENT ON FUNCTION public.glatko_get_or_create_thread IS
'G-MSG-1: idempotent thread opener. Customer-only — pros cannot create
threads. Returns the existing thread id if one already exists for the
(request, pro) pair, else inserts a new active thread.';

-- ─── 7. RLS ────────────────────────────────────────────────────────────────

ALTER TABLE public.glatko_message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glatko_thread_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Threads: own threads only"
  ON public.glatko_message_threads;
CREATE POLICY "Threads: own threads only" ON public.glatko_message_threads
  FOR SELECT USING (
    auth.uid() = customer_id
    OR auth.uid() = professional_id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Threads: customer create"
  ON public.glatko_message_threads;
CREATE POLICY "Threads: customer create" ON public.glatko_message_threads
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Threads: participants update"
  ON public.glatko_message_threads;
CREATE POLICY "Threads: participants update" ON public.glatko_message_threads
  FOR UPDATE USING (
    auth.uid() = customer_id OR auth.uid() = professional_id
  );

DROP POLICY IF EXISTS "Threads: admin all"
  ON public.glatko_message_threads;
CREATE POLICY "Threads: admin all" ON public.glatko_message_threads
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Thread messages: participants read"
  ON public.glatko_thread_messages;
CREATE POLICY "Thread messages: participants read"
  ON public.glatko_thread_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.glatko_message_threads t
      WHERE t.id = thread_id
        AND (
          auth.uid() = t.customer_id
          OR auth.uid() = t.professional_id
          OR public.is_admin()
        )
    )
  );

DROP POLICY IF EXISTS "Thread messages: participants insert"
  ON public.glatko_thread_messages;
CREATE POLICY "Thread messages: participants insert"
  ON public.glatko_thread_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.glatko_message_threads t
      WHERE t.id = thread_id
        AND t.status = 'active'
        AND (
          auth.uid() = t.customer_id
          OR auth.uid() = t.professional_id
        )
    )
  );

DROP POLICY IF EXISTS "Thread messages: own update (read_at)"
  ON public.glatko_thread_messages;
CREATE POLICY "Thread messages: own update (read_at)"
  ON public.glatko_thread_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.glatko_message_threads t
      WHERE t.id = thread_id
        AND (auth.uid() = t.customer_id OR auth.uid() = t.professional_id)
    )
  );

DROP POLICY IF EXISTS "Thread messages: admin all"
  ON public.glatko_thread_messages;
CREATE POLICY "Thread messages: admin all" ON public.glatko_thread_messages
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ─── 8. Realtime publication ──────────────────────────────────────────────
-- Both tables join supabase_realtime so the chat box receives INSERTs and
-- the inbox list reflects last_message_at / unread_count flips live.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'glatko_thread_messages'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.glatko_thread_messages';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'glatko_message_threads'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.glatko_message_threads';
  END IF;
END $$;

COMMIT;
