-- ═══════════════════════════════════════════════════════════════════════════
-- G-SEO-FOUNDATION migration 042: FAQ content for P0 service categories
-- ═══════════════════════════════════════════════════════════════════════════
-- Adds a `faqs` JSONB column to public.glatko_service_categories so each category
-- can carry up to N (Q, A) pairs translated across all 9 locales. Rendered
-- as FAQPage JSON-LD on the category detail page so Google can show
-- rich-result FAQ snippets in SERPs.
--
-- Shape:
--   faqs = [
--     {
--       "q": { "tr": "...", "en": "...", "de": "...", ... },
--       "a": { "tr": "...", "en": "...", "de": "...", ... }
--     },
--     ...
--   ]
--
-- Seeded for the 4 P0 launch categories (boat-services, home-cleaning,
-- renovation-construction, beauty-wellness) × 4 questions × 9 locales =
-- 144 translation entries. Other categories default to '[]' and can be
-- backfilled iteratively without DB churn.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

ALTER TABLE public.glatko_service_categories
  ADD COLUMN IF NOT EXISTS faqs JSONB NOT NULL DEFAULT '[]'::jsonb;

-- ──────────────────────────────────────────────────────────────────────────
-- boat-services
-- ──────────────────────────────────────────────────────────────────────────
UPDATE public.glatko_service_categories
SET faqs = '[
  {
    "q": {
      "tr": "Boka Körfezi''nde tekne temizliği ne kadar tutar?",
      "en": "How much does boat cleaning cost in Boka Bay?",
      "de": "Was kostet eine Bootsreinigung in der Bucht von Kotor?",
      "it": "Quanto costa la pulizia di una barca nelle Bocche di Cattaro?",
      "ru": "Сколько стоит чистка лодки в Которском заливе?",
      "uk": "Скільки коштує чищення човна в Которській затоці?",
      "sr": "Koliko košta čišćenje broda u Bokokotorskom zalivu?",
      "me": "Koliko košta čišćenje broda u Bokokotorskom zalivu?",
      "ar": "كم تكلفة تنظيف القارب في خليج بوكا؟"
    },
    "a": {
      "tr": "Fiyat tekne boyutuna ve durumuna göre değişir. 10m bir tekne için derin temizlik €80-€200 arasıdır. Glatko''da gerçek tekliflerden net fiyat alın.",
      "en": "Pricing depends on boat size and condition. For a 10m boat, expect €80-€200 for a deep clean. Get exact bids from verified pros on Glatko.",
      "de": "Der Preis hängt von Bootsgröße und Zustand ab. Für ein 10-m-Boot rechnen Sie mit €80-€200 für eine Tiefenreinigung. Verbindliche Angebote auf Glatko.",
      "it": "Il prezzo dipende dalle dimensioni e dalle condizioni della barca. Per una barca di 10m, da €80 a €200 per una pulizia profonda. Preventivi reali su Glatko.",
      "ru": "Цена зависит от размера и состояния лодки. Для 10-метровой лодки глубокая чистка обойдётся в €80-€200. Точные предложения от проверенных мастеров на Glatko.",
      "uk": "Ціна залежить від розміру та стану човна. Для 10-метрового човна глибоке чищення коштуватиме €80-€200. Точні пропозиції від перевірених майстрів на Glatko.",
      "sr": "Cena zavisi od veličine broda i stanja. Za brod od 10m, dubinsko čišćenje košta €80-€200. Realne ponude od proverenih profesionalaca na Glatku.",
      "me": "Cijena zavisi od veličine broda i stanja. Za brod od 10m, dubinsko čišćenje košta €80-€200. Realne ponude od provjerenih profesionalaca na Glatku.",
      "ar": "يعتمد السعر على حجم القارب وحالته. لقارب بطول 10 أمتار، توقع €80-€200 للتنظيف العميق. عروض حقيقية من محترفين موثوقين على Glatko."
    }
  },
  {
    "q": {
      "tr": "Antifouling için en iyi zaman ne zaman?",
      "en": "When is the best time for boat antifouling?",
      "de": "Wann ist die beste Zeit für Antifouling?",
      "it": "Qual è il momento migliore per l''antivegetativa?",
      "ru": "Когда лучше всего проводить обработку антифоулингом?",
      "uk": "Коли найкраще наносити антифулінг?",
      "sr": "Kada je najbolje vreme za antifouling?",
      "me": "Kada je najbolje vrijeme za antifouling?",
      "ar": "ما هو أفضل وقت لطلاء قاع القارب المضاد للحشف؟"
    },
    "a": {
      "tr": "Antifouling''i Kasım-Mart arası, yaz charter sezonundan önce yaptırın. Kuru havuz randevusu Şubat ortasına kadar dolar.",
      "en": "Schedule antifouling between November and March, before the summer charter season. Dry-dock slots fill by mid-February.",
      "de": "Planen Sie Antifouling zwischen November und März vor der Charter-Saison. Trockendock-Termine sind bis Mitte Februar belegt.",
      "it": "Pianifica l''antivegetativa tra novembre e marzo, prima della stagione di charter. I posti in cantiere si esauriscono a metà febbraio.",
      "ru": "Планируйте антифоулинг с ноября по март, до начала чартерного сезона. Места в сухом доке разбирают к середине февраля.",
      "uk": "Плануйте антифулінг з листопада по березень, до початку чартерного сезону. Місця в сухому доці закінчуються до середини лютого.",
      "sr": "Antifouling planirajte između novembra i marta, pre čarter sezone. Mesta u suvom doku se popune do sredine februara.",
      "me": "Antifouling planirajte između novembra i marta, prije čarter sezone. Mjesta u suhom doku se popune do sredine februara.",
      "ar": "خطط لطلاء القاع بين نوفمبر ومارس قبل موسم الإيجار الصيفي. أماكن الرصيف الجاف تمتلئ بحلول منتصف فبراير."
    }
  },
  {
    "q": {
      "tr": "Kaptan veya tekne teknisyenini nasıl doğrularım?",
      "en": "How do I verify a captain or boat technician?",
      "de": "Wie verifiziere ich Kapitän oder Bootstechniker?",
      "it": "Come verifico capitano o tecnico nautico?",
      "ru": "Как проверить капитана или мастера?",
      "uk": "Як перевірити капітана або механіка?",
      "sr": "Kako da proverim kapetana ili tehničara?",
      "me": "Kako da provjerim kapetana ili tehničara?",
      "ar": "كيف أتحقق من قبطان أو فني قارب؟"
    },
    "a": {
      "tr": "Tüm Glatko sağlayıcıları kimlik ve lisans doğrulamasından geçer. Yeşil rozetli profillere bakın; lisans, sigorta ve rating görünür.",
      "en": "Every Glatko provider passes ID and licence verification. Look for the green verified badge — licence, insurance and rating are visible on each profile.",
      "de": "Jeder Glatko-Anbieter durchläuft ID- und Lizenzprüfung. Achten Sie auf das grüne Verifiziert-Badge; Lizenz, Versicherung und Bewertung sind sichtbar.",
      "it": "Ogni professionista Glatko supera la verifica ID e licenza. Cerca il badge verde verificato; licenza, assicurazione e rating sono visibili.",
      "ru": "Каждый исполнитель Glatko проходит проверку ID и лицензии. Ищите зелёный значок верификации; лицензия, страховка и рейтинг видны на профиле.",
      "uk": "Кожен виконавець Glatko проходить перевірку документів і ліцензії. Шукайте зелений значок верифікації; ліцензія та рейтинг видно у профілі.",
      "sr": "Svi Glatko profesionalci prolaze proveru identiteta i licence. Tražite zelenu oznaku — licenca, osiguranje i ocena su vidljivi na profilu.",
      "me": "Svi Glatko profesionalci prolaze provjeru identiteta i licence. Tražite zelenu oznaku — licenca, osiguranje i ocjena su vidljivi na profilu.",
      "ar": "كل مزود خدمة على Glatko يجتاز التحقق من الهوية والترخيص. ابحث عن الشارة الخضراء — الترخيص والتأمين والتقييم ظاهرة على كل ملف."
    }
  },
  {
    "q": {
      "tr": "Sigortalı tekne hizmeti alabilir miyim?",
      "en": "Can I get insured boat services through Glatko?",
      "de": "Kann ich versicherte Bootsdienste über Glatko buchen?",
      "it": "Posso prenotare servizi nautici assicurati tramite Glatko?",
      "ru": "Можно ли заказать застрахованные услуги для лодки?",
      "uk": "Чи можу я замовити застраховані послуги для човна?",
      "sr": "Da li mogu dobiti osigurane usluge preko Glatka?",
      "me": "Da li mogu dobiti osigurane usluge preko Glatka?",
      "ar": "هل يمكنني الحصول على خدمات قارب مؤمَّنة عبر Glatko؟"
    },
    "a": {
      "tr": "Evet, sigortalı sağlayıcıların profilinde \"sigortalı\" rozeti vardır. Teklif istediğinizde sigorta filtresini kullanın.",
      "en": "Yes — insured providers display an \"insured\" badge. Filter your bids by insurance status before accepting an offer.",
      "de": "Ja — versicherte Anbieter zeigen ein \"versichert\"-Badge. Filtern Sie Ihre Angebote nach Versicherung, bevor Sie annehmen.",
      "it": "Sì — i professionisti assicurati hanno un badge \"assicurato\". Filtra le offerte per stato assicurativo prima di accettare.",
      "ru": "Да — у застрахованных исполнителей отображается значок \"застрахован\". Фильтруйте предложения по страховке перед выбором.",
      "uk": "Так — у застрахованих виконавців є значок \"застрахований\". Фільтруйте пропозиції за страховкою.",
      "sr": "Da — osigurani profesionalci imaju oznaku \"osiguran\". Filtrirajte ponude prema statusu osiguranja pre prihvatanja.",
      "me": "Da — osigurani profesionalci imaju oznaku \"osiguran\". Filtrirajte ponude prema statusu osiguranja prije prihvatanja.",
      "ar": "نعم — يعرض مقدمو الخدمات المؤمَّنون شارة \"مؤمَّن\". قم بتصفية العروض حسب حالة التأمين قبل القبول."
    }
  }
]'::jsonb
WHERE slug = 'boat-services';

