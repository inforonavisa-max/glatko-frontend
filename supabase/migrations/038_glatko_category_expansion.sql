-- ═══════════════════════════════════════════════════════════════════════════
-- G-CAT-5: Category Expansion — 4 new top-level + 40 subcategories
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Schema notes (probed live, NOT what the spec assumed):
--   * Subcategories live in the SAME glatko_service_categories table as
--     top-level rows, distinguished by parent_id (self-FK). There is NO
--     glatko_service_subcategories table.
--   * sort_order, NOT display_order.
--   * name + description are JSONB { locale → text }.
--
-- Scope: 4 NEW top-level categories (garden-pool, events-wedding,
--        photo-video, health-wellness) + ~10 subcats each + 24 wizard
--        questions for the new categories + locale search synonyms.
--
-- Out of scope: filling gaps in the existing 10 categories' 81
-- subcategories. Concept collisions are too high (spec's
-- 'engine-service' vs DB's 'boat-engine-service', 'captain-rental' vs
-- 'captain-daily'). A follow-up G-CAT-6 sprint will diff carefully.
--
-- Idempotent: every INSERT uses ON CONFLICT (slug) DO NOTHING. Re-running
-- the migration is safe — no duplicates, no DELETEs.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. Top-level: 4 new categories ───────────────────────────────────────

INSERT INTO public.glatko_service_categories
  (slug, name, description, icon, sort_order, is_active, parent_id)
VALUES
  (
    'garden-pool',
    jsonb_build_object(
      'me', 'Bašta i bazen',
      'sr', 'Bašta i bazen',
      'en', 'Garden & Pool',
      'tr', 'Bahçe & Havuz',
      'de', 'Garten & Pool',
      'it', 'Giardino e Piscina',
      'ru', 'Сад и бассейн',
      'ar', 'الحديقة والمسبح',
      'uk', 'Сад і басейн'
    ),
    jsonb_build_object(
      'me', 'Pejzaž, košenje trave, navodnjavanje, održavanje bazena',
      'sr', 'Pejzaž, košenje trave, navodnjavanje, održavanje bazena',
      'en', 'Landscaping, lawn care, irrigation, pool maintenance',
      'tr', 'Peyzaj, çim biçme, sulama, havuz bakımı',
      'de', 'Garten- und Landschaftsbau, Rasenpflege, Bewässerung, Poolwartung',
      'it', 'Paesaggistica, cura del prato, irrigazione, manutenzione piscina',
      'ru', 'Ландшафтный дизайн, уход за газоном, полив, обслуживание бассейна',
      'ar', 'تنسيق الحدائق، العناية بالعشب، الري، صيانة المسبح',
      'uk', 'Ландшафтний дизайн, догляд за газоном, полив, обслуговування басейну'
    ),
    'Trees', 11, true, NULL
  ),
  (
    'events-wedding',
    jsonb_build_object(
      'me', 'Događaji i venčanja',
      'sr', 'Događaji i venčanja',
      'en', 'Events & Wedding',
      'tr', 'Etkinlik & Düğün',
      'de', 'Events & Hochzeit',
      'it', 'Eventi & Matrimoni',
      'ru', 'События и свадьбы',
      'ar', 'الفعاليات والأعراس',
      'uk', 'Події та весілля'
    ),
    jsonb_build_object(
      'me', 'Destinacijska venčanja, organizacija događaja, dekoracija',
      'sr', 'Destinacijska venčanja, organizacija događaja, dekoracija',
      'en', 'Destination weddings, event planning, decoration',
      'tr', 'Destination düğün, etkinlik organizasyonu, dekorasyon',
      'de', 'Destination-Hochzeiten, Eventplanung, Dekoration',
      'it', 'Matrimoni di destinazione, organizzazione eventi, decorazione',
      'ru', 'Свадьбы за рубежом, организация событий, декор',
      'ar', 'حفلات زفاف الوجهة، تنظيم الفعاليات، الديكور',
      'uk', 'Дестинаційні весілля, організація подій, декор'
    ),
    'PartyPopper', 12, true, NULL
  ),
  (
    'photo-video',
    jsonb_build_object(
      'me', 'Foto i video',
      'sr', 'Foto i video',
      'en', 'Photo & Video',
      'tr', 'Foto & Video',
      'de', 'Foto & Video',
      'it', 'Foto e Video',
      'ru', 'Фото и видео',
      'ar', 'تصوير الصور والفيديو',
      'uk', 'Фото та відео'
    ),
    jsonb_build_object(
      'me', 'Vjenčanja, dronovi, korporativni video, Airbnb fotografija',
      'sr', 'Venčanja, dronovi, korporativni video, Airbnb fotografija',
      'en', 'Weddings, drone shoots, corporate video, Airbnb photography',
      'tr', 'Düğün, drone çekim, kurumsal video, Airbnb fotoğraf',
      'de', 'Hochzeiten, Drohnenaufnahmen, Firmenvideo, Airbnb-Fotografie',
      'it', 'Matrimoni, droni, video aziendali, fotografia Airbnb',
      'ru', 'Свадьбы, дроны, корпоративное видео, фотография Airbnb',
      'ar', 'حفلات الزفاف، الطائرات بدون طيار، فيديو الشركات، تصوير Airbnb',
      'uk', 'Весілля, дрони, корпоративне відео, фотографія Airbnb'
    ),
    'Camera', 13, true, NULL
  ),
  (
    'health-wellness',
    jsonb_build_object(
      'me', 'Zdravlje i wellness',
      'sr', 'Zdravlje i wellness',
      'en', 'Health & Wellness',
      'tr', 'Sağlık & Wellness',
      'de', 'Gesundheit & Wellness',
      'it', 'Salute e Benessere',
      'ru', 'Здоровье и велнес',
      'ar', 'الصحة والعافية',
      'uk', 'Здоров''я та велнес'
    ),
    jsonb_build_object(
      'me', 'Fizioterapija, masaža, sestrinska njega kod kuće, dijetetičar',
      'sr', 'Fizioterapija, masaža, sestrinska njega kod kuće, dijetetičar',
      'en', 'Physiotherapy, massage, home nursing, dietitian',
      'tr', 'Fizyoterapi, masaj, evde hemşire, diyetisyen',
      'de', 'Physiotherapie, Massage, häusliche Krankenpflege, Ernährungsberatung',
      'it', 'Fisioterapia, massaggio, assistenza domiciliare, dietologo',
      'ru', 'Физиотерапия, массаж, домашний уход, диетолог',
      'ar', 'العلاج الطبيعي، التدليك، التمريض المنزلي، أخصائي تغذية',
      'uk', 'Фізіотерапія, масаж, домашній догляд, дієтолог'
    ),
    'HeartPulse', 14, true, NULL
  )
