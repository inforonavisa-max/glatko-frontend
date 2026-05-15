-- ============================================================================
-- Migration: 049_glatko_renovation_furniture_subs
-- Purpose:
--   1) Add 'furniture-restoration' (sort_order 25) under 'renovation-construction'
--   2) Enrich existing 'custom-furniture' row (created 2026-05-10, empty meta):
--      description JSONB (9 locales), icon, translation_status
--   3) Add 29 search synonyms targeting 'custom-furniture'
--   4) Add 6 wizard questions for 'custom-furniture'
--   5) Add 33 search synonyms for 'furniture-restoration'
--   6) Add 5 wizard questions for 'furniture-restoration'
--
-- Decision context (A++.r1):
--   - Original plan added a new duplicate slug for free-standing bespoke
--     furniture; baseline check (Faz 1) found an existing 'custom-furniture'
--     row already under renovation-construction (sort 23, 0 pros, 0 requests,
--     NULL description / icon / synonyms / wizard).
--   - To avoid duplicate slugs and a confused UX, enriched the existing row
--     instead of creating a parallel one. All synonyms and wizard rows that
--     the original plan targeted at the discarded duplicate slug are
--     redirected here to 'custom-furniture'.
--   - sort_order=9 for custom-furniture was rejected (Faz 1.5 q11: 'painter'
--     occupies slot 9 and no integer is free in 1..24); row stays at sort 23.
--     Reorder is out-of-scope for this PR.
--
-- Schema notes (verified against 014 + 021):
--   - glatko_search_synonyms uses canonical_slug (NOT category_slug) +
--     locale + synonym + weight; UNIQUE(canonical_slug, locale, synonym).
--   - glatko_request_questions uses question_type (NOT type) of enum
--     public.glatko_question_type; UNIQUE(category_slug, question_key).
--   - glatko_service_categories has UNIQUE(slug) (Faz 1.5 q8).
--
-- Icon dependencies (lib/utils/categoryIcon.ts ICON_MAP):
--   - 'Brush' already present → used for furniture-restoration INSERT.
--   - 'Ruler' added in the same PR to support custom-furniture (icon UPDATE).
--
-- Idempotency: ON CONFLICT DO NOTHING on all INSERTs; UPDATE has
--              WHERE description IS NULL so a second run is a no-op.
-- Rollback: commented block at the bottom of this file.
-- ============================================================================

BEGIN;

-- =============================================================================
-- PART 1: Insert furniture-restoration sub-category under renovation-construction
-- (The duplicate-slug INSERT was removed in A++.r1 — see PART 1.5 instead.)
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
    'furniture-restoration',
    '{"tr":"Mobilya Restorasyonu","en":"Furniture Restoration","de":"Möbelrestaurierung","it":"Restauro Mobili","ru":"Реставрация мебели","uk":"Реставрація меблів","sr":"Реставрација намештаја","me":"Restauracija namještaja","ar":"ترميم الأثاث"}'::jsonb,
    '{"tr":"Eski, antika veya hasarlı mobilyaların yenilenmesi: cila, döşeme, yapısal onarım, antika restorasyon.","en":"Refinishing and repair of old, antique or damaged furniture: polishing, reupholstery, structural repair, antique restoration.","de":"Aufarbeitung und Reparatur alter, antiker oder beschädigter Möbel: Polieren, Neubeziehen, strukturelle Reparatur, Antiquitätenrestaurierung.","it":"Restauro e riparazione di mobili antichi, vecchi o danneggiati: lucidatura, ritappezzatura, riparazione strutturale, restauro antiquariato.","ru":"Восстановление и ремонт старой, антикварной или повреждённой мебели: полировка, перетяжка, структурный ремонт, реставрация антиквариата.","uk":"Відновлення та ремонт старих, антикварних або пошкоджених меблів: полірування, перетяжка, структурний ремонт, реставрація антикваріату.","sr":"Обнова и поправка старог, антикварног или оштећеног намештаја: полирање, пресвлачење, структурна поправка, реставрација антиквитета.","me":"Obnova i popravka starog, antikvarnog ili oštećenog namještaja: poliranje, presvlačenje, strukturna popravka, restauracija antikviteta.","ar":"تجديد وإصلاح الأثاث القديم أو العتيق أو التالف: تلميع، إعادة تنجيد، إصلاح هيكلي، ترميم القطع الأثرية."}'::jsonb,
    'Brush',
    25,
    TRUE,
    'year-round',
    99,
    FALSE,
    '{"tr":"verified","en":"verified","de":"verified","it":"verified","ru":"verified","uk":"verified","sr":"verified","me":"verified","ar":"verified"}'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- PART 1.5: Enrich existing custom-furniture row (A++.r1)
