-- ============================================================================
-- 020_glatko_search_synonyms_seed_batch4.sql
-- G-CAT-3: Sectoral synonym seed — BATCH 4 (final, sub-categories of 4 roots)
--
-- Sub-categories under childcare-family, moving-transport, automotive,
-- airbnb-management. Same density as Batch 3 (3 syn per locale per sub).
-- 29 subs × 9 × 3 = 783 rows.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- CHILDCARE-FAMILY SUBS (7): babysitter, nanny-fulltime, birthday-events,
-- animator-clown, child-photographer, tutor-young, pet-sitting
-- ----------------------------------------------------------------------------

INSERT INTO public.glatko_search_synonyms (canonical_slug, locale, synonym, weight) VALUES
  -- babysitter
  ('babysitter', 'me', 'povremeno čuvanje', 3), ('babysitter', 'me', 'večernje čuvanje', 3), ('babysitter', 'me', 'vikend čuvanje', 3),
  ('babysitter', 'sr', 'povremeno čuvanje', 3), ('babysitter', 'sr', 'večernje čuvanje', 3), ('babysitter', 'sr', 'vikend čuvanje', 3),
  ('babysitter', 'en', 'evening sitter', 3), ('babysitter', 'en', 'date night sitter', 3), ('babysitter', 'en', 'weekend sitter', 3),
  ('babysitter', 'tr', 'akşam bakıcı', 3), ('babysitter', 'tr', 'haftasonu bakıcı', 3), ('babysitter', 'tr', 'saatlik bakıcı', 3),
  ('babysitter', 'de', 'abend babysitter', 3), ('babysitter', 'de', 'wochenend babysitter', 3), ('babysitter', 'de', 'stundenweise babysitter', 3),
  ('babysitter', 'it', 'baby sitter sera', 3), ('babysitter', 'it', 'baby sitter weekend', 3), ('babysitter', 'it', 'baby sitter occasionale', 3),
  ('babysitter', 'ru', 'няня на вечер', 3), ('babysitter', 'ru', 'няня на выходные', 3), ('babysitter', 'ru', 'няня почасово', 3),
  ('babysitter', 'ar', 'جليسة مسائية', 3), ('babysitter', 'ar', 'جليسة عطلة نهاية الأسبوع', 3), ('babysitter', 'ar', 'جليسة بالساعة', 3),
  ('babysitter', 'uk', 'няня на вечір', 3), ('babysitter', 'uk', 'няня на вихідні', 3), ('babysitter', 'uk', 'няня погодинно', 3),
  -- nanny-fulltime
  ('nanny-fulltime', 'me', 'cjelodnevna dadilja', 3), ('nanny-fulltime', 'me', 'live-in dadilja', 3), ('nanny-fulltime', 'me', 'stalna dadilja', 3),
  ('nanny-fulltime', 'sr', 'celodnevna dadilja', 3), ('nanny-fulltime', 'sr', 'live-in dadilja', 3), ('nanny-fulltime', 'sr', 'stalna dadilja', 3),
  ('nanny-fulltime', 'en', 'full-time nanny', 3), ('nanny-fulltime', 'en', 'live-in nanny', 3), ('nanny-fulltime', 'en', 'permanent nanny', 3),
  ('nanny-fulltime', 'tr', 'tam zamanlı dadı', 3), ('nanny-fulltime', 'tr', 'evde kalan dadı', 3), ('nanny-fulltime', 'tr', 'sürekli dadı', 3),
  ('nanny-fulltime', 'de', 'vollzeit nanny', 3), ('nanny-fulltime', 'de', 'live-in nanny', 3), ('nanny-fulltime', 'de', 'feste kindermädchen', 3),
  ('nanny-fulltime', 'it', 'tata fissa', 3), ('nanny-fulltime', 'it', 'tata convivente', 3), ('nanny-fulltime', 'it', 'tata full-time', 3),
  ('nanny-fulltime', 'ru', 'няня с проживанием', 3), ('nanny-fulltime', 'ru', 'няня на полный день', 3), ('nanny-fulltime', 'ru', 'постоянная няня', 3),
  ('nanny-fulltime', 'ar', 'مربية مقيمة', 3), ('nanny-fulltime', 'ar', 'مربية بدوام كامل', 3), ('nanny-fulltime', 'ar', 'مربية دائمة', 3),
  ('nanny-fulltime', 'uk', 'няня з проживанням', 3), ('nanny-fulltime', 'uk', 'няня на повний день', 3), ('nanny-fulltime', 'uk', 'постійна няня', 3),
  -- birthday-events
  ('birthday-events', 'me', 'rođendanska žurka', 3), ('birthday-events', 'me', 'organizacija rođendana', 3), ('birthday-events', 'me', 'dječja proslava', 3),
  ('birthday-events', 'sr', 'rođendanska žurka', 3), ('birthday-events', 'sr', 'organizacija rođendana', 3), ('birthday-events', 'sr', 'dečija proslava', 3),
  ('birthday-events', 'en', 'birthday party', 3), ('birthday-events', 'en', 'kids party', 3), ('birthday-events', 'en', 'party planner', 3),
  ('birthday-events', 'tr', 'doğum günü partisi', 3), ('birthday-events', 'tr', 'çocuk partisi', 3), ('birthday-events', 'tr', 'parti organizasyonu', 3),
  ('birthday-events', 'de', 'kindergeburtstag', 3), ('birthday-events', 'de', 'geburtstagsparty', 3), ('birthday-events', 'de', 'partyplanung', 3),
  ('birthday-events', 'it', 'festa di compleanno', 3), ('birthday-events', 'it', 'festa bambini', 3), ('birthday-events', 'it', 'organizzazione feste', 3),
  ('birthday-events', 'ru', 'детский день рождения', 3), ('birthday-events', 'ru', 'детская вечеринка', 3), ('birthday-events', 'ru', 'организация праздников', 3),
  ('birthday-events', 'ar', 'عيد ميلاد أطفال', 3), ('birthday-events', 'ar', 'حفلة أطفال', 3), ('birthday-events', 'ar', 'تنظيم حفلات', 3),
  ('birthday-events', 'uk', 'дитячий день народження', 3), ('birthday-events', 'uk', 'дитяча вечірка', 3), ('birthday-events', 'uk', 'організація свят', 3),
  -- animator-clown
  ('animator-clown', 'me', 'animator za djecu', 3), ('animator-clown', 'me', 'klovn', 3), ('animator-clown', 'me', 'maskota za rođendan', 3),
  ('animator-clown', 'sr', 'animator za decu', 3), ('animator-clown', 'sr', 'klovn', 3), ('animator-clown', 'sr', 'maskota za rođendan', 3),
  ('animator-clown', 'en', 'kids entertainer', 3), ('animator-clown', 'en', 'clown', 3), ('animator-clown', 'en', 'mascot', 3),
  ('animator-clown', 'tr', 'çocuk animatörü', 3), ('animator-clown', 'tr', 'palyaço', 3), ('animator-clown', 'tr', 'maskot', 3),
  ('animator-clown', 'de', 'kinderanimateur', 3), ('animator-clown', 'de', 'clown', 3), ('animator-clown', 'de', 'maskottchen', 3),
  ('animator-clown', 'it', 'animatore bambini', 3), ('animator-clown', 'it', 'pagliaccio', 3), ('animator-clown', 'it', 'mascotte', 3),
  ('animator-clown', 'ru', 'аниматор', 3), ('animator-clown', 'ru', 'клоун', 3), ('animator-clown', 'ru', 'ростовая кукла', 3),
  ('animator-clown', 'ar', 'مؤدي أطفال', 3), ('animator-clown', 'ar', 'مهرج', 3), ('animator-clown', 'ar', 'تميمة', 3),
  ('animator-clown', 'uk', 'аніматор', 3), ('animator-clown', 'uk', 'клоун', 3), ('animator-clown', 'uk', 'ростова лялька', 3),
  -- child-photographer
  ('child-photographer', 'me', 'dječji fotograf', 3), ('child-photographer', 'me', 'fotografisanje beba', 3), ('child-photographer', 'me', 'porodični portreti', 3),
  ('child-photographer', 'sr', 'dečji fotograf', 3), ('child-photographer', 'sr', 'fotografisanje beba', 3), ('child-photographer', 'sr', 'porodični portreti', 3),
  ('child-photographer', 'en', 'newborn photography', 3), ('child-photographer', 'en', 'kids photographer', 3), ('child-photographer', 'en', 'family portrait', 3),
  ('child-photographer', 'tr', 'bebek fotoğrafı', 3), ('child-photographer', 'tr', 'çocuk fotoğrafçısı', 3), ('child-photographer', 'tr', 'aile fotoğrafı', 3),
  ('child-photographer', 'de', 'babyfotografie', 3), ('child-photographer', 'de', 'kinderfotograf', 3), ('child-photographer', 'de', 'familienporträt', 3),
  ('child-photographer', 'it', 'fotografo neonati', 3), ('child-photographer', 'it', 'fotografo bambini', 3), ('child-photographer', 'it', 'ritratto famiglia', 3),
  ('child-photographer', 'ru', 'фотосессия новорождённых', 3), ('child-photographer', 'ru', 'детский фотограф', 3), ('child-photographer', 'ru', 'семейный портрет', 3),
  ('child-photographer', 'ar', 'مصور أطفال', 3), ('child-photographer', 'ar', 'تصوير حديثي الولادة', 3), ('child-photographer', 'ar', 'بورتريه عائلي', 3),
  ('child-photographer', 'uk', 'фотосесія новонароджених', 3), ('child-photographer', 'uk', 'дитячий фотограф', 3), ('child-photographer', 'uk', 'сімейний портрет', 3),
  -- tutor-young
  ('tutor-young', 'me', 'pomoć u učenju za malu djecu', 3), ('tutor-young', 'me', 'predškolska pomoć', 3), ('tutor-young', 'me', 'priprema za školu', 3),
  ('tutor-young', 'sr', 'pomoć u učenju za malu decu', 3), ('tutor-young', 'sr', 'predškolska pomoć', 3), ('tutor-young', 'sr', 'priprema za školu', 3),
  ('tutor-young', 'en', 'kindergarten tutor', 3), ('tutor-young', 'en', 'reading tutor for kids', 3), ('tutor-young', 'en', 'school readiness', 3),
  ('tutor-young', 'tr', 'okul öncesi öğretmen', 3), ('tutor-young', 'tr', 'okula hazırlık', 3), ('tutor-young', 'tr', 'küçük yaş öğretmen', 3),
  ('tutor-young', 'de', 'vorschullehrer', 3), ('tutor-young', 'de', 'leseförderung kinder', 3), ('tutor-young', 'de', 'schulvorbereitung', 3),
  ('tutor-young', 'it', 'insegnante prescolare', 3), ('tutor-young', 'it', 'preparazione scuola', 3), ('tutor-young', 'it', 'tutor bambini piccoli', 3),
  ('tutor-young', 'ru', 'дошкольный педагог', 3), ('tutor-young', 'ru', 'подготовка к школе', 3), ('tutor-young', 'ru', 'учим читать ребенка', 3),
  ('tutor-young', 'ar', 'معلم رياض أطفال', 3), ('tutor-young', 'ar', 'تحضير للمدرسة', 3), ('tutor-young', 'ar', 'تعليم أطفال صغار', 3),
  ('tutor-young', 'uk', 'дошкільний педагог', 3), ('tutor-young', 'uk', 'підготовка до школи', 3), ('tutor-young', 'uk', 'вчимо читати дитину', 3),
  -- pet-sitting
  ('pet-sitting', 'me', 'čuvanje pasa', 3), ('pet-sitting', 'me', 'šetač pasa', 3), ('pet-sitting', 'me', 'čuvanje mačaka', 3),
  ('pet-sitting', 'sr', 'čuvanje pasa', 3), ('pet-sitting', 'sr', 'šetač pasa', 3), ('pet-sitting', 'sr', 'čuvanje mačaka', 3),
  ('pet-sitting', 'en', 'dog sitter', 3), ('pet-sitting', 'en', 'dog walker', 3), ('pet-sitting', 'en', 'cat sitter', 3),
  ('pet-sitting', 'tr', 'köpek bakıcısı', 3), ('pet-sitting', 'tr', 'köpek yürüyüş', 3), ('pet-sitting', 'tr', 'kedi bakıcısı', 3),
  ('pet-sitting', 'de', 'hundesitter', 3), ('pet-sitting', 'de', 'gassi service', 3), ('pet-sitting', 'de', 'katzensitter', 3),
  ('pet-sitting', 'it', 'dog sitter', 3), ('pet-sitting', 'it', 'pet sitting', 3), ('pet-sitting', 'it', 'cat sitter', 3),
  ('pet-sitting', 'ru', 'передержка собак', 3), ('pet-sitting', 'ru', 'выгул собак', 3), ('pet-sitting', 'ru', 'передержка кошек', 3),
  ('pet-sitting', 'ar', 'جليس كلاب', 3), ('pet-sitting', 'ar', 'مشي الكلاب', 3), ('pet-sitting', 'ar', 'جليس قطط', 3),
  ('pet-sitting', 'uk', 'передержка собак', 3), ('pet-sitting', 'uk', 'вигул собак', 3), ('pet-sitting', 'uk', 'передержка котів', 3);


