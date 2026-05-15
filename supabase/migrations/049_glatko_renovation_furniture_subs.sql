-- ============================================================================
-- 049_glatko_renovation_furniture_subs.sql
-- Purpose: Add 'furniture-custom' (free-standing) and 'furniture-restoration'
--          sub-categories under 'renovation-construction'.
--
-- Decision context (Karar A = Opsiyon 3):
--   - carpentry-built-in is KEPT for built-in / integrated woodwork
--     (kuhinje po mjeri, plakari po mjeri, custom cabinetry).
--   - furniture-custom is NEW, covering free-standing bespoke furniture
--     (dining tables, dressers, sofas, etc.) — semantically distinct.
--
-- Schema notes (verified against 014 + 021 — column names differ from naive
-- assumption!):
--   - glatko_search_synonyms uses canonical_slug (NOT category_slug) +
--     locale + synonym + weight; UNIQUE(canonical_slug, locale, synonym).
--   - glatko_request_questions uses question_type (NOT type) of enum
--     public.glatko_question_type; UNIQUE(category_slug, question_key).
--
-- Icon dependencies (lib/utils/categoryIcon.ts ICON_MAP):
--   - 'Brush' already present → used for furniture-restoration.
--   - 'Ruler' added in the same PR to support furniture-custom.
--
-- Idempotent: every INSERT uses ON CONFLICT DO NOTHING.
-- Rollback block at the bottom (commented).
-- ============================================================================

BEGIN;

-- =============================================================================
-- PART 1: Insert 2 new sub-categories under renovation-construction
-- =============================================================================

WITH parent AS (
  SELECT id FROM public.glatko_service_categories WHERE slug = 'renovation-construction'
)
INSERT INTO public.glatko_service_categories
  (parent_id, slug, name, description, icon, sort_order, is_active,
   seasonal, badge_priority, is_p0, translation_status)