-- Replaces the original PART 1 INSERT for the discarded duplicate slug.
-- Instead of creating a new row, the existing 'custom-furniture' row gets
-- description, icon and translation_status filled in. sort_order is
-- intentionally NOT touched (painter occupies slot 9 — see Faz 1.5 q11).
-- =============================================================================

UPDATE public.glatko_service_categories
SET
  description = '{"tr":"Masa, komidin, gardırop, kanepe gibi serbest duran mobilyaların ölçüye ve tasarıma özel yapımı.","en":"Bespoke, free-standing furniture: tables, dressers, wardrobes, sofas — built to your dimensions and style.","de":"Maßgefertigte, freistehende Möbel: Tische, Kommoden, Schränke, Sofas — nach Ihren Maßen und Ihrem Stil.","it":"Mobili su misura non incassati: tavoli, comò, armadi, divani — realizzati secondo le tue dimensioni e il tuo stile.","ru":"Отдельно стоящая мебель на заказ: столы, комоды, шкафы, диваны — по вашим размерам и стилю.","uk":"Окремо розташовані меблі на замовлення: столи, комоди, шафи, дивани — за вашими розмірами та стилем.","sr":"Слободностојећи намештај по мери: столови, комоде, ормари, софе — према вашим димензијама и стилу.","me":"Slobodnostojeći namještaj po mjeri: stolovi, komode, ormari, kauči — prema vašim dimenzijama i stilu.","ar":"أثاث قائم بذاته مصنوع حسب الطلب: طاولات، خزائن، أرائك — وفق مقاساتك وأسلوبك."}'::jsonb,
  icon = COALESCE(icon, 'Ruler'),
  translation_status = '{"tr":"verified","en":"verified","de":"verified","it":"verified","ru":"verified","uk":"verified","sr":"verified","me":"verified","ar":"verified"}'::jsonb
WHERE slug = 'custom-furniture'
  AND description IS NULL;

-- =============================================================================
-- PART 2: Search synonyms — 9 locales
-- Column is canonical_slug (not category_slug). weight defaults to 1.
-- =============================================================================

-- custom-furniture synonyms (29 rows; redirected from the discarded
-- duplicate-slug plan to the existing 'custom-furniture' slug.)
INSERT INTO public.glatko_search_synonyms (canonical_slug, locale, synonym) VALUES
  ('custom-furniture','tr','ölçüye özel mobilya'),
  ('custom-furniture','tr','custom mobilya'),
  ('custom-furniture','tr','kişiye özel mobilya'),
  ('custom-furniture','tr','ısmarlama mobilya'),
  ('custom-furniture','tr','özel tasarım mobilya'),
  ('custom-furniture','tr','tasarım mobilya'),
  ('custom-furniture','en','custom furniture'),
  ('custom-furniture','en','bespoke furniture'),
  ('custom-furniture','en','made to order furniture'),
  ('custom-furniture','en','custom table'),
  ('custom-furniture','de','maßgefertigte möbel'),
  ('custom-furniture','de','möbel nach maß'),
  ('custom-furniture','de','sondermöbel'),
  ('custom-furniture','it','mobili su misura'),
  ('custom-furniture','it','mobili personalizzati'),
  ('custom-furniture','it','arredamento su misura'),
  ('custom-furniture','ru','мебель на заказ'),
  ('custom-furniture','ru','индивидуальная мебель'),
  ('custom-furniture','ru','мебель по размерам'),
  ('custom-furniture','uk','меблі на замовлення'),
  ('custom-furniture','uk','індивідуальні меблі'),
  ('custom-furniture','sr','намештај по мери'),
  ('custom-furniture','sr','namestaj po meri'),
  ('custom-furniture','sr','prilagođeni namestaj'),
  ('custom-furniture','me','namještaj po mjeri'),
  ('custom-furniture','me','sto po mjeri'),
  ('custom-furniture','me','prilagođeni namještaj'),
  ('custom-furniture','ar','أثاث حسب الطلب'),
  ('custom-furniture','ar','أثاث مخصص')
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
-- PART 3: Wizard questions — custom-furniture (6 questions)
-- Column is question_type (not type). Enum: text/textarea/select/multiselect/
-- number/date/file/slider (from migration 021).
-- Redirected from the discarded duplicate-slug plan to existing 'custom-furniture'.
-- =============================================================================

