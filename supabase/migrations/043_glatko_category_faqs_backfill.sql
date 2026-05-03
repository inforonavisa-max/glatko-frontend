-- ═══════════════════════════════════════════════════════════════════════════
-- G-CONTENT-1 migration 043: FAQ backfill for the 10 remaining categories
-- ═══════════════════════════════════════════════════════════════════════════
-- Pairs with migration 042 (which created the JSONB column + seeded the
-- 4 P0 launch categories). This migration brings FAQ coverage from 4/14
-- to 14/14 — every active root category now ships a 4-question FAQPage
-- so Google + AI search engines have citation surface across the catalog.
--
-- 10 categories × 4 questions × 9 locales × 2 fields = 720 translation
-- entries. AI translation is acceptable for time-bounded SEO content per
-- the original sprint plan; native QA happens post-launch.
--
-- Question template (consistent across categories so structured-data tests
-- and content reviews can sweep efficiently):
--   Q1: Pricing — "How much does X cost in Montenegro / Boka Bay?"
--   Q2: Coverage — "Which areas does X serve?"
--   Q3: Verification — "How do I verify a provider?"
--   Q4: Category-specific (timing, packaging, peak season, etc.)
--
-- Idempotent: each block is `UPDATE … SET faqs = '[…]'::jsonb WHERE slug = …`
-- Apply via:  npx tsx scripts/apply-category-faqs.ts
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ──────────────────────────────────────────────────────────────────────────
-- airbnb-management
-- ──────────────────────────────────────────────────────────────────────────
UPDATE public.glatko_service_categories
SET faqs = '[
  {
    "q": {
      "tr": "Karadağ''da Airbnb yönetimi ne kadar tutar?",
      "en": "How much does Airbnb management cost in Montenegro?",
      "de": "Was kostet Airbnb-Verwaltung in Montenegro?",
      "it": "Quanto costa la gestione di un Airbnb in Montenegro?",
      "ru": "Сколько стоит управление Airbnb в Черногории?",
      "uk": "Скільки коштує управління Airbnb у Чорногорії?",
      "sr": "Koliko košta upravljanje Airbnb-om u Crnoj Gori?",
      "me": "Koliko košta upravljanje Airbnb-om u Crnoj Gori?",
      "ar": "كم تكلفة إدارة Airbnb في الجبل الأسود؟"
    },
    "a": {
      "tr": "Tam yönetim genellikle aylık gelirin %18-25''i arasındadır; sadece check-in/temizlik için sabit konukçu başına €25-€60. Net teklifleri Glatko''da görün.",
      "en": "Full management typically runs 18-25% of monthly revenue; turnover-only (check-in + cleaning) is €25-€60 per stay. See real bids on Glatko.",
      "de": "Die Komplettverwaltung kostet meist 18-25% des Monatsumsatzes; reiner Wechselservice (Check-in + Reinigung) €25-€60 pro Aufenthalt.",
      "it": "La gestione completa è di solito il 18-25% del fatturato mensile; solo turnover (check-in + pulizia) costa €25-€60 a soggiorno.",
      "ru": "Полное управление обычно 18-25% от месячного дохода; только смена гостей (заселение + уборка) — €25-€60 за заезд.",
      "uk": "Повне управління зазвичай 18-25% місячного доходу; тільки заселення + прибирання — €25-€60 за заїзд.",
      "sr": "Puno upravljanje obično 18-25% mesečnog prihoda; samo smena gostiju (check-in + čišćenje) je €25-€60 po boravku.",
      "me": "Puno upravljanje obično 18-25% mjesečnog prihoda; samo smjena gostiju (check-in + čišćenje) je €25-€60 po boravku.",
      "ar": "الإدارة الكاملة عادة 18-25% من الإيراد الشهري؛ تبديل الضيوف فقط (تسجيل + تنظيف) €25-€60 لكل إقامة."
    }
  },
  {
    "q": {
      "tr": "Hangi şehirlerde Airbnb yönetimi sunuluyor?",
      "en": "Which cities offer Airbnb management on Glatko?",
      "de": "In welchen Städten wird Airbnb-Verwaltung angeboten?",
      "it": "In quali città è disponibile la gestione Airbnb?",
      "ru": "В каких городах доступно управление Airbnb?",
      "uk": "У яких містах доступне управління Airbnb?",
      "sr": "U kojim gradovima je dostupno upravljanje Airbnb-om?",
      "me": "U kojim gradovima je dostupno upravljanje Airbnb-om?",
      "ar": "في أي مدن تتوفر إدارة Airbnb؟"
    },
    "a": {
      "tr": "Boka Körfezi (Kotor, Tivat, Herceg Novi, Budva), Bar, Ulcinj ve Podgorica''da aktif ev sahibi yöneticileri Glatko''da. Sahildeki yoğun sezonlarda 24-saat müsaitlik var.",
      "en": "Active managers cover Boka Bay (Kotor, Tivat, Herceg Novi, Budva), Bar, Ulcinj, and Podgorica. 24-hour availability during summer peak.",
      "de": "Aktive Manager decken Bucht von Kotor (Kotor, Tivat, Herceg Novi, Budva), Bar, Ulcinj und Podgorica ab. 24-Stunden-Bereitschaft in der Hauptsaison.",
      "it": "Manager attivi coprono Bocche di Cattaro (Kotor, Tivat, Herceg Novi, Budva), Bar, Ulcinj e Podgorica. Disponibilità 24h in alta stagione.",
      "ru": "Активные управляющие работают в Которском заливе (Котор, Тиват, Херцег-Нови, Будва), Баре, Улцине и Подгорице. 24-часовая поддержка в высокий сезон.",
      "uk": "Активні управителі покривають Которську затоку (Котор, Тиват, Герцег-Нові, Будва), Бар, Улцинь і Подгорицю. Підтримка 24/7 у пік сезону.",
      "sr": "Aktivni menadžeri pokrivaju Bokokotorski zaliv (Kotor, Tivat, Herceg Novi, Budva), Bar, Ulcinj i Podgoricu. Dostupnost 24h u špicu sezone.",
      "me": "Aktivni menadžeri pokrivaju Bokokotorski zaliv (Kotor, Tivat, Herceg Novi, Budva), Bar, Ulcinj i Podgoricu. Dostupnost 24h u špicu sezone.",
      "ar": "المديرون النشطون يغطون خليج بوكا (كوتور، تيفات، هيرتسيغ نوفي، بودفا)، بار، أولتسين، وبودغوريتسا. توفر 24 ساعة في ذروة الموسم."
    }
  },
  {
    "q": {
      "tr": "Yönetici sözleşmesinde nelere dikkat etmeliyim?",
      "en": "What should I check in an Airbnb manager contract?",
      "de": "Worauf sollte ich im Airbnb-Manager-Vertrag achten?",
      "it": "A cosa fare attenzione nel contratto del gestore Airbnb?",
      "ru": "На что обратить внимание в договоре с управляющим Airbnb?",
      "uk": "На що звернути увагу в договорі з управителем Airbnb?",
      "sr": "Na šta obratiti pažnju u ugovoru sa Airbnb menadžerom?",
      "me": "Na šta obratiti pažnju u ugovoru sa Airbnb menadžerom?",
      "ar": "ما الذي يجب التحقق منه في عقد مدير Airbnb؟"
    },
    "a": {
      "tr": "Komisyon yapısı, münhasırlık, fesih şartları ve hasar sigortası net olmalı. Glatko''da onaylı yöneticiler standart şartlarla çalışır; sözleşme örneğini önceden talep edebilirsiniz.",
      "en": "Look for commission structure, exclusivity clause, termination terms, and damage insurance. Verified Glatko managers use standard contracts — request a sample upfront.",
      "de": "Achten Sie auf Provisionsstruktur, Exklusivitätsklausel, Kündigungsbedingungen und Schadensversicherung. Verifizierte Glatko-Manager nutzen Standardverträge.",
      "it": "Verifica la struttura della commissione, l''esclusiva, le clausole di recesso e l''assicurazione danni. I manager verificati su Glatko usano contratti standard.",
      "ru": "Проверьте структуру комиссии, эксклюзивность, условия расторжения и страховку от ущерба. Проверенные управляющие Glatko используют стандартные договоры.",
      "uk": "Перевірте структуру комісії, ексклюзивність, умови розірвання та страхування від збитків. Перевірені управителі Glatko використовують стандартні договори.",
      "sr": "Proverite strukturu provizije, ekskluzivnost, uslove raskida i osiguranje od štete. Proveren ji Glatko menadžeri koriste standardne ugovore.",
      "me": "Provjerite strukturu provizije, ekskluzivnost, uslove raskida i osiguranje od štete. Provjereni Glatko menadžeri koriste standardne ugovore.",
      "ar": "تحقق من هيكل العمولة، شرط الحصرية، شروط الإنهاء، والتأمين ضد الأضرار. مديرو Glatko الموثقون يستخدمون عقودًا قياسية."
    }
  },
  {
    "q": {
      "tr": "Sezon başında ne zaman yönetici ile anlaşmalıyım?",
      "en": "When should I sign with a manager before the season starts?",
      "de": "Wann sollte ich vor der Saison einen Manager beauftragen?",
      "it": "Quando dovrei firmare con un gestore prima dell''alta stagione?",
      "ru": "Когда заключать договор с управляющим перед сезоном?",
      "uk": "Коли укладати договір з управителем перед сезоном?",
      "sr": "Kada treba da potpišem sa menadžerom pre sezone?",
      "me": "Kada treba da potpišem sa menadžerom prije sezone?",
      "ar": "متى يجب أن أوقع مع مدير قبل بدء الموسم؟"
    },
    "a": {
      "tr": "Yaz peak sezonu (Haziran-Eylül) için Mart sonuna kadar anlaşma yapın. Bu süre fotoğraf çekimi, listing optimizasyonu ve OTA aktivasyonu için yeterlidir.",
      "en": "Sign by end of March for the June-September peak. This leaves time for photography, listing optimisation, and OTA activations.",
      "de": "Schließen Sie bis Ende März für die Hauptsaison Juni-September ab — Zeit für Fotos, Listing-Optimierung und OTA-Aktivierung.",
      "it": "Firma entro fine marzo per il picco giugno-settembre — tempo sufficiente per foto, ottimizzazione annuncio e attivazioni OTA.",
      "ru": "Заключайте до конца марта на пик июнь-сентябрь — времени хватит на фото, оптимизацию объявления и активацию OTA.",
      "uk": "Укладайте до кінця березня на пік червень-вересень — буде час на фото, оптимізацію оголошення та активацію OTA.",
      "sr": "Potpišite do kraja marta za špic jun-septembar — vreme za fotografisanje, optimizaciju oglasa i OTA aktivacije.",
      "me": "Potpišite do kraja marta za špic jun-septembar — vrijeme za fotografisanje, optimizaciju oglasa i OTA aktivacije.",
      "ar": "وقّع بنهاية مارس لذروة يونيو-سبتمبر — يكفي الوقت للتصوير وتحسين الإعلان وتفعيل OTA."
    }
  }
]'::jsonb
WHERE slug = 'airbnb-management';