ON CONFLICT (slug) DO NOTHING;

-- ─── 2. Subcategories: 10 per new category, parent_id resolved by slug ─

WITH new_parents AS (
  SELECT id, slug FROM public.glatko_service_categories
  WHERE slug IN ('garden-pool', 'events-wedding', 'photo-video', 'health-wellness')
)
INSERT INTO public.glatko_service_categories
  (slug, name, description, icon, sort_order, is_active, parent_id)
SELECT s.slug, s.name, s.description, NULL::text, s.sort_order, true,
       (SELECT id FROM new_parents WHERE slug = s.parent_slug)
FROM (VALUES
  -- Garden & Pool
  ('garden-pool', 'landscape-design', jsonb_build_object('me','Pejzažni dizajn','sr','Pejzažni dizajn','en','Landscape design','tr','Peyzaj tasarımı','de','Landschaftsdesign','it','Progettazione paesaggistica','ru','Ландшафтный дизайн','ar','تصميم المناظر الطبيعية','uk','Ландшафтний дизайн'), jsonb_build_object('en','Garden design and planning'), 1),
  ('garden-pool', 'lawn-mowing', jsonb_build_object('me','Košenje trave','sr','Košenje trave','en','Lawn mowing','tr','Çim biçme','de','Rasenmähen','it','Taglio del prato','ru','Кошение травы','ar','جز العشب','uk','Косіння трави'), jsonb_build_object('en','Regular lawn cutting and edging'), 2),
  ('garden-pool', 'irrigation-install', jsonb_build_object('me','Postavljanje navodnjavanja','sr','Postavljanje navodnjavanja','en','Irrigation installation','tr','Otomatik sulama kurulumu','de','Bewässerungsinstallation','it','Installazione irrigazione','ru','Установка системы полива','ar','تركيب الري','uk','Встановлення поливу'), jsonb_build_object('en','Automatic irrigation system setup'), 3),
  ('garden-pool', 'tree-pruning', jsonb_build_object('me','Orezivanje drveća','sr','Orezivanje drveća','en','Tree pruning','tr','Ağaç budama','de','Baumschnitt','it','Potatura alberi','ru','Обрезка деревьев','ar','تقليم الأشجار','uk','Обрізання дерев'), jsonb_build_object('en','Tree shaping and dead wood removal'), 4),
  ('garden-pool', 'pool-opening-closing', jsonb_build_object('me','Otvaranje i zatvaranje bazena','sr','Otvaranje i zatvaranje bazena','en','Pool opening & closing','tr','Havuz açılışı & kapanışı','de','Pool-Öffnung und -Schließung','it','Apertura e chiusura piscina','ru','Открытие и закрытие бассейна','ar','فتح وإغلاق المسبح','uk','Відкриття та закриття басейну'), jsonb_build_object('en','Seasonal pool start-up and winterization'), 5),
  ('garden-pool', 'pool-chemicals', jsonb_build_object('me','Hemijsko održavanje bazena','sr','Hemijsko održavanje bazena','en','Pool chemical maintenance','tr','Havuz kimyasal bakımı','de','Pool-Chemiebehandlung','it','Manutenzione chimica piscina','ru','Химия для бассейна','ar','صيانة المسبح بالمواد الكيميائية','uk','Хімічне обслуговування басейну'), jsonb_build_object('en','pH balance, chlorine, algae control'), 6),
  ('garden-pool', 'pool-repair', jsonb_build_object('me','Popravka bazena','sr','Popravka bazena','en','Pool repair','tr','Havuz onarım','de','Pool-Reparatur','it','Riparazione piscina','ru','Ремонт бассейна','ar','إصلاح المسبح','uk','Ремонт басейну'), jsonb_build_object('en','Liner, pump, filter, tile repairs'), 7),
  ('garden-pool', 'olive-fruit-trees', jsonb_build_object('me','Maslinjaci i voćke','sr','Maslinjaci i voćke','en','Olive & fruit tree care','tr','Zeytin & meyve ağacı bakımı','de','Pflege von Oliven- und Obstbäumen','it','Cura ulivi e alberi da frutto','ru','Уход за оливковыми и фруктовыми деревьями','ar','العناية بأشجار الزيتون والفاكهة','uk','Догляд за оливковими та фруктовими деревами'), jsonb_build_object('en','Mediterranean orchard maintenance'), 8),
  ('garden-pool', 'fences-walls', jsonb_build_object('me','Ograde i zidovi','sr','Ograde i zidovi','en','Fences & walls','tr','Çit & duvar','de','Zäune & Mauern','it','Recinzioni e muri','ru','Заборы и стены','ar','الأسوار والجدران','uk','Огорожі та стіни'), jsonb_build_object('en','Garden fencing, retaining walls'), 9),
  ('garden-pool', 'garden-furniture', jsonb_build_object('me','Bašta nameštaj','sr','Baštenski nameštaj','en','Garden furniture care','tr','Bahçe mobilya bakımı','de','Pflege von Gartenmöbeln','it','Cura mobili da giardino','ru','Уход за садовой мебелью','ar','العناية بأثاث الحديقة','uk','Догляд за садовими меблями'), jsonb_build_object('en','Cleaning, oiling, winter storage'), 10),

  -- Events & Wedding
  ('events-wedding', 'destination-wedding', jsonb_build_object('me','Destinacijsko venčanje','sr','Destinacijsko venčanje','en','Destination wedding planner','tr','Destination düğün planlayıcısı','de','Destination-Hochzeitsplaner','it','Wedding planner per matrimoni di destinazione','ru','Дестинационная свадьба','ar','مخطط حفلات زفاف الوجهة','uk','Дестинаційне весілля'), jsonb_build_object('en','Full destination wedding coordination'), 1),
  ('events-wedding', 'engagement-henna', jsonb_build_object('me','Veridba i kana','sr','Veridba i kana','en','Engagement & henna night','tr','Nişan & kına','de','Verlobung und Henna-Nacht','it','Fidanzamento e festa dell''henné','ru','Помолвка и хна','ar','الخطوبة وليلة الحناء','uk','Заручини та хна'), jsonb_build_object('en','Engagement and traditional pre-wedding events'), 2),
  ('events-wedding', 'decoration-flowers', jsonb_build_object('me','Dekoracija i cvijeće','sr','Dekoracija i cveće','en','Decoration & flowers','tr','Dekorasyon & çiçek','de','Dekoration und Blumen','it','Decorazione e fiori','ru','Декор и цветы','ar','الديكور والزهور','uk','Декор і квіти'), jsonb_build_object('en','Floral arrangements and event styling'), 3),
  ('events-wedding', 'stage-tent', jsonb_build_object('me','Bina i šator','sr','Bina i šator','en','Stage & marquee','tr','Sahne & tente','de','Bühne und Festzelt','it','Palco e tendone','ru','Сцена и шатёр','ar','المسرح والخيمة','uk','Сцена та шатро'), jsonb_build_object('en','Stage construction and event tents'), 4),
  ('events-wedding', 'sound-light', jsonb_build_object('me','Razglas i osvjetljenje','sr','Ozvučenje i osvetljenje','en','Sound & lighting','tr','Ses & ışık altyapısı','de','Ton- und Lichttechnik','it','Audio e illuminazione','ru','Звук и свет','ar','الصوت والإضاءة','uk','Звук та освітлення'), jsonb_build_object('en','Professional A/V systems for events'), 5),
  ('events-wedding', 'corporate-events', jsonb_build_object('me','Korporativne organizacije','sr','Korporativne organizacije','en','Corporate events','tr','Kurumsal organizasyon','de','Firmenveranstaltungen','it','Eventi aziendali','ru','Корпоративные события','ar','الفعاليات للشركات','uk','Корпоративні події'), jsonb_build_object('en','Conferences, retreats, gala dinners'), 6),
  ('events-wedding', 'kids-party', jsonb_build_object('me','Dječja zabava','sr','Dečja zabava','en','Kids party','tr','Çocuk partisi','de','Kinderparty','it','Festa per bambini','ru','Детский праздник','ar','حفلة أطفال','uk','Дитяче свято'), jsonb_build_object('en','Themed kids parties with activities'), 7),
  ('events-wedding', 'graduation', jsonb_build_object('me','Maturska proslava','sr','Maturska proslava','en','Graduation','tr','Mezuniyet','de','Abschlussfeier','it','Festa di laurea','ru','Выпускной','ar','حفل التخرج','uk','Випускний'), jsonb_build_object('en','Graduation parties and ceremonies'), 8),
  ('events-wedding', 'after-party', jsonb_build_object('me','After-party','sr','After-party','en','After-party','tr','After-party','de','After-Party','it','After-party','ru','Афтепати','ar','حفلة ما بعد الزفاف','uk','Афтепаті'), jsonb_build_object('en','Post-event continuation parties'), 9),
  ('events-wedding', 'event-coordinator', jsonb_build_object('me','Koordinator događaja','sr','Koordinator događaja','en','Event coordinator','tr','Koordinatör','de','Eventkoordinator','it','Coordinatore eventi','ru','Координатор события','ar','منسق الفعاليات','uk','Координатор події'), jsonb_build_object('en','Day-of event management'), 10),

  -- Photo & Video
  ('photo-video', 'wedding-photographer', jsonb_build_object('me','Vjenčani fotograf','sr','Venčani fotograf','en','Wedding photographer','tr','Düğün fotoğrafçısı','de','Hochzeitsfotograf','it','Fotografo di matrimonio','ru','Свадебный фотограф','ar','مصور حفلات الزفاف','uk','Весільний фотограф'), jsonb_build_object('en','Full wedding day coverage'), 1),
  ('photo-video', 'prewedding-honeymoon', jsonb_build_object('me','Predvjenčano i medeni mjesec','sr','Predvenčana i medeni mesec','en','Prewedding & honeymoon','tr','Prewedding / honeymoon','de','Prewedding und Flitterwochen','it','Pre-matrimonio e luna di miele','ru','Предсвадебная и медовый месяц','ar','ما قبل الزفاف وشهر العسل','uk','Передвесільна та медовий місяць'), jsonb_build_object('en','Engagement, honeymoon, couple shoots'), 2),
  ('photo-video', 'drone-shoots', jsonb_build_object('me','Snimanje dronom','sr','Snimanje dronom','en','Drone shoots','tr','Drone çekim','de','Drohnenaufnahmen','it','Riprese con drone','ru','Съёмка дроном','ar','التصوير بالطائرات بدون طيار','uk','Зйомка дроном'), jsonb_build_object('en','Aerial photography and video'), 3),
  ('photo-video', 'corporate-video', jsonb_build_object('me','Korporativni video','sr','Korporativni video','en','Corporate video','tr','Kurumsal video','de','Firmenvideo','it','Video aziendali','ru','Корпоративное видео','ar','فيديو الشركات','uk','Корпоративне відео'), jsonb_build_object('en','Brand films, training videos, recap reels'), 4),
  ('photo-video', 'real-estate-airbnb', jsonb_build_object('me','Nekretnine i Airbnb','sr','Nekretnine i Airbnb','en','Real estate & Airbnb photography','tr','Gayrimenkul & Airbnb fotoğrafı','de','Immobilien- und Airbnb-Fotografie','it','Fotografia immobiliare e Airbnb','ru','Фото для недвижимости и Airbnb','ar','تصوير العقارات و Airbnb','uk','Фото нерухомості та Airbnb'), jsonb_build_object('en','Listing-grade interior photography'), 5),
  ('photo-video', 'family-baby-shoot', jsonb_build_object('me','Porodični i bebi shoot','sr','Porodični i bebi šut','en','Family & baby shoot','tr','Aile / bebek çekimi','de','Familien- und Babyshoot','it','Servizio famiglia e neonato','ru','Семейная и детская съёмка','ar','جلسة عائلية وأطفال','uk','Сімейна та дитяча зйомка'), jsonb_build_object('en','Lifestyle family and newborn sessions'), 6),
  ('photo-video', 'product-photo', jsonb_build_object('me','Fotografija proizvoda','sr','Fotografija proizvoda','en','Product photography','tr','Ürün fotoğrafı','de','Produktfotografie','it','Fotografia di prodotto','ru','Предметная съёмка','ar','تصوير المنتجات','uk','Предметна зйомка'), jsonb_build_object('en','E-commerce and catalog product shots'), 7),
  ('photo-video', 'edit-retouch', jsonb_build_object('me','Edit i retuširanje','sr','Edit i retuširanje','en','Editing & retouching','tr','Edit & retouch','de','Bearbeitung und Retusche','it','Editing e ritocco','ru','Монтаж и ретушь','ar','المونتاج والتنقيح','uk','Монтаж та ретуш'), jsonb_build_object('en','Post-production for video and photo'), 8),
  ('photo-video', 'album-print', jsonb_build_object('me','Album i štampa','sr','Album i štampa','en','Album & print','tr','Albüm & baskı','de','Album und Druck','it','Album e stampe','ru','Альбом и печать','ar','الألبوم والطباعة','uk','Альбом і друк'), jsonb_build_object('en','Photo books and fine-art prints'), 9),
  ('photo-video', 'social-content', jsonb_build_object('me','Sadržaj za društvene mreže','sr','Sadržaj za društvene mreže','en','Social media content','tr','Sosyal medya içerik prodüksiyonu','de','Social-Media-Content','it','Contenuti per social media','ru','Контент для соцсетей','ar','محتوى وسائل التواصل','uk','Контент для соцмереж'), jsonb_build_object('en','Reels, TikToks, Insta-ready content'), 10),

  -- Health & Wellness
  ('health-wellness', 'physiotherapy', jsonb_build_object('me','Fizioterapija','sr','Fizioterapija','en','Physiotherapy','tr','Fizyoterapi','de','Physiotherapie','it','Fisioterapia','ru','Физиотерапия','ar','العلاج الطبيعي','uk','Фізіотерапія'), jsonb_build_object('en','Rehabilitation and movement therapy'), 1),
  ('health-wellness', 'therapeutic-massage', jsonb_build_object('me','Terapeutska masaža','sr','Terapeutska masaža','en','Therapeutic massage','tr','Terapötik masaj','de','Therapeutische Massage','it','Massaggio terapeutico','ru','Лечебный массаж','ar','التدليك العلاجي','uk','Лікувальний масаж'), jsonb_build_object('en','Sports, deep-tissue, lymphatic massage'), 2),
  ('health-wellness', 'home-nursing', jsonb_build_object('me','Sestrinska njega kod kuće','sr','Sestrinska nega kod kuće','en','Home nursing','tr','Evde hemşire','de','Häusliche Krankenpflege','it','Assistenza infermieristica a domicilio','ru','Медсестра на дом','ar','تمريض منزلي','uk','Домашній догляд медсестри'), jsonb_build_object('en','Wound care, injections, post-op support'), 3),
  ('health-wellness', 'nutrition-diet', jsonb_build_object('me','Ishrana i dijeta','sr','Ishrana i dijeta','en','Nutrition & diet','tr','Beslenme & diyet','de','Ernährungsberatung und Diät','it','Nutrizione e dieta','ru','Питание и диета','ar','التغذية والحمية','uk','Харчування та дієта'), jsonb_build_object('en','Personalized meal plans and dietitian consults'), 4),
  ('health-wellness', 'psychologist-therapist', jsonb_build_object('me','Psiholog i terapeut','sr','Psiholog i terapeut','en','Psychologist & therapist','tr','Psikolog & terapist','de','Psychologe und Therapeut','it','Psicologo e terapeuta','ru','Психолог и терапевт','ar','أخصائي نفسي ومعالج','uk','Психолог і терапевт'), jsonb_build_object('en','Adult counseling and psychotherapy'), 5),
  ('health-wellness', 'acupuncture', jsonb_build_object('me','Akupunktura','sr','Akupunktura','en','Acupuncture','tr','Akupunktur','de','Akupunktur','it','Agopuntura','ru','Акупунктура','ar','الوخز بالإبر','uk','Акупунктура'), jsonb_build_object('en','Traditional acupuncture sessions'), 6),
  ('health-wellness', 'home-blood-test', jsonb_build_object('me','Vađenje krvi kod kuće','sr','Vađenje krvi kod kuće','en','Home blood test','tr','Evde kan tahlili','de','Hausbesuch Blutabnahme','it','Prelievo del sangue a domicilio','ru','Анализ крови на дому','ar','تحليل الدم في المنزل','uk','Аналіз крові вдома'), jsonb_build_object('en','Lab sample collection at home'), 7),
  ('health-wellness', 'child-psychologist', jsonb_build_object('me','Dječji psiholog','sr','Dečji psiholog','en','Child psychologist','tr','Çocuk psikoloğu','de','Kinderpsychologe','it','Psicologo infantile','ru','Детский психолог','ar','أخصائي نفسي للأطفال','uk','Дитячий психолог'), jsonb_build_object('en','Child and adolescent therapy'), 8),
  ('health-wellness', 'pregnancy-physio', jsonb_build_object('me','Fizioterapija u trudnoći','sr','Fizioterapija u trudnoći','en','Pregnancy physiotherapy','tr','Gebelik fizyoterapisi','de','Schwangerschaftsphysiotherapie','it','Fisioterapia in gravidanza','ru','Физиотерапия для беременных','ar','العلاج الطبيعي للحامل','uk','Фізіотерапія для вагітних'), jsonb_build_object('en','Prenatal and postpartum movement therapy'), 9),
  ('health-wellness', 'home-iv-drip', jsonb_build_object('me','IV terapija kod kuće','sr','IV terapija kod kuće','en','Home IV drip','tr','Evde IV / serum','de','IV-Therapie zu Hause','it','Flebo a domicilio','ru','Капельницы на дому','ar','محاليل وريدية في المنزل','uk','Крапельниці вдома'), jsonb_build_object('en','At-home hydration and vitamin IV therapy'), 10)
) AS s(parent_slug, slug, name, description, sort_order)
ON CONFLICT (slug) DO NOTHING;