-- ──────────────────────────────────────────────────────────────────────────
-- home-cleaning
-- ──────────────────────────────────────────────────────────────────────────
UPDATE public.glatko_service_categories
SET faqs = '[
  {
    "q": {
      "tr": "Karadağ''da ev temizliği ne kadar tutar?",
      "en": "How much does home cleaning cost in Montenegro?",
      "de": "Was kostet eine Hausreinigung in Montenegro?",
      "it": "Quanto costa la pulizia della casa in Montenegro?",
      "ru": "Сколько стоит уборка дома в Черногории?",
      "uk": "Скільки коштує прибирання дому в Чорногорії?",
      "sr": "Koliko košta čišćenje kuće u Crnoj Gori?",
      "me": "Koliko košta čišćenje kuće u Crnoj Gori?",
      "ar": "كم تكلفة تنظيف المنزل في الجبل الأسود؟"
    },
    "a": {
      "tr": "Standart temizlik €15-25/saat. 2 odalı bir daire için derin temizlik yaklaşık €120''den başlar. Boka''da fiyatlar Tivat-Budva''da biraz daha yüksek olabilir.",
      "en": "Standard cleaning runs €15-25/hour. Deep cleaning for a 2-bedroom apartment starts around €120. Tivat and Budva run slightly higher than Kotor.",
      "de": "Standardreinigung kostet €15-25/Stunde. Tiefenreinigung einer 2-Zimmer-Wohnung ab €120. Tivat und Budva sind etwas teurer als Kotor.",
      "it": "Pulizia standard €15-25/ora. Pulizia profonda per appartamento 2 camere da €120. Tivat e Budva un po'' più alti di Kotor.",
      "ru": "Стандартная уборка €15-25/час. Генеральная уборка двухкомнатной квартиры от €120. В Тивате и Будве чуть дороже, чем в Которе.",
      "uk": "Стандартне прибирання €15-25/година. Генеральне прибирання двокімнатної квартири від €120. Тіват і Будва трохи дорожчі за Котор.",
      "sr": "Standardno čišćenje €15-25/sat. Dubinsko čišćenje dvosobnog stana od €120. Tivat i Budva su nešto skuplji od Kotora.",
      "me": "Standardno čišćenje €15-25/sat. Dubinsko čišćenje dvosobnog stana od €120. Tivat i Budva su nešto skuplji od Kotora.",
      "ar": "التنظيف القياسي €15-25/ساعة. التنظيف العميق لشقة بغرفتي نوم يبدأ من €120. تيفات وبودفا أعلى قليلاً من كوتور."
    }
  },
  {
    "q": {
      "tr": "Standart temizlik ne kadar sürer?",
      "en": "How long does a regular cleaning take?",
      "de": "Wie lange dauert eine reguläre Reinigung?",
      "it": "Quanto dura una pulizia regolare?",
      "ru": "Сколько длится обычная уборка?",
      "uk": "Скільки часу займає звичайне прибирання?",
      "sr": "Koliko traje redovno čišćenje?",
      "me": "Koliko traje redovno čišćenje?",
      "ar": "كم تستغرق عملية التنظيف العادية؟"
    },
    "a": {
      "tr": "2 odalı daire genelde 2-3 saatte tamamlanır. Derin temizlik 4-6 saat alır. Profil sayfasındaki ortalama tepki süresine bakın.",
      "en": "A 2-bedroom apartment typically takes 2-3 hours. Deep cleans require 4-6 hours. Check each pro''s average response time on their profile.",
      "de": "2-Zimmer-Wohnung in der Regel 2-3 Stunden. Tiefenreinigung 4-6 Stunden. Reaktionszeit auf jedem Profil sichtbar.",
      "it": "Appartamento 2 camere in genere 2-3 ore. Pulizia profonda 4-6 ore. Tempo di risposta medio visibile sul profilo.",
      "ru": "Двухкомнатная квартира обычно 2-3 часа. Генеральная уборка 4-6 часов. Среднее время ответа видно в профиле.",
      "uk": "Двокімнатна квартира зазвичай 2-3 години. Генеральне 4-6 годин. Середній час відповіді у профілі.",
      "sr": "Dvosoban stan obično 2-3 sata. Dubinsko čišćenje 4-6 sati. Prosečno vreme odgovora na profilu.",
      "me": "Dvosoban stan obično 2-3 sata. Dubinsko čišćenje 4-6 sati. Prosječno vrijeme odgovora na profilu.",
      "ar": "شقة بغرفتي نوم تستغرق عادة 2-3 ساعات. التنظيف العميق 4-6 ساعات. متوسط وقت الاستجابة ظاهر على ملف كل محترف."
    }
  },
  {
    "q": {
      "tr": "Temizlik malzemeleri dahil mi?",
      "en": "Are cleaning supplies included?",
      "de": "Sind Reinigungsmittel inklusive?",
      "it": "I prodotti per pulire sono inclusi?",
      "ru": "Входят ли моющие средства в стоимость?",
      "uk": "Чи входять засоби для прибирання у вартість?",
      "sr": "Da li su sredstva za čišćenje uključena?",
      "me": "Da li su sredstva za čišćenje uključena?",
      "ar": "هل مستلزمات التنظيف مشمولة؟"
    },
    "a": {
      "tr": "Çoğu sağlayıcı kendi malzemesini getirir. Eko ürün veya özel deterjan istiyorsanız teklifi kabul etmeden önce belirtin.",
      "en": "Most providers bring their own supplies. If you need eco-friendly or specific products, mention it in your job post before accepting a bid.",
      "de": "Die meisten Anbieter bringen eigene Mittel mit. Bei Wunsch nach Öko-Produkten teilen Sie es im Auftrag mit.",
      "it": "La maggior parte porta i propri prodotti. Per prodotti eco o specifici, segnalalo nell''annuncio prima di accettare l''offerta.",
      "ru": "Большинство мастеров берут свои средства. Если нужны эко или специальные — укажите это в заказе.",
      "uk": "Більшість майстрів приносять свої засоби. Якщо потрібні еко чи спеціальні — вкажіть у замовленні.",
      "sr": "Većina profesionalaca donosi sopstvena sredstva. Za eko ili posebne proizvode, navedite to u objavi.",
      "me": "Većina profesionalaca donosi sopstvena sredstva. Za eko ili posebne proizvode, navedite to u oglasu.",
      "ar": "معظم المحترفين يحضرون مستلزماتهم. إذا أردت منتجات صديقة للبيئة أو منتجات محددة، اذكر ذلك في طلبك."
    }
  },
  {
    "q": {
      "tr": "Düzenli (haftalık) temizlik rezerve edebilir miyim?",
      "en": "Can I book recurring cleaning through Glatko?",
      "de": "Kann ich wiederkehrende Reinigungen über Glatko buchen?",
      "it": "Posso prenotare pulizie ricorrenti su Glatko?",
      "ru": "Можно ли забронировать регулярную уборку?",
      "uk": "Чи можна замовити регулярне прибирання?",
      "sr": "Da li mogu rezervisati redovno čišćenje?",
      "me": "Da li mogu rezervisati redovno čišćenje?",
      "ar": "هل يمكنني حجز تنظيف متكرر عبر Glatko؟"
    },
    "a": {
      "tr": "Evet — haftalık, iki haftada bir veya aylık tekrarlı hizmet talep edebilirsiniz. Tek bir teklif kabul edin, sağlayıcı takviminize sabitlensin.",
      "en": "Yes — request weekly, biweekly or monthly recurring service in your job post. Accept once and the same pro stays on your schedule.",
      "de": "Ja — fordern Sie wöchentliche, zweiwöchentliche oder monatliche Termine an. Einmal akzeptiert bleibt der Anbieter in Ihrem Plan.",
      "it": "Sì — richiedi servizio settimanale, quindicinale o mensile. Accetta una volta e il professionista resta nel tuo calendario.",
      "ru": "Да — закажите еженедельную, раз в две недели или ежемесячную уборку. Примите предложение один раз — мастер останется в графике.",
      "uk": "Так — замовте щотижневе, раз на два тижні чи щомісячне прибирання. Прийміть один раз — майстер залишиться у графіку.",
      "sr": "Da — zatražite nedeljno, dvonedeljno ili mesečno čišćenje. Prihvatite jednom i isti profesionalac ostaje u rasporedu.",
      "me": "Da — zatražite sedmično, dvosedmično ili mjesečno čišćenje. Prihvatite jednom i isti profesionalac ostaje u rasporedu.",
      "ar": "نعم — اطلب خدمة أسبوعية أو نصف شهرية أو شهرية. اقبل مرة ويبقى نفس المحترف ضمن جدولك."
    }
  }
]'::jsonb
WHERE slug = 'home-cleaning';

