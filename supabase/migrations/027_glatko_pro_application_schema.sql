-- ═══════════════════════════════════════════════════════════════════════════
-- G-PRO-1 Faz 1: Pro onboarding DB schema (application questions + profile expand)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Builds on G-REQ-1's question schema pattern (021):
--   - glatko_pro_application_questions: category-spesifik pro soruları
--     (G-REQ-1'in glatko_request_questions tablosuna paralel, JSONB i18n)
--   - glatko_pro_application_answers: pro tarafından doldurulan cevaplar
--     (kategori başına bir row, JSONB key/value)
--   - glatko_professional_profiles: company_documents, introduction_video_url,
--     pricing_model, profile_completion_score, featured_certificate_urls
--     yeni kolonları
--   - glatko_get_pro_application_questions(slug) RPC: parent inheritance
--   - glatko_calculate_profile_completion(uuid) RPC: 0-100 skoru
--
-- glatko_question_type enum 021'den re-use (text/textarea/select/multiselect/
-- number/date/file/slider).
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. Application questions table ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.glatko_pro_application_questions (
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

CREATE INDEX IF NOT EXISTS idx_pro_app_questions_category
  ON public.glatko_pro_application_questions (category_slug, step_order, field_order);

COMMENT ON TABLE public.glatko_pro_application_questions IS
'G-PRO-1: category-specific pro application questions. JSONB i18n on label/
placeholder/help_text/options. Inherits parent-category questions via
glatko_get_pro_application_questions() RPC.';

ALTER TABLE public.glatko_pro_application_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone reads pro questions" ON public.glatko_pro_application_questions;
CREATE POLICY "Anyone reads pro questions"
  ON public.glatko_pro_application_questions
  FOR SELECT
  USING (TRUE);

-- ─── 2. Application answers table ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.glatko_pro_application_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  professional_id UUID NOT NULL
    REFERENCES public.glatko_professional_profiles(id) ON DELETE CASCADE,
  category_slug TEXT NOT NULL,

  answers JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (professional_id, category_slug)
);

CREATE INDEX IF NOT EXISTS idx_pro_app_answers_pro
  ON public.glatko_pro_application_answers (professional_id);

COMMENT ON TABLE public.glatko_pro_application_answers IS
'G-PRO-1: per-pro per-category application answers. JSONB structure:
{ question_key: AnswerValue }. category_slug ties to the question set.
UNIQUE (professional_id, category_slug) keeps one answer row per category.';

ALTER TABLE public.glatko_pro_application_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pros manage own answers"
  ON public.glatko_pro_application_answers;
CREATE POLICY "Pros manage own answers"
  ON public.glatko_pro_application_answers
  FOR ALL
  USING (auth.uid() = professional_id)
  WITH CHECK (auth.uid() = professional_id);

DROP POLICY IF EXISTS "Admins read all answers"
  ON public.glatko_pro_application_answers;
CREATE POLICY "Admins read all answers"
  ON public.glatko_pro_application_answers
  FOR SELECT
  USING (is_admin());

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.glatko_pro_application_answers_touch()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pro_app_answers_touch
  ON public.glatko_pro_application_answers;
CREATE TRIGGER trg_pro_app_answers_touch
  BEFORE UPDATE ON public.glatko_pro_application_answers
  FOR EACH ROW
  EXECUTE FUNCTION public.glatko_pro_application_answers_touch();

-- ─── 3. Profile fields expand ───────────────────────────────────────────────

DO $$
BEGIN
  ALTER TABLE public.glatko_professional_profiles
    ADD COLUMN IF NOT EXISTS company_documents JSONB
      DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS introduction_video_url TEXT,
    ADD COLUMN IF NOT EXISTS pricing_model JSONB,
    ADD COLUMN IF NOT EXISTS profile_completion_score INTEGER
      DEFAULT 0
      CHECK (profile_completion_score >= 0 AND profile_completion_score <= 100),
    ADD COLUMN IF NOT EXISTS featured_certificate_urls TEXT[]
      DEFAULT '{}'::text[];
END $$;

COMMENT ON COLUMN public.glatko_professional_profiles.company_documents IS
'JSONB array: [{ url, type: "license"|"insurance"|"tax_cert"|..., name, uploaded_at }]';