-- ──────────────────────────────────────────────────────────────────────────
-- automotive
-- ──────────────────────────────────────────────────────────────────────────
UPDATE public.glatko_service_categories
SET faqs = '[
  {
    "q": {
      "tr": "Karadağ''da araç bakımı ne kadar tutar?",
      "en": "How much does car maintenance cost in Montenegro?",
      "de": "Was kostet eine Autowartung in Montenegro?",
      "it": "Quanto costa la manutenzione auto in Montenegro?",
      "ru": "Сколько стоит обслуживание автомобиля в Черногории?",
      "uk": "Скільки коштує обслуговування автомобіля в Чорногорії?",
      "sr": "Koliko košta servis automobila u Crnoj Gori?",
      "me": "Koliko košta servis automobila u Crnoj Gori?",
      "ar": "كم تكلفة صيانة السيارة في الجبل الأسود؟"
    },
    "a": {
      "tr": "Standart küçük servis €40-€90, büyük servis €120-€250 arasıdır. Detaylı (full detail) yıkama €60-€140. Glatko''da sabit fiyat tekliflerini karşılaştırın.",
      "en": "Minor service runs €40-€90, major service €120-€250. Full interior+exterior detail is €60-€140. Compare fixed-price bids on Glatko.",
      "de": "Kleiner Service €40-€90, großer Service €120-€250. Komplette Innen-/Außenreinigung €60-€140. Festpreis-Angebote auf Glatko.",
      "it": "Tagliando piccolo €40-€90, tagliando grande €120-€250. Detailing completo €60-€140. Confronta preventivi a prezzo fisso su Glatko.",
      "ru": "Малый сервис €40-€90, большой сервис €120-€250. Полная химчистка/детейлинг €60-€140. Сравните цены на Glatko.",
      "uk": "Дрібне ТО €40-€90, велике ТО €120-€250. Повний детейлінг €60-€140. Порівняйте фіксовані ціни на Glatko.",
      "sr": "Mali servis €40-€90, veliki servis €120-€250. Kompletan detailing €60-€140. Uporedite ponude sa fiksnom cenom na Glatku.",
      "me": "Mali servis €40-€90, veliki servis €120-€250. Kompletan detailing €60-€140. Uporedite ponude sa fiksnom cijenom na Glatku.",
      "ar": "خدمة صغيرة €40-€90، خدمة كبيرة €120-€250. تفصيل داخلي+خارجي كامل €60-€140. قارن العروض ذات السعر الثابت على Glatko."
    }
  },
  {
    "q": {
      "tr": "Mobil tamir hizmeti veriyor mu?",
      "en": "Are mobile / on-site car repairs available?",
      "de": "Gibt es mobile Werkstattdienste vor Ort?",
      "it": "È disponibile l''assistenza auto mobile a domicilio?",
      "ru": "Есть ли выездной автосервис?",
      "uk": "Чи є виїзний автосервіс?",
      "sr": "Da li postoji mobilni auto-servis na licu mesta?",
      "me": "Da li postoji mobilni auto-servis na licu mjesta?",
      "ar": "هل تتوفر خدمات إصلاح السيارات المتنقلة؟"
    },
    "a": {
      "tr": "Evet — Boka Körfezi ve Podgorica''da mobil servis veren teknisyenler var. Akü, fren balata, lastik değişimi gibi standart işler genellikle yerinde yapılır.",
      "en": "Yes — mobile technicians cover Boka Bay and Podgorica. Standard jobs (battery, brake pads, tyre swap) are usually done on-site.",
      "de": "Ja — mobile Techniker decken Bucht von Kotor und Podgorica ab. Standardarbeiten (Batterie, Bremsbeläge, Reifenwechsel) meist vor Ort.",
      "it": "Sì — tecnici mobili coprono Bocche di Cattaro e Podgorica. Lavori standard (batteria, pastiglie, cambio gomme) di solito a domicilio.",
      "ru": "Да — выездные мастера работают в Которском заливе и Подгорице. Стандартные работы (АКБ, колодки, шиномонтаж) обычно на месте.",
      "uk": "Так — виїзні майстри покривають Которську затоку та Подгорицю. Стандартні роботи (АКБ, колодки, шиномонтаж) зазвичай на місці.",
      "sr": "Da — mobilni majstori pokrivaju Bokokotorski zaliv i Podgoricu. Standardni poslovi (akumulator, pločice, gume) obično na licu mesta.",
      "me": "Da — mobilni majstori pokrivaju Bokokotorski zaliv i Podgoricu. Standardni poslovi (akumulator, pločice, gume) obično na licu mjesta.",
      "ar": "نعم — الفنيون المتنقلون يغطون خليج بوكا وبودغوريتسا. المهام القياسية (بطارية، تيل، تبديل إطارات) عادة في الموقع."
    }
  },
  {
    "q": {
      "tr": "Tamirciyi nasıl doğrularım?",
      "en": "How do I verify an automotive technician?",
      "de": "Wie verifiziere ich einen Kfz-Techniker?",
      "it": "Come verifico un meccanico auto?",
      "ru": "Как проверить автомеханика?",
      "uk": "Як перевірити автомеханіка?",
      "sr": "Kako da proverim automehaničara?",
      "me": "Kako da provjerim automehaničara?",
      "ar": "كيف أتحقق من فني السيارات؟"
    },
    "a": {
      "tr": "Glatko''daki tüm tamirciler kimlik ve işyeri kaydından geçer. Yeşil rozet, müşteri puanları ve önceki iş örneklerini profilde görebilirsiniz.",
      "en": "All Glatko technicians pass ID and business-registration verification. Look for the green badge, ratings, and prior work examples on each profile.",
      "de": "Alle Glatko-Techniker durchlaufen ID- und Gewerbenachweis-Prüfung. Achten Sie auf grünes Badge, Bewertungen und Arbeitsproben.",
      "it": "Tutti i tecnici Glatko passano la verifica ID e registro imprese. Cerca il badge verde, le valutazioni e gli esempi di lavoro nel profilo.",
      "ru": "Все мастера Glatko проходят проверку ID и регистрации бизнеса. Ищите зелёный значок, оценки и примеры работ на профиле.",
      "uk": "Усі майстри Glatko проходять перевірку документів і реєстрації бізнесу. Шукайте зелений значок, оцінки та приклади робіт.",
      "sr": "Svi Glatko tehničari prolaze proveru identiteta i poslovne registracije. Tražite zelenu značku, ocene i primere radova na profilu.",
      "me": "Svi Glatko tehničari prolaze provjeru identiteta i poslovne registracije. Tražite zelenu značku, ocjene i primjere radova na profilu.",
      "ar": "يجتاز جميع فنيي Glatko التحقق من الهوية وتسجيل الأعمال. ابحث عن الشارة الخضراء والتقييمات وأمثلة الأعمال السابقة."
    }
  },
  {
    "q": {
      "tr": "Yaz sezonunda araç bakımı önceden mi yaptırmalıyım?",
      "en": "Should I do car maintenance before the summer season?",
      "de": "Sollte ich die Autowartung vor der Sommersaison machen?",
      "it": "Devo fare la manutenzione auto prima dell''estate?",
      "ru": "Нужно ли делать ТО перед летним сезоном?",
      "uk": "Чи робити ТО перед літнім сезоном?",
      "sr": "Da li treba da uradim servis pre leta?",
      "me": "Da li treba da uradim servis prije ljeta?",
      "ar": "هل أحتاج إلى صيانة السيارة قبل موسم الصيف؟"
    },
    "a": {
      "tr": "Evet — özellikle klima, fren ve lastik kontrolünü Mayıs ortasına kadar yaptırın. Yaz aylarında servisler doludur, randevu 2-3 hafta önceden yapın.",
      "en": "Yes — get A/C, brakes and tyres checked by mid-May. Workshops fill up in summer; book 2-3 weeks ahead.",
      "de": "Ja — Klima, Bremsen und Reifen bis Mitte Mai prüfen. Werkstätten sind im Sommer voll; 2-3 Wochen im Voraus buchen.",
      "it": "Sì — controlla aria condizionata, freni e gomme entro metà maggio. Le officine si riempiono in estate; prenota 2-3 settimane prima.",
      "ru": "Да — проверьте кондиционер, тормоза и шины до середины мая. Летом сервисы заняты; записывайтесь за 2-3 недели.",
      "uk": "Так — перевірте кондиціонер, гальма і шини до середини травня. Влітку сервіси завантажені; записуйтесь за 2-3 тижні.",
      "sr": "Da — proverite klimu, kočnice i gume do sredine maja. Servisi su leti puni; rezervišite 2-3 nedelje unapred.",
      "me": "Da — provjerite klimu, kočnice i gume do sredine maja. Servisi su ljeti puni; rezervišite 2-3 sedmice unaprijed.",
      "ar": "نعم — افحص التكييف والفرامل والإطارات بحلول منتصف مايو. الورش ممتلئة في الصيف؛ احجز قبل 2-3 أسابيع."
    }
  }
]'::jsonb
WHERE slug = 'automotive';

