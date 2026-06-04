-- 055_profiles_notification_channel.sql
-- Faz 1-A — profiles.notification_channel (kullanıcının tercih ettiği bildirim kanalı).
--
-- ADDITIVE. NULL = "seçilmemiş" = Faz 2 failover (Viber → WhatsApp → SMS).
-- Default YOK — bir kanala zorlamak yanlış olur; seçmemiş herkes failover'a düşer.
-- CHECK yalnız geçerli kanalları (whatsapp/viber) kabul eder. NULL, CHECK'ten
-- MUAFTIR (SQL: CHECK NULL'da geçer) → mevcut tüm satırlar NULL kalır, hiçbiri
-- ihlal etmez. Faz 2 dispatcher bu kolonu okuyup birincil kanalı seçer; NULL ise
-- failover sırasını uygular. Hedef telefon numarası auth.users.phone'dan okunur
-- (profiles.phone telefon-OTP kayıtlarında boş olabilir).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notification_channel text
  CHECK (notification_channel IN ('whatsapp', 'viber'));
