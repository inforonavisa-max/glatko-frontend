-- ============================================================================
-- 021_glatko_request_questions_schema.sql
-- G-REQ-1: Request wizard — DB JSONB-driven category-specific questions.
--
-- Adds:
--   - public.glatko_question_type enum (8 input types)
--   - public.glatko_request_questions table (one row per (category_slug,
--     question_key); 9-locale label/placeholder/help_text JSONB; type-specific
--     options + validation; conditional show_if; step+field ordering)
--   - public.glatko_get_request_questions(category_slug TEXT) RPC with
--     parent-category inheritance (sub-cats also expose root-level questions)
--
-- Reuses the existing glatko_service_requests table (created earlier in
-- 001_foundation). Only additive ALTERs:
--   - anonymous_email (Airbnb pattern: anon submit, link to user later)
--   - locale (which UI language the form was filled in)
--   - flexibility (preferred-date strictness)
--   - moderation_reason / moderated_at / moderated_by (admin workflow)
-- The existing `details` JSONB column already absorbs free-form question
-- answers, so a separate `answers` column isn't introduced.
-- ============================================================================

BEGIN;

-- ─── 1. Question type enum ──────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'glatko_question_type') THEN
    CREATE TYPE public.glatko_question_type AS ENUM (
      'text',
      'textarea',
      'select',
      'multiselect',
      'number',
      'date',
      'file',
      'slider'
    );
  END IF;
END $$;

-- ─── 2. Questions table ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.glatko_request_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  category_slug TEXT NOT NULL,
  question_key TEXT NOT NULL,
  question_type public.glatko_question_type NOT NULL,

  label JSONB NOT NULL,
  placeholder JSONB,
  help_text JSONB,

  options JSONB,
  validation JSONB,
  show_if JSONB,

  step_order INTEGER NOT NULL,
  field_order INTEGER NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (category_slug, question_key)
);

CREATE INDEX IF NOT EXISTS idx_request_questions_category
  ON public.glatko_request_questions (category_slug, step_order, field_order);

COMMENT ON TABLE public.glatko_request_questions IS
'G-REQ-1: category-specific wizard questions. JSONB i18n on label/placeholder/
help_text covers 9 locales. Conditional logic via show_if (question_key /
operator / value). 8 question types: text/textarea/select/multiselect/number/
date/file/slider. Sub-categories inherit parent root-level questions via the
glatko_get_request_questions RPC.';

-- Public read; admin writes only (service role).
ALTER TABLE public.glatko_request_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone reads questions" ON public.glatko_request_questions;
CREATE POLICY "Anyone reads questions"
  ON public.glatko_request_questions
  FOR SELECT
  USING (TRUE);

-- ─── 3. RPC: questions for a category (with parent inheritance) ─────────────

CREATE OR REPLACE FUNCTION public.glatko_get_request_questions(p_category_slug TEXT)
RETURNS TABLE (
  id UUID,
  question_key TEXT,
  question_type public.glatko_question_type,
  label JSONB,
  placeholder JSONB,
  help_text JSONB,
  options JSONB,
  validation JSONB,
  show_if JSONB,
  step_order INTEGER,
  field_order INTEGER,
  is_required BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH parent_slug_lookup AS (
    SELECT parent.slug AS slug
    FROM public.glatko_service_categories child
    LEFT JOIN public.glatko_service_categories parent ON parent.id = child.parent_id
    WHERE child.slug = p_category_slug
  )
  SELECT
    q.id,
    q.question_key,
    q.question_type,
    q.label,
    q.placeholder,
    q.help_text,
    q.options,
    q.validation,
    q.show_if,
    q.step_order,
    q.field_order,
    q.is_required
  FROM public.glatko_request_questions q
  WHERE q.category_slug = p_category_slug
     OR q.category_slug = (SELECT slug FROM parent_slug_lookup)
  ORDER BY q.step_order, q.field_order;
$$;

REVOKE ALL ON FUNCTION public.glatko_get_request_questions(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.glatko_get_request_questions(TEXT)
  TO anon, authenticated;

COMMENT ON FUNCTION public.glatko_get_request_questions IS
'Returns category-specific questions plus inherited parent-category
questions, ordered by (step_order, field_order). Both root and sub
categories supply a single, deterministic question list to the wizard.';

-- ─── 4. Extend glatko_service_requests for the wizard workflow ──────────────

DO $$
BEGIN
  ALTER TABLE public.glatko_service_requests
    ADD COLUMN IF NOT EXISTS anonymous_email TEXT,
    ADD COLUMN IF NOT EXISTS locale TEXT
      CHECK (locale IS NULL OR locale IN ('me','sr','en','tr','de','it','ru','ar','uk')),
    ADD COLUMN IF NOT EXISTS flexibility TEXT
      CHECK (flexibility IS NULL OR flexibility IN ('exact','within_week','flexible')),
    ADD COLUMN IF NOT EXISTS moderation_reason TEXT,
    ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
END $$;

-- Loosen `customer_id NOT NULL` so anonymous submissions are possible. The
-- check below enforces "either user or anonymous_email" so nothing is unowned.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'glatko_service_requests'
      AND column_name = 'customer_id'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.glatko_service_requests
      ALTER COLUMN customer_id DROP NOT NULL;
  END IF;
END $$;

-- Add the user-or-anonymous constraint (idempotent).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'glatko_service_requests_customer_or_anon'
      AND conrelid = 'public.glatko_service_requests'::regclass
  ) THEN
    ALTER TABLE public.glatko_service_requests
      ADD CONSTRAINT glatko_service_requests_customer_or_anon
      CHECK (customer_id IS NOT NULL OR anonymous_email IS NOT NULL);
  END IF;
END $$;

-- Index moderation queue scans (admins paging through pending status).
CREATE INDEX IF NOT EXISTS idx_glatko_requests_moderation
  ON public.glatko_service_requests (status, created_at DESC)
  WHERE status = 'pending_moderation';

COMMIT;