-- ----------------------------------------------------------------------------
-- MOVING-TRANSPORT SUBS (7): home-moving, office-moving, single-item,
-- boat-bike-transport, storage, packing, airport-transfer
-- ----------------------------------------------------------------------------

INSERT INTO public.glatko_search_synonyms (canonical_slug, locale, synonym, weight) VALUES
  -- home-moving
  ('home-moving', 'me', 'kućna selidba', 3), ('home-moving', 'me', 'preseljenje stana', 3), ('home-moving', 'me', 'preseljenje kuće', 3),
  ('home-moving', 'sr', 'kućna selidba', 3), ('home-moving', 'sr', 'preseljenje stana', 3), ('home-moving', 'sr', 'preseljenje kuće', 3),
  ('home-moving', 'en', 'apartment moving', 3), ('home-moving', 'en', 'residential moving', 3), ('home-moving', 'en', 'home relocation', 3),
  ('home-moving', 'tr', 'ev taşıma', 3), ('home-moving', 'tr', 'daire taşıma', 3), ('home-moving', 'tr', 'mesken nakliyat', 3),
  ('home-moving', 'de', 'privater umzug', 3), ('home-moving', 'de', 'wohnungsumzug', 3), ('home-moving', 'de', 'hausumzug', 3),
  ('home-moving', 'it', 'trasloco appartamento', 3), ('home-moving', 'it', 'trasloco casa', 3), ('home-moving', 'it', 'trasloco residenziale', 3),
  ('home-moving', 'ru', 'квартирный переезд', 3), ('home-moving', 'ru', 'переезд дома', 3), ('home-moving', 'ru', 'жилой переезд', 3),
  ('home-moving', 'ar', 'نقل شقة', 3), ('home-moving', 'ar', 'نقل منزل', 3), ('home-moving', 'ar', 'نقل سكني', 3),
  ('home-moving', 'uk', 'квартирний переїзд', 3), ('home-moving', 'uk', 'переїзд будинку', 3), ('home-moving', 'uk', 'житловий переїзд', 3),
  -- office-moving
  ('office-moving', 'me', 'kancelarijska selidba', 3), ('office-moving', 'me', 'preseljenje firme', 3), ('office-moving', 'me', 'biznis selidba', 3),
  ('office-moving', 'sr', 'kancelarijska selidba', 3), ('office-moving', 'sr', 'preseljenje firme', 3), ('office-moving', 'sr', 'biznis selidba', 3),
  ('office-moving', 'en', 'commercial moving', 3), ('office-moving', 'en', 'business relocation', 3), ('office-moving', 'en', 'corporate move', 3),
  ('office-moving', 'tr', 'ofis taşıma', 3), ('office-moving', 'tr', 'işyeri taşıma', 3), ('office-moving', 'tr', 'kurumsal nakliyat', 3),
  ('office-moving', 'de', 'büroumzug', 3), ('office-moving', 'de', 'firmenumzug', 3), ('office-moving', 'de', 'gewerbeumzug', 3),
  ('office-moving', 'it', 'trasloco ufficio', 3), ('office-moving', 'it', 'trasloco aziendale', 3), ('office-moving', 'it', 'trasloco commerciale', 3),
  ('office-moving', 'ru', 'офисный переезд', 3), ('office-moving', 'ru', 'переезд компании', 3), ('office-moving', 'ru', 'корпоративный переезд', 3),
  ('office-moving', 'ar', 'نقل مكاتب', 3), ('office-moving', 'ar', 'نقل شركة', 3), ('office-moving', 'ar', 'نقل تجاري', 3),
  ('office-moving', 'uk', 'офісний переїзд', 3), ('office-moving', 'uk', 'переїзд компанії', 3), ('office-moving', 'uk', 'корпоративний переїзд', 3),
  -- single-item
  ('single-item', 'me', 'transport jednog komada', 3), ('single-item', 'me', 'preseljenje frižidera', 3), ('single-item', 'me', 'preseljenje veš mašine', 3),
  ('single-item', 'sr', 'transport jednog komada', 3), ('single-item', 'sr', 'preseljenje frižidera', 3), ('single-item', 'sr', 'preseljenje veš mašine', 3),
  ('single-item', 'en', 'single item move', 3), ('single-item', 'en', 'fridge moving', 3), ('single-item', 'en', 'sofa delivery', 3),
  ('single-item', 'tr', 'tek parça taşıma', 3), ('single-item', 'tr', 'buzdolabı taşıma', 3), ('single-item', 'tr', 'koltuk taşıma', 3),
  ('single-item', 'de', 'einzelstücktransport', 3), ('single-item', 'de', 'kühlschrank transport', 3), ('single-item', 'de', 'sofa lieferung', 3),
  ('single-item', 'it', 'trasporto singolo articolo', 3), ('single-item', 'it', 'trasporto frigo', 3), ('single-item', 'it', 'consegna divano', 3),
  ('single-item', 'ru', 'перевозка одного предмета', 3), ('single-item', 'ru', 'перевозка холодильника', 3), ('single-item', 'ru', 'доставка дивана', 3),
  ('single-item', 'ar', 'نقل قطعة واحدة', 3), ('single-item', 'ar', 'نقل ثلاجة', 3), ('single-item', 'ar', 'توصيل أريكة', 3),
  ('single-item', 'uk', 'перевезення одного предмета', 3), ('single-item', 'uk', 'перевезення холодильника', 3), ('single-item', 'uk', 'доставка дивана', 3),
  -- boat-bike-transport
  ('boat-bike-transport', 'me', 'transport plovila kopnom', 3), ('boat-bike-transport', 'me', 'transport bicikla', 3), ('boat-bike-transport', 'me', 'transport motora', 3),
  ('boat-bike-transport', 'sr', 'transport plovila kopnom', 3), ('boat-bike-transport', 'sr', 'transport bicikla', 3), ('boat-bike-transport', 'sr', 'transport motora', 3),
  ('boat-bike-transport', 'en', 'boat trailer transport', 3), ('boat-bike-transport', 'en', 'bike transport', 3), ('boat-bike-transport', 'en', 'motorcycle transport', 3),
  ('boat-bike-transport', 'tr', 'tekne karadan taşıma', 3), ('boat-bike-transport', 'tr', 'bisiklet taşıma', 3), ('boat-bike-transport', 'tr', 'motosiklet taşıma', 3),
  ('boat-bike-transport', 'de', 'boots-trailer-transport', 3), ('boat-bike-transport', 'de', 'fahrradtransport', 3), ('boat-bike-transport', 'de', 'motorradtransport', 3),
  ('boat-bike-transport', 'it', 'trasporto barca terrestre', 3), ('boat-bike-transport', 'it', 'trasporto bici', 3), ('boat-bike-transport', 'it', 'trasporto moto', 3),
  ('boat-bike-transport', 'ru', 'перевозка лодки по суше', 3), ('boat-bike-transport', 'ru', 'перевозка велосипеда', 3), ('boat-bike-transport', 'ru', 'перевозка мотоцикла', 3),
  ('boat-bike-transport', 'ar', 'نقل قارب بريا', 3), ('boat-bike-transport', 'ar', 'نقل دراجة', 3), ('boat-bike-transport', 'ar', 'نقل دراجة نارية', 3),
  ('boat-bike-transport', 'uk', 'перевезення човна сушею', 3), ('boat-bike-transport', 'uk', 'перевезення велосипеда', 3), ('boat-bike-transport', 'uk', 'перевезення мотоцикла', 3),
  -- storage
  ('storage', 'me', 'magacin', 3), ('storage', 'me', 'skladište', 3), ('storage', 'me', 'self storage', 3),
  ('storage', 'sr', 'magacin', 3), ('storage', 'sr', 'skladište', 3), ('storage', 'sr', 'self storage', 3),
  ('storage', 'en', 'self storage', 3), ('storage', 'en', 'warehouse storage', 3), ('storage', 'en', 'mini storage', 3),
  ('storage', 'tr', 'depo', 3), ('storage', 'tr', 'eşya deposu', 3), ('storage', 'tr', 'self storage', 3),
  ('storage', 'de', 'lagerraum', 3), ('storage', 'de', 'self-storage', 3), ('storage', 'de', 'einlagerung', 3),
  ('storage', 'it', 'self storage', 3), ('storage', 'it', 'deposito mobili', 3), ('storage', 'it', 'magazzino', 3),
  ('storage', 'ru', 'склад', 3), ('storage', 'ru', 'хранение вещей', 3), ('storage', 'ru', 'self storage', 3),
  ('storage', 'ar', 'مستودع', 3), ('storage', 'ar', 'تخزين أغراض', 3), ('storage', 'ar', 'سيلف ستوريج', 3),
  ('storage', 'uk', 'склад', 3), ('storage', 'uk', 'зберігання речей', 3), ('storage', 'uk', 'self storage', 3),
  -- packing
  ('packing', 'me', 'pakovanje za selidbu', 3), ('packing', 'me', 'kutije za selidbu', 3), ('packing', 'me', 'profesionalno pakovanje', 3),
  ('packing', 'sr', 'pakovanje za selidbu', 3), ('packing', 'sr', 'kutije za selidbu', 3), ('packing', 'sr', 'profesionalno pakovanje', 3),
  ('packing', 'en', 'packing service', 3), ('packing', 'en', 'moving boxes', 3), ('packing', 'en', 'professional packing', 3),
  ('packing', 'tr', 'taşıma ambalajlama', 3), ('packing', 'tr', 'taşıma kutusu', 3), ('packing', 'tr', 'profesyonel paketleme', 3),
  ('packing', 'de', 'umzugskartons', 3), ('packing', 'de', 'einpackservice', 3), ('packing', 'de', 'professionelles packen', 3),
  ('packing', 'it', 'imballaggio trasloco', 3), ('packing', 'it', 'scatole trasloco', 3), ('packing', 'it', 'imballaggio professionale', 3),
  ('packing', 'ru', 'упаковка для переезда', 3), ('packing', 'ru', 'коробки для переезда', 3), ('packing', 'ru', 'профессиональная упаковка', 3),
  ('packing', 'ar', 'تغليف للنقل', 3), ('packing', 'ar', 'صناديق نقل', 3), ('packing', 'ar', 'تغليف احترافي', 3),
  ('packing', 'uk', 'пакування для переїзду', 3), ('packing', 'uk', 'коробки для переїзду', 3), ('packing', 'uk', 'професійне пакування', 3),
  -- airport-transfer
  ('airport-transfer', 'me', 'aerodromski transfer', 3), ('airport-transfer', 'me', 'transfer iz aerodroma', 3), ('airport-transfer', 'me', 'taksi aerodrom', 3),
  ('airport-transfer', 'sr', 'aerodromski transfer', 3), ('airport-transfer', 'sr', 'transfer iz aerodroma', 3), ('airport-transfer', 'sr', 'taksi aerodrom', 3),
  ('airport-transfer', 'en', 'airport pickup', 3), ('airport-transfer', 'en', 'airport shuttle', 3), ('airport-transfer', 'en', 'airport taxi', 3),
  ('airport-transfer', 'tr', 'havalimanı transfer', 3), ('airport-transfer', 'tr', 'havaalanı taksi', 3), ('airport-transfer', 'tr', 'havalimanı servis', 3),
  ('airport-transfer', 'de', 'flughafentransfer', 3), ('airport-transfer', 'de', 'flughafenshuttle', 3), ('airport-transfer', 'de', 'flughafentaxi', 3),
  ('airport-transfer', 'it', 'transfer aeroporto', 3), ('airport-transfer', 'it', 'navetta aeroporto', 3), ('airport-transfer', 'it', 'taxi aeroporto', 3),
  ('airport-transfer', 'ru', 'трансфер аэропорт', 3), ('airport-transfer', 'ru', 'такси из аэропорта', 3), ('airport-transfer', 'ru', 'шаттл аэропорт', 3),
  ('airport-transfer', 'ar', 'نقل من المطار', 3), ('airport-transfer', 'ar', 'تاكسي مطار', 3), ('airport-transfer', 'ar', 'شاتل مطار', 3),
  ('airport-transfer', 'uk', 'трансфер аеропорт', 3), ('airport-transfer', 'uk', 'таксі з аеропорту', 3), ('airport-transfer', 'uk', 'шатл аеропорт', 3);