INSERT INTO public.glatko_request_questions
  (category_slug, question_key, question_type, label, options, validation,
   step_order, field_order, is_required)
VALUES

-- Q1: Furniture type (multiselect, required)
('custom-furniture', 'furniture_type', 'multiselect',
  '{"tr":"Hangi tür mobilya yaptırmak istiyorsunuz?","en":"What type of furniture do you want made?","de":"Welche Art von Möbel möchten Sie anfertigen lassen?","it":"Che tipo di mobile vuoi far realizzare?","ru":"Какой тип мебели вы хотите заказать?","uk":"Який тип меблів ви хочете замовити?","sr":"Какву врсту намештаја желите да направите?","me":"Kakvu vrstu namještaja želite da napravite?","ar":"ما نوع الأثاث الذي تريد صنعه؟"}'::jsonb,
  '[{"value":"dining_table","label":{"tr":"Yemek masası","en":"Dining table","de":"Esstisch","it":"Tavolo da pranzo","ru":"Обеденный стол","uk":"Обідній стіл","sr":"Трпезаријски сто","me":"Trpezarijski sto","ar":"طاولة طعام"}},{"value":"coffee_table","label":{"tr":"Sehpa","en":"Coffee table","de":"Couchtisch","it":"Tavolino","ru":"Журнальный столик","uk":"Журнальний столик","sr":"Сточић","me":"Stočić","ar":"طاولة قهوة"}},{"value":"dresser","label":{"tr":"Komidin / Şifonyer","en":"Dresser","de":"Kommode","it":"Cassettiera","ru":"Комод","uk":"Комод","sr":"Комода","me":"Komoda","ar":"خزانة أدراج"}},{"value":"bookshelf","label":{"tr":"Kitaplık","en":"Bookshelf","de":"Bücherregal","it":"Libreria","ru":"Книжный шкаф","uk":"Книжкова шафа","sr":"Полица за књиге","me":"Polica za knjige","ar":"رف كتب"}},{"value":"bed_frame","label":{"tr":"Karyola","en":"Bed frame","de":"Bettrahmen","it":"Letto","ru":"Каркас кровати","uk":"Каркас ліжка","sr":"Кревет","me":"Krevet","ar":"إطار سرير"}},{"value":"wardrobe_freestanding","label":{"tr":"Gardırop (serbest duran)","en":"Wardrobe (free-standing)","de":"Kleiderschrank (freistehend)","it":"Armadio (libero)","ru":"Шкаф (отдельностоящий)","uk":"Шафа (окремостояча)","sr":"Ормар (слободностојећи)","me":"Ormar (slobodnostojeći)","ar":"خزانة ملابس (قائمة بذاتها)"}},{"value":"sofa","label":{"tr":"Kanepe / Koltuk","en":"Sofa / Armchair","de":"Sofa / Sessel","it":"Divano / Poltrona","ru":"Диван / Кресло","uk":"Диван / Крісло","sr":"Софа / Фотеља","me":"Sofa / Fotelja","ar":"أريكة / كرسي"}},{"value":"tv_unit","label":{"tr":"TV ünitesi","en":"TV unit","de":"TV-Möbel","it":"Mobile TV","ru":"ТВ-тумба","uk":"ТВ-тумба","sr":"ТВ комода","me":"TV komoda","ar":"وحدة تلفاز"}},{"value":"desk","label":{"tr":"Çalışma masası","en":"Desk","de":"Schreibtisch","it":"Scrivania","ru":"Письменный стол","uk":"Письмовий стіл","sr":"Радни сто","me":"Radni sto","ar":"مكتب"}},{"value":"other","label":{"tr":"Diğer","en":"Other","de":"Sonstiges","it":"Altro","ru":"Другое","uk":"Інше","sr":"Друго","me":"Drugo","ar":"أخرى"}}]'::jsonb,
  '{"required":true,"min":1}'::jsonb,
  1, 1, TRUE),

