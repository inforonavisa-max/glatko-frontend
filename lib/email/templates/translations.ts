export type EmailLocale =
  | "en"
  | "tr"
  | "de"
  | "ar"
  | "it"
  | "me"
  | "ru"
  | "sr"
  | "uk";

export type EmailStrings = {
  companyName: string;
  tagline: string;
  footerCopyright: string;
  unsubscribeLabel: string;
  viewOnPlatform: string;
  greeting: string;
  regards: string;
};

const baseTranslations: Record<EmailLocale, EmailStrings> = {
  en: {
    companyName: "Glatko",
    tagline: "Find trusted professionals in Montenegro",
    footerCopyright: "© YEAR Glatko. All rights reserved.",
    unsubscribeLabel: "Unsubscribe from these emails",
    viewOnPlatform: "View on Glatko",
    greeting: "Hello",
    regards: "The Glatko Team",
  },
  tr: {
    companyName: "Glatko",
    tagline: "Karadağ'da güvenilir profesyoneller",
    footerCopyright: "© YEAR Glatko. Tüm hakları saklıdır.",
    unsubscribeLabel: "Bu e-postalardan çık",
    viewOnPlatform: "Glatko'da görüntüle",
    greeting: "Merhaba",
    regards: "Glatko Ekibi",
  },
  de: {
    companyName: "Glatko",
    tagline: "Vertrauenswürdige Profis in Montenegro finden",
    footerCopyright: "© YEAR Glatko. Alle Rechte vorbehalten.",
    unsubscribeLabel: "Von diesen E-Mails abmelden",
    viewOnPlatform: "Auf Glatko ansehen",
    greeting: "Hallo",
    regards: "Ihr Glatko-Team",
  },
  ar: {
    companyName: "Glatko",
    tagline: "اعثر على محترفين موثوقين في الجبل الأسود",
    footerCopyright: "© YEAR Glatko. جميع الحقوق محفوظة.",
    unsubscribeLabel: "إلغاء الاشتراك في هذه الرسائل",
    viewOnPlatform: "عرض على Glatko",
    greeting: "مرحباً",
    regards: "فريق Glatko",
  },
  it: {
    companyName: "Glatko",
    tagline: "Trova professionisti affidabili in Montenegro",
    footerCopyright: "© YEAR Glatko. Tutti i diritti riservati.",
    unsubscribeLabel: "Annulla iscrizione a queste email",
    viewOnPlatform: "Vedi su Glatko",
    greeting: "Ciao",
    regards: "Il team Glatko",
  },
  me: {
    companyName: "Glatko",
    tagline: "Pronađite provjerene profesionalce u Crnoj Gori",
    footerCopyright: "© YEAR Glatko. Sva prava zadržana.",
    unsubscribeLabel: "Odjavite se od ovih e-poruka",
    viewOnPlatform: "Pogledajte na Glatko",
    greeting: "Zdravo",
    regards: "Glatko tim",
  },
  ru: {
    companyName: "Glatko",
    tagline: "Находите проверенных специалистов в Черногории",
    footerCopyright: "© YEAR Glatko. Все права защищены.",
    unsubscribeLabel: "Отписаться от этих писем",
    viewOnPlatform: "Открыть в Glatko",
    greeting: "Здравствуйте",
    regards: "Команда Glatko",
  },
  sr: {
    companyName: "Glatko",
    tagline: "Pronađite proverene profesionalce u Crnoj Gori",
    footerCopyright: "© YEAR Glatko. Sva prava zadržana.",
    unsubscribeLabel: "Odjavite se sa ovih e-poruka",
    viewOnPlatform: "Pogledajte na Glatko",
    greeting: "Zdravo",
    regards: "Glatko tim",
  },
  uk: {
    companyName: "Glatko",
    tagline: "Знаходьте перевірених фахівців у Чорногорії",
    footerCopyright: "© YEAR Glatko. Усі права захищені.",
    unsubscribeLabel: "Відписатися від цих листів",
    viewOnPlatform: "Переглянути в Glatko",
    greeting: "Вітаємо",
    regards: "Команда Glatko",
  },
};