-- ──────────────────────────────────────────────────────────────────────────
-- catering-food
-- ──────────────────────────────────────────────────────────────────────────
UPDATE public.glatko_service_categories
SET faqs = '[
  {
    "q": {
      "tr": "Karadağ''da etkinlik catering''i kişi başı ne kadar?",
      "en": "How much does event catering cost per guest in Montenegro?",
      "de": "Was kostet Event-Catering pro Gast in Montenegro?",
      "it": "Quanto costa il catering per evento per ospite in Montenegro?",
      "ru": "Сколько стоит кейтеринг на гостя в Черногории?",
      "uk": "Скільки коштує кейтеринг на гостя у Чорногорії?",
      "sr": "Koliko košta keterning po gostu u Crnoj Gori?",
      "me": "Koliko košta keterning po gostu u Crnoj Gori?",
      "ar": "كم تكلفة تقديم الطعام للأحداث للضيف الواحد في الجبل الأسود؟"
    },
    "a": {
      "tr": "Kişi başı €25-€85 — büfe seçimi, kanepe servisi veya 3-tabak menüye göre. Düğün catering''i €60-€120 aralığındadır. Glatko''da sabit menü tekliflerini karşılaştırın.",
      "en": "Per-guest pricing runs €25-€85 depending on buffet, canapé service, or 3-course menu. Wedding catering is €60-€120/guest. Compare fixed menus on Glatko.",
      "de": "Pro Gast €25-€85 je nach Buffet, Canapé-Service oder 3-Gänge-Menü. Hochzeitscatering €60-€120/Gast. Festmenüs auf Glatko vergleichen.",
      "it": "Per ospite €25-€85 a seconda di buffet, finger food o menù 3 portate. Catering matrimonio €60-€120/ospite. Confronta menù fissi su Glatko.",
      "ru": "Цена на гостя €25-€85 в зависимости от формата (фуршет, канапе или 3-блюдное меню). Свадебный кейтеринг €60-€120/гость.",
      "uk": "Ціна на гостя €25-€85 залежно від формату (фуршет, канапе або 3-стравне меню). Весільний кейтеринг €60-€120/гість.",
      "sr": "Po gostu €25-€85 zavisno od bifea, kanape servisa ili 3-jelnog menija. Venčanje €60-€120/gost. Uporedite fiksne menije na Glatku.",
      "me": "Po gostu €25-€85 zavisno od bifea, kanape servisa ili 3-jelnog menija. Vjenčanje €60-€120/gost. Uporedite fiksne menije na Glatku.",
      "ar": "للضيف €25-€85 حسب البوفيه أو خدمة الكانابيه أو قائمة 3 أطباق. حفلات الزفاف €60-€120/ضيف. قارن القوائم الثابتة على Glatko."
    }
  },
  {
    "q": {
      "tr": "Hangi şehirlerde catering hizmeti mevcut?",
      "en": "Which cities have catering services on Glatko?",
      "de": "In welchen Städten gibt es Catering bei Glatko?",
      "it": "In quali città è disponibile il catering su Glatko?",
      "ru": "В каких городах доступен кейтеринг на Glatko?",
      "uk": "У яких містах доступний кейтеринг на Glatko?",
      "sr": "U kojim gradovima je dostupan keterning na Glatku?",
      "me": "U kojim gradovima je dostupan keterning na Glatku?",
      "ar": "في أي مدن تتوفر خدمة تقديم الطعام على Glatko؟"
    },
    "a": {
      "tr": "Boka Körfezi (Kotor, Tivat, Budva, Herceg Novi), Podgorica, Bar, Ulcinj. Marina ve villa düğünlerinde sahile ekipman taşıma standart hizmettir.",
      "en": "Boka Bay (Kotor, Tivat, Budva, Herceg Novi), Podgorica, Bar, Ulcinj. Marina and villa-wedding setups with on-site equipment delivery are standard.",
      "de": "Bucht von Kotor (Kotor, Tivat, Budva, Herceg Novi), Podgorica, Bar, Ulcinj. Marina- und Villa-Hochzeit mit Vor-Ort-Lieferung ist Standard.",
      "it": "Bocche di Cattaro (Kotor, Tivat, Budva, Herceg Novi), Podgorica, Bar, Ulcinj. Allestimenti marina e ville con consegna attrezzatura sono standard.",
      "ru": "Которский залив (Котор, Тиват, Будва, Херцег-Нови), Подгорица, Бар, Улцинь. Доставка оборудования на марины и виллы — стандарт.",
      "uk": "Которська затока (Котор, Тиват, Будва, Герцег-Нові), Подгориця, Бар, Улцинь. Доставка обладнання в марини і вілли — стандарт.",
      "sr": "Bokokotorski zaliv (Kotor, Tivat, Budva, Herceg Novi), Podgorica, Bar, Ulcinj. Marina i vila venčanja sa dostavom opreme su standard.",
      "me": "Bokokotorski zaliv (Kotor, Tivat, Budva, Herceg Novi), Podgorica, Bar, Ulcinj. Marina i vila vjenčanja sa dostavom opreme su standard.",
      "ar": "خليج بوكا (كوتور، تيفات، بودفا، هيرتسيغ نوفي)، بودغوريتسا، بار، أولتسين. إعدادات المرسى وحفلات الزفاف في الفلل مع توصيل المعدات قياسية."
    }
  },
  {
    "q": {
      "tr": "Catering şirketini nasıl doğrularım?",
      "en": "How do I verify a catering company?",
      "de": "Wie verifiziere ich einen Catering-Anbieter?",
      "it": "Come verifico una società di catering?",
      "ru": "Как проверить кейтеринговую компанию?",
      "uk": "Як перевірити кейтерингову компанію?",
      "sr": "Kako da proverim keterning firmu?",
      "me": "Kako da provjerim keterning firmu?",
      "ar": "كيف أتحقق من شركة تقديم الطعام؟"
    },
    "a": {
      "tr": "Glatko''daki catering sağlayıcıları gıda güvenliği belgesi (HACCP) ve işyeri kaydı doğrulamasından geçer. Geçmiş etkinlik fotoğraflarını profilden inceleyebilirsiniz.",
      "en": "Glatko caterers pass food-safety certification (HACCP) and business-registration checks. Browse past-event photos on each profile.",
      "de": "Glatko-Caterer durchlaufen Lebensmittelsicherheits-Zertifizierung (HACCP) und Gewerbenachweis. Vergangene Event-Fotos im Profil sichtbar.",
      "it": "I caterer su Glatko superano la certificazione HACCP e la verifica del registro imprese. Sfoglia le foto di eventi passati nel profilo.",
      "ru": "Кейтеринговые компании на Glatko проходят сертификацию HACCP и проверку регистрации бизнеса. Фото прошлых мероприятий — на профиле.",
      "uk": "Кейтерингові компанії на Glatko проходять сертифікацію HACCP і перевірку реєстрації. Фото з минулих заходів — у профілі.",
      "sr": "Keterneri na Glatku prolaze HACCP sertifikaciju i proveru poslovne registracije. Fotografije prethodnih događaja su u profilu.",
      "me": "Keterneri na Glatku prolaze HACCP sertifikaciju i provjeru poslovne registracije. Fotografije prethodnih događaja su u profilu.",
      "ar": "تجتاز شركات تقديم الطعام على Glatko شهادة HACCP والتحقق من تسجيل الأعمال. تصفح صور الأحداث السابقة في الملف."
    }
  },
  {
    "q": {
      "tr": "Düğün catering''i için ne kadar önceden rezervasyon yapmalıyım?",
      "en": "How far in advance should I book wedding catering?",
      "de": "Wie weit im Voraus sollte ich Hochzeitscatering buchen?",
      "it": "Con quanto anticipo prenotare il catering matrimoniale?",
      "ru": "За сколько бронировать свадебный кейтеринг?",
      "uk": "За скільки бронювати весільний кейтеринг?",
      "sr": "Koliko unapred rezervisati keterning za venčanje?",
      "me": "Koliko unaprijed rezervisati keterning za vjenčanje?",
      "ar": "كم من الوقت مسبقًا يجب حجز تقديم طعام الزفاف؟"
    },
    "a": {
      "tr": "Yaz düğünleri için en az 4-6 ay önceden rezervasyon yapın. Yüksek sezonda popüler caterer''lar Mayıs sonuna kadar dolar.",
      "en": "Book at least 4-6 months ahead for summer weddings. Popular caterers fill by end of May during peak season.",
      "de": "Mindestens 4-6 Monate im Voraus für Sommerhochzeiten buchen. Beliebte Caterer sind Ende Mai ausgebucht.",
      "it": "Prenota almeno 4-6 mesi prima per matrimoni estivi. I caterer più richiesti si esauriscono entro fine maggio.",
      "ru": "Бронируйте за 4-6 месяцев на летние свадьбы. Популярные кейтеры разбирают до конца мая.",
      "uk": "Бронюйте за 4-6 місяців на літні весілля. Популярні кейтери розбирають до кінця травня.",
      "sr": "Rezervišite najmanje 4-6 meseci unapred za letnja venčanja. Popularni keterneri se popune do kraja maja.",
      "me": "Rezervišite najmanje 4-6 mjeseci unaprijed za ljetnja vjenčanja. Popularni keterneri se popune do kraja maja.",
      "ar": "احجز قبل 4-6 أشهر على الأقل لأعراس الصيف. شركات تقديم الطعام الشائعة تمتلئ بنهاية مايو في ذروة الموسم."
    }
  }
]'::jsonb
WHERE slug = 'catering-food';

-- ──────────────────────────────────────────────────────────────────────────
-- childcare-family
-- ──────────────────────────────────────────────────────────────────────────
UPDATE public.glatko_service_categories
SET faqs = '[
  {
    "q": {
      "tr": "Karadağ''da çocuk bakıcısı saatlik ücreti nedir?",
      "en": "What is the hourly rate for babysitters in Montenegro?",
      "de": "Was kostet ein Babysitter pro Stunde in Montenegro?",
      "it": "Qual è la tariffa oraria delle babysitter in Montenegro?",
      "ru": "Сколько стоит няня в час в Черногории?",
      "uk": "Скільки коштує няня за годину в Чорногорії?",
      "sr": "Koliko košta čuvanje dece po satu u Crnoj Gori?",
      "me": "Koliko košta čuvanje djece po satu u Crnoj Gori?",
      "ar": "ما هي الأجرة بالساعة لجليسات الأطفال في الجبل الأسود؟"
    },
    "a": {
      "tr": "Saatlik €8-€18, yabancı dil bilen ya da hemşire yetkili bakıcılar €15-€25. Glatko''da yaşa göre uygun fiyat aralığını filtreleyebilirsiniz.",
      "en": "Hourly rate is €8-€18; multilingual or nursing-certified sitters are €15-€25. Filter by age group on Glatko.",
      "de": "Stundensatz €8-€18; mehrsprachige oder pflegezertifizierte Babysitter €15-€25. Auf Glatko nach Altersgruppe filtern.",
      "it": "Tariffa oraria €8-€18; babysitter plurilingue o con qualifica infermieristica €15-€25. Filtra per fascia d''età su Glatko.",
      "ru": "Почасовая ставка €8-€18; нянь со знанием языков или медподготовкой €15-€25. Фильтр по возрасту на Glatko.",
      "uk": "Погодинна ставка €8-€18; няні зі знанням мов або медичною підготовкою €15-€25. Фільтр за віком на Glatko.",
      "sr": "Po satu €8-€18; multijezičke ili sa medicinskom obukom €15-€25. Filter po uzrastu na Glatku.",
      "me": "Po satu €8-€18; multijezičke ili sa medicinskom obukom €15-€25. Filter po uzrastu na Glatku.",
      "ar": "الأجر بالساعة €8-€18؛ الجليسات متعددات اللغات أو المؤهلات تمريضيًا €15-€25. صفّي حسب الفئة العمرية على Glatko."
    }
  },
  {
    "q": {
      "tr": "Hangi şehirlerde bakıcı bulabilirim?",
      "en": "Which cities have babysitters available?",
      "de": "In welchen Städten gibt es Babysitter?",
      "it": "In quali città trovo babysitter?",
      "ru": "В каких городах есть няни?",
      "uk": "У яких містах є няні?",
      "sr": "U kojim gradovima ima čuvarki dece?",
      "me": "U kojim gradovima ima čuvarki djece?",
      "ar": "في أي مدن تتوفر جليسات الأطفال؟"
    },
    "a": {
      "tr": "Tivat, Budva, Kotor, Herceg Novi, Bar ve Podgorica''da kayıtlı bakıcılar var. Tatil sezonunda otel ve villa bazlı hizmet de mevcut.",
      "en": "Registered sitters cover Tivat, Budva, Kotor, Herceg Novi, Bar, and Podgorica. Hotel and villa-based service is available in tourist season.",
      "de": "Registrierte Babysitter in Tivat, Budva, Kotor, Herceg Novi, Bar und Podgorica. Hotel- und Villaservice in der Tourismussaison.",
      "it": "Babysitter registrate a Tivat, Budva, Kotor, Herceg Novi, Bar e Podgorica. Servizio hotel e villa in stagione turistica.",
      "ru": "Зарегистрированные няни в Тивате, Будве, Которе, Херцег-Нови, Баре и Подгорице. В сезон — выездной сервис в отели и виллы.",
      "uk": "Зареєстровані няні в Тиваті, Будві, Которі, Герцег-Нові, Барі й Подгориці. У сезон — виїзний сервіс у готелі та вілли.",
      "sr": "Registrovane čuvarke u Tivtu, Budvi, Kotoru, Herceg Novom, Baru i Podgorici. U sezoni — usluga u hotelima i vilama.",
      "me": "Registrovane čuvarke u Tivtu, Budvi, Kotoru, Herceg Novom, Baru i Podgorici. U sezoni — usluga u hotelima i vilama.",
      "ar": "الجليسات المسجلات في تيفات، بودفا، كوتور، هيرتسيغ نوفي، بار، وبودغوريتسا. خدمة الفنادق والفلل متوفرة في موسم السياحة."
    }
  },
  {
    "q": {
      "tr": "Bakıcının güvenli olduğunu nasıl bilirim?",
      "en": "How do I know a babysitter is safe?",
      "de": "Woher weiß ich, dass ein Babysitter zuverlässig ist?",
      "it": "Come so che una babysitter è affidabile?",
      "ru": "Как убедиться, что няня надёжна?",
      "uk": "Як впевнитися, що няня надійна?",
      "sr": "Kako da znam da je čuvarka pouzdana?",
      "me": "Kako da znam da je čuvarka pouzdana?",
      "ar": "كيف أتأكد من أن جليسة الأطفال آمنة؟"
    },
    "a": {
      "tr": "Glatko''da çocuk bakım sağlayıcıları kimlik, sicil ve referans kontrolünden geçer. Profilde aile referansları, çalışılan yaş aralığı ve önceki incelemeleri görebilirsiniz.",
      "en": "Glatko childcare providers pass ID, criminal-record, and reference checks. Profiles show family references, age groups they work with, and prior reviews.",
      "de": "Glatko-Kinderbetreuer durchlaufen ID-, Führungszeugnis- und Referenzprüfung. Profile zeigen Familienreferenzen, Altersgruppen und Bewertungen.",
      "it": "I tutori Glatko superano verifiche ID, casellario giudiziale e referenze. Il profilo mostra referenze familiari, fasce d''età e valutazioni.",
      "ru": "Няни Glatko проходят проверку документов, справки о несудимости и рекомендаций. На профиле — семейные отзывы и возрастные группы.",
      "uk": "Няні Glatko проходять перевірку документів, довідки про несудимість і рекомендацій. На профілі — сімейні відгуки та вікові групи.",
      "sr": "Čuvarke na Glatku prolaze proveru identiteta, kaznene evidencije i preporuke. Profili prikazuju porodične reference i uzrasne grupe.",
      "me": "Čuvarke na Glatku prolaze provjeru identiteta, kaznene evidencije i preporuke. Profili prikazuju porodične reference i uzrasne grupe.",
      "ar": "تجتاز جليسات Glatko التحقق من الهوية والسجل الجنائي والمرجعيات. تظهر الملفات المرجعيات العائلية والفئات العمرية والتقييمات."
    }
  },
  {
    "q": {
      "tr": "Bakıcı yabancı dil konuşuyor mu?",
      "en": "Do babysitters speak English / Russian / German?",
      "de": "Sprechen die Babysitter Englisch/Russisch/Deutsch?",
      "it": "Le babysitter parlano inglese/russo/tedesco?",
      "ru": "Говорят ли няни на английском/русском/немецком?",
      "uk": "Чи розмовляють няні англійською/російською/німецькою?",
      "sr": "Da li čuvarke govore engleski/ruski/nemački?",
      "me": "Da li čuvarke govore engleski/ruski/njemački?",
      "ar": "هل تتحدث جليسات الأطفال الإنجليزية/الروسية/الألمانية؟"
    },
    "a": {
      "tr": "Çoğu sahil bölgesindeki bakıcı en az iki dil konuşur (genellikle İngilizce + Rusça). Filtrelerden gerekli dili seçip uygun teklifleri görebilirsiniz.",
      "en": "Most coastal sitters speak at least two languages (typically English + Russian). Use the language filter to find a match.",
      "de": "Die meisten Babysitter an der Küste sprechen mindestens zwei Sprachen (meist Englisch + Russisch). Sprachfilter zur Auswahl nutzen.",
      "it": "La maggior parte delle babysitter costiere parla almeno due lingue (di solito inglese + russo). Usa il filtro lingua.",
      "ru": "Большинство нянь на побережье говорят минимум на двух языках (обычно английский + русский). Используйте фильтр языка.",
      "uk": "Більшість нянь на узбережжі розмовляють принаймні двома мовами (зазвичай англійська + російська). Використовуйте фільтр мов.",
      "sr": "Većina čuvarki na obali govori najmanje dva jezika (obično engleski + ruski). Koristite filter jezika.",
      "me": "Većina čuvarki na obali govori najmanje dva jezika (obično engleski + ruski). Koristite filter jezika.",
      "ar": "معظم الجليسات على الساحل يتحدثن لغتين على الأقل (عادة الإنجليزية + الروسية). استخدم مرشح اللغة."
    }
  }
]'::jsonb
WHERE slug = 'childcare-family';