VALUES
  (
    (SELECT id FROM parent),
    'furniture-custom',
    '{"tr":"Ölçüye Özel Mobilya","en":"Custom Furniture","de":"Maßgefertigte Möbel","it":"Mobili su Misura","ru":"Мебель на заказ","uk":"Меблі на замовлення","sr":"Намештај по мери","me":"Namještaj po mjeri","ar":"أثاث حسب الطلب"}'::jsonb,
    '{"tr":"Masa, komidin, gardırop, kanepe gibi serbest duran mobilyaların ölçüye ve tasarıma özel yapımı.","en":"Bespoke, free-standing furniture: tables, dressers, wardrobes, sofas — built to your dimensions and style.","de":"Maßgefertigte, freistehende Möbel: Tische, Kommoden, Schränke, Sofas — nach Ihren Maßen und Ihrem Stil.","it":"Mobili su misura non incassati: tavoli, comò, armadi, divani — realizzati secondo le tue dimensioni e il tuo stile.","ru":"Отдельно стоящая мебель на заказ: столы, комоды, шкафы, диваны — по вашим размерам и стилю.","uk":"Окремо розташовані меблі на замовлення: столи, комоди, шафи, дивани — за вашими розмірами та стилем.","sr":"Слободностојећи намештај по мери: столови, комоде, ормари, софе — према вашим димензијама и стилу.","me":"Slobodnostojeći namještaj po mjeri: stolovi, komode, ormari, kauči — prema vašim dimenzijama i stilu.","ar":"أثاث قائم بذاته مصنوع حسب الطلب: طاولات، خزائن، أرائك — وفق مقاساتك وأسلوبك."}'::jsonb,
    'Ruler',
    9,
    TRUE,
    'year-round',
    99,
    FALSE,
    '{"tr":"verified","en":"verified","de":"verified","it":"verified","ru":"verified","uk":"verified","sr":"verified","me":"verified","ar":"verified"}'::jsonb
  ),
  (
    (SELECT id FROM parent),
    'furniture-restoration',
    '{"tr":"Mobilya Restorasyonu","en":"Furniture Restoration","de":"Möbelrestaurierung","it":"Restauro Mobili","ru":"Реставрация мебели","uk":"Реставрація меблів","sr":"Реставрација намештаја","me":"Restauracija namještaja","ar":"ترميم الأثاث"}'::jsonb,
    '{"tr":"Eski, antika veya hasarlı mobilyaların yenilenmesi: cila, döşeme, yapısal onarım, antika restorasyon.","en":"Refinishing and repair of old, antique or damaged furniture: polishing, reupholstery, structural repair, antique restoration.","de":"Aufarbeitung und Reparatur alter, antiker oder beschädigter Möbel: Polieren, Neubeziehen, strukturelle Reparatur, Antiquitätenrestaurierung.","it":"Restauro e riparazione di mobili antichi, vecchi o danneggiati: lucidatura, ritappezzatura, riparazione strutturale, restauro antiquariato.","ru":"Восстановление и ремонт старой, антикварной или повреждённой мебели: полировка, перетяжка, структурный ремонт, реставрация антиквариата.","uk":"Відновлення та ремонт старих, антикварних або пошкоджених меблів: полірування, перетяжка, структурний ремонт, реставрація антикваріату.","sr":"Обнова и поправка старог, антикварног или оштећеног намештаја: полирање, пресвлачење, структурна поправка, реставрација антиквитета.","me":"Obnova i popravka starog, antikvarnog ili oštećenog namještaja: poliranje, presvlačenje, strukturna popravka, restauracija antikviteta.","ar":"تجديد وإصلاح الأثاث القديم أو العتيق أو التالف: تلميع، إعادة تنجيد، إصلاح هيكلي، ترميم القطع الأثرية."}'::jsonb,
    'Brush',
    10,
    TRUE,
    'year-round',
    99,
    FALSE,
    '{"tr":"verified","en":"verified","de":"verified","it":"verified","ru":"verified","uk":"verified","sr":"verified","me":"verified","ar":"verified"}'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- PART 2: Search synonyms — 9 locales
-- Column is canonical_slug (not category_slug). weight defaults to 1.
-- =============================================================================

-- furniture-custom synonyms (29 rows)
INSERT INTO public.glatko_search_synonyms (canonical_slug, locale, synonym) VALUES
  ('furniture-custom','tr','ölçüye özel mobilya'),
  ('furniture-custom','tr','custom mobilya'),
  ('furniture-custom','tr','kişiye özel mobilya'),
  ('furniture-custom','tr','ısmarlama mobilya'),
  ('furniture-custom','tr','özel tasarım mobilya'),
  ('furniture-custom','tr','tasarım mobilya'),
  ('furniture-custom','en','custom furniture'),
  ('furniture-custom','en','bespoke furniture'),
  ('furniture-custom','en','made to order furniture'),
  ('furniture-custom','en','custom table'),
  ('furniture-custom','de','maßgefertigte möbel'),
  ('furniture-custom','de','möbel nach maß'),
  ('furniture-custom','de','sondermöbel'),
  ('furniture-custom','it','mobili su misura'),
  ('furniture-custom','it','mobili personalizzati'),
  ('furniture-custom','it','arredamento su misura'),
  ('furniture-custom','ru','мебель на заказ'),
  ('furniture-custom','ru','индивидуальная мебель'),
  ('furniture-custom','ru','мебель по размерам'),
  ('furniture-custom','uk','меблі на замовлення'),
  ('furniture-custom','uk','індивідуальні меблі'),
  ('furniture-custom','sr','намештај по мери'),
  ('furniture-custom','sr','namestaj po meri'),
  ('furniture-custom','sr','prilagođeni namestaj'),
  ('furniture-custom','me','namještaj po mjeri'),
  ('furniture-custom','me','sto po mjeri'),
  ('furniture-custom','me','prilagođeni namještaj'),
  ('furniture-custom','ar','أثاث حسب الطلب'),
  ('furniture-custom','ar','أثاث مخصص')
ON CONFLICT (canonical_slug, locale, synonym) DO NOTHING;

-- furniture-restoration synonyms (33 rows)
INSERT INTO public.glatko_search_synonyms (canonical_slug, locale, synonym) VALUES
  ('furniture-restoration','tr','mobilya restorasyonu'),
  ('furniture-restoration','tr','mobilya yenileme'),
  ('furniture-restoration','tr','antika restorasyon'),
  ('furniture-restoration','tr','antika onarım'),
  ('furniture-restoration','tr','ahşap mobilya yenileme'),
  ('furniture-restoration','tr','cila yenileme'),
  ('furniture-restoration','tr','mobilya tamiri'),
  ('furniture-restoration','en','furniture restoration'),
  ('furniture-restoration','en','furniture refinishing'),
  ('furniture-restoration','en','antique restoration'),
  ('furniture-restoration','en','furniture repair'),
  ('furniture-restoration','en','reupholstery'),
  ('furniture-restoration','de','möbelrestaurierung'),
  ('furniture-restoration','de','antiquitätenrestaurierung'),
  ('furniture-restoration','de','möbel aufarbeiten'),
  ('furniture-restoration','it','restauro mobili'),
  ('furniture-restoration','it','restauro antiquariato'),
  ('furniture-restoration','it','restauro mobili antichi'),
  ('furniture-restoration','ru','реставрация мебели'),
  ('furniture-restoration','ru','реставрация антиквариата'),
  ('furniture-restoration','ru','перетяжка мебели'),
  ('furniture-restoration','uk','реставрація меблів'),
  ('furniture-restoration','uk','реставрація антикваріату'),
  ('furniture-restoration','uk','перетяжка меблів'),
  ('furniture-restoration','sr','реставрација намештаја'),
  ('furniture-restoration','sr','restauracija namestaja'),
  ('furniture-restoration','sr','popravka namestaja'),
  ('furniture-restoration','me','restauracija namještaja'),
  ('furniture-restoration','me','popravka namještaja'),
  ('furniture-restoration','me','obnova namještaja'),
  ('furniture-restoration','ar','ترميم الأثاث'),
  ('furniture-restoration','ar','إصلاح الأثاث'),
  ('furniture-restoration','ar','تجديد الأثاث')
ON CONFLICT (canonical_slug, locale, synonym) DO NOTHING;

-- =============================================================================
-- PART 3: Wizard questions — furniture-custom (6 questions)
-- Column is question_type (not type). Enum: text/textarea/select/multiselect/
-- number/date/file/slider (from migration 021).
-- =============================================================================

INSERT INTO public.glatko_request_questions
  (category_slug, question_key, question_type, label, options, validation,
   step_order, field_order, is_required)
VALUES

-- Q1: Furniture type (multiselect, required)
('furniture-custom', 'furniture_type', 'multiselect',
  '{"tr":"Hangi tür mobilya yaptırmak istiyorsunuz?","en":"What type of furniture do you want made?","de":"Welche Art von Möbel möchten Sie anfertigen lassen?","it":"Che tipo di mobile vuoi far realizzare?","ru":"Какой тип мебели вы хотите заказать?","uk":"Який тип меблів ви хочете замовити?","sr":"Какву врсту намештаја желите да направите?","me":"Kakvu vrstu namještaja želite da napravite?","ar":"ما نوع الأثاث الذي تريد صنعه؟"}'::jsonb,
  '[{"value":"dining_table","label":{"tr":"Yemek masası","en":"Dining table","de":"Esstisch","it":"Tavolo da pranzo","ru":"Обеденный стол","uk":"Обідній стіл","sr":"Трпезаријски сто","me":"Trpezarijski sto","ar":"طاولة طعام"}},{"value":"coffee_table","label":{"tr":"Sehpa","en":"Coffee table","de":"Couchtisch","it":"Tavolino","ru":"Журнальный столик","uk":"Журнальний столик","sr":"Сточић","me":"Stočić","ar":"طاولة قهوة"}},{"value":"dresser","label":{"tr":"Komidin / Şifonyer","en":"Dresser","de":"Kommode","it":"Cassettiera","ru":"Комод","uk":"Комод","sr":"Комода","me":"Komoda","ar":"خزانة أدراج"}},{"value":"bookshelf","label":{"tr":"Kitaplık","en":"Bookshelf","de":"Bücherregal","it":"Libreria","ru":"Книжный шкаф","uk":"Книжкова шафа","sr":"Полица за књиге","me":"Polica za knjige","ar":"رف كتب"}},{"value":"bed_frame","label":{"tr":"Karyola","en":"Bed frame","de":"Bettrahmen","it":"Letto","ru":"Каркас кровати","uk":"Каркас ліжка","sr":"Кревет","me":"Krevet","ar":"إطار سرير"}},{"value":"wardrobe_freestanding","label":{"tr":"Gardırop (serbest duran)","en":"Wardrobe (free-standing)","de":"Kleiderschrank (freistehend)","it":"Armadio (libero)","ru":"Шкаф (отдельностоящий)","uk":"Шафа (окремостояча)","sr":"Ормар (слободностојећи)","me":"Ormar (slobodnostojeći)","ar":"خزانة ملابس (قائمة بذاتها)"}},{"value":"sofa","label":{"tr":"Kanepe / Koltuk","en":"Sofa / Armchair","de":"Sofa / Sessel","it":"Divano / Poltrona","ru":"Диван / Кресло","uk":"Диван / Крісло","sr":"Софа / Фотеља","me":"Sofa / Fotelja","ar":"أريكة / كرسي"}},{"value":"tv_unit","label":{"tr":"TV ünitesi","en":"TV unit","de":"TV-Möbel","it":"Mobile TV","ru":"ТВ-тумба","uk":"ТВ-тумба","sr":"ТВ комода","me":"TV komoda","ar":"وحدة تلفاز"}},{"value":"desk","label":{"tr":"Çalışma masası","en":"Desk","de":"Schreibtisch","it":"Scrivania","ru":"Письменный стол","uk":"Письмовий стіл","sr":"Радни сто","me":"Radni sto","ar":"مكتب"}},{"value":"other","label":{"tr":"Diğer","en":"Other","de":"Sonstiges","it":"Altro","ru":"Другое","uk":"Інше","sr":"Друго","me":"Drugo","ar":"أخرى"}}]'::jsonb,
  '{"required":true,"min":1}'::jsonb,
  1, 1, TRUE),

-- Q2: Material (multiselect, required)
('furniture-custom', 'material', 'multiselect',
  '{"tr":"Hangi malzemeyi tercih ediyorsunuz?","en":"Which material do you prefer?","de":"Welches Material bevorzugen Sie?","it":"Quale materiale preferisci?","ru":"Какой материал предпочитаете?","uk":"Який матеріал ви віддаєте перевагу?","sr":"Који материјал преферирате?","me":"Koji materijal preferirate?","ar":"ما المادة التي تفضلها؟"}'::jsonb,
  '[{"value":"solid_wood","label":{"tr":"Masif ahşap","en":"Solid wood","de":"Massivholz","it":"Legno massello","ru":"Массив дерева","uk":"Масив дерева","sr":"Пуно дрво","me":"Puno drvo","ar":"خشب صلب"}},{"value":"mdf","label":{"tr":"MDF","en":"MDF","de":"MDF","it":"MDF","ru":"МДФ","uk":"МДФ","sr":"МДФ","me":"MDF","ar":"إم دي إف"}},{"value":"plywood","label":{"tr":"Kontrplak","en":"Plywood","de":"Sperrholz","it":"Compensato","ru":"Фанера","uk":"Фанера","sr":"Шперплоча","me":"Šperploča","ar":"خشب رقائقي"}},{"value":"metal","label":{"tr":"Metal aksamlı","en":"With metal accents","de":"Mit Metallakzenten","it":"Con dettagli in metallo","ru":"С металлическими элементами","uk":"З металевими елементами","sr":"Са металним детаљима","me":"Sa metalnim detaljima","ar":"بتفاصيل معدنية"}},{"value":"glass","label":{"tr":"Cam","en":"Glass","de":"Glas","it":"Vetro","ru":"Стекло","uk":"Скло","sr":"Стакло","me":"Staklo","ar":"زجاج"}},{"value":"undecided","label":{"tr":"Karar vermedim, ustaya soracağım","en":"Undecided, will ask the pro","de":"Unentschieden, frage den Profi","it":"Indeciso, chiederò al professionista","ru":"Не определился, спрошу мастера","uk":"Не визначився, запитаю майстра","sr":"Нисам одлучио, питаћу мајстора","me":"Nisam odlučio, pitaću majstora","ar":"غير محدد، سأسأل المختص"}}]'::jsonb,
  '{"required":true,"min":1}'::jsonb,
  1, 2, TRUE),

-- Q3: Style (single, optional)
('furniture-custom', 'style', 'select',
  '{"tr":"Hangi stili düşünüyorsunuz?","en":"Which style are you considering?","de":"An welchen Stil denken Sie?","it":"Quale stile stai considerando?","ru":"Какой стиль вы рассматриваете?","uk":"Який стиль ви розглядаєте?","sr":"Који стил разматрате?","me":"Koji stil razmatrate?","ar":"ما الأسلوب الذي تفكر فيه؟"}'::jsonb,
  '[{"value":"modern","label":{"tr":"Modern minimalist","en":"Modern minimalist","de":"Modern minimalistisch","it":"Moderno minimalista","ru":"Современный минимализм","uk":"Сучасний мінімалізм","sr":"Модеран минимализам","me":"Moderan minimalizam","ar":"حديث بسيط"}},{"value":"classic","label":{"tr":"Klasik","en":"Classic","de":"Klassisch","it":"Classico","ru":"Классический","uk":"Класичний","sr":"Класичан","me":"Klasičan","ar":"كلاسيكي"}},{"value":"rustic","label":{"tr":"Rustik","en":"Rustic","de":"Rustikal","it":"Rustico","ru":"Рустик","uk":"Рустик","sr":"Рустичан","me":"Rustičan","ar":"ريفي"}},{"value":"industrial","label":{"tr":"Endüstriyel","en":"Industrial","de":"Industrial","it":"Industriale","ru":"Лофт / индустриальный","uk":"Лофт / індустріальний","sr":"Индустријски","me":"Industrijski","ar":"صناعي"}},{"value":"scandinavian","label":{"tr":"İskandinav","en":"Scandinavian","de":"Skandinavisch","it":"Scandinavo","ru":"Скандинавский","uk":"Скандинавський","sr":"Скандинавски","me":"Skandinavski","ar":"إسكندنافي"}},{"value":"other","label":{"tr":"Diğer","en":"Other","de":"Sonstiges","it":"Altro","ru":"Другое","uk":"Інше","sr":"Друго","me":"Drugo","ar":"أخرى"}}]'::jsonb,
  NULL,
  2, 1, FALSE),

-- Q4: Dimensions (text, optional)
('furniture-custom', 'dimensions', 'text',
  '{"tr":"Yaklaşık ölçüler (cm: EnxBoyxYükseklik)","en":"Approximate dimensions (cm: WxLxH)","de":"Ungefähre Maße (cm: BxLxH)","it":"Dimensioni approssimative (cm: LxLxH)","ru":"Приблизительные размеры (см: ШхДхВ)","uk":"Приблизні розміри (см: ШхДхВ)","sr":"Оквирне димензије (cm: ШxДxВ)","me":"Okvirne dimenzije (cm: ŠxDxV)","ar":"الأبعاد التقريبية (سم: عرض×طول×ارتفاع)"}'::jsonb,
  NULL,
  '{"maxLength":200}'::jsonb,
  2, 2, FALSE),

-- Q5: Quantity (number, required)
('furniture-custom', 'quantity', 'number',
  '{"tr":"Kaç adet?","en":"How many items?","de":"Wie viele Stücke?","it":"Quanti pezzi?","ru":"Сколько штук?","uk":"Скільки штук?","sr":"Колико комада?","me":"Koliko komada?","ar":"كم القطع؟"}'::jsonb,
  NULL,
  '{"required":true,"min":1,"max":50}'::jsonb,
  2, 3, TRUE),

-- Q6: Timeline (single, required)
('furniture-custom', 'timeline', 'select',
  '{"tr":"Ne zaman teslim almak istiyorsunuz?","en":"When do you need it delivered?","de":"Wann benötigen Sie es?","it":"Quando ti serve?","ru":"Когда нужна доставка?","uk":"Коли потрібна доставка?","sr":"Када вам је потребно?","me":"Kada vam je potrebno?","ar":"متى تحتاجه؟"}'::jsonb,
  '[{"value":"asap","label":{"tr":"En kısa sürede","en":"As soon as possible","de":"So bald wie möglich","it":"Il prima possibile","ru":"Как можно скорее","uk":"Якнайшвидше","sr":"Што пре","me":"Što prije","ar":"بأسرع وقت ممكن"}},{"value":"1_2_months","label":{"tr":"1-2 ay içinde","en":"Within 1-2 months","de":"Innerhalb von 1-2 Monaten","it":"Entro 1-2 mesi","ru":"В течение 1-2 месяцев","uk":"Протягом 1-2 місяців","sr":"У року од 1-2 месеца","me":"U roku od 1-2 mjeseca","ar":"خلال شهر إلى شهرين"}},{"value":"3_plus_months","label":{"tr":"3+ ay","en":"3+ months","de":"3+ Monate","it":"3+ mesi","ru":"3+ месяца","uk":"3+ місяці","sr":"3+ месеца","me":"3+ mjeseca","ar":"3+ أشهر"}},{"value":"flexible","label":{"tr":"Esnek","en":"Flexible","de":"Flexibel","it":"Flessibile","ru":"Гибко","uk":"Гнучко","sr":"Флексибилно","me":"Fleksibilno","ar":"مرن"}}]'::jsonb,
  '{"required":true}'::jsonb,
  2, 4, TRUE)
ON CONFLICT (category_slug, question_key) DO NOTHING;

-- =============================================================================
-- PART 4: Wizard questions — furniture-restoration (5 questions)
-- =============================================================================

INSERT INTO public.glatko_request_questions
  (category_slug, question_key, question_type, label, options, validation,
   step_order, field_order, is_required)
VALUES

-- Q1: Item type (multiselect, required)
('furniture-restoration', 'item_type', 'multiselect',
  '{"tr":"Hangi mobilya restore edilecek?","en":"Which furniture will be restored?","de":"Welche Möbel sollen restauriert werden?","it":"Quale mobile verrà restaurato?","ru":"Какую мебель нужно отреставрировать?","uk":"Які меблі потрібно відреставрувати?","sr":"Који намештај ће бити рестауриран?","me":"Koji namještaj će biti restauriran?","ar":"ما الأثاث الذي سيتم ترميمه؟"}'::jsonb,
  '[{"value":"chair","label":{"tr":"Sandalye","en":"Chair","de":"Stuhl","it":"Sedia","ru":"Стул","uk":"Стілець","sr":"Столица","me":"Stolica","ar":"كرسي"}},{"value":"table","label":{"tr":"Masa","en":"Table","de":"Tisch","it":"Tavolo","ru":"Стол","uk":"Стіл","sr":"Сто","me":"Sto","ar":"طاولة"}},{"value":"sofa","label":{"tr":"Kanepe","en":"Sofa","de":"Sofa","it":"Divano","ru":"Диван","uk":"Диван","sr":"Софа","me":"Sofa","ar":"أريكة"}},{"value":"wardrobe","label":{"tr":"Gardırop","en":"Wardrobe","de":"Kleiderschrank","it":"Armadio","ru":"Шкаф","uk":"Шафа","sr":"Ормар","me":"Ormar","ar":"خزانة ملابس"}},{"value":"dresser","label":{"tr":"Komidin","en":"Dresser","de":"Kommode","it":"Cassettiera","ru":"Комод","uk":"Комод","sr":"Комода","me":"Komoda","ar":"خزانة أدراج"}},{"value":"antique","label":{"tr":"Antika eşya","en":"Antique piece","de":"Antikes Stück","it":"Pezzo antico","ru":"Антикварный предмет","uk":"Антикварний предмет","sr":"Антиквитет","me":"Antikvitet","ar":"قطعة أثرية"}},{"value":"other","label":{"tr":"Diğer","en":"Other","de":"Sonstiges","it":"Altro","ru":"Другое","uk":"Інше","sr":"Друго","me":"Drugo","ar":"أخرى"}}]'::jsonb,
  '{"required":true,"min":1}'::jsonb,
  1, 1, TRUE),

-- Q2: Condition (single, required)
('furniture-restoration', 'condition', 'select',
  '{"tr":"Mobilyanın durumu nasıl?","en":"What is the condition of the furniture?","de":"In welchem Zustand ist das Möbelstück?","it":"In che condizioni è il mobile?","ru":"В каком состоянии мебель?","uk":"У якому стані меблі?","sr":"У каквом је стању намештај?","me":"U kakvom je stanju namještaj?","ar":"ما حالة الأثاث؟"}'::jsonb,
  '[{"value":"minor_scratches","label":{"tr":"Hafif çizik / aşınma","en":"Minor scratches / wear","de":"Leichte Kratzer / Verschleiß","it":"Graffi lievi / usura","ru":"Мелкие царапины / износ","uk":"Дрібні подряпини / знос","sr":"Мање огреботине / похабаност","me":"Manje ogrebotine / pohabanost","ar":"خدوش طفيفة / تآكل"}},{"value":"water_heat_damage","label":{"tr":"Su / ısı hasarı","en":"Water / heat damage","de":"Wasser- / Hitzeschaden","it":"Danni da acqua / calore","ru":"Повреждения от воды / тепла","uk":"Пошкодження від води / тепла","sr":"Оштећења од воде / топлоте","me":"Oštećenja od vode / toplote","ar":"تلف من الماء / الحرارة"}},{"value":"structural","label":{"tr":"Yapısal hasar (gevşek bağlantı, kırık ayak)","en":"Structural damage (loose joints, broken legs)","de":"Strukturschaden (lockere Verbindungen, gebrochene Beine)","it":"Danno strutturale (giunti allentati, gambe rotte)","ru":"Структурные повреждения (расшатанные соединения, сломанные ножки)","uk":"Структурні пошкодження (розхитані з''єднання, зламані ніжки)","sr":"Структурно оштећење (лабави спојеви, сломљене ноге)","me":"Strukturno oštećenje (labavi spojevi, slomljene noge)","ar":"تلف هيكلي (وصلات مرتخية، أرجل مكسورة)"}},{"value":"upholstery_worn","label":{"tr":"Döşeme yıpranmış","en":"Upholstery worn out","de":"Polsterung abgenutzt","it":"Tappezzeria usurata","ru":"Обивка изношена","uk":"Оббивка зношена","sr":"Тапацирунг похабан","me":"Tapacirung pohaban","ar":"التنجيد بالٍ"}},{"value":"multiple","label":{"tr":"Birden fazla sorun","en":"Multiple issues","de":"Mehrere Probleme","it":"Più problemi","ru":"Несколько проблем","uk":"Декілька проблем","sr":"Више проблема","me":"Više problema","ar":"عدة مشاكل"}}]'::jsonb,
  '{"required":true}'::jsonb,
  1, 2, TRUE),

-- Q3: Restoration goal (multiselect, required)
('furniture-restoration', 'goal', 'multiselect',
  '{"tr":"Ne tür bir işlem istiyorsunuz?","en":"What type of work do you want?","de":"Welche Art von Arbeit wünschen Sie?","it":"Che tipo di lavoro desideri?","ru":"Какие работы вы хотите?","uk":"Які роботи ви хочете?","sr":"Какву врсту посла желите?","me":"Kakvu vrstu posla želite?","ar":"ما نوع العمل الذي تريده؟"}'::jsonb,
  '[{"value":"refinish_wood","label":{"tr":"Ahşap cila / yenileme","en":"Refinish wood / polish","de":"Holz neu lackieren / polieren","it":"Rifinitura legno / lucidatura","ru":"Обновление лака / полировка","uk":"Оновлення лаку / полірування","sr":"Лакирање дрвета / полирање","me":"Lakiranje drveta / poliranje","ar":"تلميع الخشب / تجديد"}},{"value":"structural_repair","label":{"tr":"Yapısal onarım","en":"Structural repair","de":"Strukturelle Reparatur","it":"Riparazione strutturale","ru":"Структурный ремонт","uk":"Структурний ремонт","sr":"Структурна поправка","me":"Strukturna popravka","ar":"إصلاح هيكلي"}},{"value":"reupholster","label":{"tr":"Döşeme yenileme","en":"Reupholstery","de":"Neu beziehen","it":"Ritappezzatura","ru":"Перетяжка","uk":"Перетяжка","sr":"Пресвлачење","me":"Presvlačenje","ar":"إعادة تنجيد"}},{"value":"cleaning","label":{"tr":"Derin temizlik / parlatma","en":"Deep cleaning / polishing","de":"Tiefenreinigung / Polieren","it":"Pulizia profonda / lucidatura","ru":"Глубокая чистка / полировка","uk":"Глибоке чищення / полірування","sr":"Дубинско чишћење / полирање","me":"Dubinsko čišćenje / poliranje","ar":"تنظيف عميق / تلميع"}},{"value":"full_restoration","label":{"tr":"Komple restorasyon","en":"Full restoration","de":"Vollständige Restaurierung","it":"Restauro completo","ru":"Полная реставрация","uk":"Повна реставрація","sr":"Потпуна рестаурација","me":"Potpuna restauracija","ar":"ترميم كامل"}}]'::jsonb,
  '{"required":true,"min":1}'::jsonb,
  2, 1, TRUE),

-- Q4: Age (single, optional)
('furniture-restoration', 'age', 'select',
  '{"tr":"Mobilyanın yaşı?","en":"Approximate age of the furniture?","de":"Ungefähres Alter des Möbels?","it":"Età approssimativa del mobile?","ru":"Приблизительный возраст мебели?","uk":"Приблизний вік меблів?","sr":"Оквирна старост намештаја?","me":"Okvirna starost namještaja?","ar":"العمر التقريبي للأثاث؟"}'::jsonb,
  '[{"value":"under_20","label":{"tr":"20 yıldan az","en":"Under 20 years","de":"Unter 20 Jahre","it":"Meno di 20 anni","ru":"Меньше 20 лет","uk":"Менше 20 років","sr":"Мање од 20 година","me":"Manje od 20 godina","ar":"أقل من 20 سنة"}},{"value":"20_50","label":{"tr":"20-50 yıl","en":"20-50 years","de":"20-50 Jahre","it":"20-50 anni","ru":"20-50 лет","uk":"20-50 років","sr":"20-50 година","me":"20-50 godina","ar":"20-50 سنة"}},{"value":"antique","label":{"tr":"Antika (50+ yıl)","en":"Antique (50+ years)","de":"Antik (50+ Jahre)","it":"Antico (50+ anni)","ru":"Антиквариат (50+ лет)","uk":"Антикваріат (50+ років)","sr":"Антиквитет (50+ година)","me":"Antikvitet (50+ godina)","ar":"أثري (50+ سنة)"}},{"value":"unknown","label":{"tr":"Bilmiyorum","en":"Unknown","de":"Unbekannt","it":"Sconosciuto","ru":"Не знаю","uk":"Не знаю","sr":"Не знам","me":"Ne znam","ar":"غير معروف"}}]'::jsonb,
  NULL,
  2, 2, FALSE),

-- Q5: Item count (number, required)
('furniture-restoration', 'item_count', 'number',
  '{"tr":"Kaç adet eşya?","en":"How many items?","de":"Wie viele Stücke?","it":"Quanti pezzi?","ru":"Сколько предметов?","uk":"Скільки предметів?","sr":"Колико комада?","me":"Koliko komada?","ar":"كم القطع؟"}'::jsonb,
  NULL,
  '{"required":true,"min":1,"max":50}'::jsonb,
  2, 3, TRUE)
ON CONFLICT (category_slug, question_key) DO NOTHING;

COMMIT;

-- =============================================================================
-- ROLLBACK BLOCK (commented; uncomment + run as a separate transaction)
-- =============================================================================
-- BEGIN;
-- DELETE FROM public.glatko_request_questions
--   WHERE category_slug IN ('furniture-custom', 'furniture-restoration');
-- DELETE FROM public.glatko_search_synonyms
--   WHERE canonical_slug IN ('furniture-custom', 'furniture-restoration');
-- DELETE FROM public.glatko_service_categories
--   WHERE slug IN ('furniture-custom', 'furniture-restoration');
-- COMMIT;
--
-- Verification queries:
-- SELECT slug, name->>'tr' AS tr_name, sort_order, is_active
--   FROM public.glatko_service_categories
--  WHERE parent_id = (SELECT id FROM public.glatko_service_categories WHERE slug='renovation-construction')
--  ORDER BY sort_order;
--
-- SELECT canonical_slug, locale, count(*) AS n_synonyms
--   FROM public.glatko_search_synonyms
--  WHERE canonical_slug IN ('furniture-custom','furniture-restoration')
--  GROUP BY 1,2 ORDER BY 1,2;
--
-- SELECT category_slug, question_key, question_type, step_order, field_order, is_required
--   FROM public.glatko_request_questions
--  WHERE category_slug IN ('furniture-custom','furniture-restoration')
--  ORDER BY 1, step_order, field_order;
