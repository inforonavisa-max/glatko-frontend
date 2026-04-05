-- Sprint 1: Talebe tercih edilen profesyonel bağlama
-- Müşteri belirli bir profesyonelden teklif istediğinde bu alan dolar.

ALTER TABLE glatko_service_requests
  ADD COLUMN preferred_professional_id UUID
  REFERENCES glatko_professional_profiles(id)
  ON DELETE SET NULL;

-- Bu profesyonel varsa, talep oluşturulunca ona öncelikli bildirim gidecek.
COMMENT ON COLUMN glatko_service_requests.preferred_professional_id
  IS 'Müşterinin özellikle teklif istediği profesyonel (opsiyonel)';

-- Index: profesyonelin kendine gelen direkt talepleri hızlı sorgulaması için
CREATE INDEX idx_glatko_requests_preferred_pro
  ON glatko_service_requests(preferred_professional_id)
  WHERE preferred_professional_id IS NOT NULL;