-- ──────────────────────────────────────────────────────────────────────────
-- events-wedding
-- ──────────────────────────────────────────────────────────────────────────
UPDATE public.glatko_service_categories
SET faqs = '[
  {
    "q": {
      "tr": "Karadağ''da düğün organizasyonu ne kadar tutar?",
      "en": "How much does wedding planning cost in Montenegro?",
      "de": "Was kostet eine Hochzeitsplanung in Montenegro?",
      "it": "Quanto costa l''organizzazione di un matrimonio in Montenegro?",
      "ru": "Сколько стоит организация свадьбы в Черногории?",
      "uk": "Скільки коштує організація весілля в Чорногорії?",
      "sr": "Koliko košta organizacija venčanja u Crnoj Gori?",
      "me": "Koliko košta organizacija vjenčanja u Crnoj Gori?",
      "ar": "كم تكلفة تنظيم حفلات الزفاف في الجبل الأسود؟"
    },
    "a": {
      "tr": "Tam organizasyon (planlama + dekorasyon + koordinasyon) €3.500-€12.000 arasında. Sadece koordinasyon (Day-of) €800-€2.000. Glatko''da paket teklifleri görün.",
      "en": "Full planning (design + decor + coordination) is €3,500-€12,000. Day-of coordination only is €800-€2,000. See package bids on Glatko.",
      "de": "Komplette Planung (Design + Dekoration + Koordination) €3.500-€12.000. Nur Day-of-Koordination €800-€2.000. Pakete auf Glatko vergleichen.",
      "it": "Pianificazione completa (design + decorazioni + coordinamento) €3.500-€12.000. Solo coordinamento Day-of €800-€2.000.",
      "ru": "Полное планирование (дизайн + декор + координация) €3.500-€12.000. Только день мероприятия €800-€2.000.",
      "uk": "Повне планування (дизайн + декор + координація) €3.500-€12.000. Тільки координація в день €800-€2.000.",
      "sr": "Puno planiranje (dizajn + dekoracija + koordinacija) €3.500-€12.000. Samo koordinacija na dan venčanja €800-€2.000.",
      "me": "Puno planiranje (dizajn + dekoracija + koordinacija) €3.500-€12.000. Samo koordinacija na dan vjenčanja €800-€2.000.",
      "ar": "التخطيط الكامل (تصميم + ديكور + تنسيق) €3,500-€12,000. تنسيق يوم الحفل فقط €800-€2,000."
    }
  },
  {
    "q": {
      "tr": "Hangi mekânlarda düğün organizasyonu yapılır?",
      "en": "Which venues are popular for weddings on Glatko?",
      "de": "Welche Locations sind für Hochzeiten beliebt?",
      "it": "Quali location sono popolari per i matrimoni?",
      "ru": "Какие площадки популярны для свадеб?",
      "uk": "Які майданчики популярні для весіль?",
      "sr": "Koje lokacije su popularne za venčanja?",
      "me": "Koje lokacije su popularne za vjenčanja?",
      "ar": "ما هي الأماكن الشائعة لحفلات الزفاف؟"
    },
    "a": {
      "tr": "Boka Körfezi (Sveti Stefan, Aman Sveti Stefan, Porto Montenegro), Skadar Gölü, Lustica Bay villa''ları ve Kotor eski şehir teraslarındaki düğünlerle çalışan organizatörler var.",
      "en": "Boka Bay (Sveti Stefan, Aman, Porto Montenegro), Lake Skadar, Lustica Bay villas, and Kotor old-town terraces are the most-requested venues.",
      "de": "Bucht von Kotor (Sveti Stefan, Aman, Porto Montenegro), Skadar-See, Lustica-Bay-Villen und Kotor-Altstadt-Terrassen sind am gefragtesten.",
      "it": "Bocche di Cattaro (Sveti Stefan, Aman, Porto Montenegro), Lago di Scutari, ville di Lustica Bay e terrazze del centro storico di Kotor.",
      "ru": "Которский залив (Свети-Стефан, Aman, Porto Montenegro), Скадарское озеро, виллы Lustica Bay и террасы Старого Котора.",
      "uk": "Которська затока (Свети-Стефан, Aman, Porto Montenegro), Скадарське озеро, вілли Lustica Bay і тераси Старого Котора.",
      "sr": "Bokokotorski zaliv (Sveti Stefan, Aman, Porto Montenegro), Skadarsko jezero, vile Lustica Bay i terase Starog Kotora.",
      "me": "Bokokotorski zaliv (Sveti Stefan, Aman, Porto Montenegro), Skadarsko jezero, vile Lustica Bay i terase Starog Kotora.",
      "ar": "خليج بوكا (سفيتي ستيفان، أمان، بورتو مونتينيغرو)، بحيرة سكادار، فلل لوستيكا باي، وشرفات مدينة كوتور القديمة."
    }
  },
  {
    "q": {
      "tr": "Düğün organizatörünü nasıl doğrularım?",
      "en": "How do I verify a wedding planner?",
      "de": "Wie verifiziere ich einen Hochzeitsplaner?",
      "it": "Come verifico un wedding planner?",
      "ru": "Как проверить свадебного организатора?",
      "uk": "Як перевірити весільного організатора?",
      "sr": "Kako da proverim wedding plannera?",
      "me": "Kako da provjerim wedding plannera?",
      "ar": "كيف أتحقق من منظم حفلات الزفاف؟"
    },
    "a": {
      "tr": "Glatko''daki organizatörler işyeri kaydı, sigorta ve önceki düğün portfolyosu ile doğrulanır. Profilde gerçek müşteri yorumları ve etkinlik fotoğrafları görünür.",
      "en": "Glatko planners are verified by business registration, insurance, and prior wedding portfolios. Profiles show real client reviews and event photos.",
      "de": "Glatko-Planer werden über Gewerbenachweis, Versicherung und Hochzeitsportfolio verifiziert. Profile zeigen echte Bewertungen und Fotos.",
      "it": "I planner Glatko sono verificati con registro imprese, assicurazione e portfolio matrimoni. Profilo con recensioni reali e foto eventi.",
      "ru": "Организаторы Glatko проверяются по регистрации, страховке и портфолио свадеб. На профиле — реальные отзывы и фото мероприятий.",
      "uk": "Організатори Glatko перевіряються за реєстрацією, страховкою і портфоліо весіль. На профілі — реальні відгуки і фото.",
      "sr": "Planeri na Glatku se proveravaju kroz registraciju firme, osiguranje i portfolio venčanja. Profili imaju prave kritike i fotografije.",
      "me": "Planeri na Glatku se provjeravaju kroz registraciju firme, osiguranje i portfolio vjenčanja. Profili imaju prave kritike i fotografije.",
      "ar": "يتم التحقق من منظمي Glatko عبر تسجيل الأعمال والتأمين ومحفظة حفلات الزفاف السابقة. الملفات تعرض تقييمات حقيقية وصور."
    }
  },
  {
    "q": {
      "tr": "Düğün için ne kadar önceden organizatör bulmalıyım?",
      "en": "How far in advance should I hire a wedding planner?",
      "de": "Wie früh sollte ich einen Hochzeitsplaner buchen?",
      "it": "Con quanto anticipo prenotare un wedding planner?",
      "ru": "За сколько искать свадебного организатора?",
      "uk": "За скільки шукати весільного організатора?",
      "sr": "Koliko unapred angažovati wedding plannera?",
      "me": "Koliko unaprijed angažovati wedding plannera?",
      "ar": "كم من الوقت مسبقًا يجب توظيف منظم زفاف؟"
    },
    "a": {
      "tr": "Yaz sezonu (Mayıs-Eylül) için 9-12 ay önceden kontak kurun. Aralık-Şubat arası planlamayı sonuçlandırmak en yaygın takvim.",
      "en": "Reach out 9-12 months ahead for the May-September peak. Most plans are finalised between December and February.",
      "de": "9-12 Monate im Voraus für Hauptsaison Mai-September. Die meisten Pläne werden Dezember-Februar fertiggestellt.",
      "it": "Contatta 9-12 mesi prima per il picco maggio-settembre. I piani vengono finalizzati tra dicembre e febbraio.",
      "ru": "Связывайтесь за 9-12 месяцев на пик май-сентябрь. Планы финализируют декабрь-февраль.",
      "uk": "Зв''язуйтесь за 9-12 місяців на пік травень-вересень. Плани фіналізують грудень-лютий.",
      "sr": "Kontaktirajte 9-12 meseci unapred za špic maj-septembar. Planovi se finalizuju decembar-februar.",
      "me": "Kontaktirajte 9-12 mjeseci unaprijed za špic maj-septembar. Planovi se finalizuju decembar-februar.",
      "ar": "تواصل قبل 9-12 شهرًا لذروة مايو-سبتمبر. تُنجز معظم الخطط بين ديسمبر وفبراير."
    }
  }
]'::jsonb
WHERE slug = 'events-wedding';

