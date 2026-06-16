-- ═══════════════════════════════════════════════════════════════════════════
-- 070: H5a — booking giriş kapısı: hold + OTP + patient write-RPC'leri
-- ═══════════════════════════════════════════════════════════════════════════
-- H2/H4 ile SİMETRİK: health şeması PostgREST'e EXPOSE EDİLMEZ → service-role bile
-- .from('health.*') yapamaz. Bu yüzden tüm YAZMA da public şemada SECURITY DEFINER
-- RPC'lerle. H5a GERÇEK REZERVASYON YAPMAZ — health.book_appointment ÇAĞRILMAZ (H5b).
-- Burada yalnız: 5dk slot hold + OTP üret/doğrula + (OTP geçince) patient kaydı.
--
-- GÜVENLİK:
--   * Her fonksiyon SECURITY DEFINER + SET search_path='' (066/068/069 deseni). Tüm
--     health.* + extensions.* (pgcrypto) + vault.* objeleri şema-qualified.
--   * EXECUTE yalnız service_role (anon/authenticated ASLA) — hold/OTP/patient yalnız
--     server route'tan service-role ile yaratılır. anon health şemasında grant'sız kalır.
--   * PII (telefon/email) KOLON-ŞİFRELİ: extensions.pgp_sym_encrypt + anahtar Vault'tan
--     (health_pii_key). Anahtar repo'da/SQL'de YAZILI DEĞİL — aşağıda rastgele üretilir
--     (gen_random_bytes, if-not-exists guard). OTP kodu HASH'li saklanır (route sha256),
--     plain kod DB'ye ASLA girmez. patient kaydı YALNIZ OTP doğrulanınca + açık rıza ile.
--
-- ADDITIVE: health.* ALTER/DROP YOK; 066-069 nesnelerine dokunulmaz. Yeni public RPC'ler.
--
-- ROLLBACK:
--   drop function if exists public.health_create_hold(uuid,uuid,uuid,timestamptz,timestamptz,text);
--   drop function if exists public.health_release_hold(uuid,text);
--   drop function if exists public.health_get_hold(uuid,text,text);
--   drop function if exists public.health_create_otp(text,text);
--   drop function if exists public.health_verify_otp(text,text,text,text,text,boolean,boolean);
--   -- Vault: select vault.delete_secret(id) where name='health_pii_key' (manuel; veri kaybı = mevcut PII çözülemez).

-- ─────────────────────────────────────────────────────────────────────────────
-- 0) PII şifreleme anahtarı (Vault). Rastgele, idempotent, repo'da DEĞİL.
-- ─────────────────────────────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'health_pii_key') then
    perform vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'base64'),
      'health_pii_key',
      'Glatko health.patients column encryption key (pgp_sym; H5a)'
    );
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) Slot hold oluştur (5 dk). gist EXCLUDE (hold↔hold) + confirmed appointment
--    çakışma kontrolü (hold↔appointment). Döner: {holdId, expiresAt}.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.health_create_hold(
  p_provider_id uuid,
  p_service_id  uuid,
  p_location_id uuid,
  p_slot_start  timestamptz,
  p_slot_end    timestamptz,
  p_session_key text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hold health.slot_holds;
begin
  -- Geçmiş / geçersiz slot
  if p_slot_start is null or p_slot_end is null or p_slot_start >= p_slot_end then
    raise exception 'SLOT_INVALID';
  end if;
  if p_slot_start <= now() then
    raise exception 'SLOT_PAST';
  end if;
  if coalesce(length(p_session_key), 0) < 16 then
    raise exception 'SESSION_INVALID';
  end if;

  -- Provider yayınlı+onaylı + hizmet o provider'a ait+aktif + lokasyon bağlı mı?
  if not exists (
    select 1 from health.providers p
    where p.id = p_provider_id and p.is_published = true and p.verification_status = 'approved'
  ) then
    raise exception 'PROVIDER_UNAVAILABLE';
  end if;
  if not exists (
    select 1 from health.services s
    where s.id = p_service_id and s.provider_id = p_provider_id and s.is_active = true
  ) then
    raise exception 'SERVICE_INVALID';
  end if;
  if not exists (
    select 1 from health.provider_locations pl
    where pl.provider_id = p_provider_id and pl.location_id = p_location_id
  ) then
    raise exception 'LOCATION_INVALID';
  end if;

  -- KATMAN A: mevcut confirmed randevu ile çakışma → SLOT_TAKEN
  if exists (
    select 1 from health.appointments a
    where a.provider_id = p_provider_id
      and a.status = 'confirmed'
      and a.slot_range && tstzrange(p_slot_start, p_slot_end, '[)')
  ) then
    raise exception 'SLOT_TAKEN';
  end if;

  -- Süresi geçmiş hold'lar gist EXCLUDE'u hâlâ tutar (cron */5 onları temizleyene
  -- kadar). Yeni hold'un yanlışça SLOT_HELD almaması için çakışan aralıktaki SÜRESİ
  -- GEÇMİŞ hold'ları burada da temizle (cron'a ek; slot anında geri-açılır).
  delete from health.slot_holds
  where provider_id = p_provider_id
    and expires_at <= now()
    and slot_range && tstzrange(p_slot_start, p_slot_end, '[)');

  -- KATMAN B: hold INSERT — gist EXCLUDE başka AKTİF hold ile çakışmayı reddeder.
  begin
    insert into health.slot_holds (provider_id, service_id, location_id, slot_range, session_key, expires_at)
    values (p_provider_id, p_service_id, p_location_id,
            tstzrange(p_slot_start, p_slot_end, '[)'), p_session_key, now() + interval '5 minutes')
    returning * into v_hold;
  exception when exclusion_violation then
    raise exception 'SLOT_HELD';
  end;

  return jsonb_build_object('holdId', v_hold.id, 'expiresAt', v_hold.expires_at);
