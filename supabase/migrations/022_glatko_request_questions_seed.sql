-- ============================================================================
-- 022_glatko_request_questions_seed.sql
-- G-REQ-1 Faz 2: per-category wizard questions, 9-locale eksiksiz.
--
-- 10 root categories × 5-7 questions = ~55 rows. Each row carries the full
-- 9-locale JSONB for label/placeholder/help_text and (where applicable)
-- option labels. Memory item 25: no EN fallback at runtime — every locale
-- key is genuinely localized at seed time.
--
-- Conventions:
--   - step_order groups fields into wizard steps (1=specifics, 2=description,
--     3=preferences/conditional, 4=files). Common steps (location/budget/
--     date/auth) are added by the wizard component, not seeded here.
--   - field_order is per-step display ordering.
--   - validation JSON keeps cross-cutting `required` plus type-specific
--     min/max/maxLength/maxFiles/etc. is_required boolean is duplicated for
--     fast index-able lookup but the JSON is the source of truth.
--   - show_if encodes conditional visibility (operator one of eq/in/gt/lt).
-- ============================================================================

BEGIN;

-- ─── 1. boat-services (7 questions) ────────────────────────────────────────

INSERT INTO public.glatko_request_questions
  (category_slug, question_key, question_type, label, placeholder, help_text,
   options, validation, show_if, step_order, field_order, is_required)
VALUES