-- ──────────────────────────────────────────────────────────────────────────
-- garden-pool
-- ──────────────────────────────────────────────────────────────────────────
UPDATE public.glatko_service_categories
SET faqs = '[
  {
    "q": {
      "tr": "Karadağ''da havuz bakımı aylık ne kadar tutar?",
      "en": "How much does monthly pool maintenance cost in Montenegro?",
      "de": "Was kostet monatliche Poolwartung in Montenegro?",
      "it": "Quanto costa la manutenzione mensile della piscina in Montenegro?",
      "ru": "Сколько стоит ежемесячное обслуживание бассейна в Черногории?",
      "uk": "Скільки коштує щомісячне обслуговування басейну в Чорногорії?",
      "sr": "Koliko košta mesečno održavanje bazena u Crnoj Gori?",
      "me": "Koliko košta mjesečno održavanje bazena u Crnoj Gori?",
      "ar": "كم تكلفة الصيانة الشهرية للمسبح في الجبل الأسود؟"
    },
    "a": {
      "tr": "Standart villa havuzu (40-60m³) aylık €120-€280 arasıdır. Kimyasal dengeleme, filtreleme ve elle temizlik dahil. Glatko''da ayrıntılı paket teklifleri var.",
      "en": "A standard villa pool (40-60m³) runs €120-€280/month including chemical balance, filtration, and manual cleaning. See itemised bids on Glatko.",
      "de": "Standard-Villapool (40-60m³) kostet €120-€280/Monat inkl. Chemie, Filtration und Handreinigung. Detaillierte Angebote auf Glatko.",
      "it": "Una piscina villa standard (40-60m³) costa €120-€280/mese, inclusi equilibrio chimico, filtrazione e pulizia manuale.",
      "ru": "Стандартный бассейн виллы (40-60m³) — €120-€280/мес. с химией, фильтрацией и ручной чисткой. Детальные предложения на Glatko.",
      "uk": "Стандартний басейн вілли (40-60m³) — €120-€280/міс. з хімією, фільтрацією і ручним чищенням. Деталізовані пропозиції на Glatko.",
      "sr": "Standardni vila bazen (40-60m³) je €120-€280/mesec uključujući hemiju, filtraciju i ručno čišćenje.",
      "me": "Standardni vila bazen (40-60m³) je €120-€280/mjesec uključujući hemiju, filtraciju i ručno čišćenje.",
      "ar": "مسبح فيلا قياسي (40-60م³) €120-€280/شهر شاملاً التوازن الكيميائي والترشيح والتنظيف اليدوي."
    }
  },
  {
    "q": {
      "tr": "Bahçe sulama sistemi kurulumu ne kadar sürer?",
      "en": "How long does irrigation system installation take?",
      "de": "Wie lange dauert die Bewässerungsinstallation?",
      "it": "Quanto dura l''installazione di un impianto di irrigazione?",
      "ru": "Сколько времени занимает установка системы полива?",
      "uk": "Скільки часу займає встановлення системи поливу?",
      "sr": "Koliko traje ugradnja sistema za navodnjavanje?",
      "me": "Koliko traje ugradnja sistema za navodnjavanje?",
      "ar": "كم من الوقت يستغرق تركيب نظام الري؟"
    },
    "a": {
      "tr": "Standart villa bahçesi (300-500m²) için 2-4 gün; akıllı kontrolcü ve damla sulama dahil. Sezon başında (Mart-Nisan) randevu hızla dolar.",
      "en": "Typical villa garden (300-500m²) takes 2-4 days including smart controller and drip lines. Spring slots fill fast (March-April).",
      "de": "Typischer Villagarten (300-500m²) dauert 2-4 Tage inkl. Smart-Controller und Tropfschläuchen. Frühlings-Termine sind schnell ausgebucht.",
      "it": "Giardino tipico di villa (300-500m²) richiede 2-4 giorni con centralina smart e gocciolatori. Slot primaverili si riempiono in fretta.",
      "ru": "Типичный сад виллы (300-500m²) — 2-4 дня с умным контроллером и капельным поливом. Весенние слоты быстро заняты.",
      "uk": "Типовий сад вілли (300-500m²) — 2-4 дні з розумним контролером і крапельним поливом. Весняні слоти швидко зайняті.",
      "sr": "Tipična vila bašta (300-500m²) traje 2-4 dana uključujući smart kontroler i kap po kap. Prolećni termini se brzo popune.",
      "me": "Tipična vila bašta (300-500m²) traje 2-4 dana uključujući smart kontroler i kap po kap. Proljećni termini se brzo popune.",
      "ar": "حديقة فيلا نموذجية (300-500م²) تستغرق 2-4 أيام بما فيها وحدة تحكم ذكية وأنابيب التنقيط. مواعيد الربيع تمتلئ بسرعة."
    }
  },
  {
    "q": {
      "tr": "Bahçıvan veya havuz teknisyenini nasıl doğrularım?",
      "en": "How do I verify a gardener or pool technician?",
      "de": "Wie verifiziere ich Gärtner oder Pooltechniker?",
      "it": "Come verifico un giardiniere o tecnico piscina?",
      "ru": "Как проверить садовника или техника по бассейнам?",
      "uk": "Як перевірити садівника або техніка з басейнів?",
      "sr": "Kako da proverim baštovana ili tehničara za bazene?",
      "me": "Kako da provjerim baštovana ili tehničara za bazene?",
      "ar": "كيف أتحقق من البستاني أو فني المسابح؟"
    },
    "a": {
      "tr": "Glatko''da bahçe ve havuz teknisyenleri kimlik, işyeri ve sigorta doğrulamasından geçer. Profilde tamamlanmış villa projeleri ve müşteri yorumları görünür.",
      "en": "Glatko gardeners and pool techs pass ID, business registration, and liability insurance checks. Profiles show completed villa projects and reviews.",
      "de": "Glatko-Gärtner und Pooltechniker durchlaufen ID-, Gewerbe- und Haftpflicht-Versicherungsprüfung. Profile zeigen abgeschlossene Villaprojekte.",
      "it": "Giardinieri e tecnici piscine Glatko superano verifica ID, registro imprese e assicurazione responsabilità. Profilo con progetti completati.",
      "ru": "Садовники и техники Glatko проходят проверку ID, регистрации и страховки ответственности. Профили — завершённые проекты вилл.",
      "uk": "Садівники і техніки Glatko проходять перевірку ID, реєстрації та страхування відповідальності. Профілі — завершені проекти.",
      "sr": "Baštovani i bazen tehničari na Glatku prolaze proveru ID, registracije i osiguranja od odgovornosti.",
      "me": "Baštovani i bazen tehničari na Glatku prolaze provjeru ID, registracije i osiguranja od odgovornosti.",
      "ar": "يجتاز بستانيو وفنيو المسابح على Glatko التحقق من الهوية وتسجيل الأعمال وتأمين المسؤولية. الملفات تعرض المشاريع المكتملة."
    }
  },
  {
    "q": {
      "tr": "Sezon dışında havuz bakımı gerekli mi?",
      "en": "Is pool maintenance needed off-season?",
      "de": "Ist Poolwartung außerhalb der Saison notwendig?",
      "it": "La manutenzione piscina è necessaria fuori stagione?",
      "ru": "Нужно ли обслуживание бассейна вне сезона?",
      "uk": "Чи потрібне обслуговування басейну поза сезоном?",
      "sr": "Da li je održavanje bazena potrebno van sezone?",
      "me": "Da li je održavanje bazena potrebno van sezone?",
      "ar": "هل صيانة المسبح ضرورية خارج الموسم؟"
    },
    "a": {
      "tr": "Evet — kış kapatma, kimyasal dengeleme ve donma korumasını Kasım-Şubat aylarında yaptırın. Sezon başlangıcında temizlik servisi €150-€350 maliyetlidir.",
      "en": "Yes — winterising, chemical balance and freeze protection should run November-February. Spring opening service is €150-€350.",
      "de": "Ja — Winterbereitung, Chemie und Frostschutz November-Februar. Frühjahrs-Öffnungsservice €150-€350.",
      "it": "Sì — chiusura invernale, equilibrio chimico e antigelo da novembre a febbraio. Apertura primaverile €150-€350.",
      "ru": "Да — консервация на зиму и защита от мороза в ноябре-феврале. Весенний запуск €150-€350.",
      "uk": "Так — консервація на зиму і захист від морозу в листопаді-лютому. Весняний запуск €150-€350.",
      "sr": "Da — zimski zatvarač, hemija i zaštita od smrzavanja od novembra do februara. Prolećno otvaranje €150-€350.",
      "me": "Da — zimski zatvarač, hemija i zaštita od smrzavanja od novembra do februara. Proljećno otvaranje €150-€350.",
      "ar": "نعم — إغلاق الشتاء والتوازن الكيميائي والحماية من التجمد في نوفمبر-فبراير. خدمة فتح الربيع €150-€350."
    }
  }
]'::jsonb
WHERE slug = 'garden-pool';