-- ----------------------------------------------------------------------------
-- AUTOMOTIVE SUBS (8): auto-repair, tire-service, car-wash, towing,
-- mobile-repair, auto-engine-service, detailing, expertise-inspection
-- ----------------------------------------------------------------------------

INSERT INTO public.glatko_search_synonyms (canonical_slug, locale, synonym, weight) VALUES
  -- auto-repair
  ('auto-repair', 'me', 'auto servis radionica', 3), ('auto-repair', 'me', 'mehaničar radionica', 3), ('auto-repair', 'me', 'kvar dijagnostika', 3),
  ('auto-repair', 'sr', 'auto servis radionica', 3), ('auto-repair', 'sr', 'mehaničar radionica', 3), ('auto-repair', 'sr', 'kvar dijagnostika', 3),
  ('auto-repair', 'en', 'auto shop', 3), ('auto-repair', 'en', 'car diagnostic', 3), ('auto-repair', 'en', 'general car repair', 3),
  ('auto-repair', 'tr', 'oto tamir atölyesi', 3), ('auto-repair', 'tr', 'arıza tespiti', 3), ('auto-repair', 'tr', 'genel oto bakım', 3),
  ('auto-repair', 'de', 'kfz-werkstatt allgemein', 3), ('auto-repair', 'de', 'fahrzeugdiagnose', 3), ('auto-repair', 'de', 'autoreparaturwerkstatt', 3),
  ('auto-repair', 'it', 'autofficina', 3), ('auto-repair', 'it', 'diagnosi auto', 3), ('auto-repair', 'it', 'riparazione auto generale', 3),
  ('auto-repair', 'ru', 'авторемонтная мастерская', 3), ('auto-repair', 'ru', 'диагностика авто', 3), ('auto-repair', 'ru', 'общий ремонт авто', 3),
  ('auto-repair', 'ar', 'ورشة تصليح سيارات', 3), ('auto-repair', 'ar', 'تشخيص أعطال', 3), ('auto-repair', 'ar', 'صيانة عامة', 3),
  ('auto-repair', 'uk', 'авторемонтна майстерня', 3), ('auto-repair', 'uk', 'діагностика авто', 3), ('auto-repair', 'uk', 'загальний ремонт авто', 3),
  -- tire-service
  ('tire-service', 'me', 'vulkanizer servis', 3), ('tire-service', 'me', 'gume zamjena', 3), ('tire-service', 'me', 'balansiranje guma', 3),
  ('tire-service', 'sr', 'vulkanizer servis', 3), ('tire-service', 'sr', 'gume zamena', 3), ('tire-service', 'sr', 'balansiranje guma', 3),
  ('tire-service', 'en', 'tire shop', 3), ('tire-service', 'en', 'wheel balancing', 3), ('tire-service', 'en', 'tire fitting', 3),
  ('tire-service', 'tr', 'lastik servisi', 3), ('tire-service', 'tr', 'lastik dengesi', 3), ('tire-service', 'tr', 'lastik montajı', 3),
  ('tire-service', 'de', 'reifenhandel', 3), ('tire-service', 'de', 'reifenmontage', 3), ('tire-service', 'de', 'reifenwuchten', 3),
  ('tire-service', 'it', 'gommista officina', 3), ('tire-service', 'it', 'equilibratura ruote', 3), ('tire-service', 'it', 'montaggio gomme', 3),
  ('tire-service', 'ru', 'шиномонтаж сервис', 3), ('tire-service', 'ru', 'балансировка колес', 3), ('tire-service', 'ru', 'установка шин', 3),
  ('tire-service', 'ar', 'محل إطارات', 3), ('tire-service', 'ar', 'موازنة عجلات', 3), ('tire-service', 'ar', 'تركيب إطارات', 3),
  ('tire-service', 'uk', 'шиномонтаж сервіс', 3), ('tire-service', 'uk', 'балансування коліс', 3), ('tire-service', 'uk', 'встановлення шин', 3),
  -- car-wash
  ('car-wash', 'me', 'auto perionica', 3), ('car-wash', 'me', 'pranje vozila', 3), ('car-wash', 'me', 'unutrašnje pranje auta', 3),
  ('car-wash', 'sr', 'auto perionica', 3), ('car-wash', 'sr', 'pranje vozila', 3), ('car-wash', 'sr', 'unutrašnje pranje auta', 3),
  ('car-wash', 'en', 'auto wash', 3), ('car-wash', 'en', 'interior detailing', 3), ('car-wash', 'en', 'exterior wash', 3),
  ('car-wash', 'tr', 'oto kuaför', 3), ('car-wash', 'tr', 'iç temizlik araba', 3), ('car-wash', 'tr', 'dış yıkama', 3),
  ('car-wash', 'de', 'autowaschanlage', 3), ('car-wash', 'de', 'innenreinigung auto', 3), ('car-wash', 'de', 'außenwäsche', 3),
  ('car-wash', 'it', 'autolavaggio', 3), ('car-wash', 'it', 'pulizia interni auto', 3), ('car-wash', 'it', 'lavaggio esterno', 3),
  ('car-wash', 'ru', 'автомойка', 3), ('car-wash', 'ru', 'химчистка салона', 3), ('car-wash', 'ru', 'наружная мойка', 3),
  ('car-wash', 'ar', 'مغسلة سيارات', 3), ('car-wash', 'ar', 'تنظيف داخلي سيارة', 3), ('car-wash', 'ar', 'غسيل خارجي', 3),
  ('car-wash', 'uk', 'автомийка', 3), ('car-wash', 'uk', 'хімчистка салону', 3), ('car-wash', 'uk', 'зовнішня мийка', 3),
  -- towing
  ('towing', 'me', 'šlep služba', 3), ('towing', 'me', 'pauk služba', 3), ('towing', 'me', 'transport pokvarenog auta', 3),
  ('towing', 'sr', 'šlep služba', 3), ('towing', 'sr', 'pauk služba', 3), ('towing', 'sr', 'transport pokvarenog auta', 3),
  ('towing', 'en', 'tow truck', 3), ('towing', 'en', 'roadside assistance', 3), ('towing', 'en', 'breakdown service', 3),
  ('towing', 'tr', 'çekici', 3), ('towing', 'tr', 'yol yardım', 3), ('towing', 'tr', 'arızalı araç çekme', 3),
  ('towing', 'de', 'abschleppdienst', 3), ('towing', 'de', 'pannenhilfe', 3), ('towing', 'de', 'pannendienst', 3),
  ('towing', 'it', 'carro attrezzi', 3), ('towing', 'it', 'soccorso stradale', 3), ('towing', 'it', 'recupero auto', 3),
  ('towing', 'ru', 'эвакуатор', 3), ('towing', 'ru', 'техпомощь на дороге', 3), ('towing', 'ru', 'буксировка авто', 3),
  ('towing', 'ar', 'سطحة', 3), ('towing', 'ar', 'مساعدة على الطريق', 3), ('towing', 'ar', 'سحب سيارة', 3),
  ('towing', 'uk', 'евакуатор', 3), ('towing', 'uk', 'техдопомога на дорозі', 3), ('towing', 'uk', 'буксирування авто', 3),
  -- mobile-repair
  ('mobile-repair', 'me', 'auto popravka na licu mjesta', 3), ('mobile-repair', 'me', 'mobilni mehaničar', 3), ('mobile-repair', 'me', 'kućni servis automobila', 3),
  ('mobile-repair', 'sr', 'auto popravka na licu mesta', 3), ('mobile-repair', 'sr', 'mobilni mehaničar', 3), ('mobile-repair', 'sr', 'kućni servis automobila', 3),
  ('mobile-repair', 'en', 'mobile mechanic', 3), ('mobile-repair', 'en', 'on-site car repair', 3), ('mobile-repair', 'en', 'house call mechanic', 3),
  ('mobile-repair', 'tr', 'gezici tamirci', 3), ('mobile-repair', 'tr', 'yerinde tamir', 3), ('mobile-repair', 'tr', 'eve gelen tamirci', 3),
  ('mobile-repair', 'de', 'mobile autoreparatur', 3), ('mobile-repair', 'de', 'mobiler mechaniker', 3), ('mobile-repair', 'de', 'pannenservice vor ort', 3),
  ('mobile-repair', 'it', 'meccanico mobile', 3), ('mobile-repair', 'it', 'riparazione auto a domicilio', 3), ('mobile-repair', 'it', 'meccanico a casa', 3),
  ('mobile-repair', 'ru', 'выездной автомеханик', 3), ('mobile-repair', 'ru', 'ремонт авто на месте', 3), ('mobile-repair', 'ru', 'мобильный автосервис', 3),
  ('mobile-repair', 'ar', 'ميكانيكي متنقل', 3), ('mobile-repair', 'ar', 'إصلاح سيارة في الموقع', 3), ('mobile-repair', 'ar', 'ميكانيكي للمنزل', 3),
  ('mobile-repair', 'uk', 'виїзний автомеханік', 3), ('mobile-repair', 'uk', 'ремонт авто на місці', 3), ('mobile-repair', 'uk', 'мобільний автосервіс', 3),
  -- auto-engine-service
  ('auto-engine-service', 'me', 'servis motora automobila', 3), ('auto-engine-service', 'me', 'remont motora', 3), ('auto-engine-service', 'me', 'glava motora', 3),
  ('auto-engine-service', 'sr', 'servis motora automobila', 3), ('auto-engine-service', 'sr', 'remont motora', 3), ('auto-engine-service', 'sr', 'glava motora', 3),
  ('auto-engine-service', 'en', 'engine overhaul', 3), ('auto-engine-service', 'en', 'engine rebuild', 3), ('auto-engine-service', 'en', 'cylinder head repair', 3),
  ('auto-engine-service', 'tr', 'motor revizyonu araba', 3), ('auto-engine-service', 'tr', 'motor sökümü', 3), ('auto-engine-service', 'tr', 'silindir kapağı', 3),
  ('auto-engine-service', 'de', 'motorüberholung auto', 3), ('auto-engine-service', 'de', 'motorinstandsetzung', 3), ('auto-engine-service', 'de', 'zylinderkopfreparatur', 3),
  ('auto-engine-service', 'it', 'revisione motore auto', 3), ('auto-engine-service', 'it', 'rifacimento motore', 3), ('auto-engine-service', 'it', 'testata motore', 3),
  ('auto-engine-service', 'ru', 'капитальный ремонт двигателя', 3), ('auto-engine-service', 'ru', 'переборка двигателя', 3), ('auto-engine-service', 'ru', 'головка блока', 3),
  ('auto-engine-service', 'ar', 'تجديد محرك سيارة', 3), ('auto-engine-service', 'ar', 'إعادة تأهيل محرك', 3), ('auto-engine-service', 'ar', 'رأس محرك', 3),
  ('auto-engine-service', 'uk', 'капітальний ремонт двигуна', 3), ('auto-engine-service', 'uk', 'переборка двигуна', 3), ('auto-engine-service', 'uk', 'головка блоку', 3),
  -- detailing
  ('detailing', 'me', 'detailing automobila', 3), ('detailing', 'me', 'auto poliranje', 3), ('detailing', 'me', 'keramičko premazivanje', 3),
  ('detailing', 'sr', 'detailing automobila', 3), ('detailing', 'sr', 'auto poliranje', 3), ('detailing', 'sr', 'keramičko premazivanje', 3),
  ('detailing', 'en', 'car polishing', 3), ('detailing', 'en', 'ceramic coating', 3), ('detailing', 'en', 'paint correction', 3),
  ('detailing', 'tr', 'oto pasta cila', 3), ('detailing', 'tr', 'seramik kaplama', 3), ('detailing', 'tr', 'boya düzeltme', 3),
  ('detailing', 'de', 'autopolitur', 3), ('detailing', 'de', 'keramikversiegelung', 3), ('detailing', 'de', 'lackaufbereitung', 3),
  ('detailing', 'it', 'lucidatura auto', 3), ('detailing', 'it', 'rivestimento ceramico', 3), ('detailing', 'it', 'correzione vernice', 3),
  ('detailing', 'ru', 'полировка авто', 3), ('detailing', 'ru', 'керамическое покрытие', 3), ('detailing', 'ru', 'коррекция покраски', 3),
  ('detailing', 'ar', 'تلميع سيارة', 3), ('detailing', 'ar', 'طلاء سيراميك', 3), ('detailing', 'ar', 'إصلاح طلاء', 3),
  ('detailing', 'uk', 'поліровка авто', 3), ('detailing', 'uk', 'керамічне покриття', 3), ('detailing', 'uk', 'корекція фарбування', 3),
  -- expertise-inspection
  ('expertise-inspection', 'me', 'tehnički pregled', 3), ('expertise-inspection', 'me', 'kontrola vozila', 3), ('expertise-inspection', 'me', 'ekspertiza polovnog auta', 3),
  ('expertise-inspection', 'sr', 'tehnički pregled', 3), ('expertise-inspection', 'sr', 'kontrola vozila', 3), ('expertise-inspection', 'sr', 'ekspertiza polovnog auta', 3),
  ('expertise-inspection', 'en', 'vehicle inspection', 3), ('expertise-inspection', 'en', 'pre-purchase inspection', 3), ('expertise-inspection', 'en', 'used car check', 3),
  ('expertise-inspection', 'tr', 'araç ekspertizi', 3), ('expertise-inspection', 'tr', 'ikinci el muayene', 3), ('expertise-inspection', 'tr', 'satış öncesi kontrol', 3),
  ('expertise-inspection', 'de', 'fahrzeuggutachten', 3), ('expertise-inspection', 'de', 'gebrauchtwagenprüfung', 3), ('expertise-inspection', 'de', 'kaufgutachten', 3),
  ('expertise-inspection', 'it', 'perizia auto', 3), ('expertise-inspection', 'it', 'controllo auto usata', 3), ('expertise-inspection', 'it', 'ispezione pre-acquisto', 3),
  ('expertise-inspection', 'ru', 'проверка авто перед покупкой', 3), ('expertise-inspection', 'ru', 'диагностика бу авто', 3), ('expertise-inspection', 'ru', 'экспертиза авто', 3),
  ('expertise-inspection', 'ar', 'فحص سيارة قبل الشراء', 3), ('expertise-inspection', 'ar', 'تقييم سيارة مستعملة', 3), ('expertise-inspection', 'ar', 'فحص فني شامل', 3),
  ('expertise-inspection', 'uk', 'перевірка авто перед покупкою', 3), ('expertise-inspection', 'uk', 'діагностика бу авто', 3), ('expertise-inspection', 'uk', 'експертиза авто', 3);


