-- Avatars bucket: bump file_size_limit 2MB → 5MB.
-- Modern phone cameras produce 3-5MB photos; 2MB blocks legitimate uploads.
UPDATE storage.buckets
SET file_size_limit = 5242880  -- 5 MiB
WHERE id = 'avatars';