export function getEmailStrings(locale: EmailLocale): EmailStrings {
  const s = baseTranslations[locale] ?? baseTranslations.en;
  const y = String(new Date().getFullYear());
  return {
    ...s,
    footerCopyright: s.footerCopyright.replace("YEAR", y),
  };
}

/* ─── new-request-match ─── */
export type NewRequestMatchCopy = {
  subject: string;
  headline: string;
  directBody: string;
  indirectBody: string;
  labelService: string;
  labelLocation: string;
  labelRequest: string;
  cta: string;
  closingTip: string;
};

const newRequestMatch: Record<EmailLocale, NewRequestMatchCopy> = {
  en: {
    subject: "New service request on Glatko",
    headline: "You have a new service request",
    directBody: "{customerName} asked you personally for a quote.",
    indirectBody: "There is a new request in your area that fits your services.",
    labelService: "Service",
    labelLocation: "Location",
    labelRequest: "Request",
    cta: "Review request & send quote",
    closingTip: "Pros who reply quickly win more jobs on Glatko.",
  },
  tr: {
    subject: "Glatko'da yeni hizmet talebi",
    headline: "Yeni bir hizmet talebiniz var",
    directBody: "{customerName} özellikle sizden teklif istedi.",
    indirectBody: "Bölgenizde hizmetlerinize uyan yeni bir talep var.",
    labelService: "Hizmet",
    labelLocation: "Konum",
    labelRequest: "Talep",
    cta: "Talebi incele ve teklif ver",
    closingTip: "Hızlı dönen profesyoneller Glatko'da daha çok iş alır.",
  },
  de: {
    subject: "Neue Serviceanfrage auf Glatko",
    headline: "Sie haben eine neue Serviceanfrage",
    directBody: "{customerName} hat Sie persönlich um ein Angebot gebeten.",
    indirectBody: "In Ihrer Region gibt es eine neue Anfrage, die zu Ihren Leistungen passt.",
    labelService: "Leistung",
    labelLocation: "Ort",
    labelRequest: "Anfrage",
    cta: "Anfrage prüfen & Angebot senden",
    closingTip: "Schnelle Antworten bringen mehr Aufträge auf Glatko.",
  },
  ar: {
    subject: "طلب خدمة جديد على Glatko",
    headline: "لديك طلب خدمة جديد",
    directBody: "طلب منك {customerName} عرض سعر بشكل مباشر.",
    indirectBody: "هناك طلب جديد في منطقتك يتوافق مع خدماتك.",
    labelService: "الخدمة",
    labelLocation: "الموقع",
    labelRequest: "الطلب",
    cta: "مراجعة الطلب وإرسال عرض",
    closingTip: "المحترفون السريعون الرد يحصلون على المزيد من العمل في Glatko.",
  },
  it: {
    subject: "Nuova richiesta di servizio su Glatko",
    headline: "Hai una nuova richiesta di servizio",
    directBody: "{customerName} ti ha chiesto personalmente un preventivo.",
    indirectBody: "C'è una nuova richiesta nella tua zona adatta ai tuoi servizi.",
    labelService: "Servizio",
    labelLocation: "Località",
    labelRequest: "Richiesta",
    cta: "Esamina la richiesta e invia il preventivo",
    closingTip: "Chi risponde in fretta ottiene più lavori su Glatko.",
  },
  me: {
    subject: "Novi zahtjev za uslugom na Glatko",
    headline: "Imate novi zahtjev za uslugom",
    directBody: "{customerName} je posebno od vas tražio ponudu.",
    indirectBody: "U vašoj regiji postoji novi zahtjev koji odgovara vašim uslugama.",
    labelService: "Usluga",
    labelLocation: "Lokacija",
    labelRequest: "Zahtjev",
    cta: "Pregledajte zahtjev i pošaljite ponudu",
    closingTip: "Brzi odgovori donose više posla na Glatko.",
  },
  ru: {
    subject: "Новая заявка на услугу в Glatko",
    headline: "У вас новая заявка на услугу",
    directBody: "{customerName} лично попросил(а) у вас предложение.",
    indirectBody: "В вашем регионе появилась новая заявка, которая подходит под ваши услуги.",
    labelService: "Услуга",
    labelLocation: "Локация",
    labelRequest: "Заявка",
    cta: "Просмотреть заявку и отправить предложение",
    closingTip: "Быстрый отклик помогает получать больше заказов на Glatko.",
  },
  sr: {
    subject: "Novi zahtev za uslugom na Glatko",
    headline: "Imate novi zahtev za uslugom",
    directBody: "{customerName} je posebno od vas tražio ponudu.",
    indirectBody: "U vašoj regiji postoji novi zahtev koji odgovara vašim uslugama.",
    labelService: "Usluga",
    labelLocation: "Lokacija",
    labelRequest: "Zahtev",
    cta: "Pregledajte zahtev i pošaljite ponudu",
    closingTip: "Brzi odgovori donose više posla na Glatko.",
  },
  uk: {
    subject: "Нова заявка на послугу в Glatko",
    headline: "У вас нова заявка на послугу",
    directBody: "{customerName} особисто попросив(ла) у вас пропозицію.",
    indirectBody: "У вашому регіоні з’явилася нова заявка, що відповідає вашим послугам.",
    labelService: "Послуга",
    labelLocation: "Локація",
    labelRequest: "Заявка",
    cta: "Переглянути заявку й надіслати пропозицію",
    closingTip: "Швидка відповідь допомагає отримувати більше замовлень на Glatko.",
  },
};

