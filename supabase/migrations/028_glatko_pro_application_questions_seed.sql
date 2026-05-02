-- ============================================================================
-- 028_glatko_pro_application_questions_seed.sql
-- G-PRO-1 Faz 2: per-category pro application questions, 9-locale eksiksiz.
--
-- 10 root categories × 5-7 questions = ~60 rows. Each row carries the full
-- 9-locale JSONB for label/placeholder/help_text and option labels. Memory
-- item 25: no EN fallback — every locale key is genuinely localized at seed.
--
-- Conventions (G-REQ-1 022 pattern):
--   - step_order 1 = qualifications/specializations
--   - step_order 2 = capacity/scope (team, equipment, areas)
--   - step_order 3 = trust signals (insurance, certifications, references)
--   - field_order is per-step display ordering
--   - validation JSONB carries `required` plus type-specific min/max/maxLength/etc.
--   - is_required boolean is duplicated for fast index-able lookup; JSON is canonical.
--   - show_if encodes conditional visibility (operator one of eq/in/gt/lt).
-- ============================================================================

BEGIN;

-- ─── 1. boat-services (7 questions) ────────────────────────────────────────

INSERT INTO public.glatko_pro_application_questions
  (category_slug, question_key, question_type, label, placeholder, help_text,
   options, validation, show_if, step_order, field_order, is_required)
VALUES

('boat-services', 'license_status', 'select',
  '{"me":"Status pomorske licence","sr":"Status pomorske licence","en":"Marine license status","tr":"Denizcilik lisansı durumu","de":"Schifffahrtslizenz-Status","it":"Stato licenza nautica","ru":"Статус морской лицензии","ar":"حالة الترخيص البحري","uk":"Статус морської ліцензії"}'::jsonb,
  NULL,
  '{"me":"Mnogi pomorski servisi zahtijevaju zvaničnu licencu","sr":"Mnogi pomorski servisi zahtevaju zvaničnu licencu","en":"Many marine services require an official license","tr":"Pek çok denizcilik hizmeti resmi lisans gerektirir","de":"Viele Bootsdienste erfordern eine offizielle Lizenz","it":"Molti servizi nautici richiedono una licenza ufficiale","ru":"Многие морские услуги требуют официальной лицензии","ar":"تتطلب العديد من الخدمات البحرية ترخيصًا رسميًا","uk":"Багато морських послуг потребують офіційної ліцензії"}'::jsonb,
  '[
    {"value":"licensed","label":{"me":"Imam licencu","sr":"Imam licencu","en":"Licensed","tr":"Lisanslı","de":"Lizenziert","it":"Con licenza","ru":"Лицензирован","ar":"مرخص","uk":"Ліцензований"}},
    {"value":"in_progress","label":{"me":"U procesu pribavljanja","sr":"U procesu pribavljanja","en":"In progress","tr":"Süreçte","de":"In Bearbeitung","it":"In corso","ru":"В процессе","ar":"قيد التقدم","uk":"У процесі"}},
    {"value":"not_required","label":{"me":"Nije potrebna","sr":"Nije potrebna","en":"Not required","tr":"Gerekli değil","de":"Nicht erforderlich","it":"Non richiesta","ru":"Не требуется","ar":"غير مطلوب","uk":"Не потрібна"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 1, 1, TRUE),

('boat-services', 'specializations', 'multiselect',
  '{"me":"Specijalizacije","sr":"Specijalizacije","en":"Specializations","tr":"Uzmanlık alanları","de":"Spezialisierungen","it":"Specializzazioni","ru":"Специализации","ar":"التخصصات","uk":"Спеціалізації"}'::jsonb,
  NULL,
  '{"me":"Izaberite sve oblasti u kojima radite","sr":"Izaberite sve oblasti u kojima radite","en":"Select all areas you work in","tr":"Çalıştığınız tüm alanları seçin","de":"Wählen Sie alle Bereiche aus","it":"Seleziona tutte le aree","ru":"Выберите все области","ar":"اختر جميع المجالات","uk":"Виберіть усі сфери"}'::jsonb,
  '[
    {"value":"antifouling","label":{"me":"Antifouling premaz","sr":"Antifouling premaz","en":"Antifouling","tr":"Antifouling","de":"Antifouling","it":"Antifouling","ru":"Антиобрастание","ar":"طلاء مضاد للرواسب","uk":"Антифоулінг"}},
    {"value":"winterization","label":{"me":"Zimovanje plovila","sr":"Zimovanje plovila","en":"Winterization","tr":"Kışlama","de":"Wintereinlagerung","it":"Rimessaggio invernale","ru":"Зимовка","ar":"التخزين الشتوي","uk":"Зимівля"}},
    {"value":"engine","label":{"me":"Motor i mehanika","sr":"Motor i mehanika","en":"Engine & mechanics","tr":"Motor ve mekanik","de":"Motor & Mechanik","it":"Motore e meccanica","ru":"Двигатель и механика","ar":"المحرك والميكانيكا","uk":"Двигун та механіка"}},
    {"value":"electronics","label":{"me":"Elektronika","sr":"Elektronika","en":"Electronics","tr":"Elektronik","de":"Elektronik","it":"Elettronica","ru":"Электроника","ar":"الإلكترونيات","uk":"Електроніка"}},
    {"value":"sails","label":{"me":"Jedra i takelaža","sr":"Jedra i takelaža","en":"Sails & rigging","tr":"Yelken ve donanım","de":"Segel & Takelung","it":"Vele e attrezzature","ru":"Паруса и такелаж","ar":"الأشرعة والتجهيزات","uk":"Вітрила та такелаж"}},
    {"value":"interior","label":{"me":"Enterijer i tapaciranje","sr":"Enterijer i tapaciranje","en":"Interior & upholstery","tr":"İç mekan ve döşeme","de":"Innenraum & Polsterung","it":"Interni e tappezzeria","ru":"Интерьер и обивка","ar":"الداخل والتنجيد","uk":"Інтерʼєр та оббивка"}}
  ]'::jsonb,
  '{"required":true,"minSelected":1}'::jsonb, NULL, 1, 2, TRUE),

('boat-services', 'years_in_marine_services', 'number',
  '{"me":"Godine iskustva u pomorstvu","sr":"Godine iskustva u pomorstvu","en":"Years in marine services","tr":"Denizcilik hizmetlerinde yıl","de":"Jahre in Bootsdiensten","it":"Anni nel settore nautico","ru":"Лет опыта в морских услугах","ar":"سنوات الخبرة البحرية","uk":"Років у морських послугах"}'::jsonb,
  '{"me":"npr. 5","sr":"npr. 5","en":"e.g. 5","tr":"örn. 5","de":"z.B. 5","it":"es. 5","ru":"напр. 5","ar":"مثلاً 5","uk":"напр. 5"}'::jsonb,
  NULL, NULL,
  '{"required":true,"min":0,"max":60}'::jsonb, NULL, 1, 3, TRUE),

('boat-services', 'equipment_owned', 'multiselect',
  '{"me":"Posjedujem opremu","sr":"Posjedujem opremu","en":"Equipment owned","tr":"Sahip olduğum ekipmanlar","de":"Eigene Ausrüstung","it":"Attrezzature di proprietà","ru":"Своё оборудование","ar":"المعدات المملوكة","uk":"Власне обладнання"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"own_workshop","label":{"me":"Vlastita radionica","sr":"Vlastita radionica","en":"Own workshop","tr":"Kendi atölyem","de":"Eigene Werkstatt","it":"Officina propria","ru":"Своя мастерская","ar":"ورشة خاصة","uk":"Власна майстерня"}},
    {"value":"portable_tools","label":{"me":"Prijenosni alat","sr":"Prijenosni alat","en":"Portable tools","tr":"Taşınabilir aletler","de":"Tragbare Werkzeuge","it":"Attrezzi portatili","ru":"Переносные инструменты","ar":"أدوات محمولة","uk":"Переносні інструменти"}},
    {"value":"specialized_machinery","label":{"me":"Specijalizirane mašine","sr":"Specijalizovane mašine","en":"Specialized machinery","tr":"Özel makineler","de":"Spezialmaschinen","it":"Macchinari specializzati","ru":"Специализированные станки","ar":"آلات متخصصة","uk":"Спеціалізовані машини"}},
    {"value":"diving_gear","label":{"me":"Ronilačka oprema","sr":"Ronilačka oprema","en":"Diving gear","tr":"Dalış ekipmanı","de":"Tauchausrüstung","it":"Attrezzatura subacquea","ru":"Снаряжение для дайвинга","ar":"معدات الغوص","uk":"Спорядження для дайвінгу"}}
  ]'::jsonb,
  '{"required":true,"minSelected":1}'::jsonb, NULL, 2, 1, TRUE),

('boat-services', 'service_areas', 'multiselect',
  '{"me":"Područja u kojima nudim usluge","sr":"Područja u kojima nudim usluge","en":"Service areas","tr":"Hizmet bölgeleri","de":"Servicegebiete","it":"Aree di servizio","ru":"Регионы обслуживания","ar":"مناطق الخدمة","uk":"Регіони обслуговування"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"budva","label":{"me":"Budva","sr":"Budva","en":"Budva","tr":"Budva","de":"Budva","it":"Budva","ru":"Будва","ar":"بودفا","uk":"Будва"}},
    {"value":"kotor","label":{"me":"Kotor","sr":"Kotor","en":"Kotor","tr":"Kotor","de":"Kotor","it":"Cattaro","ru":"Котор","ar":"كوتور","uk":"Котор"}},
    {"value":"tivat","label":{"me":"Tivat","sr":"Tivat","en":"Tivat","tr":"Tivat","de":"Tivat","it":"Teodo","ru":"Тиват","ar":"تيفات","uk":"Тіват"}},
    {"value":"bar","label":{"me":"Bar","sr":"Bar","en":"Bar","tr":"Bar","de":"Bar","it":"Antivari","ru":"Бар","ar":"بار","uk":"Бар"}},
    {"value":"herceg-novi","label":{"me":"Herceg Novi","sr":"Herceg Novi","en":"Herceg Novi","tr":"Herceg Novi","de":"Herceg Novi","it":"Castelnuovo","ru":"Херцег-Нови","ar":"هرسج نوفي","uk":"Херцег-Нові"}},
    {"value":"ulcinj","label":{"me":"Ulcinj","sr":"Ulcinj","en":"Ulcinj","tr":"Ulcinj","de":"Ulcinj","it":"Dulcigno","ru":"Улцинь","ar":"أولتسين","uk":"Улцинь"}}
  ]'::jsonb,
  '{"required":true,"minSelected":1}'::jsonb, NULL, 2, 2, TRUE),

