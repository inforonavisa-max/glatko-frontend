-- 056_glatko_thread_external_notified.sql
-- Faz 2-C — glatko_message_threads.external_notified_at (dış-kanal cooldown marker).
--
-- Bağlam: notifyNewMessages cron'u (her 5 dk, 10 dk pencere) okunmamış thread'lere
-- bildirim üretir. Faz 2-C bu cron'dan dış kanala (SMS) bildirim ekler. Tekrar-
-- önleme markeri OLMADAN aktif okunmamış bir thread her 5 dk'da SMS tetikler (spam:
-- 1 saat offline ≈ 12 SMS). Bu kolon thread başına son BAŞARILI dış-bildirim zamanını
-- tutar; cron yalnız NULL veya cooldown'dan (varsayılan 60 dk) daha eski ise gönderir
-- → thread başına ≤1 SMS/saat. Yalnız gerçekten gönderildiğinde güncellenir
-- (flag-off / cap / quiet-hours / no-phone nedeniyle gitmezse güncellenmez).
--
-- Additive, nullable, default YOK → mevcut tüm satırlar NULL (ilk cron'da uygun).
-- Hiçbir mevcut satırı bozmaz; idempotent (IF NOT EXISTS).

ALTER TABLE public.glatko_message_threads
  ADD COLUMN IF NOT EXISTS external_notified_at timestamptz;
