-- User account profile fields on public.profiles (extends auth users)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS preferred_locale text DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

COMMENT ON COLUMN public.profiles.is_active IS 'When false, account is soft-deleted; user should be signed out.';