export function getNewRequestMatchCopy(
  locale: EmailLocale,
): NewRequestMatchCopy {
  return newRequestMatch[locale] ?? newRequestMatch.en;
}

/* ─── new-bid-received ─── */
export type NewBidReceivedCopy = {
  subject: string;
  openLine: string;
  requestLabel: string;
  priceLabel: string;
  messageLabel: string;
  cta: string;
  note: string;
};

const newBidReceived: Record<EmailLocale, NewBidReceivedCopy> = {
  en: {
    subject: "You received a new quote on Glatko",
    openLine: "{professionalName} sent a quote for your request.",
    requestLabel: "Request",
    priceLabel: "Price",
    messageLabel: "Message",
    cta: "Review quote",
    note: "Compare several quotes to pick the best fit.",
  },
  tr: {
    subject: "Glatko'da yeni bir teklif aldınız",
    openLine: "{professionalName} talebinize teklif gönderdi.",
    requestLabel: "Talep",
    priceLabel: "Fiyat",
    messageLabel: "Mesaj",
    cta: "Teklifi incele",
    note: "Birden fazla teklifi karşılaştırarak en doğru seçimi yapın.",
  },
  de: {
    subject: "Neues Angebot auf Glatko",
    openLine: "{professionalName} hat ein Angebot zu Ihrer Anfrage gesendet.",
    requestLabel: "Anfrage",
    priceLabel: "Preis",
    messageLabel: "Nachricht",
    cta: "Angebot ansehen",
    note: "Vergleichen Sie mehrere Angebote, um die beste Wahl zu treffen.",
  },
  ar: {
    subject: "تلقيت عرض سعر جديد على Glatko",
    openLine: "أرسل {professionalName} عرض سعر لطلبك.",
    requestLabel: "الطلب",
    priceLabel: "السعر",
    messageLabel: "الرسالة",
    cta: "مراجعة العرض",
    note: "قارن بين عدة عروض لاختيار الأنسب.",
  },
  it: {
    subject: "Hai ricevuto un nuovo preventivo su Glatko",
    openLine: "{professionalName} ha inviato un preventivo per la tua richiesta.",
    requestLabel: "Richiesta",
    priceLabel: "Prezzo",
    messageLabel: "Messaggio",
    cta: "Vedi preventivo",
    note: "Confronta più preventivi per scegliere quello migliore.",
  },
  me: {
    subject: "Dobili ste novu ponudu na Glatko",
    openLine: "{professionalName} je poslao ponudu za vaš zahtjev.",
    requestLabel: "Zahtjev",
    priceLabel: "Cijena",
    messageLabel: "Poruka",
    cta: "Pogledajte ponudu",
    note: "Uporedite više ponuda da odaberete najbolju.",
  },
  ru: {
    subject: "Новое предложение в Glatko",
    openLine: "{professionalName} отправил(а) предложение по вашей заявке.",
    requestLabel: "Заявка",
    priceLabel: "Цена",
    messageLabel: "Сообщение",
    cta: "Посмотреть предложение",
    note: "Сравните несколько предложений, чтобы выбрать лучшее.",
  },
  sr: {
    subject: "Dobili ste novu ponudu na Glatko",
    openLine: "{professionalName} je poslao ponudu za vaš zahtev.",
    requestLabel: "Zahtev",
    priceLabel: "Cena",
    messageLabel: "Poruka",
    cta: "Pogledajte ponudu",
    note: "Uporedite više ponuda da izaberete najbolju.",
  },
  uk: {
    subject: "Нова пропозиція в Glatko",
    openLine: "{professionalName} надіслав(ла) пропозицію щодо вашої заявки.",
    requestLabel: "Заявка",
    priceLabel: "Ціна",
    messageLabel: "Повідомлення",
    cta: "Переглянути пропозицію",
    note: "Порівняйте кілька пропозицій, щоб обрати найкращу.",
  },
};