-- ──────────────────────────────────────────────────────────────────────────
-- health-wellness
-- ──────────────────────────────────────────────────────────────────────────
UPDATE public.glatko_service_categories
SET faqs = '[
  {
    "q": {
      "tr": "Karadağ''da kişisel antrenör saatlik ücreti?",
      "en": "What is the hourly rate for a personal trainer in Montenegro?",
      "de": "Was kostet ein Personal Trainer pro Stunde in Montenegro?",
      "it": "Qual è la tariffa oraria di un personal trainer in Montenegro?",
      "ru": "Сколько стоит персональный тренер в час в Черногории?",
      "uk": "Скільки коштує персональний тренер за годину в Чорногорії?",
      "sr": "Koliko košta lični trener po satu u Crnoj Gori?",
      "me": "Koliko košta lični trener po satu u Crnoj Gori?",
      "ar": "ما هي الأجرة بالساعة للمدرب الشخصي في الجبل الأسود؟"
    },
    "a": {
      "tr": "Saatlik €25-€55 arası — sahil ya da otel-içi sessions €40-€70. Sertifikalı diyetisyen + antrenör paketleri €350-€600/ay. Glatko''da net teklifler.",
      "en": "Hourly €25-€55; beach or hotel-based sessions €40-€70. Certified trainer + dietitian packages run €350-€600/month. Real bids on Glatko.",
      "de": "Stundensatz €25-€55; Strand- oder Hotel-Sessions €40-€70. Trainer + Ernährungsberater Pakete €350-€600/Monat.",
      "it": "Tariffa oraria €25-€55; sessioni in spiaggia o hotel €40-€70. Pacchetti trainer + nutrizionista €350-€600/mese.",
      "ru": "Час €25-€55; занятия на пляже/в отеле €40-€70. Пакет тренер+нутрициолог €350-€600/мес.",
      "uk": "Година €25-€55; заняття на пляжі/в готелі €40-€70. Пакет тренер+нутриціолог €350-€600/міс.",
      "sr": "Po satu €25-€55; sesije na plaži ili u hotelu €40-€70. Paket trener + nutricionista €350-€600/mesec.",
      "me": "Po satu €25-€55; sesije na plaži ili u hotelu €40-€70. Paket trener + nutricionista €350-€600/mjesec.",
      "ar": "بالساعة €25-€55؛ جلسات الشاطئ أو الفندق €40-€70. باقات المدرب + خبير التغذية €350-€600/شهر."
    }
  },
  {
    "q": {
      "tr": "Mobil masaj veya fizyoterapi mevcut mu?",
      "en": "Are mobile massage and physiotherapy services available?",
      "de": "Gibt es mobile Massage und Physiotherapie?",
      "it": "Sono disponibili massaggi e fisioterapia a domicilio?",
      "ru": "Есть ли выездной массаж и физиотерапия?",
      "uk": "Чи є виїзний масаж і фізіотерапія?",
      "sr": "Da li postoji mobilna masaža i fizioterapija?",
      "me": "Da li postoji mobilna masaža i fizioterapija?",
      "ar": "هل تتوفر خدمات التدليك والعلاج الطبيعي المتنقلة؟"
    },
    "a": {
      "tr": "Evet — masöz ve fizyoterapistler villa, otel ve yat üzerine geliyor. 60dk masaj €40-€85; 60dk fizyoterapi €45-€90. Boka Körfezi yoğun kapsama bölgesi.",
      "en": "Yes — therapists travel to villas, hotels, and yachts. 60-min massage €40-€85; 60-min physio €45-€90. Boka Bay has the densest coverage.",
      "de": "Ja — Therapeuten kommen zu Villen, Hotels und Yachten. 60-Min-Massage €40-€85; 60-Min-Physio €45-€90. Bucht von Kotor mit dichtester Abdeckung.",
      "it": "Sì — i terapisti si spostano in ville, hotel e yacht. Massaggio 60 min €40-€85; fisioterapia 60 min €45-€90.",
      "ru": "Да — массажисты и физиотерапевты выезжают на виллы, в отели и на яхты. 60-мин массаж €40-€85; физио €45-€90.",
      "uk": "Так — масажисти і фізіотерапевти виїжджають на вілли, в готелі та на яхти. Масаж 60хв €40-€85; фізіо €45-€90.",
      "sr": "Da — terapeuti dolaze u vile, hotele i jahte. 60-min masaža €40-€85; fizio €45-€90. Bokokotorski zaliv ima najgušće pokrivanje.",
      "me": "Da — terapeuti dolaze u vile, hotele i jahte. 60-min masaža €40-€85; fizio €45-€90. Bokokotorski zaliv ima najgušće pokrivanje.",
      "ar": "نعم — المعالجون يأتون إلى الفلل والفنادق واليخوت. تدليك 60 دقيقة €40-€85؛ علاج طبيعي €45-€90."
    }
  },
  {
    "q": {
      "tr": "Sağlık profesyonelini nasıl doğrularım?",
      "en": "How do I verify a health-and-wellness provider?",
      "de": "Wie verifiziere ich einen Gesundheits-/Wellness-Anbieter?",
      "it": "Come verifico un professionista benessere?",
      "ru": "Как проверить специалиста по здоровью/велнес?",
      "uk": "Як перевірити фахівця зі здоров''я/велнес?",
      "sr": "Kako da proverim wellness profesionalca?",
      "me": "Kako da provjerim wellness profesionalca?",
      "ar": "كيف أتحقق من مقدم خدمة الصحة والعافية؟"
    },
    "a": {
      "tr": "Glatko''da masöz, fizyoterapist ve antrenörler lisans + sertifika doğrulamasından geçer. Profilde belge sınıfı, deneyim yılı ve müşteri yorumları görünür.",
      "en": "Glatko therapists, physios and trainers pass license + certification verification. Profiles show credentials, years of experience, and reviews.",
      "de": "Glatko-Therapeuten, Physios und Trainer durchlaufen Lizenz- und Zertifikatsprüfung. Profile zeigen Qualifikationen und Bewertungen.",
      "it": "Terapisti, fisioterapisti e trainer Glatko superano verifica licenza + certificazione. Profilo con credenziali ed esperienza.",
      "ru": "Терапевты, физио и тренеры Glatko проходят проверку лицензий и сертификатов. Профиль с дипломами и стажем.",
      "uk": "Терапевти, фізіо і тренери Glatko проходять перевірку ліцензій і сертифікатів. Профіль з дипломами і стажем.",
      "sr": "Glatko terapeuti, fizioterapeuti i treneri prolaze proveru licenci i sertifikata.",
      "me": "Glatko terapeuti, fizioterapeuti i treneri prolaze provjeru licenci i sertifikata.",
      "ar": "يجتاز معالجو وفنيّو ومدربو Glatko التحقق من الترخيص والشهادات. الملفات تعرض المؤهلات وسنوات الخبرة."
    }
  },
  {
    "q": {
      "tr": "Sahil sezonu için ne zaman antrenör tutmalıyım?",
      "en": "When should I hire a trainer for beach-season prep?",
      "de": "Wann sollte ich einen Trainer für die Strandsaison-Vorbereitung buchen?",
      "it": "Quando assumere un trainer per la preparazione estiva?",
      "ru": "Когда нанимать тренера к пляжному сезону?",
      "uk": "Коли наймати тренера до пляжного сезону?",
      "sr": "Kada angažovati trenera za pripremu za leto?",
      "me": "Kada angažovati trenera za pripremu za ljeto?",
      "ar": "متى يجب توظيف مدرب للاستعداد لموسم الشاطئ؟"
    },
    "a": {
      "tr": "Yaz sezonu için Mart başında başlayın — 12 haftalık plan vücut kompozisyonu için yeterlidir. Mayıs sonrası taleple birlikte ücretler %15-20 artar.",
      "en": "Start in early March — a 12-week plan is enough for body-composition results. Rates rise 15-20% with demand after late May.",
      "de": "Anfang März starten — 12-Wochen-Plan reicht für Körperkomposition. Preise steigen 15-20% nach Ende Mai.",
      "it": "Inizia all''inizio di marzo — un piano 12 settimane basta per la ricomposizione. Le tariffe salgono 15-20% dopo fine maggio.",
      "ru": "Начинайте в начале марта — 12-недельный план достаточен. После конца мая ставки растут на 15-20%.",
      "uk": "Починайте на початку березня — 12-тижневий план достатній. Після кінця травня ставки зростають на 15-20%.",
      "sr": "Počnite početkom marta — 12-nedeljni plan je dovoljan. Nakon kraja maja cene rastu 15-20%.",
      "me": "Počnite početkom marta — 12-sedmični plan je dovoljan. Nakon kraja maja cijene rastu 15-20%.",
      "ar": "ابدأ في بداية مارس — خطة 12 أسبوعًا كافية لتركيبة الجسم. ترتفع الأسعار 15-20% مع الطلب بعد نهاية مايو."
    }
  }
]'::jsonb
WHERE slug = 'health-wellness';