-- ----------------------------------------------------------------------------
-- AIRBNB-MANAGEMENT SUBS (7): full-management, checkin-checkout,
-- turnover-cleaning, listing-photography, booking-management, maintenance,
-- guest-support
-- ----------------------------------------------------------------------------

INSERT INTO public.glatko_search_synonyms (canonical_slug, locale, synonym, weight) VALUES
  -- full-management
  ('full-management', 'me', 'kompletno upravljanje smještajem', 3), ('full-management', 'me', 'full service airbnb', 3), ('full-management', 'me', 'pun servis upravljanja', 3),
  ('full-management', 'sr', 'kompletno upravljanje smeštajem', 3), ('full-management', 'sr', 'full service airbnb', 3), ('full-management', 'sr', 'pun servis upravljanja', 3),
  ('full-management', 'en', 'full service rental management', 3), ('full-management', 'en', 'turnkey airbnb management', 3), ('full-management', 'en', 'all-inclusive str', 3),
  ('full-management', 'tr', 'tam hizmet airbnb', 3), ('full-management', 'tr', 'anahtar teslim yönetim', 3), ('full-management', 'tr', 'komple kiralama yönetimi', 3),
  ('full-management', 'de', 'rundum-service ferienwohnung', 3), ('full-management', 'de', 'komplett-service airbnb', 3), ('full-management', 'de', 'all-inclusive vermietung', 3),
  ('full-management', 'it', 'gestione completa airbnb', 3), ('full-management', 'it', 'servizio chiavi in mano', 3), ('full-management', 'it', 'gestione totale affitto', 3),
  ('full-management', 'ru', 'полное управление airbnb', 3), ('full-management', 'ru', 'под ключ управление', 3), ('full-management', 'ru', 'все включено аренда', 3),
  ('full-management', 'ar', 'إدارة كاملة ايربنب', 3), ('full-management', 'ar', 'إدارة شاملة', 3), ('full-management', 'ar', 'خدمة متكاملة تأجير', 3),
  ('full-management', 'uk', 'повне управління airbnb', 3), ('full-management', 'uk', 'під ключ управління', 3), ('full-management', 'uk', 'все включено оренда', 3),
  -- checkin-checkout
  ('checkin-checkout', 'me', 'prijava i odjava gostiju', 3), ('checkin-checkout', 'me', 'meet and greet', 3), ('checkin-checkout', 'me', 'dolazak gostiju', 3),
  ('checkin-checkout', 'sr', 'prijava i odjava gostiju', 3), ('checkin-checkout', 'sr', 'meet and greet', 3), ('checkin-checkout', 'sr', 'dolazak gostiju', 3),
  ('checkin-checkout', 'en', 'check-in service', 3), ('checkin-checkout', 'en', 'meet and greet', 3), ('checkin-checkout', 'en', 'guest arrival', 3),
  ('checkin-checkout', 'tr', 'giriş çıkış servisi', 3), ('checkin-checkout', 'tr', 'misafir karşılama', 3), ('checkin-checkout', 'tr', 'anahtar teslim servis', 3),
  ('checkin-checkout', 'de', 'check-in service', 3), ('checkin-checkout', 'de', 'gästeempfang', 3), ('checkin-checkout', 'de', 'meet and greet', 3),
  ('checkin-checkout', 'it', 'servizio check-in', 3), ('checkin-checkout', 'it', 'accoglienza ospiti', 3), ('checkin-checkout', 'it', 'meet and greet', 3),
  ('checkin-checkout', 'ru', 'встреча гостей', 3), ('checkin-checkout', 'ru', 'заселение гостей', 3), ('checkin-checkout', 'ru', 'передача ключей гостям', 3),
  ('checkin-checkout', 'ar', 'استقبال نزلاء', 3), ('checkin-checkout', 'ar', 'تسجيل دخول ضيوف', 3), ('checkin-checkout', 'ar', 'استقبال ايربنب', 3),
  ('checkin-checkout', 'uk', 'зустріч гостей', 3), ('checkin-checkout', 'uk', 'заселення гостей', 3), ('checkin-checkout', 'uk', 'передача ключів гостям', 3),
  -- turnover-cleaning
  ('turnover-cleaning', 'me', 'turnover čišćenje airbnb', 3), ('turnover-cleaning', 'me', 'standardizovana priprema', 3), ('turnover-cleaning', 'me', 'menjanje posteljine', 3),
  ('turnover-cleaning', 'sr', 'turnover čišćenje airbnb', 3), ('turnover-cleaning', 'sr', 'standardizovana priprema', 3), ('turnover-cleaning', 'sr', 'menjanje posteljine', 3),
  ('turnover-cleaning', 'en', 'airbnb turnover', 3), ('turnover-cleaning', 'en', 'changeover cleaning', 3), ('turnover-cleaning', 'en', 'linen change', 3),
  ('turnover-cleaning', 'tr', 'airbnb arası temizlik', 3), ('turnover-cleaning', 'tr', 'çarşaf değişimi', 3), ('turnover-cleaning', 'tr', 'standart temizlik airbnb', 3),
  ('turnover-cleaning', 'de', 'airbnb wechselreinigung', 3), ('turnover-cleaning', 'de', 'bettwäschewechsel', 3), ('turnover-cleaning', 'de', 'standardreinigung fewo', 3),
  ('turnover-cleaning', 'it', 'pulizia turnover airbnb', 3), ('turnover-cleaning', 'it', 'cambio biancheria', 3), ('turnover-cleaning', 'it', 'pulizia standard locazione', 3),
  ('turnover-cleaning', 'ru', 'турновер airbnb уборка', 3), ('turnover-cleaning', 'ru', 'смена белья', 3), ('turnover-cleaning', 'ru', 'стандартная уборка аренда', 3),
  ('turnover-cleaning', 'ar', 'تنظيف ايربنب بين الحجوزات', 3), ('turnover-cleaning', 'ar', 'تغيير ملاءات', 3), ('turnover-cleaning', 'ar', 'تنظيف قياسي تأجير', 3),
  ('turnover-cleaning', 'uk', 'турновер airbnb прибирання', 3), ('turnover-cleaning', 'uk', 'зміна білизни', 3), ('turnover-cleaning', 'uk', 'стандартне прибирання оренда', 3),
  -- listing-photography
  ('listing-photography', 'me', 'fotografisanje stana', 3), ('listing-photography', 'me', 'profesionalne fotografije za airbnb', 3), ('listing-photography', 'me', 'real estate fotografija', 3),
  ('listing-photography', 'sr', 'fotografisanje stana', 3), ('listing-photography', 'sr', 'profesionalne fotografije za airbnb', 3), ('listing-photography', 'sr', 'real estate fotografija', 3),
  ('listing-photography', 'en', 'real estate photography', 3), ('listing-photography', 'en', 'airbnb listing photos', 3), ('listing-photography', 'en', 'property photoshoot', 3),
  ('listing-photography', 'tr', 'emlak fotoğrafçılığı', 3), ('listing-photography', 'tr', 'airbnb ilan fotoğrafı', 3), ('listing-photography', 'tr', 'profesyonel daire fotoğrafı', 3),
  ('listing-photography', 'de', 'immobilienfotografie', 3), ('listing-photography', 'de', 'airbnb fotos', 3), ('listing-photography', 'de', 'wohnung fotoshooting', 3),
  ('listing-photography', 'it', 'fotografia immobiliare', 3), ('listing-photography', 'it', 'foto airbnb annuncio', 3), ('listing-photography', 'it', 'shooting appartamento', 3),
  ('listing-photography', 'ru', 'фотосъемка недвижимости', 3), ('listing-photography', 'ru', 'фото для airbnb', 3), ('listing-photography', 'ru', 'профессиональные фото квартиры', 3),
  ('listing-photography', 'ar', 'تصوير عقاري', 3), ('listing-photography', 'ar', 'صور إعلان ايربنب', 3), ('listing-photography', 'ar', 'تصوير شقق', 3),
  ('listing-photography', 'uk', 'фотозйомка нерухомості', 3), ('listing-photography', 'uk', 'фото для airbnb', 3), ('listing-photography', 'uk', 'професійні фото квартири', 3),
  -- booking-management
  ('booking-management', 'me', 'upravljanje rezervacijama', 3), ('booking-management', 'me', 'kalendarsko upravljanje', 3), ('booking-management', 'me', 'booking optimizacija', 3),
  ('booking-management', 'sr', 'upravljanje rezervacijama', 3), ('booking-management', 'sr', 'kalendarsko upravljanje', 3), ('booking-management', 'sr', 'booking optimizacija', 3),
  ('booking-management', 'en', 'reservation management', 3), ('booking-management', 'en', 'pricing optimization', 3), ('booking-management', 'en', 'channel manager', 3),
  ('booking-management', 'tr', 'rezervasyon yönetimi airbnb', 3), ('booking-management', 'tr', 'fiyat optimizasyonu', 3), ('booking-management', 'tr', 'takvim yönetimi', 3),
  ('booking-management', 'de', 'buchungsmanagement', 3), ('booking-management', 'de', 'preisoptimierung', 3), ('booking-management', 'de', 'kalenderverwaltung', 3),
  ('booking-management', 'it', 'gestione prenotazioni', 3), ('booking-management', 'it', 'ottimizzazione prezzi', 3), ('booking-management', 'it', 'gestione calendario', 3),
  ('booking-management', 'ru', 'управление бронированием', 3), ('booking-management', 'ru', 'оптимизация цен', 3), ('booking-management', 'ru', 'управление календарем', 3),
  ('booking-management', 'ar', 'إدارة الحجوزات', 3), ('booking-management', 'ar', 'تحسين الأسعار', 3), ('booking-management', 'ar', 'إدارة التقويم', 3),
  ('booking-management', 'uk', 'управління бронюваннями', 3), ('booking-management', 'uk', 'оптимізація цін', 3), ('booking-management', 'uk', 'управління календарем', 3),
  -- maintenance
  ('maintenance', 'me', 'održavanje smještaja', 3), ('maintenance', 'me', 'sitne popravke airbnb', 3), ('maintenance', 'me', 'održavanje vile', 3),
  ('maintenance', 'sr', 'održavanje smeštaja', 3), ('maintenance', 'sr', 'sitne popravke airbnb', 3), ('maintenance', 'sr', 'održavanje vile', 3),
  ('maintenance', 'en', 'rental property maintenance', 3), ('maintenance', 'en', 'airbnb handyman', 3), ('maintenance', 'en', 'villa upkeep', 3),
  ('maintenance', 'tr', 'kiralık ev bakımı', 3), ('maintenance', 'tr', 'airbnb tamir bakım', 3), ('maintenance', 'tr', 'villa bakım', 3),
  ('maintenance', 'de', 'objektwartung airbnb', 3), ('maintenance', 'de', 'kleinreparaturen vermietung', 3), ('maintenance', 'de', 'villainstandhaltung', 3),
  ('maintenance', 'it', 'manutenzione airbnb', 3), ('maintenance', 'it', 'piccole riparazioni', 3), ('maintenance', 'it', 'manutenzione villa', 3),
  ('maintenance', 'ru', 'обслуживание airbnb', 3), ('maintenance', 'ru', 'мелкий ремонт аренды', 3), ('maintenance', 'ru', 'содержание виллы', 3),
  ('maintenance', 'ar', 'صيانة عقار مؤجر', 3), ('maintenance', 'ar', 'إصلاحات صغيرة ايربنب', 3), ('maintenance', 'ar', 'صيانة فيلا', 3),
  ('maintenance', 'uk', 'обслуговування airbnb', 3), ('maintenance', 'uk', 'дрібний ремонт оренди', 3), ('maintenance', 'uk', 'утримання вілли', 3),
  -- guest-support
  ('guest-support', 'me', 'podrška gostima', 3), ('guest-support', 'me', '24-satna komunikacija', 3), ('guest-support', 'me', 'concierge airbnb', 3),
  ('guest-support', 'sr', 'podrška gostima', 3), ('guest-support', 'sr', '24-satna komunikacija', 3), ('guest-support', 'sr', 'concierge airbnb', 3),
  ('guest-support', 'en', '24/7 guest support', 3), ('guest-support', 'en', 'concierge service', 3), ('guest-support', 'en', 'guest communication', 3),
  ('guest-support', 'tr', '24 saat misafir desteği', 3), ('guest-support', 'tr', 'concierge airbnb', 3), ('guest-support', 'tr', 'misafir iletişimi', 3),
  ('guest-support', 'de', '24/7 gästesupport', 3), ('guest-support', 'de', 'concierge service', 3), ('guest-support', 'de', 'gästekommunikation', 3),
  ('guest-support', 'it', 'supporto ospiti 24/7', 3), ('guest-support', 'it', 'concierge airbnb', 3), ('guest-support', 'it', 'comunicazione ospiti', 3),
  ('guest-support', 'ru', 'поддержка гостей 24/7', 3), ('guest-support', 'ru', 'консьерж airbnb', 3), ('guest-support', 'ru', 'связь с гостями', 3),
  ('guest-support', 'ar', 'دعم النزلاء 24/7', 3), ('guest-support', 'ar', 'كونسيرج ايربنب', 3), ('guest-support', 'ar', 'تواصل مع الضيوف', 3),
  ('guest-support', 'uk', 'підтримка гостей 24/7', 3), ('guest-support', 'uk', 'консьєрж airbnb', 3), ('guest-support', 'uk', 'зв''язок з гостями', 3);

COMMIT;
