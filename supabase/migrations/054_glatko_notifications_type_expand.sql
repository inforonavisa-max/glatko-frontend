-- 054_glatko_notifications_type_expand.sql
-- Faz 0-A — glatko_notifications.type CHECK genişletme (ADDITIVE).
--
-- Bağlam (prod-doğrulamalı):
--   glatko_notifications_type_check kısıtı 'thread_message' içermiyordu. Bu yüzden
--   lib/cron/notifyNewMessages.ts'in ürettiği thread_message in-app satırları
--   constraint'e takılıp sessizce reddediliyordu (prod'da thread_message = 0 satır).
--   Aktif teklif akışı (submitQuote) için de müşteriye gidecek 'new_quote' tipi yok.
--
-- Bu migration kısıta iki tip ekler:
--   * 'thread_message' — aktif mesaj thread'leri + notifyNewMessages cron'u
--   * 'new_quote'      — aktif teklif → müşteri in-app bildirimi (Faz 0-B'de wire edilecek)
--
-- Güvenlik: ADDITIVE. Mevcut 9 tipin tamamı yeni sette korunuyor; prod'daki mevcut
-- satırlar (verification_approved / status_change / new_request_match) ve diğer tüm
-- legacy tipler geçerli kalır — hiçbir satır ihlal etmez. DROP IF EXISTS + ADD ile
-- idempotent (tekrar çalıştırılabilir). Constraint adı korunuyor.

ALTER TABLE public.glatko_notifications
  DROP CONSTRAINT IF EXISTS glatko_notifications_type_check;

ALTER TABLE public.glatko_notifications
  ADD CONSTRAINT glatko_notifications_type_check
  CHECK (type IN (
    'new_bid',
    'bid_accepted',
    'bid_rejected',
    'message',
    'status_change',
    'review',
    'verification_approved',
    'verification_rejected',
    'new_request_match',
    'thread_message',
    'new_quote'
  ));