-- ──────────────────────────────────────────────────────────────────────────
-- moving-transport
-- ──────────────────────────────────────────────────────────────────────────
UPDATE public.glatko_service_categories
SET faqs = '[
  {
    "q": {
      "tr": "Karadağ''da nakliye fiyatları nasıl hesaplanır?",
      "en": "How are moving / transport prices calculated in Montenegro?",
      "de": "Wie werden Umzugs-/Transportpreise in Montenegro berechnet?",
      "it": "Come si calcolano i prezzi di trasloco/trasporto in Montenegro?",
      "ru": "Как считается стоимость переезда в Черногории?",
      "uk": "Як рахується вартість переїзду в Чорногорії?",
      "sr": "Kako se računaju cene selidbe u Crnoj Gori?",
      "me": "Kako se računaju cijene selidbe u Crnoj Gori?",
      "ar": "كيف تُحسب أسعار النقل في الجبل الأسود؟"
    },
    "a": {
      "tr": "Şehir içi (Tivat→Budva) tek odalı €120-€220, üç odalı €280-€450. Paketleme ve montaj dahil paketler vardır. Glatko''da m³ tahminine göre teklif alın.",
      "en": "Local (Tivat→Budva) one-bedroom is €120-€220, three-bedroom €280-€450. Packing + assembly packages available. Get bids by m³ estimate.",
      "de": "Lokal (Tivat→Budva) Ein-Zimmer €120-€220, Drei-Zimmer €280-€450. Pack- und Montagepakete verfügbar. Angebote nach m³.",
      "it": "Locale (Tivat→Budva) monolocale €120-€220, trilocale €280-€450. Pacchetti imballaggio + montaggio. Preventivi per m³.",
      "ru": "Локальный (Тиват→Будва) однушка €120-€220, трёшка €280-€450. Пакеты с упаковкой/сборкой. Цена по m³.",
      "uk": "Локально (Тиват→Будва) однушка €120-€220, трикімнатна €280-€450. Пакети з упаковкою/збиранням. Ціна за m³.",
      "sr": "Lokalno (Tivat→Budva) jednosoban €120-€220, trosoban €280-€450. Paketi sa pakovanjem + montažom. Ponude po m³.",
      "me": "Lokalno (Tivat→Budva) jednosoban €120-€220, trosoban €280-€450. Paketi sa pakovanjem + montažom. Ponude po m³.",
      "ar": "محليًا (تيفات→بودفا) غرفة واحدة €120-€220، ثلاث غرف €280-€450. باقات تغليف + تركيب متاحة. عروض بحسب m³."
    }
  },
  {
    "q": {
      "tr": "Hangi şehirler arası nakliye yapılır?",
      "en": "Which cities are covered for moving service?",
      "de": "Welche Städte werden beim Umzug abgedeckt?",
      "it": "Quali città sono coperte per i traslochi?",
      "ru": "В каких городах действует переезд?",
      "uk": "У яких містах діє переїзд?",
      "sr": "Koji gradovi su pokriveni za selidbu?",
      "me": "Koji gradovi su pokriveni za selidbu?",
      "ar": "ما المدن المغطاة لخدمة النقل؟"
    },
    "a": {
      "tr": "Tüm Karadağ kıyısı (Herceg Novi → Ulcinj), Podgorica ve Cetinje. Sırbistan, Hırvatistan ve Bosna sınır ötesi nakliye için lisanslı kuryeler de Glatko''da.",
      "en": "Full Montenegro coast (Herceg Novi → Ulcinj), Podgorica, Cetinje. Cross-border (Serbia, Croatia, Bosnia) licensed couriers are listed too.",
      "de": "Gesamte Küste (Herceg Novi → Ulcinj), Podgorica, Cetinje. Grenzüberschreitend (Serbien, Kroatien, Bosnien) lizenzierte Spediteure verfügbar.",
      "it": "Tutta la costa (Herceg Novi → Ulcinj), Podgorica, Cetinje. Trasporti transfrontalieri (Serbia, Croazia, Bosnia) con corrieri licenziati.",
      "ru": "Все побережье (Херцег-Нови → Улцинь), Подгорица, Цетинье. Трансграничные перевозки (Сербия, Хорватия, Босния) с лицензированными перевозчиками.",
      "uk": "Усе узбережжя (Герцег-Нові → Улцинь), Подгориця, Цетинє. Транскордонні перевезення (Сербія, Хорватія, Боснія) з ліцензованими перевізниками.",
      "sr": "Cela obala (Herceg Novi → Ulcinj), Podgorica, Cetinje. Prekogranični transport (Srbija, Hrvatska, Bosna) sa licenciranim prevoznicima.",
      "me": "Cijela obala (Herceg Novi → Ulcinj), Podgorica, Cetinje. Prekogranični transport (Srbija, Hrvatska, Bosna) sa licenciranim prevoznicima.",
      "ar": "كامل الساحل (هيرتسيغ نوفي → أولتسين)، بودغوريتسا، تسيتينيي. النقل عبر الحدود (صربيا، كرواتيا، البوسنة) مع شركات نقل مرخصة."
    }
  },
  {
    "q": {
      "tr": "Nakliye şirketini nasıl doğrularım?",
      "en": "How do I verify a moving company?",
      "de": "Wie verifiziere ich einen Umzugsanbieter?",
      "it": "Come verifico un''azienda di traslochi?",
      "ru": "Как проверить транспортную компанию?",
      "uk": "Як перевірити транспортну компанію?",
      "sr": "Kako da proverim selidbenu firmu?",
      "me": "Kako da provjerim selidbenu firmu?",
      "ar": "كيف أتحقق من شركة النقل؟"
    },
    "a": {
      "tr": "Glatko''daki nakliyeciler taşıma lisansı ve eşya sigortası ile doğrulanır. Profilde işletme kaydı, sigorta sınırı ve tamamlanan iş sayısı görünür.",
      "en": "Glatko movers are verified by transport license and goods-in-transit insurance. Profiles show registration, insurance cap, and completed jobs.",
      "de": "Glatko-Spediteure verifiziert über Transportlizenz und Transportgüter-Versicherung. Profil mit Registrierung und Versicherungssumme.",
      "it": "I trasportatori Glatko sono verificati con licenza di trasporto e assicurazione merci. Profilo con registrazione e massimale.",
      "ru": "Перевозчики Glatko проверяются по лицензии и страхованию груза. Профили — регистрация, лимит страховки и опыт.",
      "uk": "Перевізники Glatko перевіряються за ліцензією і страхуванням вантажу. Профілі — реєстрація, ліміт страховки і досвід.",
      "sr": "Selidbeni provajderi na Glatku se proveravaju kroz transportnu licencu i osiguranje robe.",
      "me": "Selidbeni provajderi na Glatku se provjeravaju kroz transportnu licencu i osiguranje robe.",
      "ar": "يتم التحقق من شركات النقل على Glatko عبر رخصة النقل وتأمين البضائع. الملفات تعرض التسجيل وحد التأمين."
    }
  },
  {
    "q": {
      "tr": "Yoğun sezonda ne kadar önceden rezervasyon yapmalıyım?",
      "en": "How far in advance should I book during peak season?",
      "de": "Wie früh sollte ich in der Hochsaison buchen?",
      "it": "Con quanto anticipo prenotare in alta stagione?",
      "ru": "За сколько бронировать в высокий сезон?",
      "uk": "За скільки бронювати у пік сезону?",
      "sr": "Koliko unapred rezervisati u špicu sezone?",
      "me": "Koliko unaprijed rezervisati u špicu sezone?",
      "ar": "كم من الوقت مسبقًا يجب الحجز في ذروة الموسم؟"
    },
    "a": {
      "tr": "Mayıs-Eylül arası 2-3 hafta önceden rezervasyon yapın; sezon sonu turist çıkışı (Eylül sonu) en yoğun haftadır.",
      "en": "Book 2-3 weeks ahead between May-September; end-of-season tourist outflow (late September) is the busiest week.",
      "de": "Im Mai-September 2-3 Wochen im Voraus buchen; Ende September (Saisonende) ist die geschäftigste Woche.",
      "it": "Tra maggio e settembre, prenota 2-3 settimane prima; fine settembre è la settimana più impegnata.",
      "ru": "Май-сентябрь — за 2-3 недели; конец сентября (отъезд туристов) — самая загруженная неделя.",
      "uk": "Травень-вересень — за 2-3 тижні; кінець вересня (виїзд туристів) — найзавантаженіший тиждень.",
      "sr": "Maj-septembar — 2-3 nedelje unapred; kraj septembra (odlazak turista) je najbukinija nedelja.",
      "me": "Maj-septembar — 2-3 sedmice unaprijed; kraj septembra (odlazak turista) je najbukinija sedmica.",
      "ar": "احجز قبل 2-3 أسابيع بين مايو وسبتمبر؛ نهاية سبتمبر (مغادرة السياح) هي أكثر الأسابيع ازدحامًا."
    }
  }
]'::jsonb
WHERE slug = 'moving-transport';

-- ──────────────────────────────────────────────────────────────────────────
-- photo-video
-- ──────────────────────────────────────────────────────────────────────────
UPDATE public.glatko_service_categories
SET faqs = '[
  {
    "q": {
      "tr": "Karadağ''da düğün fotoğrafçısı ne kadar tutar?",
      "en": "How much does a wedding photographer cost in Montenegro?",
      "de": "Was kostet ein Hochzeitsfotograf in Montenegro?",
      "it": "Quanto costa un fotografo di matrimonio in Montenegro?",
      "ru": "Сколько стоит свадебный фотограф в Черногории?",
      "uk": "Скільки коштує весільний фотограф у Чорногорії?",
      "sr": "Koliko košta fotograf za venčanje u Crnoj Gori?",
      "me": "Koliko košta fotograf za vjenčanje u Crnoj Gori?",
      "ar": "كم تكلفة مصور حفلات الزفاف في الجبل الأسود؟"
    },
    "a": {
      "tr": "Tam gün düğün €900-€2.400 (8 saat + işlenmiş foto teslimi). Drone + video paketi +€500-€1.200. Glatko''da paket teklifleri görün.",
      "en": "Full-day wedding €900-€2,400 (8h + retouched gallery). Drone + video package adds €500-€1,200. Compare bids on Glatko.",
      "de": "Ganztageshochzeit €900-€2.400 (8h + retuschierte Galerie). Drohne + Video +€500-€1.200. Pakete auf Glatko.",
      "it": "Matrimonio giornata intera €900-€2.400 (8h + galleria ritoccata). Drone + video +€500-€1.200.",
      "ru": "Полный день €900-€2.400 (8ч + обработанная галерея). Дрон + видео +€500-€1.200.",
      "uk": "Повний день €900-€2.400 (8год + обробка). Дрон + відео +€500-€1.200.",
      "sr": "Ceo dan €900-€2.400 (8h + obrađena galerija). Dron + video +€500-€1.200.",
      "me": "Cijeli dan €900-€2.400 (8h + obrađena galerija). Dron + video +€500-€1.200.",
      "ar": "يوم كامل €900-€2,400 (8 ساعات + معرض معالج). درون + فيديو +€500-€1,200."
    }
  },
  {
    "q": {
      "tr": "Hangi tür çekimler mevcut?",
      "en": "What kinds of shoots are available?",
      "de": "Welche Arten von Shootings gibt es?",
      "it": "Quali tipi di shooting sono disponibili?",
      "ru": "Какие виды съёмок доступны?",
      "uk": "Які види зйомок доступні?",
      "sr": "Koji tipovi snimanja su dostupni?",
      "me": "Koji tipovi snimanja su dostupni?",
      "ar": "ما أنواع التصوير المتاحة؟"
    },
    "a": {
      "tr": "Düğün, etkinlik, ürün, gayrimenkul (havadan dahil), aile portresi, ticari moda. Sahile özel: yat & yelken çekimi, balayı portfolio''ları.",
      "en": "Wedding, event, product, real-estate (including aerial), family portraits, commercial fashion. Coast-specific: yacht/sailing shoots and honeymoon portfolios.",
      "de": "Hochzeit, Event, Produkt, Immobilien (inkl. Luftaufnahmen), Familie, Mode. Küste: Yacht-/Segelshootings und Flitterwochen-Portfolios.",
      "it": "Matrimoni, eventi, prodotti, immobiliare (incluso aereo), ritratti famiglia, moda commerciale. Costa: shooting yacht/vela e luna di miele.",
      "ru": "Свадьба, события, продукты, недвижимость (с дронами), семейные портреты, мода. Побережье: яхты, медовые месяцы.",
      "uk": "Весілля, події, продукти, нерухомість (з дронами), сім''я, мода. Узбережжя: яхти, медовий місяць.",
      "sr": "Venčanja, događaji, proizvodi, nekretnine (sa dronovima), porodični portreti, modna komerc. Obala: jahte, medeni mesec.",
      "me": "Vjenčanja, događaji, proizvodi, nekretnine (sa dronovima), porodični portreti, modna komerc. Obala: jahte, medeni mjesec.",
      "ar": "زفاف، فعاليات، منتجات، عقارات (مع جوية)، صور عائلية، أزياء تجارية. ساحلية: تصوير اليخوت وشهر العسل."
    }
  },
  {
    "q": {
      "tr": "Fotoğrafçıyı nasıl doğrularım?",
      "en": "How do I verify a photographer or videographer?",
      "de": "Wie verifiziere ich einen Foto-/Videografen?",
      "it": "Come verifico un fotografo o videomaker?",
      "ru": "Как проверить фотографа или видеографа?",
      "uk": "Як перевірити фотографа або відеографа?",
      "sr": "Kako da proverim fotografa ili snimatelja?",
      "me": "Kako da provjerim fotografa ili snimatelja?",
      "ar": "كيف أتحقق من المصور أو فني الفيديو؟"
    },
    "a": {
      "tr": "Glatko''daki sağlayıcılar kimlik, işletme kaydı ve portfolyo kontrolünden geçer. Profilde son 12 aylık çalışmalar, müşteri yorumları ve teslim süreleri görünür.",
      "en": "Glatko providers pass ID, business-registration, and portfolio review. Profiles show last-12-month work, client reviews, and delivery times.",
      "de": "Glatko-Anbieter durchlaufen ID-, Gewerbe- und Portfolio-Prüfung. Profil zeigt 12-Monats-Arbeiten, Bewertungen und Lieferzeiten.",
      "it": "Fornitori Glatko superano verifica ID, registro imprese e portfolio. Profilo con lavori 12 mesi, recensioni e tempi consegna.",
      "ru": "Фотографы Glatko проходят проверку ID, регистрации и портфолио. Профили — работы за 12 месяцев и сроки сдачи.",
      "uk": "Фотографи Glatko проходять перевірку ID, реєстрації та портфоліо. Профілі — роботи за 12 місяців і строки.",
      "sr": "Fotografi na Glatku prolaze proveru identiteta, registracije i portfolija.",
      "me": "Fotografi na Glatku prolaze provjeru identiteta, registracije i portfolija.",
      "ar": "يجتاز مصورو Glatko التحقق من الهوية وتسجيل الأعمال ومراجعة المحفظة."
    }
  },
  {
    "q": {
      "tr": "Düğün için ne kadar önceden fotoğrafçı tutmalıyım?",
      "en": "How early should I book a wedding photographer?",
      "de": "Wie früh sollte ich einen Hochzeitsfotografen buchen?",
      "it": "Quanto prima prenotare il fotografo del matrimonio?",
      "ru": "За сколько бронировать свадебного фотографа?",
      "uk": "За скільки бронювати весільного фотографа?",
      "sr": "Koliko unapred rezervisati fotografa za venčanje?",
      "me": "Koliko unaprijed rezervisati fotografa za vjenčanje?",
      "ar": "كم مبكرًا يجب حجز مصور الزفاف؟"
    },
    "a": {
      "tr": "Yaz düğünleri (Mayıs-Eylül) için 8-12 ay önceden — popüler isimler Ocak ortasına kadar dolar. Cumartesi günleri en yoğun.",
      "en": "Book 8-12 months ahead for May-September weddings; in-demand names fill by mid-January. Saturdays are the busiest.",
      "de": "8-12 Monate im Voraus für Hochzeiten Mai-September. Beliebte Namen sind Mitte Januar ausgebucht. Samstage am stärksten gefragt.",
      "it": "8-12 mesi prima per matrimoni maggio-settembre; nomi richiesti si esauriscono entro metà gennaio. Sabati i più richiesti.",
      "ru": "За 8-12 месяцев на свадьбы май-сентябрь; топ-имена расходятся к середине января. Субботы — самые загруженные.",
      "uk": "За 8-12 місяців на весілля травень-вересень; топ-імена розходяться до середини січня. Суботи — найбільше навантаження.",
      "sr": "8-12 meseci unapred za venčanja maj-septembar; popularna imena se popune do sredine januara.",
      "me": "8-12 mjeseci unaprijed za vjenčanja maj-septembar; popularna imena se popune do sredine januara.",
      "ar": "احجز قبل 8-12 شهرًا لأعراس مايو-سبتمبر؛ الأسماء المطلوبة تمتلئ بحلول منتصف يناير. السبت أكثر الأيام انشغالًا."
    }
  }
]'::jsonb
WHERE slug = 'photo-video';