('boat-services', 'boat_type', 'select',
  '{"me":"Tip plovila","sr":"Tip plovila","en":"Boat type","tr":"Tekne tipi","de":"Boots-Typ","it":"Tipo di barca","ru":"Тип лодки","ar":"نوع القارب","uk":"Тип човна"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"sailboat","label":{"me":"Jedrilica","sr":"Jedrilica","en":"Sailboat","tr":"Yelkenli","de":"Segelboot","it":"Barca a vela","ru":"Парусник","ar":"قارب شراعي","uk":"Вітрильник"}},
    {"value":"motorboat","label":{"me":"Motorni čamac","sr":"Motorni čamac","en":"Motorboat","tr":"Motorlu tekne","de":"Motorboot","it":"Motoscafo","ru":"Моторная лодка","ar":"قارب بمحرك","uk":"Моторний човен"}},
    {"value":"yacht","label":{"me":"Jahta","sr":"Jahta","en":"Yacht","tr":"Yat","de":"Yacht","it":"Yacht","ru":"Яхта","ar":"يخت","uk":"Яхта"}},
    {"value":"catamaran","label":{"me":"Katamaran","sr":"Katamaran","en":"Catamaran","tr":"Katamaran","de":"Katamaran","it":"Catamarano","ru":"Катамаран","ar":"كاتاماران","uk":"Катамаран"}},
    {"value":"other","label":{"me":"Drugo","sr":"Drugo","en":"Other","tr":"Diğer","de":"Andere","it":"Altro","ru":"Другое","ar":"آخر","uk":"Інше"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 1, 1, TRUE),

('boat-services', 'boat_length', 'number',
  '{"me":"Dužina plovila (m)","sr":"Dužina plovila (m)","en":"Boat length (m)","tr":"Tekne uzunluğu (m)","de":"Bootslänge (m)","it":"Lunghezza barca (m)","ru":"Длина лодки (м)","ar":"طول القارب (م)","uk":"Довжина човна (м)"}'::jsonb,
  '{"me":"npr. 12","sr":"npr. 12","en":"e.g. 12","tr":"örn. 12","de":"z.B. 12","it":"es. 12","ru":"напр. 12","ar":"مثلاً 12","uk":"напр. 12"}'::jsonb,
  '{"me":"Dužina utiče na cijenu i materijal","sr":"Dužina utiče na cenu i materijal","en":"Length affects price and materials needed","tr":"Uzunluk fiyat ve malzeme miktarını etkiler","de":"Länge beeinflusst Preis und Material","it":"La lunghezza influenza prezzo e materiali","ru":"Длина влияет на цену и материалы","ar":"الطول يؤثر على السعر والمواد المطلوبة","uk":"Довжина впливає на ціну та матеріали"}'::jsonb,
  NULL,
  '{"required":true,"min":1,"max":100}'::jsonb, NULL, 1, 2, TRUE),

('boat-services', 'hull_material', 'select',
  '{"me":"Materijal trupa","sr":"Materijal trupa","en":"Hull material","tr":"Tekne gövde malzemesi","de":"Rumpfmaterial","it":"Materiale dello scafo","ru":"Материал корпуса","ar":"مادة الهيكل","uk":"Матеріал корпусу"}'::jsonb,
  NULL,
  '{"me":"Različiti materijali zahtijevaju različite tretmane","sr":"Različiti materijali zahtevaju različite tretmane","en":"Different materials require different treatments","tr":"Farklı malzemeler farklı işlemler gerektirir","de":"Verschiedene Materialien benötigen verschiedene Behandlungen","it":"Materiali diversi richiedono trattamenti diversi","ru":"Разные материалы требуют разной обработки","ar":"المواد المختلفة تحتاج إلى معالجات مختلفة","uk":"Різні матеріали потребують різного догляду"}'::jsonb,
  '[
    {"value":"fiberglass","label":{"me":"Fiberglas","sr":"Fiberglas","en":"Fiberglass","tr":"Fiberglas","de":"Fiberglas","it":"Vetroresina","ru":"Стеклопластик","ar":"الألياف الزجاجية","uk":"Склопластик"}},
    {"value":"aluminum","label":{"me":"Aluminijum","sr":"Aluminijum","en":"Aluminum","tr":"Alüminyum","de":"Aluminium","it":"Alluminio","ru":"Алюминий","ar":"الألومنيوم","uk":"Алюміній"}},
    {"value":"steel","label":{"me":"Čelik","sr":"Čelik","en":"Steel","tr":"Çelik","de":"Stahl","it":"Acciaio","ru":"Сталь","ar":"الفولاذ","uk":"Сталь"}},
    {"value":"wood","label":{"me":"Drvo","sr":"Drvo","en":"Wood","tr":"Ahşap","de":"Holz","it":"Legno","ru":"Дерево","ar":"الخشب","uk":"Дерево"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 1, 3, TRUE),

('boat-services', 'service_description', 'textarea',
  '{"me":"Opis potrebnog servisa","sr":"Opis potrebnog servisa","en":"Service description","tr":"Hizmet açıklaması","de":"Servicebeschreibung","it":"Descrizione del servizio","ru":"Описание услуги","ar":"وصف الخدمة","uk":"Опис послуги"}'::jsonb,
  '{"me":"Detaljno opišite šta treba uraditi…","sr":"Detaljno opišite šta treba uraditi…","en":"Describe in detail what needs to be done…","tr":"Yapılması gerekenleri ayrıntılı açıklayın…","de":"Beschreiben Sie detailliert, was zu tun ist…","it":"Descrivi in dettaglio cosa va fatto…","ru":"Подробно опишите, что нужно сделать…","ar":"صف بالتفصيل ما يجب القيام به…","uk":"Детально опишіть, що потрібно зробити…"}'::jsonb,
  NULL, NULL,
  '{"required":true,"minLength":20,"maxLength":2000}'::jsonb, NULL, 2, 1, TRUE),

('boat-services', 'current_condition', 'select',
  '{"me":"Trenutno stanje","sr":"Trenutno stanje","en":"Current condition","tr":"Mevcut durum","de":"Aktueller Zustand","it":"Condizione attuale","ru":"Текущее состояние","ar":"الحالة الحالية","uk":"Поточний стан"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"excellent","label":{"me":"Odlično","sr":"Odlično","en":"Excellent","tr":"Mükemmel","de":"Ausgezeichnet","it":"Eccellente","ru":"Отличное","ar":"ممتاز","uk":"Відмінний"}},
    {"value":"good","label":{"me":"Dobro","sr":"Dobro","en":"Good","tr":"İyi","de":"Gut","it":"Buono","ru":"Хорошее","ar":"جيد","uk":"Добрий"}},
    {"value":"fair","label":{"me":"Solidno","sr":"Solidno","en":"Fair","tr":"Orta","de":"Mittelmäßig","it":"Discreto","ru":"Удовлетворительное","ar":"متوسط","uk":"Задовільний"}},
    {"value":"needs_repair","label":{"me":"Potrebna popravka","sr":"Potrebna popravka","en":"Needs repair","tr":"Tamir gerekli","de":"Reparatur nötig","it":"Da riparare","ru":"Требует ремонта","ar":"يحتاج إصلاح","uk":"Потребує ремонту"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 2, 2, TRUE),

('boat-services', 'needs_winterization', 'select',
  '{"me":"Da li je potrebno zimovanje","sr":"Da li je potrebno zimovanje","en":"Winterization needed?","tr":"Kışlama gerekli mi?","de":"Wintereinlagerung nötig?","it":"Serve rimessaggio invernale?","ru":"Нужна ли зимовка?","ar":"هل تحتاج إلى تخزين شتوي؟","uk":"Потрібна зимівля?"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"yes","label":{"me":"Da","sr":"Da","en":"Yes","tr":"Evet","de":"Ja","it":"Sì","ru":"Да","ar":"نعم","uk":"Так"}},
    {"value":"no","label":{"me":"Ne","sr":"Ne","en":"No","tr":"Hayır","de":"Nein","it":"No","ru":"Нет","ar":"لا","uk":"Ні"}},
    {"value":"unsure","label":{"me":"Nisam siguran/na","sr":"Nisam siguran/na","en":"Not sure","tr":"Emin değilim","de":"Unsicher","it":"Non so","ru":"Не уверен(а)","ar":"غير متأكد","uk":"Не впевнений(а)"}}
  ]'::jsonb,
  '{}'::jsonb,
  '{"question_key":"boat_type","operator":"in","value":["yacht","catamaran","sailboat","motorboat"]}'::jsonb,
  3, 1, FALSE),

('boat-services', 'photos', 'file',
  '{"me":"Fotografije plovila","sr":"Fotografije plovila","en":"Boat photos","tr":"Tekne fotoğrafları","de":"Boots-Fotos","it":"Foto della barca","ru":"Фото лодки","ar":"صور القارب","uk":"Фото човна"}'::jsonb,
  NULL,
  '{"me":"Fotografije pomažu profesionalcima dati tačnu ponudu","sr":"Fotografije pomažu profesionalcima dati tačnu ponudu","en":"Photos help professionals give an accurate quote","tr":"Fotoğraflar profesyonellerin doğru teklif vermesine yardımcı olur","de":"Fotos helfen Profis bei genauen Angeboten","it":"Le foto aiutano i professionisti a dare preventivi accurati","ru":"Фото помогают специалистам дать точную оценку","ar":"الصور تساعد المحترفين على تقديم عرض دقيق","uk":"Фото допомагають фахівцям дати точну оцінку"}'::jsonb,
  NULL,
  '{"maxFiles":5,"maxSizeMB":10,"allowedTypes":["image/jpeg","image/png","image/webp"]}'::jsonb,
  NULL, 4, 1, FALSE);


-- ─── 2. home-cleaning (5 questions) ────────────────────────────────────────

INSERT INTO public.glatko_request_questions
  (category_slug, question_key, question_type, label, placeholder, help_text,
   options, validation, show_if, step_order, field_order, is_required)
VALUES

('home-cleaning', 'cleaning_type', 'select',
  '{"me":"Tip čišćenja","sr":"Tip čišćenja","en":"Cleaning type","tr":"Temizlik türü","de":"Reinigungsart","it":"Tipo di pulizia","ru":"Тип уборки","ar":"نوع التنظيف","uk":"Тип прибирання"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"regular","label":{"me":"Redovno čišćenje","sr":"Redovno čišćenje","en":"Regular cleaning","tr":"Düzenli temizlik","de":"Regelmäßige Reinigung","it":"Pulizia regolare","ru":"Регулярная уборка","ar":"تنظيف منتظم","uk":"Регулярне прибирання"}},
    {"value":"deep","label":{"me":"Detaljno čišćenje","sr":"Detaljno čišćenje","en":"Deep cleaning","tr":"Detaylı temizlik","de":"Grundreinigung","it":"Pulizia approfondita","ru":"Генеральная уборка","ar":"تنظيف عميق","uk":"Глибоке прибирання"}},
    {"value":"move_in_out","label":{"me":"Useljenje/iseljenje","sr":"Useljenje/iseljenje","en":"Move-in / move-out","tr":"Eve giriş / çıkış","de":"Ein- / Auszug","it":"Entrata / uscita","ru":"Заезд / выезд","ar":"دخول / مغادرة","uk":"Заїзд / виїзд"}},
    {"value":"post_construction","label":{"me":"Nakon građevinskih radova","sr":"Nakon građevinskih radova","en":"After construction","tr":"İnşaat sonrası","de":"Nach Bauarbeiten","it":"Dopo lavori","ru":"После ремонта","ar":"بعد البناء","uk":"Після ремонту"}},
    {"value":"airbnb_turnover","label":{"me":"Airbnb između gostiju","sr":"Airbnb između gostiju","en":"Airbnb turnover","tr":"Airbnb dönüş","de":"Airbnb-Wechsel","it":"Airbnb turnover","ru":"Airbnb уборка","ar":"تنظيف ايربنب","uk":"Airbnb прибирання"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 1, 1, TRUE),

('home-cleaning', 'area_size_sqm', 'number',
  '{"me":"Veličina prostora (m²)","sr":"Veličina prostora (m²)","en":"Area size (m²)","tr":"Alan büyüklüğü (m²)","de":"Fläche (m²)","it":"Superficie (m²)","ru":"Площадь (м²)","ar":"مساحة (م²)","uk":"Площа (м²)"}'::jsonb,
  '{"me":"npr. 80","sr":"npr. 80","en":"e.g. 80","tr":"örn. 80","de":"z.B. 80","it":"es. 80","ru":"напр. 80","ar":"مثلاً 80","uk":"напр. 80"}'::jsonb,
  NULL, NULL,
  '{"required":true,"min":10,"max":2000}'::jsonb, NULL, 1, 2, TRUE),

('home-cleaning', 'frequency', 'select',
  '{"me":"Učestalost","sr":"Učestalost","en":"Frequency","tr":"Sıklık","de":"Häufigkeit","it":"Frequenza","ru":"Частота","ar":"التكرار","uk":"Частота"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"one_time","label":{"me":"Jednokratno","sr":"Jednokratno","en":"One-time","tr":"Tek seferlik","de":"Einmalig","it":"Una volta","ru":"Одноразово","ar":"مرة واحدة","uk":"Одноразово"}},
    {"value":"weekly","label":{"me":"Sedmično","sr":"Sedmično","en":"Weekly","tr":"Haftalık","de":"Wöchentlich","it":"Settimanale","ru":"Еженедельно","ar":"أسبوعياً","uk":"Щотижня"}},
    {"value":"biweekly","label":{"me":"Svake dvije sedmice","sr":"Svake dve nedelje","en":"Every two weeks","tr":"İki haftada bir","de":"Alle zwei Wochen","it":"Ogni due settimane","ru":"Раз в две недели","ar":"كل أسبوعين","uk":"Раз на два тижні"}},
    {"value":"monthly","label":{"me":"Mjesečno","sr":"Mesečno","en":"Monthly","tr":"Aylık","de":"Monatlich","it":"Mensile","ru":"Ежемесячно","ar":"شهرياً","uk":"Щомісяця"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 1, 3, TRUE),

('home-cleaning', 'special_requirements', 'textarea',
  '{"me":"Posebni zahtjevi","sr":"Posebni zahtevi","en":"Special requirements","tr":"Özel istekler","de":"Besondere Wünsche","it":"Richieste speciali","ru":"Особые пожелания","ar":"متطلبات خاصة","uk":"Особливі вимоги"}'::jsonb,
  '{"me":"npr. eko sredstva, alergije…","sr":"npr. eko sredstva, alergije…","en":"e.g. eco-friendly products, allergies…","tr":"örn. çevre dostu ürünler, alerjiler…","de":"z.B. Öko-Produkte, Allergien…","it":"es. prodotti eco, allergie…","ru":"напр. экосредства, аллергии…","ar":"مثلاً منتجات صديقة للبيئة، حساسية…","uk":"напр. екопродукти, алергії…"}'::jsonb,
  NULL, NULL,
  '{"maxLength":500}'::jsonb, NULL, 2, 1, FALSE),

('home-cleaning', 'photos', 'file',
  '{"me":"Fotografije prostora","sr":"Fotografije prostora","en":"Space photos","tr":"Alan fotoğrafları","de":"Fotos der Räume","it":"Foto dello spazio","ru":"Фото помещения","ar":"صور المكان","uk":"Фото приміщення"}'::jsonb,
  NULL, NULL, NULL,
  '{"maxFiles":5,"maxSizeMB":10,"allowedTypes":["image/jpeg","image/png","image/webp"]}'::jsonb,
  NULL, 3, 1, FALSE);


-- ─── 3. beauty-wellness (5 questions) ──────────────────────────────────────

INSERT INTO public.glatko_request_questions
  (category_slug, question_key, question_type, label, placeholder, help_text,
   options, validation, show_if, step_order, field_order, is_required)
VALUES

('beauty-wellness', 'service_type', 'multiselect',
  '{"me":"Tip usluge","sr":"Tip usluge","en":"Service type","tr":"Hizmet türü","de":"Servicetyp","it":"Tipo di servizio","ru":"Тип услуги","ar":"نوع الخدمة","uk":"Тип послуги"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"hair","label":{"me":"Kosa","sr":"Kosa","en":"Hair","tr":"Saç","de":"Haare","it":"Capelli","ru":"Волосы","ar":"شعر","uk":"Волосся"}},
    {"value":"nails","label":{"me":"Nokti","sr":"Nokti","en":"Nails","tr":"Tırnak","de":"Nägel","it":"Unghie","ru":"Ногти","ar":"أظافر","uk":"Нігті"}},
    {"value":"facial","label":{"me":"Tretman lica","sr":"Tretman lica","en":"Facial / skincare","tr":"Cilt bakımı","de":"Gesichtsbehandlung","it":"Trattamento viso","ru":"Уход за лицом","ar":"عناية بالبشرة","uk":"Догляд за обличчям"}},
    {"value":"massage","label":{"me":"Masaža","sr":"Masaža","en":"Massage","tr":"Masaj","de":"Massage","it":"Massaggio","ru":"Массаж","ar":"تدليك","uk":"Масаж"}},
    {"value":"makeup","label":{"me":"Šminka","sr":"Šminka","en":"Makeup","tr":"Makyaj","de":"Make-up","it":"Trucco","ru":"Макияж","ar":"مكياج","uk":"Макіяж"}},
    {"value":"hair_removal","label":{"me":"Depilacija","sr":"Depilacija","en":"Hair removal","tr":"Epilasyon","de":"Haarentfernung","it":"Depilazione","ru":"Эпиляция","ar":"إزالة الشعر","uk":"Видалення волосся"}}
  ]'::jsonb,
  '{"required":true,"minSelected":1}'::jsonb, NULL, 1, 1, TRUE),

('beauty-wellness', 'location_preference', 'select',
  '{"me":"Lokacija usluge","sr":"Lokacija usluge","en":"Service location","tr":"Hizmet yeri","de":"Service-Ort","it":"Luogo del servizio","ru":"Место услуги","ar":"موقع الخدمة","uk":"Місце надання послуги"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"home_visit","label":{"me":"Dolazak kod mene","sr":"Dolazak kod mene","en":"Home visit","tr":"Eve geliş","de":"Hausbesuch","it":"A domicilio","ru":"С выездом ко мне","ar":"زيارة منزلية","uk":"Виїзд до мене"}},
    {"value":"salon","label":{"me":"U salonu","sr":"U salonu","en":"At the salon","tr":"Salonda","de":"Im Salon","it":"In salone","ru":"В салоне","ar":"في الصالون","uk":"У салоні"}},
    {"value":"either","label":{"me":"Bilo gdje","sr":"Bilo gde","en":"Either","tr":"Fark etmez","de":"Egal","it":"Indifferente","ru":"Без разницы","ar":"أي مكان","uk":"Будь-де"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 1, 2, TRUE),

('beauty-wellness', 'service_description', 'textarea',
  '{"me":"Opis željene usluge","sr":"Opis željene usluge","en":"Service description","tr":"Hizmet açıklaması","de":"Servicebeschreibung","it":"Descrizione del servizio","ru":"Описание услуги","ar":"وصف الخدمة","uk":"Опис послуги"}'::jsonb,
  '{"me":"npr. boja kose, dužina rezanja…","sr":"npr. boja kose, dužina sečenja…","en":"e.g. hair color, cut length…","tr":"örn. saç rengi, kesim boyu…","de":"z.B. Haarfarbe, Schnittlänge…","it":"es. colore capelli, lunghezza taglio…","ru":"напр. цвет волос, длина стрижки…","ar":"مثلاً لون الشعر، طول القص…","uk":"напр. колір волосся, довжина стрижки…"}'::jsonb,
  NULL, NULL,
  '{"required":true,"minLength":15,"maxLength":1000}'::jsonb, NULL, 2, 1, TRUE),

('beauty-wellness', 'preferred_date', 'date',
  '{"me":"Željeni datum","sr":"Željeni datum","en":"Preferred date","tr":"Tercih edilen tarih","de":"Wunschtermin","it":"Data preferita","ru":"Предпочтительная дата","ar":"التاريخ المفضل","uk":"Бажана дата"}'::jsonb,
  NULL, NULL, NULL,
  '{}'::jsonb, NULL, 3, 1, FALSE),

('beauty-wellness', 'photos', 'file',
  '{"me":"Referentne fotografije","sr":"Referentne fotografije","en":"Reference photos","tr":"Referans fotoğraflar","de":"Referenzfotos","it":"Foto di riferimento","ru":"Референсные фото","ar":"صور مرجعية","uk":"Референсні фото"}'::jsonb,
  NULL,
  '{"me":"Fotografije željenog izgleda pomažu","sr":"Fotografije željenog izgleda pomažu","en":"Photos of the look you want help","tr":"İstediğiniz görünümün fotoğrafları yardımcı olur","de":"Fotos des gewünschten Looks helfen","it":"Le foto del look desiderato aiutano","ru":"Фото желаемого образа помогают","ar":"صور للمظهر المرغوب تساعد","uk":"Фото бажаного образу допомагають"}'::jsonb,
  NULL,
  '{"maxFiles":4,"maxSizeMB":8,"allowedTypes":["image/jpeg","image/png","image/webp"]}'::jsonb,
  NULL, 3, 2, FALSE);


-- ─── 4. renovation-construction (7 questions) ──────────────────────────────

INSERT INTO public.glatko_request_questions
  (category_slug, question_key, question_type, label, placeholder, help_text,
   options, validation, show_if, step_order, field_order, is_required)
VALUES

('renovation-construction', 'project_type', 'multiselect',
  '{"me":"Tip radova","sr":"Tip radova","en":"Project type","tr":"Proje türü","de":"Projektart","it":"Tipo di lavoro","ru":"Тип работ","ar":"نوع المشروع","uk":"Тип робіт"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"electrical","label":{"me":"Električni radovi","sr":"Električni radovi","en":"Electrical","tr":"Elektrik","de":"Elektroarbeiten","it":"Elettricità","ru":"Электромонтаж","ar":"أعمال كهرباء","uk":"Електромонтаж"}},
    {"value":"plumbing","label":{"me":"Vodoinstalacije","sr":"Vodoinstalacije","en":"Plumbing","tr":"Su tesisatı","de":"Sanitärarbeiten","it":"Idraulica","ru":"Сантехника","ar":"سباكة","uk":"Сантехніка"}},
    {"value":"painting","label":{"me":"Krečenje / molerski","sr":"Krečenje / molerski","en":"Painting","tr":"Boya badana","de":"Malerarbeiten","it":"Tinteggiatura","ru":"Малярные работы","ar":"دهان","uk":"Малярні роботи"}},
    {"value":"tiling","label":{"me":"Postavljanje pločica","sr":"Postavljanje pločica","en":"Tiling","tr":"Fayans seramik","de":"Fliesenarbeiten","it":"Posa piastrelle","ru":"Укладка плитки","ar":"بلاط","uk":"Укладання плитки"}},
    {"value":"drywall","label":{"me":"Gips kartonski radovi","sr":"Gips kartonski radovi","en":"Drywall","tr":"Alçıpan","de":"Trockenbau","it":"Cartongesso","ru":"Гипсокартон","ar":"جبس بورد","uk":"Гіпсокартон"}},
    {"value":"flooring","label":{"me":"Podne obloge","sr":"Podne obloge","en":"Flooring","tr":"Zemin kaplama","de":"Bodenbelag","it":"Pavimentazione","ru":"Напольные покрытия","ar":"أرضيات","uk":"Підлогові покриття"}},
    {"value":"full_renovation","label":{"me":"Kompletna renovacija","sr":"Kompletna renovacija","en":"Full renovation","tr":"Komple tadilat","de":"Komplettsanierung","it":"Ristrutturazione completa","ru":"Полный ремонт","ar":"تجديد شامل","uk":"Повна реновація"}}
  ]'::jsonb,
  '{"required":true,"minSelected":1}'::jsonb, NULL, 1, 1, TRUE),

('renovation-construction', 'area_sqm', 'number',
  '{"me":"Površina radova (m²)","sr":"Površina radova (m²)","en":"Work area (m²)","tr":"Çalışma alanı (m²)","de":"Arbeitsfläche (m²)","it":"Area di lavoro (m²)","ru":"Площадь работ (м²)","ar":"مساحة العمل (م²)","uk":"Площа робіт (м²)"}'::jsonb,
  '{"me":"npr. 60","sr":"npr. 60","en":"e.g. 60","tr":"örn. 60","de":"z.B. 60","it":"es. 60","ru":"напр. 60","ar":"مثلاً 60","uk":"напр. 60"}'::jsonb,
  NULL, NULL,
  '{"required":true,"min":1,"max":5000}'::jsonb, NULL, 1, 2, TRUE),

('renovation-construction', 'current_state', 'select',
  '{"me":"Trenutno stanje prostora","sr":"Trenutno stanje prostora","en":"Current state","tr":"Mevcut durum","de":"Aktueller Zustand","it":"Stato attuale","ru":"Текущее состояние","ar":"الحالة الحالية","uk":"Поточний стан"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"new_construction","label":{"me":"Novogradnja","sr":"Novogradnja","en":"New construction","tr":"Yeni inşaat","de":"Neubau","it":"Nuova costruzione","ru":"Новостройка","ar":"بناء جديد","uk":"Новобудова"}},
    {"value":"empty","label":{"me":"Prazno (bez namještaja)","sr":"Prazno (bez nameštaja)","en":"Empty (no furniture)","tr":"Boş (mobilyasız)","de":"Leer (keine Möbel)","it":"Vuoto (senza mobili)","ru":"Пустое (без мебели)","ar":"فارغ (بدون أثاث)","uk":"Порожнє (без меблів)"}},
    {"value":"furnished","label":{"me":"Namješteno","sr":"Namešteno","en":"Furnished","tr":"Eşyalı","de":"Möbliert","it":"Ammobiliato","ru":"С мебелью","ar":"مفروش","uk":"З меблями"}},
    {"value":"occupied","label":{"me":"U upotrebi","sr":"U upotrebi","en":"Occupied","tr":"Yaşanılıyor","de":"Bewohnt","it":"Abitato","ru":"Жилое","ar":"مأهول","uk":"Жиле"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 1, 3, TRUE),

('renovation-construction', 'project_description', 'textarea',
  '{"me":"Detaljan opis projekta","sr":"Detaljan opis projekta","en":"Project description","tr":"Proje açıklaması","de":"Projektbeschreibung","it":"Descrizione progetto","ru":"Описание проекта","ar":"وصف المشروع","uk":"Опис проєкту"}'::jsonb,
  '{"me":"Šta tačno želite da uradite, redoslijed faza…","sr":"Šta tačno želite da uradite, redosled faza…","en":"What exactly you want done, phasing…","tr":"Tam olarak ne istiyorsunuz, faz sırası…","de":"Was genau erledigt werden soll, Phasen…","it":"Cosa vuoi fare nel dettaglio, fasi…","ru":"Что именно нужно сделать, этапы…","ar":"ما الذي تريد القيام به بالتحديد، المراحل…","uk":"Що саме потрібно зробити, фази…"}'::jsonb,
  NULL, NULL,
  '{"required":true,"minLength":40,"maxLength":3000}'::jsonb, NULL, 2, 1, TRUE),

('renovation-construction', 'has_permits', 'select',
  '{"me":"Imate li potrebne dozvole?","sr":"Imate li potrebne dozvole?","en":"Do you have the required permits?","tr":"Gerekli ruhsatlar var mı?","de":"Liegen die nötigen Genehmigungen vor?","it":"Hai i permessi necessari?","ru":"У вас есть нужные разрешения?","ar":"هل لديك التصاريح المطلوبة؟","uk":"Чи є необхідні дозволи?"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"yes","label":{"me":"Da, sve dozvole","sr":"Da, sve dozvole","en":"Yes, all permits","tr":"Evet, hepsi","de":"Ja, alle","it":"Sì, tutti","ru":"Да, все","ar":"نعم، الكل","uk":"Так, усі"}},
    {"value":"partial","label":{"me":"Djelimično","sr":"Delimično","en":"Partial","tr":"Kısmen","de":"Teilweise","it":"Parziale","ru":"Частично","ar":"جزئياً","uk":"Частково"}},
    {"value":"no","label":{"me":"Ne, treba pomoć","sr":"Ne, treba pomoć","en":"No, need help","tr":"Hayır, yardım gerek","de":"Nein, brauche Hilfe","it":"No, serve aiuto","ru":"Нет, нужна помощь","ar":"لا، أحتاج مساعدة","uk":"Ні, потрібна допомога"}},
    {"value":"unsure","label":{"me":"Nisam siguran/na","sr":"Nisam siguran/na","en":"Not sure","tr":"Emin değilim","de":"Unsicher","it":"Non so","ru":"Не уверен(а)","ar":"غير متأكد","uk":"Не впевнений(а)"}}
  ]'::jsonb,
  '{}'::jsonb, NULL, 3, 1, FALSE),

('renovation-construction', 'budget_estimate', 'select',
  '{"me":"Procjenjeni budžet","sr":"Procenjeni budžet","en":"Budget estimate","tr":"Tahmini bütçe","de":"Budgetschätzung","it":"Budget stimato","ru":"Ориентировочный бюджет","ar":"الميزانية التقديرية","uk":"Орієнтовний бюджет"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"under_1000","label":{"me":"Do 1.000 €","sr":"Do 1.000 €","en":"Under €1,000","tr":"€1.000 altı","de":"Unter 1.000 €","it":"Sotto €1.000","ru":"До 1 000 €","ar":"أقل من 1,000 €","uk":"До 1 000 €"}},
    {"value":"1000_5000","label":{"me":"1.000–5.000 €","sr":"1.000–5.000 €","en":"€1,000–5,000","tr":"€1.000–5.000","de":"1.000–5.000 €","it":"€1.000–5.000","ru":"1 000–5 000 €","ar":"1,000–5,000 €","uk":"1 000–5 000 €"}},
    {"value":"5000_15000","label":{"me":"5.000–15.000 €","sr":"5.000–15.000 €","en":"€5,000–15,000","tr":"€5.000–15.000","de":"5.000–15.000 €","it":"€5.000–15.000","ru":"5 000–15 000 €","ar":"5,000–15,000 €","uk":"5 000–15 000 €"}},
    {"value":"15000_50000","label":{"me":"15.000–50.000 €","sr":"15.000–50.000 €","en":"€15,000–50,000","tr":"€15.000–50.000","de":"15.000–50.000 €","it":"€15.000–50.000","ru":"15 000–50 000 €","ar":"15,000–50,000 €","uk":"15 000–50 000 €"}},
    {"value":"over_50000","label":{"me":"Preko 50.000 €","sr":"Preko 50.000 €","en":"Over €50,000","tr":"€50.000 üstü","de":"Über 50.000 €","it":"Oltre €50.000","ru":"Свыше 50 000 €","ar":"أكثر من 50,000 €","uk":"Понад 50 000 €"}},
    {"value":"unsure","label":{"me":"Nisam siguran/na","sr":"Nisam siguran/na","en":"Not sure","tr":"Emin değilim","de":"Unsicher","it":"Non so","ru":"Не уверен(а)","ar":"غير متأكد","uk":"Не впевнений(а)"}}
  ]'::jsonb,
  '{}'::jsonb, NULL, 3, 2, FALSE),

('renovation-construction', 'photos', 'file',
  '{"me":"Fotografije prostora","sr":"Fotografije prostora","en":"Site photos","tr":"Mekan fotoğrafları","de":"Fotos vom Objekt","it":"Foto del luogo","ru":"Фото объекта","ar":"صور الموقع","uk":"Фото об''єкта"}'::jsonb,
  NULL, NULL, NULL,
  '{"maxFiles":8,"maxSizeMB":10,"allowedTypes":["image/jpeg","image/png","image/webp"]}'::jsonb,
  NULL, 4, 1, FALSE);


-- ─── 5. catering-food (6 questions) ────────────────────────────────────────

INSERT INTO public.glatko_request_questions
  (category_slug, question_key, question_type, label, placeholder, help_text,
   options, validation, show_if, step_order, field_order, is_required)
VALUES

('catering-food', 'event_type', 'select',
  '{"me":"Tip događaja","sr":"Tip događaja","en":"Event type","tr":"Etkinlik türü","de":"Veranstaltungsart","it":"Tipo di evento","ru":"Тип мероприятия","ar":"نوع الحدث","uk":"Тип події"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"private","label":{"me":"Privatna proslava","sr":"Privatna proslava","en":"Private gathering","tr":"Özel buluşma","de":"Private Feier","it":"Festa privata","ru":"Частное мероприятие","ar":"تجمع خاص","uk":"Приватна вечірка"}},
    {"value":"wedding","label":{"me":"Vjenčanje","sr":"Venčanje","en":"Wedding","tr":"Düğün","de":"Hochzeit","it":"Matrimonio","ru":"Свадьба","ar":"حفل زفاف","uk":"Весілля"}},
    {"value":"corporate","label":{"me":"Korporativni događaj","sr":"Korporativni događaj","en":"Corporate","tr":"Kurumsal","de":"Firmenevent","it":"Aziendale","ru":"Корпоратив","ar":"حفل شركات","uk":"Корпоратив"}},
    {"value":"birthday","label":{"me":"Rođendan","sr":"Rođendan","en":"Birthday","tr":"Doğum günü","de":"Geburtstag","it":"Compleanno","ru":"День рождения","ar":"عيد ميلاد","uk":"День народження"}},
    {"value":"yacht","label":{"me":"Na jahti / brodu","sr":"Na jahti / brodu","en":"Yacht / boat","tr":"Yatta / teknede","de":"Auf der Yacht","it":"Su yacht","ru":"На яхте","ar":"على يخت","uk":"На яхті"}},
    {"value":"villa","label":{"me":"U vili","sr":"U vili","en":"Villa","tr":"Villada","de":"In der Villa","it":"In villa","ru":"На вилле","ar":"في فيلا","uk":"На віллі"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 1, 1, TRUE),

('catering-food', 'guest_count', 'number',
  '{"me":"Broj gostiju","sr":"Broj gostiju","en":"Guest count","tr":"Misafir sayısı","de":"Gäste-Anzahl","it":"Numero di ospiti","ru":"Количество гостей","ar":"عدد الضيوف","uk":"Кількість гостей"}'::jsonb,
  '{"me":"npr. 30","sr":"npr. 30","en":"e.g. 30","tr":"örn. 30","de":"z.B. 30","it":"es. 30","ru":"напр. 30","ar":"مثلاً 30","uk":"напр. 30"}'::jsonb,
  NULL, NULL,
  '{"required":true,"min":1,"max":2000}'::jsonb, NULL, 1, 2, TRUE),

('catering-food', 'dietary_restrictions', 'multiselect',
  '{"me":"Posebne ishrane","sr":"Posebne ishrane","en":"Dietary restrictions","tr":"Beslenme tercihleri","de":"Ernährungsbesonderheiten","it":"Esigenze alimentari","ru":"Особенности питания","ar":"قيود غذائية","uk":"Дієтичні вимоги"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"vegetarian","label":{"me":"Vegetarijanska","sr":"Vegetarijanska","en":"Vegetarian","tr":"Vejetaryen","de":"Vegetarisch","it":"Vegetariano","ru":"Вегетарианское","ar":"نباتي","uk":"Вегетаріанське"}},
    {"value":"vegan","label":{"me":"Veganska","sr":"Veganska","en":"Vegan","tr":"Vegan","de":"Vegan","it":"Vegano","ru":"Веганское","ar":"نباتي صرف","uk":"Веганське"}},
    {"value":"halal","label":{"me":"Halal","sr":"Halal","en":"Halal","tr":"Helal","de":"Halal","it":"Halal","ru":"Халяль","ar":"حلال","uk":"Халяль"}},
    {"value":"kosher","label":{"me":"Košer","sr":"Košer","en":"Kosher","tr":"Koşer","de":"Koscher","it":"Kosher","ru":"Кошер","ar":"كوشير","uk":"Кошер"}},
    {"value":"gluten_free","label":{"me":"Bez glutena","sr":"Bez glutena","en":"Gluten-free","tr":"Glütensiz","de":"Glutenfrei","it":"Senza glutine","ru":"Без глютена","ar":"خالٍ من الجلوتين","uk":"Без глютену"}},
    {"value":"none","label":{"me":"Nema ograničenja","sr":"Nema ograničenja","en":"No restrictions","tr":"Kısıtlama yok","de":"Keine Einschränkungen","it":"Nessuna","ru":"Без ограничений","ar":"لا قيود","uk":"Без обмежень"}}
  ]'::jsonb,
  '{}'::jsonb, NULL, 2, 1, FALSE),

('catering-food', 'menu_preference', 'textarea',
  '{"me":"Željeni meni / kuhinja","sr":"Željeni meni / kuhinja","en":"Menu / cuisine preference","tr":"Tercih edilen menü / mutfak","de":"Menü- / Küchenwunsch","it":"Menù / cucina preferita","ru":"Предпочтения по меню / кухне","ar":"تفضيلات القائمة","uk":"Бажане меню / кухня"}'::jsonb,
  '{"me":"npr. mediteranska, BBQ, švedski sto…","sr":"npr. mediteranska, BBQ, švedski sto…","en":"e.g. Mediterranean, BBQ, buffet…","tr":"örn. Akdeniz, mangal, açık büfe…","de":"z.B. mediterran, BBQ, Buffet…","it":"es. mediterraneo, BBQ, buffet…","ru":"напр. средиземноморская, BBQ, шведский стол…","ar":"مثلاً متوسطية، شواء، بوفيه…","uk":"напр. середземноморська, BBQ, шведський стіл…"}'::jsonb,
  NULL, NULL,
  '{"maxLength":1000}'::jsonb, NULL, 2, 2, FALSE),

('catering-food', 'event_date', 'date',
  '{"me":"Datum događaja","sr":"Datum događaja","en":"Event date","tr":"Etkinlik tarihi","de":"Veranstaltungsdatum","it":"Data evento","ru":"Дата мероприятия","ar":"تاريخ الحدث","uk":"Дата події"}'::jsonb,
  NULL, NULL, NULL,
  '{"required":true}'::jsonb, NULL, 3, 1, TRUE),

('catering-food', 'location_provided', 'select',
  '{"me":"Lokacija događaja","sr":"Lokacija događaja","en":"Venue arrangement","tr":"Mekan düzenleme","de":"Veranstaltungsort","it":"Location","ru":"Площадка мероприятия","ar":"الموقع","uk":"Місце події"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"i_have_venue","label":{"me":"Imam svoju lokaciju","sr":"Imam svoju lokaciju","en":"I have a venue","tr":"Mekan bende var","de":"Ich habe einen Ort","it":"Ho la sede","ru":"Площадка у меня есть","ar":"لدي موقع","uk":"Місце вже є"}},
    {"value":"need_venue","label":{"me":"Treba mi pomoć oko lokacije","sr":"Treba mi pomoć oko lokacije","en":"Need venue suggestions","tr":"Mekan önerisi gerek","de":"Brauche Vorschläge","it":"Cerco location","ru":"Нужна помощь с площадкой","ar":"أحتاج اقتراحات","uk":"Потрібна допомога з місцем"}}
  ]'::jsonb,
  '{}'::jsonb, NULL, 3, 2, FALSE);


-- ─── 6. tutoring-education (5 questions) ───────────────────────────────────

INSERT INTO public.glatko_request_questions
  (category_slug, question_key, question_type, label, placeholder, help_text,
   options, validation, show_if, step_order, field_order, is_required)
VALUES

('tutoring-education', 'subject', 'multiselect',
  '{"me":"Predmet","sr":"Predmet","en":"Subject","tr":"Konu / ders","de":"Fach","it":"Materia","ru":"Предмет","ar":"المادة","uk":"Предмет"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"math","label":{"me":"Matematika","sr":"Matematika","en":"Math","tr":"Matematik","de":"Mathematik","it":"Matematica","ru":"Математика","ar":"رياضيات","uk":"Математика"}},
    {"value":"science","label":{"me":"Prirodne nauke","sr":"Prirodne nauke","en":"Science","tr":"Fen bilimleri","de":"Naturwissenschaften","it":"Scienze","ru":"Естественные науки","ar":"علوم","uk":"Природничі науки"}},
    {"value":"languages","label":{"me":"Jezici","sr":"Jezici","en":"Languages","tr":"Yabancı dil","de":"Sprachen","it":"Lingue","ru":"Языки","ar":"لغات","uk":"Мови"}},
    {"value":"music","label":{"me":"Muzika","sr":"Muzika","en":"Music","tr":"Müzik","de":"Musik","it":"Musica","ru":"Музыка","ar":"موسيقى","uk":"Музика"}},
    {"value":"art","label":{"me":"Likovno","sr":"Likovno","en":"Art","tr":"Resim","de":"Kunst","it":"Arte","ru":"Изобразительное искусство","ar":"فن","uk":"Образотворче мистецтво"}},
    {"value":"exam_prep","label":{"me":"Priprema za ispite","sr":"Priprema za ispite","en":"Exam preparation","tr":"Sınav hazırlık","de":"Prüfungsvorbereitung","it":"Preparazione esami","ru":"Подготовка к экзаменам","ar":"تحضير امتحانات","uk":"Підготовка до іспитів"}}
  ]'::jsonb,
  '{"required":true,"minSelected":1}'::jsonb, NULL, 1, 1, TRUE),

('tutoring-education', 'level', 'select',
  '{"me":"Nivo","sr":"Nivo","en":"Level","tr":"Seviye","de":"Niveau","it":"Livello","ru":"Уровень","ar":"المستوى","uk":"Рівень"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"beginner","label":{"me":"Početni","sr":"Početni","en":"Beginner","tr":"Başlangıç","de":"Anfänger","it":"Principiante","ru":"Начинающий","ar":"مبتدئ","uk":"Початковий"}},
    {"value":"intermediate","label":{"me":"Srednji","sr":"Srednji","en":"Intermediate","tr":"Orta","de":"Mittelstufe","it":"Intermedio","ru":"Средний","ar":"متوسط","uk":"Середній"}},
    {"value":"advanced","label":{"me":"Napredni","sr":"Napredni","en":"Advanced","tr":"İleri","de":"Fortgeschritten","it":"Avanzato","ru":"Продвинутый","ar":"متقدم","uk":"Просунутий"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 1, 2, TRUE),

('tutoring-education', 'student_age', 'number',
  '{"me":"Uzrast učenika","sr":"Uzrast učenika","en":"Student age","tr":"Öğrenci yaşı","de":"Alter des Lernenden","it":"Età dello studente","ru":"Возраст ученика","ar":"عمر الطالب","uk":"Вік учня"}'::jsonb,
  '{"me":"npr. 14","sr":"npr. 14","en":"e.g. 14","tr":"örn. 14","de":"z.B. 14","it":"es. 14","ru":"напр. 14","ar":"مثلاً 14","uk":"напр. 14"}'::jsonb,
  NULL, NULL,
  '{"required":true,"min":3,"max":99}'::jsonb, NULL, 1, 3, TRUE),

('tutoring-education', 'frequency', 'select',
  '{"me":"Učestalost časova","sr":"Učestalost časova","en":"Lesson frequency","tr":"Ders sıklığı","de":"Unterrichtshäufigkeit","it":"Frequenza lezioni","ru":"Частота занятий","ar":"تكرار الدروس","uk":"Частота занять"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"once","label":{"me":"Jednom (probni čas)","sr":"Jednom (probni čas)","en":"Once (trial)","tr":"Tek seferlik (deneme)","de":"Einmalig (Probe)","it":"Una volta (prova)","ru":"Разовое (пробное)","ar":"مرة واحدة","uk":"Одне (пробне)"}},
    {"value":"weekly","label":{"me":"Sedmično","sr":"Sedmično","en":"Weekly","tr":"Haftalık","de":"Wöchentlich","it":"Settimanale","ru":"Еженедельно","ar":"أسبوعياً","uk":"Щотижня"}},
    {"value":"twice_weekly","label":{"me":"Dva puta sedmično","sr":"Dva puta nedeljno","en":"Twice a week","tr":"Haftada iki","de":"Zweimal wöchentlich","it":"Due volte a settimana","ru":"Два раза в неделю","ar":"مرتين أسبوعياً","uk":"Двічі на тиждень"}},
    {"value":"intensive","label":{"me":"Intenzivno (svakodnevno)","sr":"Intenzivno (svakodnevno)","en":"Intensive (daily)","tr":"Yoğun (günlük)","de":"Intensiv (täglich)","it":"Intensivo (giornaliero)","ru":"Интенсивно (ежедневно)","ar":"مكثف (يومياً)","uk":"Інтенсивно (щодня)"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 1, 4, TRUE),

('tutoring-education', 'online_or_in_person', 'select',
  '{"me":"Online ili uživo","sr":"Online ili uživo","en":"Online or in-person","tr":"Online veya yüz yüze","de":"Online oder Präsenz","it":"Online o di persona","ru":"Онлайн или лично","ar":"عبر الإنترنت أو شخصياً","uk":"Онлайн чи особисто"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"online","label":{"me":"Online","sr":"Online","en":"Online","tr":"Online","de":"Online","it":"Online","ru":"Онлайн","ar":"عبر الإنترنت","uk":"Онлайн"}},
    {"value":"in_person","label":{"me":"Uživo","sr":"Uživo","en":"In-person","tr":"Yüz yüze","de":"Präsenz","it":"Di persona","ru":"Лично","ar":"شخصياً","uk":"Особисто"}},
    {"value":"either","label":{"me":"Bilo koje","sr":"Bilo koje","en":"Either","tr":"Fark etmez","de":"Egal","it":"Indifferente","ru":"Любой","ar":"أي منهما","uk":"Будь-який"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 2, 1, TRUE);


-- ─── 7. childcare-family (5 questions) ─────────────────────────────────────

INSERT INTO public.glatko_request_questions
  (category_slug, question_key, question_type, label, placeholder, help_text,
   options, validation, show_if, step_order, field_order, is_required)
VALUES

('childcare-family', 'care_type', 'select',
  '{"me":"Tip njege","sr":"Tip nege","en":"Care type","tr":"Bakım türü","de":"Betreuungsart","it":"Tipo di assistenza","ru":"Тип ухода","ar":"نوع الرعاية","uk":"Тип догляду"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"babysitting","label":{"me":"Povremeno čuvanje","sr":"Povremeno čuvanje","en":"Occasional babysitting","tr":"Ara sıra çocuk bakımı","de":"Gelegentliches Babysitten","it":"Baby-sitter occasionale","ru":"Разовая няня","ar":"جليسة مؤقتة","uk":"Разова няня"}},
    {"value":"fulltime_nanny","label":{"me":"Stalna dadilja","sr":"Stalna dadilja","en":"Full-time nanny","tr":"Tam zamanlı dadı","de":"Vollzeit-Nanny","it":"Tata fissa","ru":"Постоянная няня","ar":"مربية بدوام كامل","uk":"Постійна няня"}},
    {"value":"eldercare","label":{"me":"Njega starijih","sr":"Nega starijih","en":"Elder care","tr":"Yaşlı bakımı","de":"Seniorenbetreuung","it":"Assistenza anziani","ru":"Уход за пожилыми","ar":"رعاية المسنين","uk":"Догляд за літніми"}},
    {"value":"pet_sitting","label":{"me":"Čuvanje ljubimaca","sr":"Čuvanje ljubimaca","en":"Pet sitting","tr":"Evcil hayvan bakımı","de":"Tierbetreuung","it":"Pet sitting","ru":"Передержка питомца","ar":"رعاية حيوان أليف","uk":"Догляд за тваринами"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 1, 1, TRUE),

('childcare-family', 'hours_per_week', 'number',
  '{"me":"Sati sedmično","sr":"Sati nedeljno","en":"Hours per week","tr":"Haftalık saat","de":"Stunden pro Woche","it":"Ore a settimana","ru":"Часов в неделю","ar":"ساعات أسبوعياً","uk":"Годин на тиждень"}'::jsonb,
  '{"me":"npr. 20","sr":"npr. 20","en":"e.g. 20","tr":"örn. 20","de":"z.B. 20","it":"es. 20","ru":"напр. 20","ar":"مثلاً 20","uk":"напр. 20"}'::jsonb,
  NULL, NULL,
  '{"required":true,"min":1,"max":80}'::jsonb, NULL, 1, 2, TRUE),

('childcare-family', 'special_needs', 'textarea',
  '{"me":"Posebne potrebe ili napomene","sr":"Posebne potrebe ili napomene","en":"Special needs or notes","tr":"Özel ihtiyaçlar / notlar","de":"Besondere Bedürfnisse / Hinweise","it":"Esigenze speciali o note","ru":"Особые потребности / заметки","ar":"احتياجات خاصة أو ملاحظات","uk":"Особливі потреби чи нотатки"}'::jsonb,
  '{"me":"npr. alergije, hronični uslovi, jezik…","sr":"npr. alergije, hronični uslovi, jezik…","en":"e.g. allergies, chronic conditions, language…","tr":"örn. alerji, kronik durum, dil…","de":"z.B. Allergien, chronische Erkrankungen, Sprache…","it":"es. allergie, condizioni croniche, lingua…","ru":"напр. аллергии, хронические состояния, язык…","ar":"مثلاً حساسية، حالات مزمنة، لغة…","uk":"напр. алергії, хронічні стани, мова…"}'::jsonb,
  NULL, NULL,
  '{"maxLength":1000}'::jsonb, NULL, 2, 1, FALSE),

('childcare-family', 'preferred_caretaker', 'select',
  '{"me":"Preferencije za pomagača","sr":"Preferencije za pomagača","en":"Caretaker preferences","tr":"Bakıcı tercihi","de":"Betreuer-Wünsche","it":"Preferenze sull''operatore","ru":"Предпочтения по специалисту","ar":"تفضيلات الجليس","uk":"Побажання щодо фахівця"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"any","label":{"me":"Bilo ko","sr":"Bilo ko","en":"Anyone","tr":"Herhangi biri","de":"Egal","it":"Chiunque","ru":"Любой","ar":"أي شخص","uk":"Будь-хто"}},
    {"value":"female_only","label":{"me":"Samo žena","sr":"Samo žena","en":"Female only","tr":"Sadece kadın","de":"Nur weiblich","it":"Solo donna","ru":"Только женщина","ar":"أنثى فقط","uk":"Лише жінка"}},
    {"value":"male_only","label":{"me":"Samo muškarac","sr":"Samo muškarac","en":"Male only","tr":"Sadece erkek","de":"Nur männlich","it":"Solo uomo","ru":"Только мужчина","ar":"ذكر فقط","uk":"Лише чоловік"}},
    {"value":"experienced","label":{"me":"Iskusan/na (5+ god)","sr":"Iskusan/na (5+ god)","en":"Experienced (5+ years)","tr":"Deneyimli (5+ yıl)","de":"Erfahren (5+ Jahre)","it":"Con esperienza (5+ anni)","ru":"Опытный (5+ лет)","ar":"خبرة (+5 سنوات)","uk":"Досвідчений(а) (5+ років)"}}
  ]'::jsonb,
  '{}'::jsonb, NULL, 2, 2, FALSE),

('childcare-family', 'schedule_flexibility', 'select',
  '{"me":"Fleksibilnost rasporeda","sr":"Fleksibilnost rasporeda","en":"Schedule flexibility","tr":"Esneklik","de":"Zeitliche Flexibilität","it":"Flessibilità oraria","ru":"Гибкость графика","ar":"مرونة الجدول","uk":"Гнучкість графіка"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"fixed","label":{"me":"Fiksni raspored","sr":"Fiksni raspored","en":"Fixed schedule","tr":"Sabit program","de":"Festes Schema","it":"Orario fisso","ru":"Фиксированный график","ar":"جدول ثابت","uk":"Фіксований графік"}},
    {"value":"flexible","label":{"me":"Fleksibilno","sr":"Fleksibilno","en":"Flexible","tr":"Esnek","de":"Flexibel","it":"Flessibile","ru":"Гибкий","ar":"مرن","uk":"Гнучкий"}},
    {"value":"weekends","label":{"me":"Samo vikendi","sr":"Samo vikendi","en":"Weekends only","tr":"Sadece haftasonu","de":"Nur am Wochenende","it":"Solo weekend","ru":"Только выходные","ar":"عطلة نهاية الأسبوع فقط","uk":"Лише вихідні"}},
    {"value":"evenings","label":{"me":"Samo večernji termini","sr":"Samo večernji termini","en":"Evenings only","tr":"Sadece akşamları","de":"Nur abends","it":"Solo sere","ru":"Только вечера","ar":"المساءات فقط","uk":"Лише вечорами"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 2, 3, TRUE);


-- ─── 8. moving-transport (6 questions) ─────────────────────────────────────

INSERT INTO public.glatko_request_questions
  (category_slug, question_key, question_type, label, placeholder, help_text,
   options, validation, show_if, step_order, field_order, is_required)
VALUES

('moving-transport', 'move_type', 'select',
  '{"me":"Tip preseljenja","sr":"Tip preseljenja","en":"Move type","tr":"Taşınma türü","de":"Umzugsart","it":"Tipo di trasloco","ru":"Тип переезда","ar":"نوع النقل","uk":"Тип переїзду"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"full_house","label":{"me":"Cijela kuća / stan","sr":"Cela kuća / stan","en":"Full home","tr":"Komple ev","de":"Komplette Wohnung","it":"Casa intera","ru":"Полный переезд","ar":"منزل كامل","uk":"Повне переїзд"}},
    {"value":"few_items","label":{"me":"Nekoliko stvari","sr":"Nekoliko stvari","en":"A few items","tr":"Birkaç eşya","de":"Wenige Gegenstände","it":"Pochi oggetti","ru":"Несколько предметов","ar":"بضع قطع","uk":"Кілька речей"}},
    {"value":"office","label":{"me":"Kancelarija","sr":"Kancelarija","en":"Office","tr":"Ofis","de":"Büro","it":"Ufficio","ru":"Офис","ar":"مكتب","uk":"Офіс"}},
    {"value":"international","label":{"me":"Međunarodno","sr":"Međunarodno","en":"International","tr":"Uluslararası","de":"International","it":"Internazionale","ru":"Международный","ar":"دولي","uk":"Міжнародний"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 1, 1, TRUE),

('moving-transport', 'volume_estimate', 'select',
  '{"me":"Procjena obima","sr":"Procena obima","en":"Volume estimate","tr":"Tahmini hacim","de":"Volumen-Schätzung","it":"Stima volume","ru":"Объём (оценка)","ar":"الحجم التقديري","uk":"Орієнтовний обсяг"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"studio","label":{"me":"Garsonjera (≈10 m³)","sr":"Garsonjera (≈10 m³)","en":"Studio (~10 m³)","tr":"Stüdyo (~10 m³)","de":"Studio (~10 m³)","it":"Monolocale (~10 m³)","ru":"Студия (~10 м³)","ar":"استوديو (~10 م³)","uk":"Студія (~10 м³)"}},
    {"value":"one_bedroom","label":{"me":"Jednosobni (≈20 m³)","sr":"Jednosobni (≈20 m³)","en":"1-bedroom (~20 m³)","tr":"1+1 (~20 m³)","de":"1-Zi.-Whg. (~20 m³)","it":"Bilocale (~20 m³)","ru":"1-комнатная (~20 м³)","ar":"غرفة واحدة (~20 م³)","uk":"1-кімнатна (~20 м³)"}},
    {"value":"two_three_bedroom","label":{"me":"Dvosobni / trosobni (≈30–50 m³)","sr":"Dvosobni / trosobni (≈30–50 m³)","en":"2–3 bedroom (~30–50 m³)","tr":"2–3 oda (~30–50 m³)","de":"2–3 Zi.-Whg. (~30–50 m³)","it":"Trilocale (~30–50 m³)","ru":"2–3 комнаты (~30–50 м³)","ar":"2–3 غرف (~30–50 م³)","uk":"2–3 кімнати (~30–50 м³)"}},
    {"value":"large_house","label":{"me":"Velika kuća (>50 m³)","sr":"Velika kuća (>50 m³)","en":"Large house (>50 m³)","tr":"Büyük ev (>50 m³)","de":"Großes Haus (>50 m³)","it":"Casa grande (>50 m³)","ru":"Большой дом (>50 м³)","ar":"منزل كبير (>50 م³)","uk":"Великий будинок (>50 м³)"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 1, 2, TRUE),

('moving-transport', 'origin_address', 'text',
  '{"me":"Polazna adresa / grad","sr":"Polazna adresa / grad","en":"Origin address / city","tr":"Başlangıç adresi / şehir","de":"Startadresse / Stadt","it":"Indirizzo di partenza / città","ru":"Адрес отправки / город","ar":"عنوان المنشأ / المدينة","uk":"Адреса відправлення / місто"}'::jsonb,
  '{"me":"npr. Budva, Slovenska obala","sr":"npr. Budva, Slovenska obala","en":"e.g. Budva, Slovenska obala","tr":"örn. Budva, Slovenska obala","de":"z.B. Budva, Slovenska obala","it":"es. Budva, Slovenska obala","ru":"напр. Будва, Slovenska obala","ar":"مثلاً بودفا، سلوفينسكا أوبالا","uk":"напр. Будва, Slovenska obala"}'::jsonb,
  NULL, NULL,
  '{"required":true,"maxLength":200}'::jsonb, NULL, 2, 1, TRUE),

('moving-transport', 'destination_address', 'text',
  '{"me":"Odredišna adresa / grad","sr":"Odredišna adresa / grad","en":"Destination address / city","tr":"Varış adresi / şehir","de":"Zieladresse / Stadt","it":"Indirizzo di destinazione / città","ru":"Адрес назначения / город","ar":"عنوان الوجهة / المدينة","uk":"Адреса призначення / місто"}'::jsonb,
  '{"me":"npr. Kotor, Stari Grad","sr":"npr. Kotor, Stari Grad","en":"e.g. Kotor, Old Town","tr":"örn. Kotor, eski şehir","de":"z.B. Kotor, Altstadt","it":"es. Kotor, città vecchia","ru":"напр. Котор, Старый Город","ar":"مثلاً كوتور، البلدة القديمة","uk":"напр. Котор, Старе Місто"}'::jsonb,
  NULL, NULL,
  '{"required":true,"maxLength":200}'::jsonb, NULL, 2, 2, TRUE),

('moving-transport', 'preferred_date', 'date',
  '{"me":"Željeni datum preseljenja","sr":"Željeni datum preseljenja","en":"Preferred move date","tr":"İstenen taşınma tarihi","de":"Wunschtermin Umzug","it":"Data preferita trasloco","ru":"Желаемая дата переезда","ar":"التاريخ المفضل للنقل","uk":"Бажана дата переїзду"}'::jsonb,
  NULL, NULL, NULL,
  '{"required":true}'::jsonb, NULL, 3, 1, TRUE),

('moving-transport', 'has_fragile_items', 'select',
  '{"me":"Lomljive ili posebne stvari?","sr":"Lomljive ili posebne stvari?","en":"Fragile or special items?","tr":"Kırılır ya da özel eşya var mı?","de":"Zerbrechliche / besondere Gegenstände?","it":"Oggetti fragili o speciali?","ru":"Хрупкие / особые вещи?","ar":"عناصر هشة أو خاصة؟","uk":"Крихкі чи особливі речі?"}'::jsonb,
  NULL,
  '{"me":"Klavir, umjetnička djela, antikvarne stvari…","sr":"Klavir, umetnička dela, antikvarne stvari…","en":"Piano, artwork, antiques…","tr":"Piyano, sanat eseri, antikalar…","de":"Klavier, Kunstwerke, Antiquitäten…","it":"Pianoforte, opere d''arte, antichi…","ru":"Пианино, картины, антиквариат…","ar":"بيانو، أعمال فنية، عتيق…","uk":"Піаніно, картини, антикваріат…"}'::jsonb,
  '[
    {"value":"none","label":{"me":"Nema","sr":"Nema","en":"None","tr":"Yok","de":"Keine","it":"Nessuno","ru":"Нет","ar":"لا يوجد","uk":"Немає"}},
    {"value":"some","label":{"me":"Ima nekoliko","sr":"Ima nekoliko","en":"A few","tr":"Birkaç","de":"Einige","it":"Alcuni","ru":"Немного","ar":"بعض","uk":"Декілька"}},
    {"value":"many","label":{"me":"Mnogo lomljivih","sr":"Mnogo lomljivih","en":"Many fragile","tr":"Çok kırılgan","de":"Viele zerbrechlich","it":"Molti fragili","ru":"Много хрупких","ar":"كثير من الهشة","uk":"Багато крихких"}}
  ]'::jsonb,
  '{}'::jsonb, NULL, 3, 2, FALSE);


-- ─── 9. automotive (5 questions) ───────────────────────────────────────────

INSERT INTO public.glatko_request_questions
  (category_slug, question_key, question_type, label, placeholder, help_text,
   options, validation, show_if, step_order, field_order, is_required)
VALUES

('automotive', 'service_type', 'multiselect',
  '{"me":"Tip servisa","sr":"Tip servisa","en":"Service type","tr":"Hizmet türü","de":"Serviceart","it":"Tipo di servizio","ru":"Тип услуги","ar":"نوع الخدمة","uk":"Тип послуги"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"mechanical","label":{"me":"Mehanika","sr":"Mehanika","en":"Mechanical","tr":"Mekanik","de":"Mechanik","it":"Meccanica","ru":"Механика","ar":"ميكانيكا","uk":"Механіка"}},
    {"value":"electrical","label":{"me":"Auto-električar","sr":"Auto-električar","en":"Electrical","tr":"Oto elektrik","de":"Elektrik","it":"Elettrauto","ru":"Электрика","ar":"كهرباء سيارات","uk":"Електрика"}},
    {"value":"bodywork","label":{"me":"Limarija / farbanje","sr":"Limarija / farbanje","en":"Bodywork / paint","tr":"Kaporta / boya","de":"Karosserie / Lack","it":"Carrozzeria / vernice","ru":"Кузов / покраска","ar":"سمكرة / دهان","uk":"Кузов / фарбування"}},
    {"value":"tires","label":{"me":"Gume","sr":"Gume","en":"Tires","tr":"Lastik","de":"Reifen","it":"Pneumatici","ru":"Шины","ar":"إطارات","uk":"Шини"}},
    {"value":"detailing","label":{"me":"Detailing / pranje","sr":"Detailing / pranje","en":"Detailing / wash","tr":"Detailing / yıkama","de":"Detailing / Wäsche","it":"Detailing / lavaggio","ru":"Детейлинг / мойка","ar":"تنظيف داخلي / غسيل","uk":"Детейлінг / миття"}},
    {"value":"diagnostic","label":{"me":"Dijagnostika","sr":"Dijagnostika","en":"Diagnostic","tr":"Arıza tespiti","de":"Diagnose","it":"Diagnosi","ru":"Диагностика","ar":"تشخيص","uk":"Діагностика"}}
  ]'::jsonb,
  '{"required":true,"minSelected":1}'::jsonb, NULL, 1, 1, TRUE),

('automotive', 'vehicle_make_model', 'text',
  '{"me":"Marka i model vozila","sr":"Marka i model vozila","en":"Vehicle make and model","tr":"Araç markası ve modeli","de":"Marke und Modell","it":"Marca e modello","ru":"Марка и модель","ar":"الماركة والطراز","uk":"Марка і модель"}'::jsonb,
  '{"me":"npr. VW Golf 7","sr":"npr. VW Golf 7","en":"e.g. VW Golf 7","tr":"örn. VW Golf 7","de":"z.B. VW Golf 7","it":"es. VW Golf 7","ru":"напр. VW Golf 7","ar":"مثلاً VW Golf 7","uk":"напр. VW Golf 7"}'::jsonb,
  NULL, NULL,
  '{"required":true,"maxLength":100}'::jsonb, NULL, 1, 2, TRUE),

('automotive', 'vehicle_year', 'number',
  '{"me":"Godište","sr":"Godište","en":"Year","tr":"Model yılı","de":"Baujahr","it":"Anno","ru":"Год выпуска","ar":"سنة الصنع","uk":"Рік випуску"}'::jsonb,
  '{"me":"npr. 2018","sr":"npr. 2018","en":"e.g. 2018","tr":"örn. 2018","de":"z.B. 2018","it":"es. 2018","ru":"напр. 2018","ar":"مثلاً 2018","uk":"напр. 2018"}'::jsonb,
  NULL, NULL,
  '{"required":true,"min":1950,"max":2030}'::jsonb, NULL, 1, 3, TRUE),

('automotive', 'problem_description', 'textarea',
  '{"me":"Opis problema / potrebnog servisa","sr":"Opis problema / potrebnog servisa","en":"Problem / service description","tr":"Sorun / hizmet açıklaması","de":"Problem- / Servicebeschreibung","it":"Descrizione problema / servizio","ru":"Описание проблемы / услуги","ar":"وصف المشكلة / الخدمة","uk":"Опис проблеми / послуги"}'::jsonb,
  '{"me":"Šta se dešava? Kada počelo?…","sr":"Šta se dešava? Kada počelo?…","en":"What''s happening? When did it start?…","tr":"Sorun nedir? Ne zaman başladı?…","de":"Was ist los? Wann begann es?…","it":"Cosa succede? Da quando?…","ru":"Что происходит? Когда началось?…","ar":"ما الذي يحدث؟ متى بدأ؟…","uk":"Що відбувається? Коли почалося?…"}'::jsonb,
  NULL, NULL,
  '{"required":true,"minLength":20,"maxLength":2000}'::jsonb, NULL, 2, 1, TRUE),

('automotive', 'mobile_or_workshop', 'select',
  '{"me":"Lokacija servisa","sr":"Lokacija servisa","en":"Service location","tr":"Servis yeri","de":"Serviceort","it":"Luogo del servizio","ru":"Место обслуживания","ar":"موقع الخدمة","uk":"Місце обслуговування"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"workshop","label":{"me":"Servisna radionica","sr":"Servisna radionica","en":"Workshop","tr":"Atölye","de":"Werkstatt","it":"Officina","ru":"Автосервис","ar":"الورشة","uk":"Сервіс"}},
    {"value":"mobile","label":{"me":"Dolazak na lokaciju","sr":"Dolazak na lokaciju","en":"Mobile / on-site","tr":"Yerinde","de":"Vor Ort","it":"Sul posto","ru":"Выездной","ar":"خدمة متنقلة","uk":"Виїзний"}},
    {"value":"either","label":{"me":"Bilo koje","sr":"Bilo koje","en":"Either","tr":"Fark etmez","de":"Egal","it":"Indifferente","ru":"Любой","ar":"أي منهما","uk":"Будь-який"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 2, 2, TRUE);


-- ─── 10. airbnb-management (5 questions) ───────────────────────────────────

INSERT INTO public.glatko_request_questions
  (category_slug, question_key, question_type, label, placeholder, help_text,
   options, validation, show_if, step_order, field_order, is_required)
VALUES

('airbnb-management', 'service_type', 'multiselect',
  '{"me":"Potrebne usluge","sr":"Potrebne usluge","en":"Services needed","tr":"Gerekli hizmetler","de":"Benötigte Services","it":"Servizi richiesti","ru":"Нужные услуги","ar":"الخدمات المطلوبة","uk":"Потрібні послуги"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"full_management","label":{"me":"Kompletno upravljanje","sr":"Kompletno upravljanje","en":"Full management","tr":"Tam yönetim","de":"Komplettverwaltung","it":"Gestione completa","ru":"Полное управление","ar":"إدارة كاملة","uk":"Повне управління"}},
    {"value":"checkin_checkout","label":{"me":"Prijava / odjava gostiju","sr":"Prijava / odjava gostiju","en":"Check-in / check-out","tr":"Giriş / çıkış","de":"Check-in / Check-out","it":"Check-in / check-out","ru":"Заселение / выселение","ar":"تسجيل دخول / خروج","uk":"Заїзд / виїзд"}},
    {"value":"turnover_cleaning","label":{"me":"Čišćenje između gostiju","sr":"Čišćenje između gostiju","en":"Turnover cleaning","tr":"Giriş çıkış temizliği","de":"Wechselreinigung","it":"Pulizia turnover","ru":"Уборка между гостями","ar":"تنظيف بين الضيوف","uk":"Прибирання між гостями"}},
    {"value":"listing_photos","label":{"me":"Profesionalne fotografije","sr":"Profesionalne fotografije","en":"Listing photography","tr":"İlan fotoğrafları","de":"Listing-Fotos","it":"Foto annuncio","ru":"Фото для объявления","ar":"تصوير الإعلان","uk":"Фото оголошення"}},
    {"value":"maintenance","label":{"me":"Održavanje","sr":"Održavanje","en":"Maintenance","tr":"Bakım","de":"Wartung","it":"Manutenzione","ru":"Обслуживание","ar":"صيانة","uk":"Обслуговування"}},
    {"value":"booking_management","label":{"me":"Upravljanje rezervacijama","sr":"Upravljanje rezervacijama","en":"Booking management","tr":"Rezervasyon yönetimi","de":"Buchungsverwaltung","it":"Gestione prenotazioni","ru":"Управление бронированиями","ar":"إدارة الحجوزات","uk":"Управління бронюваннями"}}
  ]'::jsonb,
  '{"required":true,"minSelected":1}'::jsonb, NULL, 1, 1, TRUE),

('airbnb-management', 'property_count', 'number',
  '{"me":"Broj nekretnina","sr":"Broj nekretnina","en":"Number of properties","tr":"Mülk sayısı","de":"Anzahl Objekte","it":"Numero di proprietà","ru":"Количество объектов","ar":"عدد العقارات","uk":"Кількість об''єктів"}'::jsonb,
  '{"me":"npr. 1","sr":"npr. 1","en":"e.g. 1","tr":"örn. 1","de":"z.B. 1","it":"es. 1","ru":"напр. 1","ar":"مثلاً 1","uk":"напр. 1"}'::jsonb,
  NULL, NULL,
  '{"required":true,"min":1,"max":200}'::jsonb, NULL, 1, 2, TRUE),

('airbnb-management', 'turnover_per_month', 'select',
  '{"me":"Procjena turnovera mjesečno","sr":"Procena turnovera mesečno","en":"Estimated turnovers per month","tr":"Aylık tahmini değişim","de":"Geschätzte Wechsel/Monat","it":"Turnover stimati al mese","ru":"Турноверов в месяц (оценка)","ar":"تقدير عمليات التبديل شهرياً","uk":"Турноверів на місяць (оцінка)"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"under_5","label":{"me":"Manje od 5","sr":"Manje od 5","en":"Under 5","tr":"5''ten az","de":"Unter 5","it":"Meno di 5","ru":"Менее 5","ar":"أقل من 5","uk":"Менше 5"}},
    {"value":"5_15","label":{"me":"5–15","sr":"5–15","en":"5–15","tr":"5–15","de":"5–15","it":"5–15","ru":"5–15","ar":"5–15","uk":"5–15"}},
    {"value":"15_30","label":{"me":"15–30","sr":"15–30","en":"15–30","tr":"15–30","de":"15–30","it":"15–30","ru":"15–30","ar":"15–30","uk":"15–30"}},
    {"value":"over_30","label":{"me":"Više od 30","sr":"Više od 30","en":"Over 30","tr":"30''dan fazla","de":"Über 30","it":"Più di 30","ru":"Более 30","ar":"أكثر من 30","uk":"Понад 30"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 1, 3, TRUE),

('airbnb-management', 'has_existing_listing', 'select',
  '{"me":"Postojeći oglas?","sr":"Postojeći oglas?","en":"Existing listing?","tr":"Mevcut ilan var mı?","de":"Bestehendes Inserat?","it":"Annuncio esistente?","ru":"Уже есть объявление?","ar":"هل لديك إعلان موجود؟","uk":"Чи є наявне оголошення?"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"airbnb","label":{"me":"Da, na Airbnb","sr":"Da, na Airbnb","en":"Yes, on Airbnb","tr":"Evet, Airbnb''de","de":"Ja, auf Airbnb","it":"Sì, su Airbnb","ru":"Да, на Airbnb","ar":"نعم، على ايربنب","uk":"Так, на Airbnb"}},
    {"value":"booking","label":{"me":"Da, na Booking","sr":"Da, na Booking","en":"Yes, on Booking.com","tr":"Evet, Booking''de","de":"Ja, auf Booking","it":"Sì, su Booking","ru":"Да, на Booking","ar":"نعم، على Booking","uk":"Так, на Booking"}},
    {"value":"both","label":{"me":"Oba","sr":"Oba","en":"Both","tr":"İkisi","de":"Beide","it":"Entrambi","ru":"Оба","ar":"كلاهما","uk":"Обидва"}},
    {"value":"none","label":{"me":"Ne, počinjem od nule","sr":"Ne, počinjem od nule","en":"No, starting fresh","tr":"Hayır, sıfırdan","de":"Nein, neu starten","it":"No, parto da zero","ru":"Нет, начинаю с нуля","ar":"لا، أبدأ من الصفر","uk":"Ні, починаю з нуля"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 2, 1, TRUE),

('airbnb-management', 'property_description', 'textarea',
  '{"me":"Opis nekretnine i očekivanja","sr":"Opis nekretnine i očekivanja","en":"Property + expectations","tr":"Mülk ve beklentiler","de":"Objekt + Erwartungen","it":"Proprietà + aspettative","ru":"Объект и ожидания","ar":"العقار والتوقعات","uk":"Об''єкт і очікування"}'::jsonb,
  '{"me":"Veličina, lokacija, broj soba, sezonalnost…","sr":"Veličina, lokacija, broj soba, sezonalnost…","en":"Size, location, room count, seasonality…","tr":"Büyüklük, konum, oda sayısı, sezon…","de":"Größe, Lage, Zimmer, Saisonalität…","it":"Dimensioni, posizione, stanze, stagionalità…","ru":"Размер, локация, количество комнат, сезонность…","ar":"الحجم، الموقع، عدد الغرف، الموسم…","uk":"Розмір, місце, кількість кімнат, сезонність…"}'::jsonb,
  NULL, NULL,
  '{"maxLength":2000}'::jsonb, NULL, 2, 2, FALSE);

COMMIT;