COMMENT ON COLUMN public.glatko_professional_profiles.pricing_model IS
'JSONB: { type: "hourly"|"fixed"|"per_unit", base_rate: number, currency: "EUR", details?: {...} }';

COMMENT ON COLUMN public.glatko_professional_profiles.profile_completion_score IS
'0-100 score, computed by glatko_calculate_profile_completion(). Persisted
for fast read-paths; canonical value is the RPC result.';

-- ─── 4. RPC: get application questions for category (with parent inheritance) ─

CREATE OR REPLACE FUNCTION public.glatko_get_pro_application_questions(
  p_category_slug TEXT
)
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
  FROM public.glatko_pro_application_questions q
  WHERE q.category_slug = p_category_slug
     OR q.category_slug = (SELECT slug FROM parent_slug_lookup)
  ORDER BY q.step_order, q.field_order;
$$;

REVOKE ALL ON FUNCTION public.glatko_get_pro_application_questions(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.glatko_get_pro_application_questions(TEXT)
  TO anon, authenticated;

COMMENT ON FUNCTION public.glatko_get_pro_application_questions IS
'G-PRO-1: returns category-specific pro questions plus inherited parent-
category questions, ordered by (step_order, field_order). Mirrors
glatko_get_request_questions() pattern from G-REQ-1.';

-- ─── 5. RPC: calculate profile completion score ─────────────────────────────

CREATE OR REPLACE FUNCTION public.glatko_calculate_profile_completion(
  p_professional_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile RECORD;
  v_score INTEGER := 0;
  v_services_count INTEGER;
BEGIN
  SELECT * INTO v_profile
  FROM public.glatko_professional_profiles
  WHERE id = p_professional_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Min zorunlu (50 puan)
  IF v_profile.business_name IS NOT NULL
     AND length(trim(v_profile.business_name)) > 0 THEN
    v_score := v_score + 10;
  END IF;

  IF v_profile.bio IS NOT NULL AND length(trim(v_profile.bio)) >= 100 THEN
    v_score := v_score + 10;
  END IF;

  IF v_profile.phone IS NOT NULL AND length(trim(v_profile.phone)) > 0 THEN
    v_score := v_score + 5;
  END IF;

  IF v_profile.location_city IS NOT NULL THEN
    v_score := v_score + 10;
  END IF;

  IF v_profile.languages IS NOT NULL
     AND array_length(v_profile.languages, 1) >= 2 THEN
    v_score := v_score + 5;
  END IF;

  SELECT COUNT(*) INTO v_services_count
  FROM public.glatko_pro_services
  WHERE professional_id = p_professional_id;

  IF v_services_count > 0 THEN
    v_score := v_score + 10;
  END IF;

  -- Premium fields (50 puan)
  IF v_profile.years_experience IS NOT NULL
     AND v_profile.years_experience > 0 THEN
    v_score := v_score + 5;
  END IF;

  IF v_profile.hourly_rate_min IS NOT NULL THEN
    v_score := v_score + 5;
  END IF;

  IF v_profile.portfolio_images IS NOT NULL
     AND array_length(v_profile.portfolio_images, 1) >= 3 THEN
    v_score := v_score + 15;
  END IF;

  IF v_profile.company_documents IS NOT NULL
     AND jsonb_array_length(v_profile.company_documents) > 0 THEN
    v_score := v_score + 10;
  END IF;

  IF v_profile.introduction_video_url IS NOT NULL
     AND length(trim(v_profile.introduction_video_url)) > 0 THEN
    v_score := v_score + 10;
  END IF;

  IF v_profile.featured_certificate_urls IS NOT NULL
     AND array_length(v_profile.featured_certificate_urls, 1) > 0 THEN
    v_score := v_score + 5;
  END IF;

  RETURN LEAST(v_score, 100);
END;
$$;

REVOKE ALL ON FUNCTION public.glatko_calculate_profile_completion(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.glatko_calculate_profile_completion(UUID)
  TO authenticated;

COMMENT ON FUNCTION public.glatko_calculate_profile_completion IS
'G-PRO-1: returns 0-100 profile completion score. 50 puan zorunlu min
(business_name, bio>=100ch, phone, city, 2+ lang, services), 50 puan
premium (experience, rate, 3+ portfolio, documents, intro video, certs).';