-- Q2: Material (multiselect, required)
('custom-furniture', 'material', 'multiselect',
  '{"tr":"Hangi malzemeyi tercih ediyorsunuz?","en":"Which material do you prefer?","de":"Welches Material bevorzugen Sie?","it":"Quale materiale preferisci?","ru":"Какой материал предпочитаете?","uk":"Який матеріал ви віддаєте перевагу?","sr":"Који материјал преферирате?","me":"Koji materijal preferirate?","ar":"ما المادة التي تفضلها؟"}'::jsonb,
  '[{"value":"solid_wood","label":{"tr":"Masif ahşap","en":"Solid wood","de":"Massivholz","it":"Legno massello","ru":"Массив дерева","uk":"Масив дерева","sr":"Пуно дрво","me":"Puno drvo","ar":"خشب صلب"}},{"value":"mdf","label":{"tr":"MDF","en":"MDF","de":"MDF","it":"MDF","ru":"МДФ","uk":"МДФ","sr":"МДФ","me":"MDF","ar":"إم دي إف"}},{"value":"plywood","label":{"tr":"Kontrplak","en":"Plywood","de":"Sperrholz","it":"Compensato","ru":"Фанера","uk":"Фанера","sr":"Шперплоча","me":"Šperploča","ar":"خشب رقائقي"}},{"value":"metal","label":{"tr":"Metal aksamlı","en":"With metal accents","de":"Mit Metallakzenten","it":"Con dettagli in metallo","ru":"С металлическими элементами","uk":"З металевими елементами","sr":"Са металним детаљима","me":"Sa metalnim detaljima","ar":"بتفاصيل معدنية"}},{"value":"glass","label":{"tr":"Cam","en":"Glass","de":"Glas","it":"Vetro","ru":"Стекло","uk":"Скло","sr":"Стакло","me":"Staklo","ar":"زجاج"}},{"value":"undecided","label":{"tr":"Karar vermedim, ustaya soracağım","en":"Undecided, will ask the pro","de":"Unentschieden, frage den Profi","it":"Indeciso, chiederò al professionista","ru":"Не определился, спрошу мастера","uk":"Не визначився, запитаю майстра","sr":"Нисам одлучио, питаћу мајстора","me":"Nisam odlučio, pitaću majstora","ar":"غير محدد، سأسأل المختص"}}]'::jsonb,
  '{"required":true,"min":1}'::jsonb,
  1, 2, TRUE),

-- Q3: Style (single, optional)
('custom-furniture', 'style', 'select',
  '{"tr":"Hangi stili düşünüyorsunuz?","en":"Which style are you considering?","de":"An welchen Stil denken Sie?","it":"Quale stile stai considerando?","ru":"Какой стиль вы рассматриваете?","uk":"Який стиль ви розглядаєте?","sr":"Који стил разматрате?","me":"Koji stil razmatrate?","ar":"ما الأسلوب الذي تفكر فيه؟"}'::jsonb,
  '[{"value":"modern","label":{"tr":"Modern minimalist","en":"Modern minimalist","de":"Modern minimalistisch","it":"Moderno minimalista","ru":"Современный минимализм","uk":"Сучасний мінімалізм","sr":"Модеран минимализам","me":"Moderan minimalizam","ar":"حديث بسيط"}},{"value":"classic","label":{"tr":"Klasik","en":"Classic","de":"Klassisch","it":"Classico","ru":"Классический","uk":"Класичний","sr":"Класичан","me":"Klasičan","ar":"كلاسيكي"}},{"value":"rustic","label":{"tr":"Rustik","en":"Rustic","de":"Rustikal","it":"Rustico","ru":"Рустик","uk":"Рустик","sr":"Рустичан","me":"Rustičan","ar":"ريفي"}},{"value":"industrial","label":{"tr":"Endüstriyel","en":"Industrial","de":"Industrial","it":"Industriale","ru":"Лофт / индустриальный","uk":"Лофт / індустріальний","sr":"Индустријски","me":"Industrijski","ar":"صناعي"}},{"value":"scandinavian","label":{"tr":"İskandinav","en":"Scandinavian","de":"Skandinavisch","it":"Scandinavo","ru":"Скандинавский","uk":"Скандинавський","sr":"Скандинавски","me":"Skandinavski","ar":"إسكندنافي"}},{"value":"other","label":{"tr":"Diğer","en":"Other","de":"Sonstiges","it":"Altro","ru":"Другое","uk":"Інше","sr":"Друго","me":"Drugo","ar":"أخرى"}}]'::jsonb,
  NULL,
  2, 1, FALSE),