('boat-services', 'certifications', 'textarea',
  '{"me":"Sertifikati i licence","sr":"Sertifikati i licence","en":"Certifications & licenses","tr":"Sertifikalar ve lisanslar","de":"Zertifikate & Lizenzen","it":"Certificazioni e licenze","ru":"Сертификаты и лицензии","ar":"الشهادات والتراخيص","uk":"Сертифікати та ліцензії"}'::jsonb,
  '{"me":"Navedi brojeve sertifikata, osiguranja…","sr":"Navedi brojeve sertifikata, osiguranja…","en":"List certification numbers, insurance…","tr":"Sertifika no, sigorta no listele…","de":"Listen Sie Zertifikatsnummern, Versicherungen…","it":"Elenca numeri certificati, assicurazione…","ru":"Перечислите номера сертификатов, страховку…","ar":"اذكر أرقام الشهادات والتأمين…","uk":"Вкажіть номери сертифікатів, страхування…"}'::jsonb,
  NULL, NULL,
  '{"maxLength":1000}'::jsonb, NULL, 3, 1, FALSE),

('boat-services', 'emergency_response', 'select',
  '{"me":"24/7 hitne intervencije","sr":"24/7 hitne intervencije","en":"24/7 emergency response","tr":"7/24 acil servis","de":"24/7 Notfallservice","it":"Pronto intervento 24/7","ru":"Экстренный вызов 24/7","ar":"الاستجابة الطارئة 24/7","uk":"Аварійний виклик 24/7"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"yes","label":{"me":"Da, dostupan 24/7","sr":"Da, dostupan 24/7","en":"Yes, 24/7","tr":"Evet, 7/24","de":"Ja, 24/7","it":"Sì, 24/7","ru":"Да, 24/7","ar":"نعم، 24/7","uk":"Так, 24/7"}},
    {"value":"business_hours","label":{"me":"Samo radnim vremenom","sr":"Samo radnim vremenom","en":"Business hours only","tr":"Sadece mesai saatleri","de":"Nur Geschäftszeiten","it":"Solo orari di ufficio","ru":"Только в рабочее время","ar":"خلال ساعات العمل فقط","uk":"Лише в робочий час"}},
    {"value":"no","label":{"me":"Ne","sr":"Ne","en":"No","tr":"Hayır","de":"Nein","it":"No","ru":"Нет","ar":"لا","uk":"Ні"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 3, 2, TRUE);


-- ─── 2. home-cleaning (5 questions) ────────────────────────────────────────

INSERT INTO public.glatko_pro_application_questions
  (category_slug, question_key, question_type, label, placeholder, help_text,
   options, validation, show_if, step_order, field_order, is_required)
VALUES

('home-cleaning', 'eco_products', 'select',
  '{"me":"Koristim eko proizvode","sr":"Koristim eko proizvode","en":"I use eco-friendly products","tr":"Çevre dostu ürünler kullanırım","de":"Ich verwende Bio-Produkte","it":"Uso prodotti ecologici","ru":"Использую эко-средства","ar":"أستخدم منتجات صديقة للبيئة","uk":"Використовую еко-засоби"}'::jsonb,
  NULL,
  '{"me":"Klijenti često traže netoksične opcije","sr":"Klijenti često traže netoksične opcije","en":"Clients often request non-toxic options","tr":"Müşteriler genellikle toksik olmayan ürünler ister","de":"Kunden bevorzugen oft nicht-toxische Produkte","it":"I clienti spesso preferiscono prodotti non tossici","ru":"Клиенты часто просят нетоксичные средства","ar":"يفضل العملاء غالبًا منتجات غير سامة","uk":"Клієнти часто просять нетоксичні засоби"}'::jsonb,
  '[
    {"value":"always","label":{"me":"Uvijek","sr":"Uvek","en":"Always","tr":"Her zaman","de":"Immer","it":"Sempre","ru":"Всегда","ar":"دائمًا","uk":"Завжди"}},
    {"value":"on_request","label":{"me":"Na zahtjev","sr":"Na zahtev","en":"On request","tr":"Talep üzerine","de":"Auf Anfrage","it":"Su richiesta","ru":"По запросу","ar":"عند الطلب","uk":"За запитом"}},
    {"value":"no","label":{"me":"Ne","sr":"Ne","en":"No","tr":"Hayır","de":"Nein","it":"No","ru":"Нет","ar":"لا","uk":"Ні"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 1, 1, TRUE),

('home-cleaning', 'team_size', 'select',
  '{"me":"Veličina tima","sr":"Veličina tima","en":"Team size","tr":"Ekip boyutu","de":"Teamgröße","it":"Dimensione del team","ru":"Размер команды","ar":"حجم الفريق","uk":"Розмір команди"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"solo","label":{"me":"Sam radim","sr":"Sam radim","en":"Solo","tr":"Tek başına","de":"Alleine","it":"Da solo","ru":"Один","ar":"بمفردي","uk":"Сам"}},
    {"value":"2_3","label":{"me":"2-3 osobe","sr":"2-3 osobe","en":"2-3 people","tr":"2-3 kişi","de":"2-3 Personen","it":"2-3 persone","ru":"2-3 человека","ar":"2-3 أشخاص","uk":"2-3 людини"}},
    {"value":"4_plus","label":{"me":"4 ili više","sr":"4 ili više","en":"4 or more","tr":"4+ kişi","de":"4 oder mehr","it":"4 o più","ru":"4 и более","ar":"4 أو أكثر","uk":"4 та більше"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 1, 2, TRUE),

('home-cleaning', 'own_supplies', 'select',
  '{"me":"Donosim svoju opremu i sredstva","sr":"Donosim svoju opremu i sredstva","en":"I bring my own supplies","tr":"Kendi malzemelerimi getiririm","de":"Ich bringe eigene Materialien","it":"Porto i miei prodotti","ru":"Приношу свой инвентарь","ar":"أحضر أدواتي الخاصة","uk":"Приношу свій інвентар"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"yes","label":{"me":"Da","sr":"Da","en":"Yes","tr":"Evet","de":"Ja","it":"Sì","ru":"Да","ar":"نعم","uk":"Так"}},
    {"value":"client_provides","label":{"me":"Klijent obezbjeđuje","sr":"Klijent obezbeđuje","en":"Client provides","tr":"Müşteri sağlar","de":"Kunde stellt","it":"Il cliente fornisce","ru":"Клиент предоставляет","ar":"يوفرها العميل","uk":"Клієнт надає"}},
    {"value":"flexible","label":{"me":"Fleksibilno","sr":"Fleksibilno","en":"Flexible","tr":"Esnek","de":"Flexibel","it":"Flessibile","ru":"Гибко","ar":"مرن","uk":"Гнучко"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 2, 1, TRUE),

('home-cleaning', 'specializations', 'multiselect',
  '{"me":"Specijalizacije","sr":"Specijalizacije","en":"Specializations","tr":"Uzmanlık alanları","de":"Spezialisierungen","it":"Specializzazioni","ru":"Специализации","ar":"التخصصات","uk":"Спеціалізації"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"airbnb","label":{"me":"Airbnb između gostiju","sr":"Airbnb između gostiju","en":"Airbnb turnover","tr":"Airbnb dönüş","de":"Airbnb-Wechsel","it":"Airbnb turnover","ru":"Airbnb уборка","ar":"تنظيف ايربنب","uk":"Airbnb прибирання"}},
    {"value":"deep_clean","label":{"me":"Detaljno čišćenje","sr":"Detaljno čišćenje","en":"Deep cleaning","tr":"Detaylı temizlik","de":"Grundreinigung","it":"Pulizia profonda","ru":"Генеральная уборка","ar":"تنظيف عميق","uk":"Глибоке прибирання"}},
    {"value":"post_construction","label":{"me":"Nakon građevinskih radova","sr":"Nakon građevinskih radova","en":"Post-construction","tr":"İnşaat sonrası","de":"Nach Bauarbeiten","it":"Dopo lavori","ru":"После ремонта","ar":"بعد البناء","uk":"Після ремонту"}},
    {"value":"window_glass","label":{"me":"Prozori i staklo","sr":"Prozori i staklo","en":"Windows & glass","tr":"Pencere ve cam","de":"Fenster & Glas","it":"Finestre e vetri","ru":"Окна и стекло","ar":"النوافذ والزجاج","uk":"Вікна та скло"}},
    {"value":"office","label":{"me":"Kancelarije","sr":"Kancelarije","en":"Offices","tr":"Ofisler","de":"Büros","it":"Uffici","ru":"Офисы","ar":"المكاتب","uk":"Офіси"}}
  ]'::jsonb,
  '{"required":true,"minSelected":1}'::jsonb, NULL, 2, 2, TRUE),

('home-cleaning', 'insurance', 'select',
  '{"me":"Profesionalno osiguranje","sr":"Profesionalno osiguranje","en":"Professional insurance","tr":"Profesyonel sigorta","de":"Berufshaftpflicht","it":"Assicurazione professionale","ru":"Профессиональная страховка","ar":"تأمين مهني","uk":"Професійна страховка"}'::jsonb,
  NULL,
  '{"me":"Pokriva eventualnu štetu klijenta","sr":"Pokriva eventualnu štetu klijenta","en":"Covers accidental client property damage","tr":"Müşteri mülküne kazara verilen hasarı kapsar","de":"Deckt versehentliche Schäden am Kundeneigentum","it":"Copre danni accidentali alla proprietà del cliente","ru":"Покрывает случайный ущерб имуществу клиента","ar":"يغطي الأضرار العرضية لممتلكات العميل","uk":"Покриває випадкові пошкодження майна клієнта"}'::jsonb,
  '[
    {"value":"yes","label":{"me":"Da, imam","sr":"Da, imam","en":"Yes","tr":"Evet","de":"Ja","it":"Sì","ru":"Да","ar":"نعم","uk":"Так"}},
    {"value":"applying","label":{"me":"Apliciram","sr":"Apliciram","en":"Applying","tr":"Başvuruda","de":"In Beantragung","it":"In richiesta","ru":"Оформляется","ar":"قيد التقديم","uk":"Подаю заявку"}},
    {"value":"no","label":{"me":"Ne","sr":"Ne","en":"No","tr":"Hayır","de":"Nein","it":"No","ru":"Нет","ar":"لا","uk":"Ні"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 3, 1, TRUE);


-- ─── 3. beauty-wellness (6 questions) ──────────────────────────────────────

INSERT INTO public.glatko_pro_application_questions
  (category_slug, question_key, question_type, label, placeholder, help_text,
   options, validation, show_if, step_order, field_order, is_required)
VALUES

('beauty-wellness', 'license_status', 'select',
  '{"me":"Profesionalna licenca","sr":"Profesionalna licenca","en":"Professional license","tr":"Mesleki lisans","de":"Berufslizenz","it":"Licenza professionale","ru":"Профессиональная лицензия","ar":"الترخيص المهني","uk":"Професійна ліцензія"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"licensed","label":{"me":"Imam","sr":"Imam","en":"Licensed","tr":"Lisanslı","de":"Lizenziert","it":"Con licenza","ru":"Лицензирован","ar":"مرخص","uk":"Ліцензований"}},
    {"value":"in_progress","label":{"me":"U procesu","sr":"U procesu","en":"In progress","tr":"Süreçte","de":"In Bearbeitung","it":"In corso","ru":"В процессе","ar":"قيد التقدم","uk":"У процесі"}},
    {"value":"trained_only","label":{"me":"Samo edukacija","sr":"Samo edukacija","en":"Trained only","tr":"Sadece eğitim","de":"Nur Ausbildung","it":"Solo formazione","ru":"Только обучение","ar":"تدريب فقط","uk":"Лише навчання"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 1, 1, TRUE),

('beauty-wellness', 'specializations', 'multiselect',
  '{"me":"Tretmani koje pružam","sr":"Tretmani koje pružam","en":"Treatments offered","tr":"Sunulan tedaviler","de":"Angebotene Behandlungen","it":"Trattamenti offerti","ru":"Предлагаемые услуги","ar":"العلاجات المقدمة","uk":"Послуги, що надаються"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"hair","label":{"me":"Frizerske usluge","sr":"Frizerske usluge","en":"Hair services","tr":"Saç hizmetleri","de":"Haar-Services","it":"Servizi capelli","ru":"Услуги для волос","ar":"خدمات الشعر","uk":"Послуги для волосся"}},
    {"value":"nails","label":{"me":"Nokti","sr":"Nokti","en":"Nails","tr":"Tırnak","de":"Nägel","it":"Unghie","ru":"Маникюр","ar":"الأظافر","uk":"Нігті"}},
    {"value":"facial","label":{"me":"Tretmani lica","sr":"Tretmani lica","en":"Facial","tr":"Yüz bakımı","de":"Gesichtsbehandlung","it":"Trattamenti viso","ru":"Уход за лицом","ar":"العناية بالوجه","uk":"Догляд за обличчям"}},
    {"value":"massage","label":{"me":"Masaža","sr":"Masaža","en":"Massage","tr":"Masaj","de":"Massage","it":"Massaggio","ru":"Массаж","ar":"التدليك","uk":"Масаж"}},
    {"value":"makeup","label":{"me":"Makeup","sr":"Makeup","en":"Makeup","tr":"Makyaj","de":"Make-up","it":"Trucco","ru":"Макияж","ar":"المكياج","uk":"Макіяж"}},
    {"value":"waxing","label":{"me":"Depilacija","sr":"Depilacija","en":"Waxing","tr":"Ağda","de":"Waxing","it":"Ceretta","ru":"Эпиляция","ar":"إزالة الشعر بالشمع","uk":"Епіляція"}}
  ]'::jsonb,
  '{"required":true,"minSelected":1}'::jsonb, NULL, 1, 2, TRUE),

('beauty-wellness', 'own_studio', 'select',
  '{"me":"Imam vlastiti studio","sr":"Imam vlastiti studio","en":"I have my own studio","tr":"Kendi stüdyom var","de":"Eigenes Studio","it":"Studio proprio","ru":"Своя студия","ar":"لدي استوديو خاص","uk":"Власна студія"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"yes","label":{"me":"Da","sr":"Da","en":"Yes","tr":"Evet","de":"Ja","it":"Sì","ru":"Да","ar":"نعم","uk":"Так"}},
    {"value":"shared","label":{"me":"Dijelim prostor","sr":"Delim prostor","en":"Shared space","tr":"Ortak mekan","de":"Gemeinschaftsraum","it":"Spazio condiviso","ru":"Делю помещение","ar":"مساحة مشتركة","uk":"Спільне приміщення"}},
    {"value":"home_based","label":{"me":"Iz kuće","sr":"Iz kuće","en":"Home-based","tr":"Ev ortamında","de":"Zuhause","it":"A domicilio","ru":"На дому","ar":"من المنزل","uk":"З дому"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 2, 1, TRUE),

('beauty-wellness', 'mobile_service', 'select',
  '{"me":"Mobilna usluga (kod klijenta)","sr":"Mobilna usluga (kod klijenta)","en":"Mobile service (at client''s home)","tr":"Mobil hizmet (müşteri evinde)","de":"Mobile Dienstleistung","it":"Servizio mobile","ru":"Мобильная услуга (на дому)","ar":"خدمة متنقلة (في منزل العميل)","uk":"Мобільна послуга (вдома)"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"yes","label":{"me":"Da","sr":"Da","en":"Yes","tr":"Evet","de":"Ja","it":"Sì","ru":"Да","ar":"نعم","uk":"Так"}},
    {"value":"no","label":{"me":"Ne","sr":"Ne","en":"No","tr":"Hayır","de":"Nein","it":"No","ru":"Нет","ar":"لا","uk":"Ні"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 2, 2, TRUE),

('beauty-wellness', 'products_brand', 'textarea',
  '{"me":"Brendovi proizvoda koje koristim","sr":"Brendovi proizvoda koje koristim","en":"Product brands I use","tr":"Kullandığım ürün markaları","de":"Verwendete Produktmarken","it":"Marche di prodotti utilizzati","ru":"Бренды используемых продуктов","ar":"العلامات التجارية المستخدمة","uk":"Бренди продуктів, які використовую"}'::jsonb,
  '{"me":"npr. L''Oréal Professional, Wella, OPI…","sr":"npr. L''Oréal Professional, Wella, OPI…","en":"e.g. L''Oréal Professional, Wella, OPI…","tr":"örn. L''Oréal Professional, Wella, OPI…","de":"z.B. L''Oréal Professional, Wella, OPI…","it":"es. L''Oréal Professional, Wella, OPI…","ru":"напр. L''Oréal Professional, Wella, OPI…","ar":"مثل L''Oréal Professional، Wella، OPI…","uk":"напр. L''Oréal Professional, Wella, OPI…"}'::jsonb,
  NULL, NULL,
  '{"maxLength":500}'::jsonb, NULL, 3, 1, FALSE),

('beauty-wellness', 'years_experience_beauty', 'number',
  '{"me":"Godine iskustva u struci","sr":"Godine iskustva u struci","en":"Years of experience","tr":"Mesleki deneyim yılı","de":"Berufsjahre","it":"Anni di esperienza","ru":"Лет опыта","ar":"سنوات الخبرة","uk":"Років досвіду"}'::jsonb,
  '{"me":"npr. 5","sr":"npr. 5","en":"e.g. 5","tr":"örn. 5","de":"z.B. 5","it":"es. 5","ru":"напр. 5","ar":"مثلاً 5","uk":"напр. 5"}'::jsonb,
  NULL, NULL,
  '{"required":true,"min":0,"max":60}'::jsonb, NULL, 3, 2, TRUE);


-- ─── 4. renovation-construction (7 questions) ──────────────────────────────

INSERT INTO public.glatko_pro_application_questions
  (category_slug, question_key, question_type, label, placeholder, help_text,
   options, validation, show_if, step_order, field_order, is_required)
VALUES

('renovation-construction', 'project_types', 'multiselect',
  '{"me":"Tipovi projekata","sr":"Tipovi projekata","en":"Project types","tr":"Proje türleri","de":"Projektarten","it":"Tipi di progetto","ru":"Типы проектов","ar":"أنواع المشاريع","uk":"Типи проєктів"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"full_renovation","label":{"me":"Kompletna renovacija","sr":"Kompletna renovacija","en":"Full renovation","tr":"Komple tadilat","de":"Komplettrenovierung","it":"Ristrutturazione completa","ru":"Полный ремонт","ar":"تجديد كامل","uk":"Повний ремонт"}},
    {"value":"bathroom","label":{"me":"Kupatilo","sr":"Kupatilo","en":"Bathroom","tr":"Banyo","de":"Badezimmer","it":"Bagno","ru":"Ванная","ar":"الحمام","uk":"Ванна кімната"}},
    {"value":"kitchen","label":{"me":"Kuhinja","sr":"Kuhinja","en":"Kitchen","tr":"Mutfak","de":"Küche","it":"Cucina","ru":"Кухня","ar":"المطبخ","uk":"Кухня"}},
    {"value":"painting","label":{"me":"Krečenje","sr":"Krečenje","en":"Painting","tr":"Boyama","de":"Malerarbeiten","it":"Pittura","ru":"Покраска","ar":"الدهان","uk":"Фарбування"}},
    {"value":"flooring","label":{"me":"Podovi","sr":"Podovi","en":"Flooring","tr":"Zemin","de":"Bodenbeläge","it":"Pavimentazione","ru":"Полы","ar":"الأرضيات","uk":"Підлоги"}},
    {"value":"electrical","label":{"me":"Elektroinstalacije","sr":"Elektroinstalacije","en":"Electrical","tr":"Elektrik","de":"Elektrik","it":"Elettrico","ru":"Электрика","ar":"الكهرباء","uk":"Електрика"}},
    {"value":"plumbing","label":{"me":"Vodoinstalacije","sr":"Vodoinstalacije","en":"Plumbing","tr":"Su tesisatı","de":"Sanitär","it":"Idraulica","ru":"Сантехника","ar":"السباكة","uk":"Сантехніка"}}
  ]'::jsonb,
  '{"required":true,"minSelected":1}'::jsonb, NULL, 1, 1, TRUE),

('renovation-construction', 'team_size', 'select',
  '{"me":"Veličina tima","sr":"Veličina tima","en":"Team size","tr":"Ekip boyutu","de":"Teamgröße","it":"Dimensione del team","ru":"Размер команды","ar":"حجم الفريق","uk":"Розмір команди"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"solo","label":{"me":"Sam radim","sr":"Sam radim","en":"Solo","tr":"Tek başına","de":"Alleine","it":"Da solo","ru":"Один","ar":"بمفردي","uk":"Сам"}},
    {"value":"small","label":{"me":"2-4 osobe","sr":"2-4 osobe","en":"2-4 people","tr":"2-4 kişi","de":"2-4 Personen","it":"2-4 persone","ru":"2-4 человека","ar":"2-4 أشخاص","uk":"2-4 людини"}},
    {"value":"medium","label":{"me":"5-10 osoba","sr":"5-10 osoba","en":"5-10 people","tr":"5-10 kişi","de":"5-10 Personen","it":"5-10 persone","ru":"5-10 человек","ar":"5-10 أشخاص","uk":"5-10 людей"}},
    {"value":"large","label":{"me":"10+ osoba","sr":"10+ osoba","en":"10+ people","tr":"10+ kişi","de":"10+ Personen","it":"10+ persone","ru":"10+ человек","ar":"10+ أشخاص","uk":"10+ людей"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 1, 2, TRUE),

('renovation-construction', 'permits_handling', 'select',
  '{"me":"Pomažem oko građevinskih dozvola","sr":"Pomažem oko građevinskih dozvola","en":"I help with building permits","tr":"İnşaat ruhsatı konusunda yardımcı olurum","de":"Hilfe bei Baugenehmigungen","it":"Aiuto con i permessi","ru":"Помогаю с разрешениями","ar":"أساعد في التصاريح","uk":"Допомагаю з дозволами"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"yes","label":{"me":"Da","sr":"Da","en":"Yes","tr":"Evet","de":"Ja","it":"Sì","ru":"Да","ar":"نعم","uk":"Так"}},
    {"value":"refer_partner","label":{"me":"Imam partnera","sr":"Imam partnera","en":"I refer a partner","tr":"Partnere yönlendiriyorum","de":"Empfehle einen Partner","it":"Indirizzo un partner","ru":"Направляю к партнёру","ar":"أحيل إلى شريك","uk":"Направляю до партнера"}},
    {"value":"no","label":{"me":"Ne","sr":"Ne","en":"No","tr":"Hayır","de":"Nein","it":"No","ru":"Нет","ar":"لا","uk":"Ні"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 1, 3, TRUE),

('renovation-construction', 'equipment', 'multiselect',
  '{"me":"Posjedujem opremu","sr":"Posjedujem opremu","en":"Equipment owned","tr":"Sahip olduğum ekipman","de":"Eigene Ausrüstung","it":"Attrezzature di proprietà","ru":"Своё оборудование","ar":"المعدات المملوكة","uk":"Власне обладнання"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"basic_tools","label":{"me":"Osnovni alat","sr":"Osnovni alat","en":"Basic tools","tr":"Temel aletler","de":"Grundwerkzeuge","it":"Attrezzi base","ru":"Базовый инструмент","ar":"أدوات أساسية","uk":"Базовий інструмент"}},
    {"value":"power_tools","label":{"me":"Električni alati","sr":"Električni alati","en":"Power tools","tr":"Elektrikli aletler","de":"Elektrowerkzeuge","it":"Utensili elettrici","ru":"Электроинструмент","ar":"أدوات كهربائية","uk":"Електроінструмент"}},
    {"value":"scaffolding","label":{"me":"Skele","sr":"Skele","en":"Scaffolding","tr":"İskele","de":"Gerüst","it":"Impalcatura","ru":"Леса","ar":"السقالات","uk":"Риштування"}},
    {"value":"truck","label":{"me":"Vozilo / kombi","sr":"Vozilo / kombi","en":"Truck / van","tr":"Kamyonet","de":"LKW / Transporter","it":"Camion / furgone","ru":"Грузовик / фургон","ar":"شاحنة / فان","uk":"Вантажівка / фургон"}}
  ]'::jsonb,
  '{"required":true,"minSelected":1}'::jsonb, NULL, 2, 1, TRUE),

('renovation-construction', 'typical_duration', 'select',
  '{"me":"Tipično trajanje projekta","sr":"Tipično trajanje projekta","en":"Typical project duration","tr":"Tipik proje süresi","de":"Typische Projektdauer","it":"Durata tipica del progetto","ru":"Типичная длительность проекта","ar":"مدة المشروع النموذجية","uk":"Типова тривалість проєкту"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"days","label":{"me":"Nekoliko dana","sr":"Nekoliko dana","en":"Few days","tr":"Birkaç gün","de":"Einige Tage","it":"Pochi giorni","ru":"Несколько дней","ar":"أيام قليلة","uk":"Кілька днів"}},
    {"value":"weeks","label":{"me":"1-4 nedjelje","sr":"1-4 nedelje","en":"1-4 weeks","tr":"1-4 hafta","de":"1-4 Wochen","it":"1-4 settimane","ru":"1-4 недели","ar":"1-4 أسابيع","uk":"1-4 тижні"}},
    {"value":"months","label":{"me":"1-6 mjeseci","sr":"1-6 meseci","en":"1-6 months","tr":"1-6 ay","de":"1-6 Monate","it":"1-6 mesi","ru":"1-6 месяцев","ar":"1-6 أشهر","uk":"1-6 місяців"}},
    {"value":"long_term","label":{"me":"6+ mjeseci","sr":"6+ meseci","en":"6+ months","tr":"6+ ay","de":"6+ Monate","it":"6+ mesi","ru":"6+ месяцев","ar":"6+ أشهر","uk":"6+ місяців"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 2, 2, TRUE),

('renovation-construction', 'insurance', 'select',
  '{"me":"Profesionalno osiguranje","sr":"Profesionalno osiguranje","en":"Professional insurance","tr":"Profesyonel sigorta","de":"Berufshaftpflicht","it":"Assicurazione professionale","ru":"Профессиональная страховка","ar":"التأمين المهني","uk":"Професійна страховка"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"yes","label":{"me":"Da","sr":"Da","en":"Yes","tr":"Evet","de":"Ja","it":"Sì","ru":"Да","ar":"نعم","uk":"Так"}},
    {"value":"applying","label":{"me":"Apliciram","sr":"Apliciram","en":"Applying","tr":"Başvuruda","de":"In Beantragung","it":"In richiesta","ru":"Оформляется","ar":"قيد التقديم","uk":"Подаю заявку"}},
    {"value":"no","label":{"me":"Ne","sr":"Ne","en":"No","tr":"Hayır","de":"Nein","it":"No","ru":"Нет","ar":"لا","uk":"Ні"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 3, 1, TRUE),

('renovation-construction', 'past_projects', 'textarea',
  '{"me":"Opis prethodnih projekata","sr":"Opis prethodnih projekata","en":"Past projects description","tr":"Geçmiş projeler açıklaması","de":"Beschreibung früherer Projekte","it":"Descrizione progetti passati","ru":"Описание прошлых проектов","ar":"وصف المشاريع السابقة","uk":"Опис попередніх проєктів"}'::jsonb,
  '{"me":"Kratko opišite 2-3 reprezentativna projekta","sr":"Kratko opišite 2-3 reprezentativna projekta","en":"Briefly describe 2-3 representative projects","tr":"2-3 örnek projeyi kısaca anlatın","de":"Beschreiben Sie 2-3 typische Projekte","it":"Descrivi 2-3 progetti rappresentativi","ru":"Кратко опишите 2-3 проекта","ar":"صف باختصار 2-3 مشاريع","uk":"Опишіть 2-3 типові проєкти"}'::jsonb,
  NULL, NULL,
  '{"maxLength":1500}'::jsonb, NULL, 3, 2, FALSE);


-- ─── 5. catering-food (6 questions) ────────────────────────────────────────

INSERT INTO public.glatko_pro_application_questions
  (category_slug, question_key, question_type, label, placeholder, help_text,
   options, validation, show_if, step_order, field_order, is_required)
VALUES

('catering-food', 'cuisine_specialties', 'multiselect',
  '{"me":"Specijaliteti kuhinje","sr":"Specijaliteti kuhinje","en":"Cuisine specialties","tr":"Mutfak uzmanlıkları","de":"Küchenspezialitäten","it":"Specialità culinarie","ru":"Кулинарные специализации","ar":"تخصصات المطبخ","uk":"Кулінарні спеціалізації"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"montenegrin","label":{"me":"Crnogorska","sr":"Crnogorska","en":"Montenegrin","tr":"Karadağ","de":"Montenegrinisch","it":"Montenegrina","ru":"Черногорская","ar":"الجبل الأسود","uk":"Чорногорська"}},
    {"value":"mediterranean","label":{"me":"Mediteranska","sr":"Mediteranska","en":"Mediterranean","tr":"Akdeniz","de":"Mediterran","it":"Mediterranea","ru":"Средиземноморская","ar":"البحر المتوسط","uk":"Середземноморська"}},
    {"value":"italian","label":{"me":"Italijanska","sr":"Italijanska","en":"Italian","tr":"İtalyan","de":"Italienisch","it":"Italiana","ru":"Итальянская","ar":"الإيطالية","uk":"Італійська"}},
    {"value":"turkish","label":{"me":"Turska","sr":"Turska","en":"Turkish","tr":"Türk","de":"Türkisch","it":"Turca","ru":"Турецкая","ar":"التركية","uk":"Турецька"}},
    {"value":"asian","label":{"me":"Azijska","sr":"Azijska","en":"Asian","tr":"Asya","de":"Asiatisch","it":"Asiatica","ru":"Азиатская","ar":"الآسيوية","uk":"Азійська"}},
    {"value":"bbq_grill","label":{"me":"Roštilj","sr":"Roštilj","en":"BBQ / grill","tr":"Mangal","de":"BBQ / Grill","it":"BBQ / griglia","ru":"Барбекю","ar":"الشواء","uk":"Барбекю"}},
    {"value":"desserts","label":{"me":"Dezerti","sr":"Dezerti","en":"Desserts","tr":"Tatlılar","de":"Desserts","it":"Dolci","ru":"Десерты","ar":"الحلويات","uk":"Десерти"}}
  ]'::jsonb,
  '{"required":true,"minSelected":1}'::jsonb, NULL, 1, 1, TRUE),

('catering-food', 'dietary_options', 'multiselect',
  '{"me":"Specijalne dijete","sr":"Specijalne dijete","en":"Dietary options","tr":"Özel diyetler","de":"Spezielle Diäten","it":"Opzioni dietetiche","ru":"Диетические опции","ar":"الخيارات الغذائية","uk":"Дієтичні опції"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"vegetarian","label":{"me":"Vegetarijanska","sr":"Vegetarijanska","en":"Vegetarian","tr":"Vejetaryen","de":"Vegetarisch","it":"Vegetariana","ru":"Вегетарианская","ar":"نباتي","uk":"Вегетаріанська"}},
    {"value":"vegan","label":{"me":"Veganska","sr":"Veganska","en":"Vegan","tr":"Vegan","de":"Vegan","it":"Vegana","ru":"Веганская","ar":"نباتي صرف","uk":"Веганська"}},
    {"value":"gluten_free","label":{"me":"Bez glutena","sr":"Bez glutena","en":"Gluten-free","tr":"Glutensiz","de":"Glutenfrei","it":"Senza glutine","ru":"Без глютена","ar":"خالٍ من الجلوتين","uk":"Без глютену"}},
    {"value":"halal","label":{"me":"Halal","sr":"Halal","en":"Halal","tr":"Helal","de":"Halal","it":"Halal","ru":"Халяль","ar":"حلال","uk":"Халяль"}},
    {"value":"kosher","label":{"me":"Košer","sr":"Košer","en":"Kosher","tr":"Koşer","de":"Koscher","it":"Kosher","ru":"Кошер","ar":"كوشير","uk":"Кошер"}},
    {"value":"allergies","label":{"me":"Alergije","sr":"Alergije","en":"Allergy-aware","tr":"Alerjiye duyarlı","de":"Allergiker","it":"Allergie","ru":"Аллергии","ar":"الحساسية","uk":"Алергії"}}
  ]'::jsonb,
  '{}'::jsonb, NULL, 1, 2, FALSE),

('catering-food', 'event_capacity', 'select',
  '{"me":"Maksimalan broj gostiju","sr":"Maksimalan broj gostiju","en":"Max event capacity","tr":"Maksimum etkinlik kapasitesi","de":"Max. Gästezahl","it":"Capacità massima eventi","ru":"Максимум гостей","ar":"الحد الأقصى للضيوف","uk":"Максимальна кількість гостей"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"small","label":{"me":"Do 20","sr":"Do 20","en":"Up to 20","tr":"20''ye kadar","de":"Bis 20","it":"Fino a 20","ru":"До 20","ar":"حتى 20","uk":"До 20"}},
    {"value":"medium","label":{"me":"20-50","sr":"20-50","en":"20-50","tr":"20-50","de":"20-50","it":"20-50","ru":"20-50","ar":"20-50","uk":"20-50"}},
    {"value":"large","label":{"me":"50-150","sr":"50-150","en":"50-150","tr":"50-150","de":"50-150","it":"50-150","ru":"50-150","ar":"50-150","uk":"50-150"}},
    {"value":"xl","label":{"me":"150+","sr":"150+","en":"150+","tr":"150+","de":"150+","it":"150+","ru":"150+","ar":"150+","uk":"150+"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 2, 1, TRUE),

('catering-food', 'own_kitchen', 'select',
  '{"me":"Imam profesionalnu kuhinju","sr":"Imam profesionalnu kuhinju","en":"Professional kitchen","tr":"Profesyonel mutfak","de":"Professionelle Küche","it":"Cucina professionale","ru":"Профессиональная кухня","ar":"مطبخ احترافي","uk":"Професійна кухня"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"yes","label":{"me":"Da","sr":"Da","en":"Yes","tr":"Evet","de":"Ja","it":"Sì","ru":"Да","ar":"نعم","uk":"Так"}},
    {"value":"shared","label":{"me":"Dijelim","sr":"Delim","en":"Shared","tr":"Ortak","de":"Geteilt","it":"Condivisa","ru":"Делю","ar":"مشتركة","uk":"Спільна"}},
    {"value":"client_venue","label":{"me":"Kuvam na lokaciji klijenta","sr":"Kuvam na lokaciji klijenta","en":"Cook at client venue","tr":"Müşteri mekanında","de":"Beim Kunden","it":"Presso il cliente","ru":"Готовлю у клиента","ar":"أطبخ في مكان العميل","uk":"Готую у клієнта"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 2, 2, TRUE),

('catering-food', 'food_safety_license', 'select',
  '{"me":"HACCP / sanitarna licenca","sr":"HACCP / sanitarna licenca","en":"HACCP / food safety license","tr":"HACCP / gıda güvenliği lisansı","de":"HACCP / Lebensmittelhygiene-Lizenz","it":"HACCP / licenza sanitaria","ru":"HACCP / лицензия","ar":"HACCP / ترخيص سلامة الغذاء","uk":"HACCP / ліцензія"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"yes","label":{"me":"Imam","sr":"Imam","en":"Yes","tr":"Var","de":"Ja","it":"Sì","ru":"Есть","ar":"نعم","uk":"Маю"}},
    {"value":"in_progress","label":{"me":"U procesu","sr":"U procesu","en":"In progress","tr":"Süreçte","de":"In Bearbeitung","it":"In corso","ru":"Оформляется","ar":"قيد التقدم","uk":"У процесі"}},
    {"value":"no","label":{"me":"Nemam","sr":"Nemam","en":"No","tr":"Yok","de":"Nein","it":"No","ru":"Нет","ar":"لا","uk":"Ні"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 3, 1, TRUE),

('catering-food', 'insurance', 'select',
  '{"me":"Profesionalno osiguranje","sr":"Profesionalno osiguranje","en":"Professional insurance","tr":"Profesyonel sigorta","de":"Berufshaftpflicht","it":"Assicurazione professionale","ru":"Профессиональная страховка","ar":"التأمين المهني","uk":"Професійна страховка"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"yes","label":{"me":"Da","sr":"Da","en":"Yes","tr":"Evet","de":"Ja","it":"Sì","ru":"Да","ar":"نعم","uk":"Так"}},
    {"value":"no","label":{"me":"Ne","sr":"Ne","en":"No","tr":"Hayır","de":"Nein","it":"No","ru":"Нет","ar":"لا","uk":"Ні"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 3, 2, TRUE);


-- ─── 6. tutoring-education (5 questions) ───────────────────────────────────

INSERT INTO public.glatko_pro_application_questions
  (category_slug, question_key, question_type, label, placeholder, help_text,
   options, validation, show_if, step_order, field_order, is_required)
VALUES

('tutoring-education', 'subjects', 'multiselect',
  '{"me":"Predmeti koje predajem","sr":"Predmeti koje predajem","en":"Subjects taught","tr":"Verdiğim dersler","de":"Unterrichtete Fächer","it":"Materie insegnate","ru":"Преподаваемые предметы","ar":"المواد التي أدرّسها","uk":"Предмети, які викладаю"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"math","label":{"me":"Matematika","sr":"Matematika","en":"Math","tr":"Matematik","de":"Mathematik","it":"Matematica","ru":"Математика","ar":"الرياضيات","uk":"Математика"}},
    {"value":"physics","label":{"me":"Fizika","sr":"Fizika","en":"Physics","tr":"Fizik","de":"Physik","it":"Fisica","ru":"Физика","ar":"الفيزياء","uk":"Фізика"}},
    {"value":"chemistry","label":{"me":"Hemija","sr":"Hemija","en":"Chemistry","tr":"Kimya","de":"Chemie","it":"Chimica","ru":"Химия","ar":"الكيمياء","uk":"Хімія"}},
    {"value":"languages","label":{"me":"Strani jezici","sr":"Strani jezici","en":"Foreign languages","tr":"Yabancı diller","de":"Fremdsprachen","it":"Lingue straniere","ru":"Иностранные языки","ar":"اللغات","uk":"Іноземні мови"}},
    {"value":"music","label":{"me":"Muzika","sr":"Muzika","en":"Music","tr":"Müzik","de":"Musik","it":"Musica","ru":"Музыка","ar":"الموسيقى","uk":"Музика"}},
    {"value":"art","label":{"me":"Likovna","sr":"Likovna","en":"Art","tr":"Resim","de":"Kunst","it":"Arte","ru":"Изобразительное искусство","ar":"الفن","uk":"Образотворче"}},
    {"value":"programming","label":{"me":"Programiranje","sr":"Programiranje","en":"Programming","tr":"Programlama","de":"Programmierung","it":"Programmazione","ru":"Программирование","ar":"البرمجة","uk":"Програмування"}}
  ]'::jsonb,
  '{"required":true,"minSelected":1}'::jsonb, NULL, 1, 1, TRUE),

('tutoring-education', 'levels', 'multiselect',
  '{"me":"Nivoi","sr":"Nivoi","en":"Levels","tr":"Seviyeler","de":"Stufen","it":"Livelli","ru":"Уровни","ar":"المستويات","uk":"Рівні"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"primary","label":{"me":"Osnovna škola","sr":"Osnovna škola","en":"Primary","tr":"İlkokul","de":"Grundschule","it":"Primaria","ru":"Начальная","ar":"الابتدائي","uk":"Початкова"}},
    {"value":"secondary","label":{"me":"Srednja škola","sr":"Srednja škola","en":"Secondary","tr":"Lise","de":"Sekundarstufe","it":"Secondaria","ru":"Средняя","ar":"الثانوي","uk":"Середня"}},
    {"value":"university","label":{"me":"Fakultet","sr":"Fakultet","en":"University","tr":"Üniversite","de":"Universität","it":"Università","ru":"Университет","ar":"الجامعي","uk":"Університет"}},
    {"value":"adult","label":{"me":"Odrasli","sr":"Odrasli","en":"Adult","tr":"Yetişkin","de":"Erwachsene","it":"Adulti","ru":"Взрослые","ar":"البالغون","uk":"Дорослі"}}
  ]'::jsonb,
  '{"required":true,"minSelected":1}'::jsonb, NULL, 1, 2, TRUE),

('tutoring-education', 'teaching_method', 'multiselect',
  '{"me":"Načini nastave","sr":"Načini nastave","en":"Teaching method","tr":"Öğretim yöntemi","de":"Unterrichtsmethode","it":"Metodo di insegnamento","ru":"Способ обучения","ar":"طريقة التدريس","uk":"Метод навчання"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"in_person","label":{"me":"Uživo","sr":"Uživo","en":"In-person","tr":"Yüz yüze","de":"Vor Ort","it":"In presenza","ru":"Лично","ar":"حضوري","uk":"Особисто"}},
    {"value":"online","label":{"me":"Online","sr":"Online","en":"Online","tr":"Online","de":"Online","it":"Online","ru":"Онлайн","ar":"عبر الإنترنت","uk":"Онлайн"}},
    {"value":"hybrid","label":{"me":"Kombinovano","sr":"Kombinovano","en":"Hybrid","tr":"Karma","de":"Hybrid","it":"Ibrido","ru":"Гибрид","ar":"مدمج","uk":"Гібридне"}},
    {"value":"home_visit","label":{"me":"Dolazim kući","sr":"Dolazim kući","en":"Home visits","tr":"Eve gelirim","de":"Hausbesuche","it":"A domicilio","ru":"Выезд на дом","ar":"زيارات منزلية","uk":"Виїзд додому"}}
  ]'::jsonb,
  '{"required":true,"minSelected":1}'::jsonb, NULL, 2, 1, TRUE),

('tutoring-education', 'qualifications', 'textarea',
  '{"me":"Diplome i kvalifikacije","sr":"Diplome i kvalifikacije","en":"Degrees & qualifications","tr":"Diploma ve nitelikler","de":"Abschlüsse & Qualifikationen","it":"Titoli e qualifiche","ru":"Дипломы и квалификации","ar":"الشهادات والمؤهلات","uk":"Дипломи та кваліфікації"}'::jsonb,
  '{"me":"npr. MA Engleski jezik, certifikat CELTA…","sr":"npr. MA Engleski jezik, sertifikat CELTA…","en":"e.g. MA English, CELTA certificate…","tr":"örn. MA İngilizce, CELTA sertifikası…","de":"z.B. MA Englisch, CELTA-Zertifikat…","it":"es. MA Inglese, certificato CELTA…","ru":"напр. MA Английский, CELTA сертификат…","ar":"مثلاً ماجستير في الإنجليزية، شهادة CELTA…","uk":"напр. MA Англійська, сертифікат CELTA…"}'::jsonb,
  NULL, NULL,
  '{"required":true,"maxLength":1000}'::jsonb, NULL, 3, 1, TRUE),

('tutoring-education', 'years_teaching', 'number',
  '{"me":"Godine iskustva u nastavi","sr":"Godine iskustva u nastavi","en":"Years teaching","tr":"Öğretmenlik yılı","de":"Unterrichtserfahrung in Jahren","it":"Anni di insegnamento","ru":"Лет преподавания","ar":"سنوات التدريس","uk":"Років викладання"}'::jsonb,
  '{"me":"npr. 5","sr":"npr. 5","en":"e.g. 5","tr":"örn. 5","de":"z.B. 5","it":"es. 5","ru":"напр. 5","ar":"مثلاً 5","uk":"напр. 5"}'::jsonb,
  NULL, NULL,
  '{"required":true,"min":0,"max":60}'::jsonb, NULL, 3, 2, TRUE);


-- ─── 7. childcare-family (6 questions) ─────────────────────────────────────

INSERT INTO public.glatko_pro_application_questions
  (category_slug, question_key, question_type, label, placeholder, help_text,
   options, validation, show_if, step_order, field_order, is_required)
VALUES

('childcare-family', 'age_groups', 'multiselect',
  '{"me":"Uzrasti djece","sr":"Uzrasti dece","en":"Age groups","tr":"Yaş grupları","de":"Altersgruppen","it":"Fasce d''età","ru":"Возрастные группы","ar":"الفئات العمرية","uk":"Вікові групи"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"infant","label":{"me":"Bebe (0-12 m)","sr":"Bebe (0-12 m)","en":"Infants (0-12 m)","tr":"Bebek (0-12 ay)","de":"Säugling (0-12 M.)","it":"Neonati (0-12 m)","ru":"Младенцы (0-12 м)","ar":"الرضّع (0-12 شهر)","uk":"Немовлята (0-12 м)"}},
    {"value":"toddler","label":{"me":"1-3 godine","sr":"1-3 godine","en":"1-3 years","tr":"1-3 yaş","de":"1-3 Jahre","it":"1-3 anni","ru":"1-3 года","ar":"1-3 سنوات","uk":"1-3 роки"}},
    {"value":"preschool","label":{"me":"3-6 godina","sr":"3-6 godina","en":"3-6 years","tr":"3-6 yaş","de":"3-6 Jahre","it":"3-6 anni","ru":"3-6 лет","ar":"3-6 سنوات","uk":"3-6 років"}},
    {"value":"school","label":{"me":"6-12 godina","sr":"6-12 godina","en":"6-12 years","tr":"6-12 yaş","de":"6-12 Jahre","it":"6-12 anni","ru":"6-12 лет","ar":"6-12 سنة","uk":"6-12 років"}},
    {"value":"teen","label":{"me":"Tinejdžeri","sr":"Tinejdžeri","en":"Teens","tr":"Gençler","de":"Teenager","it":"Adolescenti","ru":"Подростки","ar":"المراهقون","uk":"Підлітки"}}
  ]'::jsonb,
  '{"required":true,"minSelected":1}'::jsonb, NULL, 1, 1, TRUE),

('childcare-family', 'care_types', 'multiselect',
  '{"me":"Tipovi brige","sr":"Tipovi brige","en":"Care types","tr":"Bakım türleri","de":"Pflegearten","it":"Tipi di cura","ru":"Типы ухода","ar":"أنواع الرعاية","uk":"Типи догляду"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"babysitting","label":{"me":"Babysitting","sr":"Babysitting","en":"Babysitting","tr":"Bebek bakımı","de":"Babysitting","it":"Babysitting","ru":"Бэбиситтинг","ar":"رعاية الأطفال","uk":"Бебісітинг"}},
    {"value":"nanny","label":{"me":"Stalna dadilja","sr":"Stalna dadilja","en":"Live-in nanny","tr":"Yatılı bakıcı","de":"Festes Kindermädchen","it":"Tata fissa","ru":"Постоянная няня","ar":"مربية مقيمة","uk":"Постійна няня"}},
    {"value":"after_school","label":{"me":"Nakon škole","sr":"Nakon škole","en":"After-school","tr":"Okul sonrası","de":"Nach der Schule","it":"Doposcuola","ru":"После школы","ar":"بعد المدرسة","uk":"Після школи"}},
    {"value":"events","label":{"me":"Događaji / svadbe","sr":"Događaji / svadbe","en":"Events / weddings","tr":"Etkinlik / düğün","de":"Events / Hochzeiten","it":"Eventi / matrimoni","ru":"Мероприятия","ar":"الفعاليات","uk":"Події / весілля"}},
    {"value":"travel","label":{"me":"Sa porodicom na putovanju","sr":"Sa porodicom na putovanju","en":"Travel companion","tr":"Tatil bakıcılığı","de":"Reisebegleitung","it":"Compagnia in viaggio","ru":"Сопровождение в путешествии","ar":"مرافق في السفر","uk":"Супровід у подорожі"}}
  ]'::jsonb,
  '{"required":true,"minSelected":1}'::jsonb, NULL, 1, 2, TRUE),

('childcare-family', 'first_aid_cert', 'select',
  '{"me":"Sertifikat za prvu pomoć","sr":"Sertifikat za prvu pomoć","en":"First aid certificate","tr":"İlk yardım sertifikası","de":"Erste-Hilfe-Zertifikat","it":"Certificato primo soccorso","ru":"Сертификат первой помощи","ar":"شهادة الإسعافات الأولية","uk":"Сертифікат першої допомоги"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"yes","label":{"me":"Da, važeći","sr":"Da, važeći","en":"Yes, current","tr":"Evet, geçerli","de":"Ja, gültig","it":"Sì, valido","ru":"Да, актуальный","ar":"نعم، ساري","uk":"Так, чинний"}},
    {"value":"expired","label":{"me":"Imao/la, istekao","sr":"Imao/la, istekao","en":"Expired","tr":"Süresi dolmuş","de":"Abgelaufen","it":"Scaduto","ru":"Истёк","ar":"منتهي","uk":"Прострочений"}},
    {"value":"no","label":{"me":"Nemam","sr":"Nemam","en":"No","tr":"Yok","de":"Keines","it":"No","ru":"Нет","ar":"لا","uk":"Немає"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 2, 1, TRUE),

('childcare-family', 'own_transport', 'select',
  '{"me":"Imam vozilo","sr":"Imam vozilo","en":"Own transportation","tr":"Kendi aracım var","de":"Eigenes Fahrzeug","it":"Trasporto proprio","ru":"Свой автомобиль","ar":"وسيلة نقل خاصة","uk":"Свій транспорт"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"yes","label":{"me":"Da","sr":"Da","en":"Yes","tr":"Evet","de":"Ja","it":"Sì","ru":"Да","ar":"نعم","uk":"Так"}},
    {"value":"no","label":{"me":"Ne","sr":"Ne","en":"No","tr":"Hayır","de":"Nein","it":"No","ru":"Нет","ar":"لا","uk":"Ні"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 2, 2, TRUE),

('childcare-family', 'special_needs', 'select',
  '{"me":"Iskustvo sa djecom posebnih potreba","sr":"Iskustvo sa decom posebnih potreba","en":"Special needs experience","tr":"Özel gereksinimli çocuk deneyimi","de":"Erfahrung mit Kindern mit besonderen Bedürfnissen","it":"Esperienza con bambini con esigenze speciali","ru":"Опыт с особыми детьми","ar":"خبرة مع الأطفال ذوي الاحتياجات الخاصة","uk":"Досвід з дітьми з особливими потребами"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"yes","label":{"me":"Da, sertifikat","sr":"Da, sertifikat","en":"Yes, certified","tr":"Evet, sertifikalı","de":"Ja, zertifiziert","it":"Sì, certificato","ru":"Да, сертифицирован","ar":"نعم، معتمد","uk":"Так, сертифікований"}},
    {"value":"some","label":{"me":"Imam iskustvo","sr":"Imam iskustvo","en":"Some experience","tr":"Biraz deneyim","de":"Etwas Erfahrung","it":"Esperienza limitata","ru":"Есть опыт","ar":"بعض الخبرة","uk":"Маю досвід"}},
    {"value":"no","label":{"me":"Ne","sr":"Ne","en":"No","tr":"Hayır","de":"Nein","it":"No","ru":"Нет","ar":"لا","uk":"Ні"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 3, 1, TRUE),

('childcare-family', 'references', 'textarea',
  '{"me":"Reference / preporuke","sr":"Reference / preporuke","en":"References","tr":"Referanslar","de":"Referenzen","it":"Referenze","ru":"Рекомендации","ar":"المراجع","uk":"Рекомендації"}'::jsonb,
  '{"me":"Imena ranijih porodica i kontakt (uz odobrenje)","sr":"Imena ranijih porodica i kontakt (uz odobrenje)","en":"Names of past families and contact (with permission)","tr":"Eski ailelerin adı ve iletişim (izinle)","de":"Namen früherer Familien (mit Erlaubnis)","it":"Nomi di famiglie precedenti (con permesso)","ru":"Имена прошлых семей (с разрешения)","ar":"أسماء العائلات السابقة (بإذن)","uk":"Імена попередніх родин (з дозволом)"}'::jsonb,
  NULL, NULL,
  '{"maxLength":1000}'::jsonb, NULL, 3, 2, FALSE);


-- ─── 8. moving-transport (6 questions) ─────────────────────────────────────

INSERT INTO public.glatko_pro_application_questions
  (category_slug, question_key, question_type, label, placeholder, help_text,
   options, validation, show_if, step_order, field_order, is_required)
VALUES

('moving-transport', 'vehicle_types', 'multiselect',
  '{"me":"Tipovi vozila","sr":"Tipovi vozila","en":"Vehicle types","tr":"Araç türleri","de":"Fahrzeugtypen","it":"Tipi di veicolo","ru":"Типы транспорта","ar":"أنواع المركبات","uk":"Типи транспорту"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"van_small","label":{"me":"Mali kombi","sr":"Mali kombi","en":"Small van","tr":"Küçük kamyonet","de":"Kleiner Transporter","it":"Furgone piccolo","ru":"Маленький фургон","ar":"شاحنة صغيرة","uk":"Малий фургон"}},
    {"value":"van_large","label":{"me":"Veliki kombi","sr":"Veliki kombi","en":"Large van","tr":"Büyük kamyonet","de":"Großer Transporter","it":"Furgone grande","ru":"Большой фургон","ar":"شاحنة كبيرة","uk":"Великий фургон"}},
    {"value":"truck","label":{"me":"Kamion","sr":"Kamion","en":"Truck","tr":"Kamyon","de":"LKW","it":"Camion","ru":"Грузовик","ar":"شاحنة","uk":"Вантажівка"}},
    {"value":"trailer","label":{"me":"Prikolica","sr":"Prikolica","en":"Trailer","tr":"Römork","de":"Anhänger","it":"Rimorchio","ru":"Прицеп","ar":"مقطورة","uk":"Причіп"}},
    {"value":"refrigerated","label":{"me":"Hladnjača","sr":"Hladnjača","en":"Refrigerated","tr":"Soğutuculu","de":"Kühltransporter","it":"Refrigerato","ru":"Рефрижератор","ar":"مبرد","uk":"Холодильник"}}
  ]'::jsonb,
  '{"required":true,"minSelected":1}'::jsonb, NULL, 1, 1, TRUE),

('moving-transport', 'team_size', 'select',
  '{"me":"Veličina tima","sr":"Veličina tima","en":"Team size","tr":"Ekip boyutu","de":"Teamgröße","it":"Dimensione del team","ru":"Размер команды","ar":"حجم الفريق","uk":"Розмір команди"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"solo","label":{"me":"Sam","sr":"Sam","en":"Solo","tr":"Tek","de":"Alleine","it":"Da solo","ru":"Один","ar":"بمفردي","uk":"Сам"}},
    {"value":"2_3","label":{"me":"2-3 osobe","sr":"2-3 osobe","en":"2-3 people","tr":"2-3 kişi","de":"2-3 Personen","it":"2-3 persone","ru":"2-3 человека","ar":"2-3 أشخاص","uk":"2-3 людини"}},
    {"value":"4_plus","label":{"me":"4+ osoba","sr":"4+ osoba","en":"4+ people","tr":"4+ kişi","de":"4+ Personen","it":"4+ persone","ru":"4+ человека","ar":"4+ أشخاص","uk":"4+ людей"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 1, 2, TRUE),

('moving-transport', 'storage_offered', 'select',
  '{"me":"Skladištenje robe","sr":"Skladištenje robe","en":"Storage service","tr":"Depolama hizmeti","de":"Lagerung","it":"Servizio di stoccaggio","ru":"Хранение","ar":"خدمة التخزين","uk":"Зберігання"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"yes","label":{"me":"Da","sr":"Da","en":"Yes","tr":"Evet","de":"Ja","it":"Sì","ru":"Да","ar":"نعم","uk":"Так"}},
    {"value":"partner","label":{"me":"Imam partnera","sr":"Imam partnera","en":"Via partner","tr":"Partner üzerinden","de":"Über Partner","it":"Tramite partner","ru":"Через партнёра","ar":"عبر شريك","uk":"Через партнера"}},
    {"value":"no","label":{"me":"Ne","sr":"Ne","en":"No","tr":"Hayır","de":"Nein","it":"No","ru":"Нет","ar":"لا","uk":"Ні"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 2, 1, TRUE),

('moving-transport', 'long_distance', 'select',
  '{"me":"Međunarodni transport","sr":"Međunarodni transport","en":"Long-distance / international","tr":"Uzun mesafe / uluslararası","de":"Fernumzug / international","it":"Lunga distanza / internazionale","ru":"Дальняя / международная","ar":"مسافات طويلة / دولي","uk":"Дальні / міжнародні"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"yes","label":{"me":"Da","sr":"Da","en":"Yes","tr":"Evet","de":"Ja","it":"Sì","ru":"Да","ar":"نعم","uk":"Так"}},
    {"value":"local_only","label":{"me":"Samo lokalno","sr":"Samo lokalno","en":"Local only","tr":"Sadece yerel","de":"Nur lokal","it":"Solo locale","ru":"Только локально","ar":"محلي فقط","uk":"Лише локально"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 2, 2, TRUE),

('moving-transport', 'fragile_specialty', 'select',
  '{"me":"Lomljiva i osjetljiva roba","sr":"Lomljiva i osjetljiva roba","en":"Fragile / specialty items","tr":"Kırılgan / özel eşya","de":"Zerbrechliches / Spezialgut","it":"Fragile / specializzato","ru":"Хрупкие / спец. грузы","ar":"الهش / المتخصص","uk":"Крихке / спеціальне"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"yes","label":{"me":"Da, specijalizovan","sr":"Da, specijalizovan","en":"Yes, specialized","tr":"Evet, uzman","de":"Ja, spezialisiert","it":"Sì, specializzato","ru":"Да, специализирован","ar":"نعم، متخصص","uk":"Так, спеціалізований"}},
    {"value":"standard","label":{"me":"Standardno pakovanje","sr":"Standardno pakovanje","en":"Standard packing","tr":"Standart paketleme","de":"Standardverpackung","it":"Imballaggio standard","ru":"Стандартная упаковка","ar":"تعبئة قياسية","uk":"Стандартна упаковка"}},
    {"value":"no","label":{"me":"Ne preuzimam","sr":"Ne preuzimam","en":"Don''t handle","tr":"Almıyorum","de":"Übernehme ich nicht","it":"Non gestisco","ru":"Не беру","ar":"لا أتعامل","uk":"Не беру"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 3, 1, TRUE),

('moving-transport', 'insurance', 'select',
  '{"me":"Osiguranje robe","sr":"Osiguranje robe","en":"Goods insurance","tr":"Eşya sigortası","de":"Transportversicherung","it":"Assicurazione merci","ru":"Страховка груза","ar":"تأمين البضائع","uk":"Страхування вантажу"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"yes","label":{"me":"Da","sr":"Da","en":"Yes","tr":"Evet","de":"Ja","it":"Sì","ru":"Да","ar":"نعم","uk":"Так"}},
    {"value":"client_buys","label":{"me":"Klijent može da kupi","sr":"Klijent može da kupi","en":"Client can purchase","tr":"Müşteri satın alabilir","de":"Kunde kann erwerben","it":"Cliente può acquistare","ru":"Клиент может оформить","ar":"يمكن للعميل الشراء","uk":"Клієнт може придбати"}},
    {"value":"no","label":{"me":"Ne","sr":"Ne","en":"No","tr":"Hayır","de":"Nein","it":"No","ru":"Нет","ar":"لا","uk":"Ні"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 3, 2, TRUE);


-- ─── 9. automotive (6 questions) ───────────────────────────────────────────

INSERT INTO public.glatko_pro_application_questions
  (category_slug, question_key, question_type, label, placeholder, help_text,
   options, validation, show_if, step_order, field_order, is_required)
VALUES

('automotive', 'service_types', 'multiselect',
  '{"me":"Tipovi usluga","sr":"Tipovi usluga","en":"Service types","tr":"Hizmet türleri","de":"Servicearten","it":"Tipi di servizio","ru":"Типы услуг","ar":"أنواع الخدمات","uk":"Типи послуг"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"general_repair","label":{"me":"Opšta popravka","sr":"Opšta popravka","en":"General repair","tr":"Genel onarım","de":"Allgemeine Reparatur","it":"Riparazione generale","ru":"Общий ремонт","ar":"إصلاح عام","uk":"Загальний ремонт"}},
    {"value":"engine","label":{"me":"Motor","sr":"Motor","en":"Engine","tr":"Motor","de":"Motor","it":"Motore","ru":"Двигатель","ar":"المحرك","uk":"Двигун"}},
    {"value":"electrical","label":{"me":"Elektrika","sr":"Elektrika","en":"Electrical","tr":"Elektrik","de":"Elektrik","it":"Elettrico","ru":"Электрика","ar":"الكهرباء","uk":"Електрика"}},
    {"value":"tires","label":{"me":"Gume","sr":"Gume","en":"Tires","tr":"Lastik","de":"Reifen","it":"Pneumatici","ru":"Шины","ar":"الإطارات","uk":"Шини"}},
    {"value":"bodywork","label":{"me":"Limarija i farbanje","sr":"Limarija i farbanje","en":"Bodywork & paint","tr":"Kaporta ve boya","de":"Karosserie & Lack","it":"Carrozzeria e vernice","ru":"Кузов и покраска","ar":"الهيكل والطلاء","uk":"Кузов і фарбування"}},
    {"value":"diagnostic","label":{"me":"Dijagnostika","sr":"Dijagnostika","en":"Diagnostic","tr":"Diagnostik","de":"Diagnose","it":"Diagnostica","ru":"Диагностика","ar":"التشخيص","uk":"Діагностика"}}
  ]'::jsonb,
  '{"required":true,"minSelected":1}'::jsonb, NULL, 1, 1, TRUE),

('automotive', 'specializations', 'multiselect',
  '{"me":"Specijalizacije po marki","sr":"Specijalizacije po marki","en":"Brand specializations","tr":"Marka uzmanlığı","de":"Markenspezialisierungen","it":"Specializzazioni marche","ru":"Спец. по брендам","ar":"تخصصات العلامة التجارية","uk":"Спеціалізації по марках"}'::jsonb,
  NULL,
  '{"me":"Opcionalno – ostavi prazno za sve marke","sr":"Opcionalno – ostavi prazno za sve marke","en":"Optional — leave blank for all brands","tr":"Opsiyonel — boş bırakırsan tümü","de":"Optional — leer für alle Marken","it":"Opzionale — vuoto per tutte","ru":"Опционально — пусто = все","ar":"اختياري — اتركه فارغًا للجميع","uk":"Необовʼязково — порожньо = всі"}'::jsonb,
  '[
    {"value":"vw_audi","label":{"me":"VW / Audi","sr":"VW / Audi","en":"VW / Audi","tr":"VW / Audi","de":"VW / Audi","it":"VW / Audi","ru":"VW / Audi","ar":"VW / Audi","uk":"VW / Audi"}},
    {"value":"bmw","label":{"me":"BMW","sr":"BMW","en":"BMW","tr":"BMW","de":"BMW","it":"BMW","ru":"BMW","ar":"BMW","uk":"BMW"}},
    {"value":"mercedes","label":{"me":"Mercedes","sr":"Mercedes","en":"Mercedes","tr":"Mercedes","de":"Mercedes","it":"Mercedes","ru":"Mercedes","ar":"Mercedes","uk":"Mercedes"}},
    {"value":"japanese","label":{"me":"Toyota / Honda / Nissan","sr":"Toyota / Honda / Nissan","en":"Toyota / Honda / Nissan","tr":"Toyota / Honda / Nissan","de":"Toyota / Honda / Nissan","it":"Toyota / Honda / Nissan","ru":"Toyota / Honda / Nissan","ar":"Toyota / Honda / Nissan","uk":"Toyota / Honda / Nissan"}},
    {"value":"french","label":{"me":"Renault / Peugeot / Citroën","sr":"Renault / Peugeot / Citroën","en":"Renault / Peugeot / Citroën","tr":"Renault / Peugeot / Citroën","de":"Renault / Peugeot / Citroën","it":"Renault / Peugeot / Citroën","ru":"Renault / Peugeot / Citroën","ar":"Renault / Peugeot / Citroën","uk":"Renault / Peugeot / Citroën"}},
    {"value":"electric","label":{"me":"Električna vozila","sr":"Električna vozila","en":"Electric vehicles","tr":"Elektrikli","de":"Elektrofahrzeuge","it":"Elettrici","ru":"Электромобили","ar":"السيارات الكهربائية","uk":"Електромобілі"}}
  ]'::jsonb,
  '{}'::jsonb, NULL, 1, 2, FALSE),

('automotive', 'own_workshop', 'select',
  '{"me":"Imam vlastiti servis","sr":"Imam vlastiti servis","en":"Own workshop","tr":"Kendi atölye","de":"Eigene Werkstatt","it":"Officina propria","ru":"Свой сервис","ar":"ورشة خاصة","uk":"Власна станція"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"yes","label":{"me":"Da","sr":"Da","en":"Yes","tr":"Evet","de":"Ja","it":"Sì","ru":"Да","ar":"نعم","uk":"Так"}},
    {"value":"shared","label":{"me":"Dijelim prostor","sr":"Delim prostor","en":"Shared","tr":"Ortak","de":"Geteilt","it":"Condivisa","ru":"Делю","ar":"مشتركة","uk":"Спільна"}},
    {"value":"no","label":{"me":"Ne, mobilno","sr":"Ne, mobilno","en":"No (mobile)","tr":"Hayır (mobil)","de":"Nein (mobil)","it":"No (mobile)","ru":"Нет (мобильно)","ar":"لا (متنقل)","uk":"Ні (мобільно)"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 2, 1, TRUE),

('automotive', 'mobile_service', 'select',
  '{"me":"Dolazim na lokaciju","sr":"Dolazim na lokaciju","en":"Mobile service","tr":"Mobil hizmet","de":"Mobiler Service","it":"Servizio mobile","ru":"Мобильная услуга","ar":"خدمة متنقلة","uk":"Мобільна послуга"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"yes","label":{"me":"Da","sr":"Da","en":"Yes","tr":"Evet","de":"Ja","it":"Sì","ru":"Да","ar":"نعم","uk":"Так"}},
    {"value":"emergency_only","label":{"me":"Samo hitne intervencije","sr":"Samo hitne intervencije","en":"Emergency only","tr":"Sadece acil","de":"Nur Notfälle","it":"Solo emergenze","ru":"Только аварийно","ar":"للطوارئ فقط","uk":"Лише аварійно"}},
    {"value":"no","label":{"me":"Ne","sr":"Ne","en":"No","tr":"Hayır","de":"Nein","it":"No","ru":"Нет","ar":"لا","uk":"Ні"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 2, 2, TRUE),

('automotive', 'parts_warranty', 'select',
  '{"me":"Garancija na djelove i rad","sr":"Garancija na delove i rad","en":"Parts & labor warranty","tr":"Parça ve işçilik garantisi","de":"Garantie auf Teile & Arbeit","it":"Garanzia ricambi e manodopera","ru":"Гарантия на запчасти и работу","ar":"ضمان قطع الغيار والعمل","uk":"Гарантія на запчастини й роботу"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"12_months","label":{"me":"12 mjeseci","sr":"12 meseci","en":"12 months","tr":"12 ay","de":"12 Monate","it":"12 mesi","ru":"12 месяцев","ar":"12 شهراً","uk":"12 місяців"}},
    {"value":"6_months","label":{"me":"6 mjeseci","sr":"6 meseci","en":"6 months","tr":"6 ay","de":"6 Monate","it":"6 mesi","ru":"6 месяцев","ar":"6 أشهر","uk":"6 місяців"}},
    {"value":"3_months","label":{"me":"3 mjeseca","sr":"3 meseca","en":"3 months","tr":"3 ay","de":"3 Monate","it":"3 mesi","ru":"3 месяца","ar":"3 أشهر","uk":"3 місяці"}},
    {"value":"none","label":{"me":"Bez garancije","sr":"Bez garancije","en":"No warranty","tr":"Garantisiz","de":"Keine Garantie","it":"Nessuna garanzia","ru":"Без гарантии","ar":"بدون ضمان","uk":"Без гарантії"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 3, 1, TRUE),

('automotive', 'insurance', 'select',
  '{"me":"Profesionalno osiguranje","sr":"Profesionalno osiguranje","en":"Professional insurance","tr":"Profesyonel sigorta","de":"Berufshaftpflicht","it":"Assicurazione professionale","ru":"Профессиональная страховка","ar":"التأمين المهني","uk":"Професійна страховка"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"yes","label":{"me":"Da","sr":"Da","en":"Yes","tr":"Evet","de":"Ja","it":"Sì","ru":"Да","ar":"نعم","uk":"Так"}},
    {"value":"no","label":{"me":"Ne","sr":"Ne","en":"No","tr":"Hayır","de":"Nein","it":"No","ru":"Нет","ar":"لا","uk":"Ні"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 3, 2, TRUE);


-- ─── 10. airbnb-management (5 questions) ───────────────────────────────────

INSERT INTO public.glatko_pro_application_questions
  (category_slug, question_key, question_type, label, placeholder, help_text,
   options, validation, show_if, step_order, field_order, is_required)
VALUES

('airbnb-management', 'properties_managed', 'number',
  '{"me":"Broj nekretnina koje upravljam","sr":"Broj nekretnina koje upravljam","en":"Properties currently managed","tr":"Yönettiğim mülk sayısı","de":"Aktuell verwaltete Objekte","it":"Proprietà attualmente gestite","ru":"Объектов в управлении","ar":"عدد العقارات المُدارة","uk":"Об''єктів в управлінні"}'::jsonb,
  '{"me":"npr. 8","sr":"npr. 8","en":"e.g. 8","tr":"örn. 8","de":"z.B. 8","it":"es. 8","ru":"напр. 8","ar":"مثلاً 8","uk":"напр. 8"}'::jsonb,
  NULL, NULL,
  '{"required":true,"min":0,"max":500}'::jsonb, NULL, 1, 1, TRUE),

('airbnb-management', 'services_offered', 'multiselect',
  '{"me":"Pružene usluge","sr":"Pružene usluge","en":"Services offered","tr":"Sunulan hizmetler","de":"Angebotene Leistungen","it":"Servizi offerti","ru":"Услуги","ar":"الخدمات المقدمة","uk":"Послуги, що пропонуються"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"listing_optimization","label":{"me":"Optimizacija oglasa","sr":"Optimizacija oglasa","en":"Listing optimization","tr":"İlan optimizasyonu","de":"Listing-Optimierung","it":"Ottimizzazione annuncio","ru":"Оптимизация объявления","ar":"تحسين الإعلان","uk":"Оптимізація оголошення"}},
    {"value":"guest_communication","label":{"me":"Komunikacija s gostima","sr":"Komunikacija s gostima","en":"Guest communication","tr":"Misafir iletişimi","de":"Gästekommunikation","it":"Comunicazione ospiti","ru":"Общение с гостями","ar":"التواصل مع الضيوف","uk":"Спілкування з гостями"}},
    {"value":"checkin_checkout","label":{"me":"Check-in / check-out","sr":"Check-in / check-out","en":"Check-in / check-out","tr":"Giriş / çıkış","de":"Check-in / Check-out","it":"Check-in / check-out","ru":"Заезд / выезд","ar":"الدخول / المغادرة","uk":"Заїзд / виїзд"}},
    {"value":"cleaning","label":{"me":"Čišćenje između gostiju","sr":"Čišćenje između gostiju","en":"Turnover cleaning","tr":"Misafir arası temizlik","de":"Wechselreinigung","it":"Pulizia turnover","ru":"Уборка между гостями","ar":"التنظيف بين الضيوف","uk":"Прибирання між гостями"}},
    {"value":"maintenance","label":{"me":"Održavanje","sr":"Održavanje","en":"Maintenance","tr":"Bakım","de":"Instandhaltung","it":"Manutenzione","ru":"Обслуживание","ar":"الصيانة","uk":"Обслуговування"}},
    {"value":"pricing_revenue","label":{"me":"Pricing i revenue management","sr":"Pricing i revenue management","en":"Pricing & revenue management","tr":"Fiyat ve gelir yönetimi","de":"Preis- & Umsatzmanagement","it":"Gestione prezzi e ricavi","ru":"Управление ценой и доходом","ar":"إدارة التسعير والإيرادات","uk":"Управління цінами і доходом"}}
  ]'::jsonb,
  '{"required":true,"minSelected":1}'::jsonb, NULL, 1, 2, TRUE),

('airbnb-management', 'guest_languages', 'multiselect',
  '{"me":"Jezici za komunikaciju s gostima","sr":"Jezici za komunikaciju s gostima","en":"Languages for guest communication","tr":"Misafir iletişim dilleri","de":"Sprachen für Gäste","it":"Lingue per ospiti","ru":"Языки общения","ar":"لغات التواصل","uk":"Мови спілкування"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"en","label":{"me":"Engleski","sr":"Engleski","en":"English","tr":"İngilizce","de":"Englisch","it":"Inglese","ru":"Английский","ar":"الإنجليزية","uk":"Англійська"}},
    {"value":"de","label":{"me":"Njemački","sr":"Nemački","en":"German","tr":"Almanca","de":"Deutsch","it":"Tedesco","ru":"Немецкий","ar":"الألمانية","uk":"Німецька"}},
    {"value":"ru","label":{"me":"Ruski","sr":"Ruski","en":"Russian","tr":"Rusça","de":"Russisch","it":"Russo","ru":"Русский","ar":"الروسية","uk":"Російська"}},
    {"value":"it","label":{"me":"Italijanski","sr":"Italijanski","en":"Italian","tr":"İtalyanca","de":"Italienisch","it":"Italiano","ru":"Итальянский","ar":"الإيطالية","uk":"Італійська"}},
    {"value":"fr","label":{"me":"Francuski","sr":"Francuski","en":"French","tr":"Fransızca","de":"Französisch","it":"Francese","ru":"Французский","ar":"الفرنسية","uk":"Французька"}},
    {"value":"ar","label":{"me":"Arapski","sr":"Arapski","en":"Arabic","tr":"Arapça","de":"Arabisch","it":"Arabo","ru":"Арабский","ar":"العربية","uk":"Арабська"}}
  ]'::jsonb,
  '{"required":true,"minSelected":1}'::jsonb, NULL, 2, 1, TRUE),

('airbnb-management', 'turnover_capacity', 'select',
  '{"me":"Kapacitet check-in/out po danu","sr":"Kapacitet check-in/out po danu","en":"Check-in/out capacity per day","tr":"Günlük check-in/out kapasitesi","de":"Check-in/out-Kapazität pro Tag","it":"Capacità check-in/out al giorno","ru":"Объём заездов/выездов в день","ar":"السعة اليومية للدخول/المغادرة","uk":"Кількість заїздів/виїздів на день"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"1_2","label":{"me":"1-2","sr":"1-2","en":"1-2","tr":"1-2","de":"1-2","it":"1-2","ru":"1-2","ar":"1-2","uk":"1-2"}},
    {"value":"3_5","label":{"me":"3-5","sr":"3-5","en":"3-5","tr":"3-5","de":"3-5","it":"3-5","ru":"3-5","ar":"3-5","uk":"3-5"}},
    {"value":"6_plus","label":{"me":"6+","sr":"6+","en":"6+","tr":"6+","de":"6+","it":"6+","ru":"6+","ar":"6+","uk":"6+"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 2, 2, TRUE),

('airbnb-management', 'insurance', 'select',
  '{"me":"Profesionalno osiguranje","sr":"Profesionalno osiguranje","en":"Professional insurance","tr":"Profesyonel sigorta","de":"Berufshaftpflicht","it":"Assicurazione professionale","ru":"Профессиональная страховка","ar":"التأمين المهني","uk":"Професійна страховка"}'::jsonb,
  NULL, NULL,
  '[
    {"value":"yes","label":{"me":"Da","sr":"Da","en":"Yes","tr":"Evet","de":"Ja","it":"Sì","ru":"Да","ar":"نعم","uk":"Так"}},
    {"value":"no","label":{"me":"Ne","sr":"Ne","en":"No","tr":"Hayır","de":"Nein","it":"No","ru":"Нет","ar":"لا","uk":"Ні"}}
  ]'::jsonb,
  '{"required":true}'::jsonb, NULL, 3, 1, TRUE);


COMMIT;