-- ──────────────────────────────────────────────────────────────────────────
-- renovation-construction
-- ──────────────────────────────────────────────────────────────────────────
UPDATE public.glatko_service_categories
SET faqs = '[
  {
    "q": {
      "tr": "Karadağ''da banyo tadilatı ne kadar sürer?",
      "en": "How long does a bathroom renovation take in Montenegro?",
      "de": "Wie lange dauert eine Badrenovierung in Montenegro?",
      "it": "Quanto dura una ristrutturazione del bagno in Montenegro?",
      "ru": "Сколько занимает ремонт ванной в Черногории?",
      "uk": "Скільки часу займає ремонт ванної в Чорногорії?",
      "sr": "Koliko traje renoviranje kupatila u Crnoj Gori?",
      "me": "Koliko traje renoviranje kupatila u Crnoj Gori?",
      "ar": "كم يستغرق تجديد الحمام في الجبل الأسود؟"
    },
    "a": {
      "tr": "Küçük bir banyo 5-10 iş günü, sıhhi tesisat dahil tam tadilat 2-3 hafta sürer. Yaz sezonu öncesi (Mart-Nisan) önceden rezerve edin.",
      "en": "A small bathroom takes 5-10 working days. Full renovation including plumbing runs 2-3 weeks. Book ahead in March-April before peak season.",
      "de": "Ein kleines Bad dauert 5-10 Arbeitstage. Komplettrenovierung inkl. Sanitär 2-3 Wochen. Vor März-April vorbestellen.",
      "it": "Un piccolo bagno richiede 5-10 giorni lavorativi. Ristrutturazione completa con idraulica 2-3 settimane. Prenota a marzo-aprile.",
      "ru": "Маленькая ванная — 5-10 рабочих дней. Полный ремонт с сантехникой — 2-3 недели. Бронируйте в марте-апреле, до сезона.",
      "uk": "Маленька ванна — 5-10 робочих днів. Повний ремонт із сантехнікою — 2-3 тижні. Бронюйте в березні-квітні до сезону.",
      "sr": "Malo kupatilo 5-10 radnih dana. Potpuno renoviranje sa vodovodom 2-3 nedelje. Rezervišite u martu-aprilu pre sezone.",
      "me": "Malo kupatilo 5-10 radnih dana. Potpuno renoviranje sa vodovodom 2-3 sedmice. Rezervišite u martu-aprilu prije sezone.",
      "ar": "حمام صغير يستغرق 5-10 أيام عمل. التجديد الكامل مع السباكة 2-3 أسابيع. احجز في مارس-أبريل قبل الموسم."
    }
  },
  {
    "q": {
      "tr": "Tadilat için izin gerekiyor mu?",
      "en": "Do I need a permit for renovation work?",
      "de": "Brauche ich eine Genehmigung für Umbauten?",
      "it": "Serve un permesso per ristrutturare?",
      "ru": "Нужно ли разрешение на ремонт?",
      "uk": "Чи потрібен дозвіл на ремонт?",
      "sr": "Da li je potrebna dozvola za renoviranje?",
      "me": "Da li je potrebna dozvola za renoviranje?",
      "ar": "هل أحتاج إلى تصريح للترميم؟"
    },
    "a": {
      "tr": "Kozmetik işler için genelde izin gerekmez, ama yapısal değişikliklerde gerekir. Glatko''daki müteahhit yerel belediye gerekliliklerini bilir ve süreci yürütür.",
      "en": "Cosmetic work usually doesn''t require a permit, but structural changes do. Your Glatko contractor knows local opština rules and can guide you.",
      "de": "Kosmetische Arbeiten benötigen meist keine Genehmigung, strukturelle schon. Ihr Glatko-Auftragnehmer kennt die örtlichen Vorschriften.",
      "it": "Lavori estetici di solito non richiedono permesso, quelli strutturali sì. Il professionista Glatko conosce le regole locali.",
      "ru": "Косметический ремонт обычно не требует разрешения, конструктивные изменения — да. Подрядчик Glatko знает местные правила.",
      "uk": "Косметичний ремонт зазвичай не потребує дозволу, але структурні зміни — так. Підрядник Glatko знає місцеві правила.",
      "sr": "Kozmetički radovi obično ne zahtevaju dozvolu, ali strukturne promene zahtevaju. Glatko izvođač zna pravila opštine.",
      "me": "Kozmetički radovi obično ne zahtijevaju dozvolu, ali strukturne promjene da. Glatko izvođač zna pravila opštine.",
      "ar": "الأعمال التجميلية لا تتطلب عادة تصريحًا، أما التغييرات الهيكلية فتتطلب. مقاول Glatko يعرف قواعد البلدية."
    }
  },
  {
    "q": {
      "tr": "Güvenilir maliyet tahmini nasıl alınır?",
      "en": "How do I get reliable cost estimates?",
      "de": "Wie bekomme ich zuverlässige Kostenvoranschläge?",
      "it": "Come ottengo preventivi affidabili?",
      "ru": "Как получить надёжные сметы?",
      "uk": "Як отримати надійні кошториси?",
      "sr": "Kako da dobijem pouzdane procene troškova?",
      "me": "Kako da dobijem pouzdane procjene troškova?",
      "ar": "كيف أحصل على تقديرات تكلفة موثوقة؟"
    },
    "a": {
      "tr": "Projenizi Glatko''da yayınlayın; 48 saat içinde verifiye olmuş 3+ müteahhitten kör teklif alırsınız. Tahmin değil, gerçek fiyat.",
      "en": "Post your project on Glatko and you''ll get 3+ blind bids from verified contractors within 48 hours. Real prices, not estimates.",
      "de": "Veröffentlichen Sie Ihr Projekt auf Glatko — innerhalb 48 Stunden 3+ Blindangebote verifizierter Anbieter. Echte Preise, keine Schätzungen.",
      "it": "Pubblica il progetto su Glatko: 3+ offerte cieche da imprese verificate entro 48 ore. Prezzi reali, non stime.",
      "ru": "Разместите проект на Glatko — за 48 часов получите 3+ закрытых предложения от проверенных подрядчиков. Реальные цены.",
      "uk": "Розмістіть проект на Glatko — за 48 годин отримаєте 3+ закритих пропозицій від перевірених підрядників. Реальні ціни.",
      "sr": "Objavite projekat na Glatku — u 48h dobićete 3+ slepih ponuda od proverenih izvođača. Realne cene, ne procene.",
      "me": "Objavite projekat na Glatku — u 48h dobićete 3+ slijepih ponuda od provjerenih izvođača. Realne cijene, ne procjene.",
      "ar": "انشر مشروعك على Glatko وستحصل على 3+ عروض من مقاولين موثوقين خلال 48 ساعة. أسعار حقيقية وليست تقديرية."
    }
  },
  {
    "q": {
      "tr": "Müteahhitler hasarlara karşı sigortalı mı?",
      "en": "Are providers insured for damages during renovation?",
      "de": "Sind Anbieter gegen Renovierungsschäden versichert?",
      "it": "Le imprese sono assicurate contro i danni durante i lavori?",
      "ru": "Застрахованы ли подрядчики от повреждений?",
      "uk": "Чи застраховані підрядники від пошкоджень?",
      "sr": "Da li su izvođači osigurani od šteta tokom renoviranja?",
      "me": "Da li su izvođači osigurani od šteta tokom renoviranja?",
      "ar": "هل المقاولون مؤمَّنون ضد الأضرار أثناء التجديد؟"
    },
    "a": {
      "tr": "Sigortalı olanların profilinde \"sigortalı\" rozeti vardır. İş ilanınızda \"sadece sigortalı\" filtresini açın.",
      "en": "Insured providers display an \"insured\" badge on their profile. Toggle the \"insured only\" filter on your job post.",
      "de": "Versicherte Anbieter zeigen ein \"versichert\"-Badge. Aktivieren Sie den \"nur versichert\"-Filter im Auftrag.",
      "it": "Le imprese assicurate hanno il badge \"assicurato\". Attiva il filtro \"solo assicurati\" nell''annuncio.",
      "ru": "У застрахованных есть значок \"застрахован\". Включите фильтр \"только застрахованные\" в заказе.",
      "uk": "У застрахованих є значок \"застрахований\". Увімкніть фільтр \"лише застраховані\" у замовленні.",
      "sr": "Osigurani izvođači imaju oznaku \"osiguran\". Uključite filter \"samo osigurani\" u objavi.",
      "me": "Osigurani izvođači imaju oznaku \"osiguran\". Uključite filter \"samo osigurani\" u oglasu.",
      "ar": "يعرض المقاولون المؤمَّنون شارة \"مؤمَّن\" على ملفاتهم. فعّل خيار \"المؤمَّنون فقط\" عند نشر الوظيفة."
    }
  }
]'::jsonb
WHERE slug = 'renovation-construction';