-- ─── 3. Search synonyms for the 4 new categories ──────────────────────────

INSERT INTO public.glatko_search_synonyms (canonical_slug, locale, synonym, weight)
VALUES
  -- garden-pool (12 synonyms × multi-locale)
  ('garden-pool', 'tr', 'bahçıvan', 100),
  ('garden-pool', 'tr', 'peyzaj', 90),
  ('garden-pool', 'tr', 'havuz bakımı', 100),
  ('garden-pool', 'tr', 'çim biçme', 90),
  ('garden-pool', 'me', 'bašta', 100),
  ('garden-pool', 'me', 'pejzaž', 90),
  ('garden-pool', 'me', 'bazen', 100),
  ('garden-pool', 'me', 'baštovan', 95),
  ('garden-pool', 'sr', 'bašta', 100),
  ('garden-pool', 'sr', 'baštovan', 95),
  ('garden-pool', 'en', 'gardener', 100),
  ('garden-pool', 'en', 'pool maintenance', 100),
  ('garden-pool', 'en', 'landscaping', 95),
  ('garden-pool', 'de', 'gärtner', 100),
  ('garden-pool', 'de', 'poolpflege', 100),
  ('garden-pool', 'ru', 'садовник', 100),
  ('garden-pool', 'ru', 'обслуживание бассейна', 100),
  ('garden-pool', 'it', 'giardiniere', 100),
  ('garden-pool', 'ar', 'بستاني', 100),
  ('garden-pool', 'uk', 'садівник', 100),

  -- events-wedding (12 synonyms × multi-locale)
  ('events-wedding', 'tr', 'düğün organizatörü', 100),
  ('events-wedding', 'tr', 'düğün planlamacı', 100),
  ('events-wedding', 'tr', 'organizasyon firması', 90),
  ('events-wedding', 'tr', 'wedding planner', 95),
  ('events-wedding', 'me', 'venčanje', 100),
  ('events-wedding', 'me', 'organizator događaja', 95),
  ('events-wedding', 'sr', 'venčanje', 100),
  ('events-wedding', 'sr', 'organizator događaja', 95),
  ('events-wedding', 'en', 'wedding planner', 100),
  ('events-wedding', 'en', 'event planner', 100),
  ('events-wedding', 'de', 'hochzeitsplaner', 100),
  ('events-wedding', 'ru', 'свадебный организатор', 100),
  ('events-wedding', 'it', 'wedding planner', 100),
  ('events-wedding', 'ar', 'منظم حفلات الزفاف', 100),
  ('events-wedding', 'uk', 'весільний організатор', 100),

  -- photo-video (12 synonyms × multi-locale)
  ('photo-video', 'tr', 'fotoğrafçı', 100),
  ('photo-video', 'tr', 'düğün fotoğrafçısı', 100),
  ('photo-video', 'tr', 'video çekim', 95),
  ('photo-video', 'tr', 'drone çekim', 95),
  ('photo-video', 'me', 'fotograf', 100),
  ('photo-video', 'me', 'snimatelj', 95),
  ('photo-video', 'sr', 'fotograf', 100),
  ('photo-video', 'sr', 'snimatelj', 95),
  ('photo-video', 'en', 'photographer', 100),
  ('photo-video', 'en', 'videographer', 100),
  ('photo-video', 'en', 'drone shoot', 95),
  ('photo-video', 'de', 'fotograf', 100),
  ('photo-video', 'ru', 'фотограф', 100),
  ('photo-video', 'it', 'fotografo', 100),
  ('photo-video', 'ar', 'مصور', 100),
  ('photo-video', 'uk', 'фотограф', 100),

  -- health-wellness (12 synonyms × multi-locale)
  ('health-wellness', 'tr', 'fizyoterapist', 100),
  ('health-wellness', 'tr', 'evde hemşire', 100),
  ('health-wellness', 'tr', 'diyetisyen', 100),
  ('health-wellness', 'tr', 'psikolog', 95),
  ('health-wellness', 'me', 'fizioterapeut', 100),
  ('health-wellness', 'me', 'sestra', 90),
  ('health-wellness', 'sr', 'fizioterapeut', 100),
  ('health-wellness', 'sr', 'sestra', 90),
  ('health-wellness', 'en', 'physiotherapist', 100),
  ('health-wellness', 'en', 'home nurse', 100),
  ('health-wellness', 'en', 'dietitian', 100),
  ('health-wellness', 'de', 'physiotherapeut', 100),
  ('health-wellness', 'ru', 'физиотерапевт', 100),
  ('health-wellness', 'it', 'fisioterapista', 100),
  ('health-wellness', 'ar', 'أخصائي العلاج الطبيعي', 100),
  ('health-wellness', 'uk', 'фізіотерапевт', 100)
ON CONFLICT (canonical_slug, locale, synonym) DO NOTHING;

COMMIT;