export function getNewBidReceivedCopy(locale: EmailLocale): NewBidReceivedCopy {
  return newBidReceived[locale] ?? newBidReceived.en;
}

/* ─── bid-accepted ─── */
export type BidAcceptedCopy = {
  subject: string;
  celebration: string;
  acceptedLine: string;
  serviceLabel: string;
  priceLabel: string;
  cta: string;
  note: string;
};

const bidAccepted: Record<EmailLocale, BidAcceptedCopy> = {
  en: {
    subject: "Your quote was accepted on Glatko",
    celebration: "Great news!",
    acceptedLine: "{customerName} accepted your quote.",
    serviceLabel: "Job",
    priceLabel: "Agreed price",
    cta: "Message the customer",
    note: "Use messages to agree on timing and next steps.",
  },
  tr: {
    subject: "Teklifiniz Glatko'da kabul edildi",
    celebration: "Harika haber!",
    acceptedLine: "{customerName} teklifinizi kabul etti.",
    serviceLabel: "İş",
    priceLabel: "Kabul edilen fiyat",
    cta: "Müşteri ile mesajlaş",
    note: "Zamanlama ve sonraki adımlar için mesajlaşmayı kullanın.",
  },
  de: {
    subject: "Ihr Angebot wurde auf Glatko angenommen",
    celebration: "Tolle Neuigkeiten!",
    acceptedLine: "{customerName} hat Ihr Angebot angenommen.",
    serviceLabel: "Auftrag",
    priceLabel: "Vereinbarter Preis",
    cta: "Nachricht an Kundin / Kunden",
    note: "Nutzen Sie den Chat für Termine und nächste Schritte.",
  },
  ar: {
    subject: "تم قبول عرضك على Glatko",
    celebration: "أخبار رائعة!",
    acceptedLine: "قبل {customerName} عرضك.",
    serviceLabel: "الخدمة",
    priceLabel: "السعر المتفق عليه",
    cta: "مراسلة العميل",
    note: "استخدم الرسائل لترتيب المواعيد والخطوات التالية.",
  },
  it: {
    subject: "Il tuo preventivo è stato accettato su Glatko",
    celebration: "Ottime notizie!",
    acceptedLine: "{customerName} ha accettato il tuo preventivo.",
    serviceLabel: "Lavoro",
    priceLabel: "Prezzo concordato",
    cta: "Scrivi al cliente",
    note: "Usa i messaggi per tempistiche e prossimi passi.",
  },
  me: {
    subject: "Vaša ponuda je prihvaćena na Glatko",
    celebration: "Sjajne vijesti!",
    acceptedLine: "{customerName} je prihvatio vašu ponudu.",
    serviceLabel: "Posao",
    priceLabel: "Dogovorena cijena",
    cta: "Pišite klijentu",
    note: "Koristite poruke za dogovor oko termina i sljedećih koraka.",
  },
  ru: {
    subject: "Ваше предложение принято в Glatko",
    celebration: "Отличные новости!",
    acceptedLine: "{customerName} принял(а) ваше предложение.",
    serviceLabel: "Заказ",
    priceLabel: "Согласованная цена",
    cta: "Написать клиенту",
    note: "Обсудите сроки и детали в переписке.",
  },
  sr: {
    subject: "Vaša ponuda je prihvaćena na Glatko",
    celebration: "Sjajne vesti!",
    acceptedLine: "{customerName} je prihvatio vašu ponudu.",
    serviceLabel: "Posao",
    priceLabel: "Dogovorena cena",
    cta: "Pišite klijentu",
    note: "Koristite poruke za dogovor oko termina i sledećih koraka.",
  },
  uk: {
    subject: "Вашу пропозицію прийнято в Glatko",
    celebration: "Чудові новини!",
    acceptedLine: "{customerName} прийняв(ла) вашу пропозицію.",
    serviceLabel: "Замовлення",
    priceLabel: "Погоджена ціна",
    cta: "Написати клієнту",
    note: "Узгодьте терміни та наступні кроки в повідомленнях.",
  },
};