-- ──────────────────────────────────────────────────────────────────────────
-- beauty-wellness
-- ──────────────────────────────────────────────────────────────────────────
UPDATE public.glatko_service_categories
SET faqs = '[
  {
    "q": {
      "tr": "Karadağ''da evde saç kesimi ne kadar?",
      "en": "How much does a home haircut cost in Montenegro?",
      "de": "Was kostet ein Haarschnitt zu Hause in Montenegro?",
      "it": "Quanto costa un taglio di capelli a domicilio in Montenegro?",
      "ru": "Сколько стоит стрижка на дому в Черногории?",
      "uk": "Скільки коштує стрижка вдома в Чорногорії?",
      "sr": "Koliko košta šišanje kod kuće u Crnoj Gori?",
      "me": "Koliko košta šišanje kod kuće u Crnoj Gori?",
      "ar": "كم تكلفة قص الشعر في المنزل في الجبل الأسود؟"
    },
    "a": {
      "tr": "Mobil saç kesimi €15-30 arası. Boyama veya bakım gibi daha kapsamlı işler €60''dan başlar.",
      "en": "Mobile haircuts run €15-30. More elaborate styling like colour or treatments starts around €60.",
      "de": "Mobile Haarschnitte €15-30. Aufwendige Styles wie Färben oder Behandlungen ab €60.",
      "it": "Tagli a domicilio €15-30. Servizi più elaborati come colore o trattamenti da €60.",
      "ru": "Стрижка с выездом €15-30. Окрашивание или процедуры — от €60.",
      "uk": "Стрижка з виїздом €15-30. Фарбування чи процедури — від €60.",
      "sr": "Mobilno šišanje €15-30. Složeniji tretmani poput farbanja od €60.",
      "me": "Mobilno šišanje €15-30. Složeniji tretmani poput farbanja od €60.",
      "ar": "قص الشعر المتنقل €15-30. التصفيف الأكثر تفصيلاً كالصبغ أو العلاجات يبدأ من €60."
    }
  },
  {
    "q": {
      "tr": "Güzellik hizmetleri eve gelir mi?",
      "en": "Can beauty services come to my home?",
      "de": "Kommen Beauty-Dienste zu mir nach Hause?",
      "it": "I servizi di bellezza vengono a casa?",
      "ru": "Приезжают ли мастера красоты на дом?",
      "uk": "Чи приїжджають майстри краси додому?",
      "sr": "Da li mogu beauty usluge doći kod mene?",
      "me": "Da li mogu beauty usluge doći kod mene?",
      "ar": "هل تأتي خدمات التجميل إلى منزلي؟"
    },
    "a": {
      "tr": "Evet — Boka Körfezi ve Podgorica''da pek çok Glatko sağlayıcısı mobil hizmet verir. Otel, villa veya tekne adresine gelirler.",
      "en": "Yes — many Glatko pros offer mobile beauty across Boka Bay and Podgorica. They''ll come to your hotel, villa or boat.",
      "de": "Ja — viele Glatko-Anbieter bieten mobilen Beauty-Service in Bucht von Kotor und Podgorica. Hotel, Villa oder Boot.",
      "it": "Sì — molti professionisti Glatko offrono bellezza mobile a Bocche di Cattaro e Podgorica. Vengono in hotel, villa o barca.",
      "ru": "Да — многие мастера Glatko работают с выездом в Которском заливе и Подгорице. Приедут в отель, виллу или на лодку.",
      "uk": "Так — багато майстрів Glatko працюють з виїздом у Которській затоці та Подгориці. Готель, вілла чи човен.",
      "sr": "Da — mnogi Glatko profesionalci nude mobilne beauty usluge u Boki i Podgorici. Dolaze u hotel, vilu ili na brod.",
      "me": "Da — mnogi Glatko profesionalci nude mobilne beauty usluge u Boki i Podgorici. Dolaze u hotel, vilu ili na brod.",
      "ar": "نعم — يقدم كثير من محترفي Glatko خدمات تجميل متنقلة في خليج بوكا وبودغوريتسا. يأتون إلى الفندق أو الفيلا أو القارب."
    }
  },
  {
    "q": {
      "tr": "Profesyoneller kendi ekipmanlarını mı getirir?",
      "en": "Do providers bring their own equipment?",
      "de": "Bringen Anbieter ihre eigene Ausrüstung mit?",
      "it": "I professionisti portano la propria attrezzatura?",
      "ru": "Привозят ли мастера своё оборудование?",
      "uk": "Чи привозять майстри своє обладнання?",
      "sr": "Da li profesionalci donose sopstvenu opremu?",
      "me": "Da li profesionalci donose sopstvenu opremu?",
      "ar": "هل يحضر مقدمو الخدمة معداتهم الخاصة؟"
    },
    "a": {
      "tr": "Mobil güzellik profesyonelleri tam donanımlı gelir. Sandalye, kurutma makinesi gibi belirli aletleri teklifte konfirme edin.",
      "en": "Mobile beauty pros come fully equipped. Confirm specific tools (chair, dryer, sterilizer) when accepting a bid.",
      "de": "Mobile Beauty-Profis kommen voll ausgestattet. Spezielle Ausrüstung (Stuhl, Föhn) bei Angebotsannahme bestätigen.",
      "it": "I professionisti della bellezza arrivano completamente attrezzati. Conferma strumenti specifici (sedia, asciugacapelli) all''offerta.",
      "ru": "Мобильные мастера приезжают со всем нужным. Уточните конкретные инструменты (кресло, фен) при выборе предложения.",
      "uk": "Мобільні майстри приїжджають з усім обладнанням. Уточнюйте конкретні інструменти (крісло, фен) під час прийняття пропозиції.",
      "sr": "Mobilni profesionalci dolaze potpuno opremljeni. Potvrdite specifične alate (stolica, fen) pri prihvatanju ponude.",
      "me": "Mobilni profesionalci dolaze potpuno opremljeni. Potvrdite specifične alate (stolica, fen) pri prihvatanju ponude.",
      "ar": "محترفو التجميل المتنقلون يأتون بكامل تجهيزاتهم. أكِّد على الأدوات المحددة (كرسي، مجفف) عند قبول العرض."
    }
  },
  {
    "q": {
      "tr": "Aynı gün randevu ne kadar hızlı alabilirim?",
      "en": "How quickly can I book a same-day appointment?",
      "de": "Wie schnell kann ich einen Termin am selben Tag bekommen?",
      "it": "Quanto velocemente posso prenotare un appuntamento in giornata?",
      "ru": "Как быстро можно записаться на сегодня?",
      "uk": "Як швидко можна записатися на сьогодні?",
      "sr": "Koliko brzo mogu zakazati za isti dan?",
      "me": "Koliko brzo mogu zakazati za isti dan?",
      "ar": "ما السرعة التي يمكنني بها حجز موعد في نفس اليوم؟"
    },
    "a": {
      "tr": "\"ASAP\" işaretiyle ilan açın; mesai saatlerinde sağlayıcılar dakikalar içinde yanıt verir. Yaz aylarında 1-2 saat içinde randevu alabilirsiniz.",
      "en": "Mark your request \"ASAP\" — providers respond within minutes during business hours. Summer slots open within 1-2 hours.",
      "de": "Markieren Sie Ihre Anfrage als \"ASAP\" — Antworten innerhalb von Minuten in den Geschäftszeiten. Sommertermine in 1-2 Stunden.",
      "it": "Segna la richiesta \"ASAP\" — i professionisti rispondono in minuti negli orari di lavoro. In estate posti in 1-2 ore.",
      "ru": "Отметьте запрос \"ASAP\" — мастера отвечают за минуты в рабочее время. Летом место освобождается за 1-2 часа.",
      "uk": "Позначте запит \"ASAP\" — майстри відповідають за хвилини у робочий час. Влітку місця за 1-2 години.",
      "sr": "Označite zahtev kao \"ASAP\" — profesionalci odgovaraju u nekoliko minuta. Leti slobodni termini u 1-2 sata.",
      "me": "Označite zahtjev kao \"ASAP\" — profesionalci odgovaraju u nekoliko minuta. Ljeti slobodni termini u 1-2 sata.",
      "ar": "حدِّد طلبك بـ \"عاجل\" — يستجيب المحترفون خلال دقائق في ساعات العمل. مواعيد الصيف تفتح خلال 1-2 ساعة."
    }
  }
]'::jsonb
WHERE slug = 'beauty-wellness';

COMMIT;

-- Verification:
-- SELECT slug, jsonb_array_length(faqs) AS faq_count
-- FROM public.glatko_service_categories
-- WHERE slug IN ('boat-services','home-cleaning','renovation-construction','beauty-wellness');
-- Expected: 4 rows, each with faq_count = 4.
