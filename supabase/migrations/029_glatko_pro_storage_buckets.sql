-- ============================================================================
-- 029_glatko_pro_storage_buckets.sql
-- G-PRO-1 Faz 3: Storage buckets for pro portfolio + documents.
--
--   - pro-portfolio: PUBLIC bucket (showcase images visible on pro profile)
--     • 10MB per file, image/jpeg|png|webp
--     • Path layout: {pro_user_id}/portfolio-{timestamp}.ext
--   - pro-documents: PRIVATE bucket (insurance, license, tax cert)
--     • 5MB per file, application/pdf + image/jpeg|png
--     • Path layout: {pro_user_id}/documents-{timestamp}.ext
--     • Only the owner pro and admins can read
--
-- RLS policies use storage.foldername(name)[1] to extract owner from the
-- path's first segment (pattern matches existing bucket conventions).
-- ============================================================================

-- ─── 1. Buckets ─────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('pro-portfolio', 'pro-portfolio', TRUE,
   10485760,
   ARRAY['image/jpeg','image/png','image/webp']),
  ('pro-documents', 'pro-documents', FALSE,
   5242880,
   ARRAY['application/pdf','image/jpeg','image/png'])
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ─── 2. RLS — pro-portfolio (public read, owner write) ─────────────────────

DROP POLICY IF EXISTS "Pros upload own portfolio" ON storage.objects;
CREATE POLICY "Pros upload own portfolio"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'pro-portfolio'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Pros update own portfolio" ON storage.objects;
CREATE POLICY "Pros update own portfolio"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'pro-portfolio'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Pros delete own portfolio" ON storage.objects;
CREATE POLICY "Pros delete own portfolio"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'pro-portfolio'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Public reads portfolio" ON storage.objects;
CREATE POLICY "Public reads portfolio"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pro-portfolio');

-- ─── 3. RLS — pro-documents (private, owner + admin) ───────────────────────

DROP POLICY IF EXISTS "Pros manage own documents" ON storage.objects;
CREATE POLICY "Pros manage own documents"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'pro-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'pro-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Admins read all documents" ON storage.objects;
CREATE POLICY "Admins read all documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'pro-documents'
    AND public.is_admin()
  );