end $$;
revoke all on function public.health_create_hold(uuid,uuid,uuid,timestamptz,timestamptz,text) from public, anon, authenticated;
grant execute on function public.health_create_hold(uuid,uuid,uuid,timestamptz,timestamptz,text) to service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) Hold serbest bırak (kullanıcı vazgeçer / süre dolar). Yalnız kendi session'ı.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.health_release_hold(p_hold_id uuid, p_session_key text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  with del as (
    delete from health.slot_holds
    where id = p_hold_id and session_key = p_session_key
    returning 1
  )
  select exists (select 1 from del);
$$;
revoke all on function public.health_release_hold(uuid,text) from public, anon, authenticated;
grant execute on function public.health_release_hold(uuid,text) to service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3) Hold özeti (booking sayfası). Yalnız kendi session'ı + süresi geçmemiş.
--    PII DÖNDÜRMEZ — doktor/hizmet/lokasyon/slot bilgisi. NULL → süre doldu/yok.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.health_get_hold(p_hold_id uuid, p_session_key text, p_locale text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'holdId',           h.id,
    'expiresAt',        h.expires_at,
    'slotStart',        lower(h.slot_range),
    'slotEnd',          upper(h.slot_range),
    'providerSlug',     p.slug,
    'providerName',     p.full_name,
    'providerTitle',    p.title,
    'serviceName',      sv.name ->> p_locale,
    'serviceDurationMin', sv.duration_min,
    'servicePriceEur',  sv.price_eur,
    'locationLabel',    l.label,
    'locationAddress',  l.address,
    'locationCity',     l.city
  )
  from health.slot_holds h
  join health.providers p on p.id = h.provider_id
  join health.services sv on sv.id = h.service_id
  join health.locations l on l.id = h.location_id
  where h.id = p_hold_id
    and h.session_key = p_session_key
    and h.expires_at > now();
$$;
revoke all on function public.health_get_hold(uuid,text,text) from public, anon, authenticated;
grant execute on function public.health_get_hold(uuid,text,text) to service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4) OTP oluştur. Route 6 hane üretir + sha256'lar; burada yalnız HASH saklanır.
--    Aynı telefon için önceki doğrulanmamış kodlar silinir (tek aktif kod).
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.health_create_otp(p_phone_hash text, p_code_hash text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from health.otp_codes where phone_hash = p_phone_hash and verified_at is null;
  insert into health.otp_codes (phone_hash, code_hash, expires_at)
  values (p_phone_hash, p_code_hash, now() + interval '10 minutes');
end $$;
revoke all on function public.health_create_otp(text,text) from public, anon, authenticated;
grant execute on function public.health_create_otp(text,text) to service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5) OTP doğrula + (geçerse) patient kaydı. Atomik. 3 deneme / 10 dk.
--    Başarıda: verified_at set + patients INSERT (PII Vault anahtarıyla şifreli +
--    consent damgaları) → {ok:true, patientId}. Başarısızda attempts++ + reason.
--    Sağlık-verisi rızası ZORUNLU (route da engeller; burada da savunma).
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.health_verify_otp(
  p_phone_hash        text,
  p_code_hash         text,
  p_full_name         text,
  p_phone_e164        text,
  p_email             text,
  p_consent_health    boolean,
  p_consent_marketing boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_otp   health.otp_codes;
  v_key   text;
  v_pid   uuid;
begin
  select * into v_otp
  from health.otp_codes
  where phone_hash = p_phone_hash and verified_at is null and expires_at > now()
  order by created_at desc
  limit 1
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'OTP_EXPIRED');
  end if;

  if coalesce(v_otp.attempts, 0) >= 3 then
    return jsonb_build_object('ok', false, 'reason', 'TOO_MANY_ATTEMPTS');
  end if;

  if v_otp.code_hash <> p_code_hash then
    update health.otp_codes set attempts = coalesce(attempts, 0) + 1 where id = v_otp.id;
    if coalesce(v_otp.attempts, 0) + 1 >= 3 then
      return jsonb_build_object('ok', false, 'reason', 'TOO_MANY_ATTEMPTS', 'attemptsLeft', 0);
    end if;
    return jsonb_build_object('ok', false, 'reason', 'WRONG_CODE',
                              'attemptsLeft', 3 - (coalesce(v_otp.attempts, 0) + 1));
  end if;

  -- Doğru kod. Rıza zorunlu (savunma).
  if p_consent_health is not true then
    return jsonb_build_object('ok', false, 'reason', 'CONSENT_REQUIRED');
  end if;

  v_key := (select decrypted_secret from vault.decrypted_secrets where name = 'health_pii_key');
  if v_key is null then
    raise exception 'PII_KEY_MISSING';
  end if;

  update health.otp_codes set verified_at = now() where id = v_otp.id;

  insert into health.patients (full_name, phone_enc, email_enc, phone_hash,
                               consent_health_data_at, consent_marketing_at)
  values (
    p_full_name,
    extensions.pgp_sym_encrypt(p_phone_e164, v_key),
    case when p_email is not null and length(btrim(p_email)) > 0
         then extensions.pgp_sym_encrypt(p_email, v_key) else null end,
    p_phone_hash,
    now(),
    case when p_consent_marketing is true then now() else null end
  )
  returning id into v_pid;

  return jsonb_build_object('ok', true, 'patientId', v_pid);
end $$;
revoke all on function public.health_verify_otp(text,text,text,text,text,boolean,boolean) from public, anon, authenticated;
grant execute on function public.health_verify_otp(text,text,text,text,text,boolean,boolean) to service_role;
