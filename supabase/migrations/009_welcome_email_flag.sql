ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_profile_completion_reminder_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.welcome_email_sent IS 'Welcome email gönderildi mi';
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Kullanıcı onboarding banner kapatıldı mı';
COMMENT ON COLUMN public.profiles.last_profile_completion_reminder_at IS 'Son profil tamamlama hatırlatma e-postası (tekrar önleme)';