export function getBidAcceptedCopy(locale: EmailLocale): BidAcceptedCopy {
  return bidAccepted[locale] ?? bidAccepted.en;
}

/* ─── welcome ─── */
export type WelcomeCopy = {
  subject: string;
  title: string;
  proBody: string;
  customerBody: string;
  ctaPro: string;
  ctaCustomer: string;
  bullet1: string;
  bullet2: string;
  bullet3: string;
};

const welcome: Record<EmailLocale, WelcomeCopy> = {
  en: {
    subject: "Welcome to Glatko",
    title: "Welcome to Glatko!",
    proBody: "Complete your profile and start finding your first customers.",
    customerBody: "Discover verified professionals across Montenegro.",
    ctaPro: "Complete my profile",
    ctaCustomer: "Browse professionals",
    bullet1: "Verified pros and transparent quotes",
    bullet2: "Chat in-app to agree on details",
    bullet3: "Built for homes, boats, and local services",
  },
  tr: {
    subject: "Glatko'ya hoş geldiniz",
    title: "Glatko'ya hoş geldiniz!",
    proBody: "Profilinizi tamamlayın ve ilk müşterinizi bulmaya başlayın.",
    customerBody: "Karadağ genelinde doğrulanmış profesyonelleri keşfedin.",
    ctaPro: "Profilimi tamamla",
    ctaCustomer: "Profesyonel ara",
    bullet1: "Doğrulanmış uzmanlar ve şeffaf teklifler",
    bullet2: "Detayları netleştirmek için uygulama içi sohbet",
    bullet3: "Ev, tekne ve yerel hizmetler için tasarlandı",
  },
  de: {
    subject: "Willkommen bei Glatko",
    title: "Willkommen bei Glatko!",
    proBody: "Vervollständigen Sie Ihr Profil und finden Sie Ihre ersten Kundinnen und Kunden.",
    customerBody: "Entdecken Sie verifizierte Profis in ganz Montenegro.",
    ctaPro: "Profil vervollständigen",
    ctaCustomer: "Profis entdecken",
    bullet1: "Geprüfte Profis und transparente Angebote",
    bullet2: "Chat in der App für alle Details",
    bullet3: "Für Zuhause, Boot und lokale Services",
  },
  ar: {
    subject: "مرحباً بك في Glatko",
    title: "مرحباً بك في Glatko!",
    proBody: "أكمل ملفك الشخصي وابدأ بالعثور على أول عملائك.",
    customerBody: "اكتشف محترفين موثوقين في جميع أنحاء الجبل الأسود.",
    ctaPro: "إكمال ملفي",
    ctaCustomer: "تصفح المحترفين",
    bullet1: "محترفون موثقون وعروض واضحة",
    bullet2: "دردشة داخل التطبيق لترتيب التفاصيل",
    bullet3: "مناسبة للمنازل والقوارب والخدمات المحلية",
  },
  it: {
    subject: "Benvenuto su Glatko",
    title: "Benvenuto su Glatko!",
    proBody: "Completa il profilo e inizia a trovare i tuoi primi clienti.",
    customerBody: "Scopri professionisti verificati in tutto il Montenegro.",
    ctaPro: "Completa il mio profilo",
    ctaCustomer: "Cerca professionisti",
    bullet1: "Professionisti verificati e preventivi chiari",
    bullet2: "Chat in app per i dettagli",
    bullet3: "Pensato per casa, barca e servizi locali",
  },
  me: {
    subject: "Dobrodošli na Glatko",
    title: "Dobrodošli na Glatko!",
    proBody: "Dovršite profil i počnite pronalaziti prve klijente.",
    customerBody: "Otkrijte provjerene profesionalce širom Crne Gore.",
    ctaPro: "Dovrši moj profil",
    ctaCustomer: "Pretraži profesionalce",
    bullet1: "Provjereni stručnjaci i jasne ponude",
    bullet2: "Ćaskanje u aplikaciji za detalje",
    bullet3: "Za dom, brod i lokalne usluge",
  },
  ru: {
    subject: "Добро пожаловать в Glatko",
    title: "Добро пожаловать в Glatko!",
    proBody: "Заполните профиль и начните находить первых клиентов.",
    customerBody: "Откройте для себя проверенных специалистов по всей Черногории.",
    ctaPro: "Заполнить профиль",
    ctaCustomer: "Найти специалистов",
    bullet1: "Проверенные специалисты и прозрачные предложения",
    bullet2: "Чат в приложении для согласования деталей",
    bullet3: "Для дома, яхт и локальных услуг",
  },
  sr: {
    subject: "Dobrodošli na Glatko",
    title: "Dobrodošli na Glatko!",
    proBody: "Dovršite profil i počnite da pronalazite prve klijente.",
    customerBody: "Otkrijte proverene profesionalce širom Crne Gore.",
    ctaPro: "Dovrši moj profil",
    ctaCustomer: "Pretraži profesionalce",
    bullet1: "Provereni stručnjaci i jasne ponude",
    bullet2: "Ćaskanje u aplikaciji za detalje",
    bullet3: "Za dom, brod i lokalne usluge",
  },
  uk: {
    subject: "Ласкаво просимо до Glatko",
    title: "Ласкаво просимо до Glatko!",
    proBody: "Заповніть профіль і почніть знаходити перших клієнтів.",
    customerBody: "Відкрийте для себе перевірених фахівців по всій Чорногорії.",
    ctaPro: "Заповнити профіль",
    ctaCustomer: "Знайти фахівців",
    bullet1: "Перевірені фахівці та прозорі пропозиції",
    bullet2: "Чат у застосунку для узгодження деталей",
    bullet3: "Для дому, човнів і локальних послуг",
  },
};

export function getWelcomeCopy(locale: EmailLocale): WelcomeCopy {
  return welcome[locale] ?? welcome.en;
}

export function interpolate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}
