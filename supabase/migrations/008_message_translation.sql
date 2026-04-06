-- Mesaj çeviri desteği (gönderim anında alıcı diline)
ALTER TABLE glatko_messages
  ADD COLUMN IF NOT EXISTS original_locale TEXT,
  ADD COLUMN IF NOT EXISTS translated_content TEXT,
  ADD COLUMN IF NOT EXISTS translated_locale TEXT;

CREATE INDEX IF NOT EXISTS idx_glatko_messages_translation
  ON glatko_messages (conversation_id, translated_locale)
  WHERE translated_content IS NOT NULL;

COMMENT ON COLUMN glatko_messages.original_locale IS 'Gönderenin locale kodu (en, tr, sr, vb.)';
COMMENT ON COLUMN glatko_messages.translated_content IS 'Alıcının diline çevrilmiş metin (gönderim anında)';
COMMENT ON COLUMN glatko_messages.translated_locale IS 'Çevrilen hedef locale';