-- Q4: Dimensions (text, optional)
('custom-furniture', 'dimensions', 'text',
  '{"tr":"Yaklaşık ölçüler (cm: EnxBoyxYükseklik)","en":"Approximate dimensions (cm: WxLxH)","de":"Ungefähre Maße (cm: BxLxH)","it":"Dimensioni approssimative (cm: LxLxH)","ru":"Приблизительные размеры (см: ШхДхВ)","uk":"Приблизні розміри (см: ШхДхВ)","sr":"Оквирне димензије (cm: ШxДxВ)","me":"Okvirne dimenzije (cm: ŠxDxV)","ar":"الأبعاد التقريبية (سم: عرض×طول×ارتفاع)"}'::jsonb,
  NULL,
  '{"maxLength":200}'::jsonb,
  2, 2, FALSE),

-- Q5: Quantity (number, required)
('custom-furniture', 'quantity', 'number',
  '{"tr":"Kaç adet?","en":"How many items?","de":"Wie viele Stücke?","it":"Quanti pezzi?","ru":"Сколько штук?","uk":"Скільки штук?","sr":"Колико комада?","me":"Koliko komada?","ar":"كم القطع؟"}'::jsonb,
  NULL,
  '{"required":true,"min":1,"max":50}'::jsonb,
  2, 3, TRUE),

-- Q6: Timeline (single, required)
('custom-furniture', 'timeline', 'select',
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
-- ROLLBACK BLOCK (commented; uncomment + run in Supabase Studio if needed)
-- A++.r1 rollback notes:
--   - custom-furniture row was NOT created by this migration (it predates it,
--     created_at 2026-05-10T16:42:39.263939+00:00). Do NOT DELETE it on rollback;
--     only revert the description / icon / translation_status fields we filled.
--   - furniture-restoration row WAS created by this migration; DELETE on rollback.
-- =============================================================================
-- BEGIN;
-- DELETE FROM public.glatko_request_questions
--  WHERE category_slug IN ('custom-furniture','furniture-restoration')
--    AND question_key IN ('furniture_type','material','style','dimensions','quantity','timeline',
--                         'item_type','condition','goal','age','item_count');
-- DELETE FROM public.glatko_search_synonyms
--  WHERE (canonical_slug = 'custom-furniture' AND synonym IN (
--           'ölçüye özel mobilya','custom mobilya','kişiye özel mobilya','ısmarlama mobilya',
--           'özel tasarım mobilya','tasarım mobilya','custom furniture','bespoke furniture',
--           'made to order furniture','custom table','maßgefertigte möbel','möbel nach maß',
--           'sondermöbel','mobili su misura','mobili personalizzati','arredamento su misura',
--           'мебель на заказ','индивидуальная мебель','мебель по размерам','меблі на замовлення',
--           'індивідуальні меблі','намештај по мери','namestaj po meri','prilagođeni namestaj',
--           'namještaj po mjeri','sto po mjeri','prilagođeni namještaj','أثاث حسب الطلب','أثاث مخصص'
--         ))
--      OR canonical_slug = 'furniture-restoration';
-- UPDATE public.glatko_service_categories
--    SET description = NULL,
--        icon = NULL,
--        translation_status = NULL
--  WHERE slug = 'custom-furniture' AND created_at = '2026-05-10T16:42:39.263939+00:00';
-- DELETE FROM public.glatko_service_categories WHERE slug = 'furniture-restoration';
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
--  WHERE canonical_slug IN ('custom-furniture','furniture-restoration')
--  GROUP BY 1,2 ORDER BY 1,2;
--
-- SELECT category_slug, question_key, question_type, step_order, field_order, is_required
--   FROM public.glatko_request_questions
--  WHERE category_slug IN ('custom-furniture','furniture-restoration')
--  ORDER BY 1, step_order, field_order;