-- ──────────────────────────────────────────────────────────────────────────
-- tutoring-education
-- ──────────────────────────────────────────────────────────────────────────
UPDATE public.glatko_service_categories
SET faqs = '[
  {
    "q": {
      "tr": "Karadağ''da özel ders saatlik ücret nedir?",
      "en": "What is the hourly rate for tutoring in Montenegro?",
      "de": "Was kostet Nachhilfe pro Stunde in Montenegro?",
      "it": "Qual è la tariffa oraria delle ripetizioni in Montenegro?",
      "ru": "Сколько стоит репетитор в час в Черногории?",
      "uk": "Скільки коштує репетитор за годину в Чорногорії?",
      "sr": "Koliko košta privatni čas po satu u Crnoj Gori?",
      "me": "Koliko košta privatni čas po satu u Crnoj Gori?",
      "ar": "ما هي الأجرة بالساعة للدروس الخصوصية في الجبل الأسود؟"
    },
    "a": {
      "tr": "Akademik ders €15-€35; dil dersi (İngilizce, Rusça, Almanca) €18-€45; sertifikalı IELTS/TOEFL hazırlığı €30-€60. Glatko''da seviye filtresi var.",
      "en": "Academic tutoring €15-€35; language lessons (English, Russian, German) €18-€45; certified IELTS/TOEFL prep €30-€60. Filter by level on Glatko.",
      "de": "Schulnachhilfe €15-€35; Sprachunterricht (Englisch, Russisch, Deutsch) €18-€45; IELTS/TOEFL €30-€60. Auf Glatko nach Niveau filtern.",
      "it": "Ripetizioni scolastiche €15-€35; lingue (inglese, russo, tedesco) €18-€45; IELTS/TOEFL €30-€60. Filtra per livello su Glatko.",
      "ru": "Школьные занятия €15-€35; языки (английский, русский, немецкий) €18-€45; IELTS/TOEFL €30-€60. Фильтр по уровню.",
      "uk": "Шкільні заняття €15-€35; мови (англ., рос., нім.) €18-€45; IELTS/TOEFL €30-€60. Фільтр за рівнем.",
      "sr": "Školske instrukcije €15-€35; jezici (engleski, ruski, nemački) €18-€45; IELTS/TOEFL €30-€60. Filter po nivou.",
      "me": "Školske instrukcije €15-€35; jezici (engleski, ruski, njemački) €18-€45; IELTS/TOEFL €30-€60. Filter po nivou.",
      "ar": "دروس أكاديمية €15-€35؛ لغات (إنجليزية، روسية، ألمانية) €18-€45؛ IELTS/TOEFL €30-€60. صفّي حسب المستوى على Glatko."
    }
  },
  {
    "q": {
      "tr": "Hangi dillerde özel ders mevcut?",
      "en": "Which languages are taught on Glatko?",
      "de": "Welche Sprachen werden unterrichtet?",
      "it": "Quali lingue si insegnano su Glatko?",
      "ru": "Какие языки преподаются на Glatko?",
      "uk": "Які мови викладають на Glatko?",
      "sr": "Koji jezici se predaju na Glatku?",
      "me": "Koji jezici se predaju na Glatku?",
      "ar": "ما اللغات التي تُدرَّس على Glatko؟"
    },
    "a": {
      "tr": "İngilizce, Rusça, Almanca, İtalyanca, Türkçe, Fransızca, Karadağca/Sırpça (yabancılar için). Online ya da Boka Körfezi/Podgorica yüz yüze seçenek var.",
      "en": "English, Russian, German, Italian, Turkish, French, Montenegrin/Serbian (for non-natives). Online or in-person across Boka Bay/Podgorica.",
      "de": "Englisch, Russisch, Deutsch, Italienisch, Türkisch, Französisch, Montenegrinisch/Serbisch. Online oder vor Ort in Boka Bay/Podgorica.",
      "it": "Inglese, russo, tedesco, italiano, turco, francese, montenegrino/serbo. Online o in presenza a Boka Bay/Podgorica.",
      "ru": "Английский, русский, немецкий, итальянский, турецкий, французский, черногорский/сербский. Онлайн или очно в Боке/Подгорице.",
      "uk": "Англійська, російська, німецька, італійська, турецька, французька, чорногорська/сербська. Онлайн або очно у Боці/Подгориці.",
      "sr": "Engleski, ruski, nemački, italijanski, turski, francuski, crnogorski/srpski. Online ili uživo u Bokokotorskom zalivu/Podgorici.",
      "me": "Engleski, ruski, njemački, italijanski, turski, francuski, crnogorski/srpski. Online ili uživo u Bokokotorskom zalivu/Podgorici.",
      "ar": "الإنجليزية، الروسية، الألمانية، الإيطالية، التركية، الفرنسية، الجبل الأسود/الصربية. عبر الإنترنت أو حضوريًا في خليج بوكا/بودغوريتسا."
    }
  },
  {
    "q": {
      "tr": "Öğretmeni nasıl doğrularım?",
      "en": "How do I verify a tutor?",
      "de": "Wie verifiziere ich einen Tutor?",
      "it": "Come verifico un insegnante?",
      "ru": "Как проверить преподавателя?",
      "uk": "Як перевірити викладача?",
      "sr": "Kako da proverim profesora?",
      "me": "Kako da provjerim profesora?",
      "ar": "كيف أتحقق من المدرس؟"
    },
    "a": {
      "tr": "Glatko''da öğretmenler kimlik, diploma ve sertifika doğrulamasından geçer. Profilde dil seviyeleri (CEFR), öğrenci yorumları ve sınav puanı sonuçları görünür.",
      "en": "Glatko tutors pass ID, diploma and certification checks. Profiles show CEFR levels, student reviews, and exam-result outcomes.",
      "de": "Glatko-Tutoren bestehen ID-, Diplom- und Zertifikatsprüfung. Profil zeigt CEFR-Stufen, Bewertungen und Prüfungsergebnisse.",
      "it": "I tutor Glatko superano verifica ID, diploma e certificazione. Profilo con livelli CEFR, recensioni e risultati esami.",
      "ru": "Преподаватели Glatko проходят проверку документов, дипломов и сертификатов. На профиле — уровни CEFR и отзывы.",
      "uk": "Викладачі Glatko проходять перевірку документів, дипломів і сертифікатів. На профілі — рівні CEFR і відгуки.",
      "sr": "Profesori na Glatku prolaze proveru identiteta, diplome i sertifikata.",
      "me": "Profesori na Glatku prolaze provjeru identiteta, diplome i sertifikata.",
      "ar": "يجتاز معلمو Glatko التحقق من الهوية والشهادات. الملفات تعرض مستويات CEFR وتقييمات الطلاب ونتائج الامتحانات."
    }
  },
  {
    "q": {
      "tr": "Sınav öncesi yoğunlaştırılmış ders alabilir miyim?",
      "en": "Can I get exam-prep intensive courses?",
      "de": "Kann ich Intensivkurse zur Prüfungsvorbereitung bekommen?",
      "it": "Posso fare corsi intensivi di preparazione all''esame?",
      "ru": "Могу ли я взять интенсив перед экзаменом?",
      "uk": "Чи можу я взяти інтенсив перед іспитом?",
      "sr": "Mogu li da uzmem intenzivnu pripremu za ispit?",
      "me": "Mogu li da uzmem intenzivnu pripremu za ispit?",
      "ar": "هل يمكنني الحصول على دورات مكثفة للإعداد للامتحان؟"
    },
    "a": {
      "tr": "Evet — IELTS, TOEFL, SAT, Goethe, DELF, devlet matematiği için 4-12 haftalık paketler vardır (€280-€1.200). 6 hafta önceden başlamanız önerilir.",
      "en": "Yes — IELTS, TOEFL, SAT, Goethe, DELF and state-maths exam packages run 4-12 weeks (€280-€1,200). Start 6 weeks ahead at minimum.",
      "de": "Ja — IELTS, TOEFL, SAT, Goethe, DELF und Mathematik-Staatsprüfung Pakete 4-12 Wochen (€280-€1.200). Mindestens 6 Wochen vorher beginnen.",
      "it": "Sì — pacchetti IELTS, TOEFL, SAT, Goethe, DELF, matematica di stato 4-12 settimane (€280-€1.200). Inizia 6 settimane prima.",
      "ru": "Да — IELTS, TOEFL, SAT, Goethe, DELF и госматематика — пакеты 4-12 недель (€280-€1.200). Минимум за 6 недель.",
      "uk": "Так — IELTS, TOEFL, SAT, Goethe, DELF і держматематика — пакети 4-12 тижнів (€280-€1.200). Мінімум за 6 тижнів.",
      "sr": "Da — IELTS, TOEFL, SAT, Goethe, DELF i državna matematika — paketi 4-12 nedelja (€280-€1.200).",
      "me": "Da — IELTS, TOEFL, SAT, Goethe, DELF i državna matematika — paketi 4-12 sedmica (€280-€1.200).",
      "ar": "نعم — حزم IELTS وTOEFL وSAT وGoethe وDELF ورياضيات الدولة 4-12 أسبوعًا (€280-€1,200). ابدأ قبل 6 أسابيع على الأقل."
    }
  }
]'::jsonb
WHERE slug = 'tutoring-education';

COMMIT;

-- Verify after running scripts/apply-category-faqs.ts:
-- SELECT slug, jsonb_array_length(faqs) AS faq_count
-- FROM glatko_service_categories
-- WHERE slug IN ('airbnb-management','automotive','catering-food','childcare-family',
--                'events-wedding','garden-pool','health-wellness','moving-transport',
--                'photo-video','tutoring-education')
-- ORDER BY slug;
-- Expected: 10 rows, each with faq_count = 4.
