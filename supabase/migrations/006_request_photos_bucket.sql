-- Service request photos (wizard Step 4). Client uploads under tmp-* or {auth.uid()}/...
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'glatko-request-photos',
  'glatko-request-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- INSERT: authenticated users may write to their uid folder or a tmp-* prefix (wizard draft paths)
DROP POLICY IF EXISTS "request_photos_authenticated_insert" ON storage.objects;
CREATE POLICY "request_photos_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'glatko-request-photos'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR (storage.foldername(name))[1] LIKE 'tmp-%'
  )
);

-- SELECT: public read (getPublicUrl)
DROP POLICY IF EXISTS "request_photos_public_select" ON storage.objects;
CREATE POLICY "request_photos_public_select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'glatko-request-photos');

-- UPDATE/DELETE: only objects under the user's own uid folder (tmp-* uploads are not mutable via anon RLS)
DROP POLICY IF EXISTS "request_photos_owner_update" ON storage.objects;
CREATE POLICY "request_photos_owner_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'glatko-request-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "request_photos_owner_delete" ON storage.objects;
CREATE POLICY "request_photos_owner_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'glatko-request-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
