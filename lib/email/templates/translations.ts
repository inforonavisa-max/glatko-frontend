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

const EMAIL_LOCALES: readonly EmailLocale[] = [
  "en",
  "tr",
  "de",
  "ar",
  "it",
  "me",
  "ru",
  "sr",
  "uk",
];

export function coerceEmailLocale(raw: string | null | undefined): EmailLocale {
  if (raw && (EMAIL_LOCALES as readonly string[]).includes(raw)) {
    return raw as EmailLocale;
  }
  return "en";
}

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

/* ─── bid not selected (pro) ─── */
export type BidNotSelectedCopy = {
  subject: string;
  preview: string;
  bodyLine: string;
  serviceLabel: string;
  locationLabel: string;
  tip: string;
  cta: string;
  fallbackRequest: string;
};

const bidNotSelected: Record<EmailLocale, BidNotSelectedCopy> = {
  en: {
    subject: "Your bid was not selected",
    preview: "Update on your Glatko quote",
    bodyLine:
      "The customer chose another professional for “{requestTitle}”. Thank you for taking the time to quote.",
    serviceLabel: "Service",
    locationLabel: "Location",
    tip: "Keep your profile up to date to win the next match.",
    cta: "View matching requests",
    fallbackRequest: "this request",
  },
  tr: {
    subject: "Teklifiniz seçilmedi",
    preview: "Glatko teklif güncellemesi",
    bodyLine:
      "Müşteri “{requestTitle}” için başka bir profesyoneli seçti. Teklif verdiğiniz için teşekkürler.",
    serviceLabel: "Hizmet",
    locationLabel: "Konum",
    tip: "Bir sonraki eşleşmeyi kazanmak için profilinizi güncel tutun.",
    cta: "Eşleşen talepleri gör",
    fallbackRequest: "bu talep",
  },
  de: {
    subject: "Ihr Angebot wurde nicht ausgewählt",
    preview: "Update zu Ihrem Glatko-Angebot",
    bodyLine:
      "Der Kunde hat für „{requestTitle}“ einen anderen Profi gewählt. Danke für Ihr Angebot.",
    serviceLabel: "Leistung",
    locationLabel: "Ort",
    tip: "Halten Sie Ihr Profil aktuell, um beim nächsten Mal zu überzeugen.",
    cta: "Passende Anfragen ansehen",
    fallbackRequest: "diese Anfrage",
  },
  ar: {
    subject: "لم يتم اختيار عرضك",
    preview: "تحديث بخصوص عرضك على Glatko",
    bodyLine:
      "اختار العميل محترفًا آخر لطلب «{requestTitle}». شكرًا لوقتك في تقديم العرض.",
    serviceLabel: "الخدمة",
    locationLabel: "الموقع",
    tip: "حدّث ملفك لزيادة فرصك في الطلبات القادمة.",
    cta: "عرض الطلبات المطابقة",
    fallbackRequest: "هذا الطلب",
  },
  it: {
    subject: "Il tuo preventivo non è stato scelto",
    preview: "Aggiornamento sul tuo preventivo Glatko",
    bodyLine:
      "Il cliente ha scelto un altro professionista per “{requestTitle}”. Grazie per aver inviato il preventivo.",
    serviceLabel: "Servizio",
    locationLabel: "Località",
    tip: "Tieni il profilo aggiornato per la prossima opportunità.",
    cta: "Vedi richieste in linea",
    fallbackRequest: "questa richiesta",
  },
  me: {
    subject: "Vaša ponuda nije odabrana",
    preview: "Ažuriranje vaše Glatko ponude",
    bodyLine:
      "Klijent je za „{requestTitle}“ odabrao drugog profesionalca. Hvala što ste poslali ponudu.",
    serviceLabel: "Usluga",
    locationLabel: "Lokacija",
    tip: "Držite profil ažuriranim da osvojite sljedeće prilike.",
    cta: "Pogledajte odgovarajuće zahtjeve",
    fallbackRequest: "ovaj zahtjev",
  },
  ru: {
    subject: "Ваше предложение не выбрали",
    preview: "Обновление по вашему предложению в Glatko",
    bodyLine:
      "Клиент выбрал другого специалиста для «{requestTitle}». Спасибо, что отправили предложение.",
    serviceLabel: "Услуга",
    locationLabel: "Локация",
    tip: "Обновляйте профиль, чтобы чаще выигрывать заявки.",
    cta: "Подходящие заявки",
    fallbackRequest: "эта заявка",
  },
  sr: {
    subject: "Vaša ponuda nije odabrana",
    preview: "Ažuriranje vaše Glatko ponude",
    bodyLine:
      "Klijent je za „{requestTitle}“ izabrao drugog profesionalca. Hvala što ste poslali ponudu.",
    serviceLabel: "Usluga",
    locationLabel: "Lokacija",
    tip: "Držite profil ažuriranim da osvojite sledeće prilike.",
    cta: "Pogledajte odgovarajuće zahteve",
    fallbackRequest: "ovaj zahtev",
  },
  uk: {
    subject: "Вашу пропозицію не обрали",
    preview: "Оновлення щодо вашої пропозиції в Glatko",
    bodyLine:
      "Клієнт обрав іншого фахівця для «{requestTitle}». Дякуємо, що надіслали пропозицію.",
    serviceLabel: "Послуга",
    locationLabel: "Локація",
    tip: "Оновлюйте профіль, щоб частіше отримувати замовлення.",
    cta: "Відповідні заявки",
    fallbackRequest: "ця заявка",
  },
};

export function getBidNotSelectedCopy(locale: EmailLocale): BidNotSelectedCopy {
  return bidNotSelected[locale] ?? bidNotSelected.en;
}

/* ─── status change (customer) ─── */
export type StatusChangeEmailCopy = {
  subject: string;
  headline: string;
  requestLabel: string;
  cta: string;
};

const statusChangeEmail: Record<EmailLocale, StatusChangeEmailCopy> = {
  en: {
    subject: "Your request status was updated",
    headline: "Here is the latest update on Glatko.",
    requestLabel: "Request",
    cta: "Open request",
  },
  tr: {
    subject: "Talebinizin durumu güncellendi",
    headline: "Glatko’daki talebinizle ilgili son bilgi.",
    requestLabel: "Talep",
    cta: "Talebi aç",
  },
  de: {
    subject: "Der Status Ihrer Anfrage wurde aktualisiert",
    headline: "Hier ist das neueste Update zu Ihrer Anfrage auf Glatko.",
    requestLabel: "Anfrage",
    cta: "Anfrage öffnen",
  },
  ar: {
    subject: "تم تحديث حالة طلبك",
    headline: "إليك آخر التحديثات بخصوص طلبك على Glatko.",
    requestLabel: "الطلب",
    cta: "فتح الطلب",
  },
  it: {
    subject: "Lo stato della richiesta è stato aggiornato",
    headline: "Ecco l’ultimo aggiornamento sulla tua richiesta Glatko.",
    requestLabel: "Richiesta",
    cta: "Apri richiesta",
  },
  me: {
    subject: "Status vašeg zahtjeva je ažuriran",
    headline: "Evo najnovijeg ažuriranja o vašem zahtjevu na Glatko.",
    requestLabel: "Zahtjev",
    cta: "Otvori zahtjev",
  },
  ru: {
    subject: "Статус вашей заявки обновлён",
    headline: "Последнее обновление по вашей заявке в Glatko.",
    requestLabel: "Заявка",
    cta: "Открыть заявку",
  },
  sr: {
    subject: "Status vašeg zahteva je ažuriran",
    headline: "Evo najnovijeg ažuriranja o vašem zahtevu na Glatko.",
    requestLabel: "Zahtev",
    cta: "Otvori zahtev",
  },
  uk: {
    subject: "Статус вашої заявки оновлено",
    headline: "Останнє оновлення щодо вашої заявки в Glatko.",
    requestLabel: "Заявка",
    cta: "Відкрити заявку",
  },
};

export function getStatusChangeEmailCopy(
  locale: EmailLocale,
): StatusChangeEmailCopy {
  return statusChangeEmail[locale] ?? statusChangeEmail.en;
}

/* ─── review received (pro) ─── */
export type ReviewReceivedEmailCopy = {
  subject: string;
  previewLine: string;
  ratingLine: string;
  cta: string;
};

const reviewReceivedEmail: Record<EmailLocale, ReviewReceivedEmailCopy> = {
  en: {
    subject: "You received a new review",
    previewLine: "Someone left you a {stars}-star review on Glatko.",
    ratingLine: "Rating: {stars} / 5",
    cta: "Open your dashboard",
  },
  tr: {
    subject: "Yeni bir değerlendirme aldınız",
    previewLine: "Birisi size Glatko’da {stars} yıldız verdi.",
    ratingLine: "Puan: {stars} / 5",
    cta: "Panele git",
  },
  de: {
    subject: "Sie haben eine neue Bewertung erhalten",
    previewLine: "Jemand hat Ihnen auf Glatko {stars} Sterne gegeben.",
    ratingLine: "Bewertung: {stars} / 5",
    cta: "Dashboard öffnen",
  },
  ar: {
    subject: "تلقيت تقييمًا جديدًا",
    previewLine: "ترك لك أحدهم تقييمًا بـ {stars} نجوم على Glatko.",
    ratingLine: "التقييم: {stars} / 5",
    cta: "افتح لوحة التحكم",
  },
  it: {
    subject: "Hai ricevuto una nuova recensione",
    previewLine: "Qualcuno ti ha lasciato una recensione da {stars} stelle su Glatko.",
    ratingLine: "Valutazione: {stars} / 5",
    cta: "Apri la dashboard",
  },
  me: {
    subject: "Primili ste novu recenziju",
    previewLine: "Neko vam je ostavio ocenu od {stars} zvjezdica na Glatko.",
    ratingLine: "Ocjena: {stars} / 5",
    cta: "Otvori kontrolnu tablu",
  },
  ru: {
    subject: "Вы получили новый отзыв",
    previewLine: "Вам поставили {stars} звёзд в Glatko.",
    ratingLine: "Оценка: {stars} / 5",
    cta: "Открыть панель",
  },
  sr: {
    subject: "Primili ste novu recenziju",
    previewLine: "Neko vam je ostavio ocenu od {stars} zvezdica na Glatko.",
    ratingLine: "Ocena: {stars} / 5",
    cta: "Otvori kontrolnu tablu",
  },
  uk: {
    subject: "Ви отримали новий відгук",
    previewLine: "Хтось залишив вам оцінку {stars} зірок у Glatko.",
    ratingLine: "Оцінка: {stars} / 5",
    cta: "Відкрити панель",
  },
};

export function getReviewReceivedEmailCopy(
  locale: EmailLocale,
): ReviewReceivedEmailCopy {
  return reviewReceivedEmail[locale] ?? reviewReceivedEmail.en;
}

/* ─── new message ─── */
export type NewMessageEmailCopy = {
  subject: string;
  title: string;
  cta: string;
};

const newMessageEmail: Record<EmailLocale, NewMessageEmailCopy> = {
  en: {
    subject: "New message on Glatko",
    title: "You have a new message",
    cta: "Open conversation",
  },
  tr: {
    subject: "Glatko’da yeni mesaj",
    title: "Yeni bir mesajınız var",
    cta: "Sohbeti aç",
  },
  de: {
    subject: "Neue Nachricht auf Glatko",
    title: "Sie haben eine neue Nachricht",
    cta: "Unterhaltung öffnen",
  },
  ar: {
    subject: "رسالة جديدة على Glatko",
    title: "لديك رسالة جديدة",
    cta: "فتح المحادثة",
  },
  it: {
    subject: "Nuovo messaggio su Glatko",
    title: "Hai un nuovo messaggio",
    cta: "Apri la conversazione",
  },
  me: {
    subject: "Nova poruka na Glatko",
    title: "Imate novu poruku",
    cta: "Otvori razgovor",
  },
  ru: {
    subject: "Новое сообщение в Glatko",
    title: "У вас новое сообщение",
    cta: "Открыть чат",
  },
  sr: {
    subject: "Nova poruka na Glatko",
    title: "Imate novu poruku",
    cta: "Otvori razgovor",
  },
  uk: {
    subject: "Нове повідомлення в Glatko",
    title: "У вас нове повідомлення",
    cta: "Відкрити розмову",
  },
};

export function getNewMessageEmailCopy(locale: EmailLocale): NewMessageEmailCopy {
  return newMessageEmail[locale] ?? newMessageEmail.en;
}

/* ─── verification rejected ─── */
export type VerificationSimpleCopy = {
  subject: string;
  title: string;
  body: string;
  cta: string;
};

const verificationRejectedEmail: Record<EmailLocale, VerificationSimpleCopy> = {
  en: {
    subject: "Update on your Glatko application",
    title: "Application not approved",
    body: "We could not approve your professional application. You can review your profile and try again.",
    cta: "Review your profile",
  },
  tr: {
    subject: "Glatko başvurunuz hakkında güncelleme",
    title: "Başvuru onaylanmadı",
    body: "Profesyonel başvurunuzu onaylayamadık. Profilinizi gözden geçirip tekrar deneyebilirsiniz.",
    cta: "Profili incele",
  },
  de: {
    subject: "Update zu Ihrer Glatko-Bewerbung",
    title: "Bewerbung nicht genehmigt",
    body: "Wir konnten Ihre Profi-Bewerbung nicht freigeben. Prüfen Sie Ihr Profil und versuchen Sie es erneut.",
    cta: "Profil prüfen",
  },
  ar: {
    subject: "تحديث بخصوص طلبك في Glatko",
    title: "لم تتم الموافقة على الطلب",
    body: "لم نتمكن من اعتماد طلبك المهني. راجع ملفك وحاول مرة أخرى.",
    cta: "مراجعة الملف",
  },
  it: {
    subject: "Aggiornamento sulla domanda Glatko",
    title: "Domanda non approvata",
    body: "Non abbiamo potuto approvare la tua candidatura professionale. Controlla il profilo e riprova.",
    cta: "Rivedi profilo",
  },
  me: {
    subject: "Ažuriranje vaše Glatko prijave",
    title: "Prijava nije odobrena",
    body: "Nismo mogli odobriti vašu profesionalnu prijavu. Pregledajte profil i pokušajte ponovo.",
    cta: "Pregledaj profil",
  },
  ru: {
    subject: "Обновление по заявке в Glatko",
    title: "Заявка не одобрена",
    body: "Мы не смогли одобрить вашу заявку профессионала. Проверьте профиль и попробуйте снова.",
    cta: "Проверить профиль",
  },
  sr: {
    subject: "Ažuriranje vaše Glatko prijave",
    title: "Prijava nije odobrena",
    body: "Nismo mogli odobriti vašu profesionalnu prijavu. Pregledajte profil i pokušajte ponovo.",
    cta: "Pregledaj profil",
  },
  uk: {
    subject: "Оновлення щодо заявки в Glatko",
    title: "Заявку не схвалено",
    body: "Ми не змогли схвалити вашу професійну заявку. Перевірте профіль і спробуйте знову.",
    cta: "Переглянути профіль",
  },
};

export function getVerificationRejectedEmailCopy(
  locale: EmailLocale,
): VerificationSimpleCopy {
  return verificationRejectedEmail[locale] ?? verificationRejectedEmail.en;
}

/* ─── customer welcome (post email verification) ─── */
export type CustomerWelcomeEmailCopy = {
  subject: string;
  preview: string;
  title: string;
  whatIsGlatko: string;
  step1: string;
  step2: string;
  step3: string;
  ctaPrimary: string;
  proFooter: string;
  proLinkLabel: string;
};

const customerWelcomeEmail: Record<EmailLocale, CustomerWelcomeEmailCopy> = {
  en: {
    subject: "Welcome to Glatko — Find the right professional",
    preview: "Post a request, get offers, choose your pro",
    title: "Welcome to Glatko",
    whatIsGlatko:
      "Glatko is a reverse marketplace: you describe what you need, verified professionals send quotes, and you pick the best fit — all in one place.",
    step1: "📝 Post a request",
    step2: "💬 Receive offers",
    step3: "✅ Choose your professional",
    ctaPrimary: "Create your first request",
    proFooter: "Are you a professional?",
    proLinkLabel: "Apply to join Glatko",
  },
  tr: {
    subject: "Glatko'ya hoş geldiniz — Doğru profesyoneli bulun",
    preview: "Talep açın, teklifler gelsin, seçin",
    title: "Glatko'ya hoş geldiniz",
    whatIsGlatko:
      "Glatko ters bir pazaryeri: ihtiyacınızı yazarsınız, doğrulanmış profesyoneller teklif gönderir, siz en uygun olanı seçersiniz — hepsi tek yerde.",
    step1: "📝 Talep açın",
    step2: "💬 Teklif alın",
    step3: "✅ Profesyonelinizi seçin",
    ctaPrimary: "İlk talebinizi oluşturun",
    proFooter: "Profesyonel misiniz?",
    proLinkLabel: "Buradan başvurun",
  },
  de: {
    subject: "Willkommen bei Glatko — Den richtigen Profi finden",
    preview: "Anfrage stellen, Angebote erhalten, auswählen",
    title: "Willkommen bei Glatko",
    whatIsGlatko:
      "Glatko ist ein umgekehrter Marktplatz: Sie beschreiben Ihren Bedarf, verifizierte Profis senden Angebote, und Sie wählen — alles an einem Ort.",
    step1: "📝 Anfrage erstellen",
    step2: "💬 Angebote erhalten",
    step3: "✅ Profi auswählen",
    ctaPrimary: "Erste Anfrage erstellen",
    proFooter: "Sind Sie Profi?",
    proLinkLabel: "Jetzt bewerben",
  },
  ar: {
    subject: "مرحباً بك في Glatko — اعثر على المحترف المناسب",
    preview: "أرسل طلباً، استقبل العروض، واختر",
    title: "مرحباً بك في Glatko",
    whatIsGlatko:
      "Glatko سوق معكوس: تصف احتياجك، يرسل المحترفون الموثقون عروضاً، وتختار الأنسب — كل ذلك في مكان واحد.",
    step1: "📝 أرسل طلباً",
    step2: "💬 استقبل العروض",
    step3: "✅ اختر المحترف",
    ctaPrimary: "أنشئ طلبك الأول",
    proFooter: "هل أنت محترف؟",
    proLinkLabel: "قدّم طلب الانضمام",
  },
  it: {
    subject: "Benvenuto su Glatko — Trova il professionista giusto",
    preview: "Apri una richiesta, ricevi preventivi, scegli",
    title: "Benvenuto su Glatko",
    whatIsGlatko:
      "Glatko è un marketplace al contrario: descrivi il bisogno, i professionisti verificati inviano preventivi e tu scegli — tutto in un unico posto.",
    step1: "📝 Apri una richiesta",
    step2: "💬 Ricevi offerte",
    step3: "✅ Scegli il professionista",
    ctaPrimary: "Crea la tua prima richiesta",
    proFooter: "Sei un professionista?",
    proLinkLabel: "Candidati su Glatko",
  },
  me: {
    subject: "Dobrodošli na Glatko — Pronađite pravog stručnjaka",
    preview: "Pošaljite zahtjev, dobijte ponude, izaberite",
    title: "Dobrodošli na Glatko",
    whatIsGlatko:
      "Glatko je obrnuto tržište: opišete potrebu, provjereni profesionalci šalju ponude, a vi birate — sve na jednom mjestu.",
    step1: "📝 Pošaljite zahtjev",
    step2: "💬 Primite ponude",
    step3: "✅ Izaberite stručnjaka",
    ctaPrimary: "Kreirajte prvi zahtjev",
    proFooter: "Da li ste profesionalac?",
    proLinkLabel: "Prijavite se ovdje",
  },
  ru: {
    subject: "Добро пожаловать в Glatko — Найдите нужного специалиста",
    preview: "Опишите задачу, получите предложения, выберите",
    title: "Добро пожаловать в Glatko",
    whatIsGlatko:
      "Glatko — обратный маркетплейс: вы описываете задачу, проверенные специалисты присылают предложения, вы выбираете — всё в одном месте.",
    step1: "📝 Создайте заявку",
    step2: "💬 Получите предложения",
    step3: "✅ Выберите специалиста",
    ctaPrimary: "Создать первую заявку",
    proFooter: "Вы специалист?",
    proLinkLabel: "Подать заявку",
  },
  sr: {
    subject: "Dobrodošli na Glatko — Pronađite pravog stručnjaka",
    preview: "Pošaljite zahtev, dobijte ponude, izaberite",
    title: "Dobrodošli na Glatko",
    whatIsGlatko:
      "Glatko je obrnuto tržište: opišete potrebu, provereni profesionalci šalju ponude, a vi birate — sve na jednom mestu.",
    step1: "📝 Pošaljite zahtev",
    step2: "💬 Primite ponude",
    step3: "✅ Izaberite stručnjaka",
    ctaPrimary: "Kreirajte prvi zahtev",
    proFooter: "Da li ste profesionalac?",
    proLinkLabel: "Prijavite se ovde",
  },
  uk: {
    subject: "Ласкаво просимо до Glatko — Знайдіть потрібного фахівця",
    preview: "Створіть заявку, отримайте пропозиції, оберіть",
    title: "Ласкаво просимо до Glatko",
    whatIsGlatko:
      "Glatko — зворотний маркетплейс: ви описуєте потребу, перевірені фахівці надсилають пропозиції, ви обираєте — усе в одному місці.",
    step1: "📝 Створіть заявку",
    step2: "💬 Отримайте пропозиції",
    step3: "✅ Оберіть фахівця",
    ctaPrimary: "Створити першу заявку",
    proFooter: "Ви фахівець?",
    proLinkLabel: "Подати заявку",
  },
};

export function getCustomerWelcomeEmailCopy(
  locale: EmailLocale,
): CustomerWelcomeEmailCopy {
  return customerWelcomeEmail[locale] ?? customerWelcomeEmail.en;
}

/* ─── pro welcome (verification approved) ─── */
export type ProWelcomeEmailCopy = {
  subject: string;
  preview: string;
  headline: string;
  intro: string;
  stepMatch: string;
  stepBid: string;
  stepChosen: string;
  freeBidLine: string;
  supportLine: string;
  ctaProfile: string;
  adminNoteLabel: string;
};

const proWelcomeEmail: Record<EmailLocale, ProWelcomeEmailCopy> = {
  en: {
    subject: "Welcome to Glatko Pro — your application is approved",
    preview: "Complete your profile and start bidding",
    headline: "Your application is approved — welcome to Glatko!",
    intro:
      "You can now receive matching requests, send quotes, and get chosen by customers.",
    stepMatch: "📬 Matching requests will appear in your dashboard",
    stepBid: "💼 Send clear, fair quotes",
    stepChosen: "🤝 The customer picks the best fit",
    freeBidLine: "Your first bid on each new request is free under current platform rules.",
    supportLine: "Questions? Reply to this email or use in-app help — we are here for you.",
    ctaProfile: "Complete your pro profile",
    adminNoteLabel: "Note from the team",
  },
  tr: {
    subject: "Glatko Pro'ya hoş geldiniz — başvurunuz onaylandı",
    preview: "Profilinizi tamamlayın ve teklif vermeye başlayın",
    headline: "Başvurunuz onaylandı — Glatko'ya hoş geldiniz!",
    intro:
      "Artık size uygun talepleri görebilir, teklif gönderebilir ve müşterilerin sizi seçmesini sağlayabilirsiniz.",
    stepMatch: "📬 Eşleşen talepler panonuzda görünecek",
    stepBid: "💼 Net ve adil teklifler verin",
    stepChosen: "🤝 Müşteri en uygun teklifi seçer",
    freeBidLine: "Güncel kurallara göre her yeni talepte ilk teklifiniz ücretsizdir.",
    supportLine: "Sorularınız için bu e-postayı yanıtlayın veya uygulama içi yardımı kullanın.",
    ctaProfile: "Pro profilinizi tamamlayın",
    adminNoteLabel: "Ekip notu",
  },
  de: {
    subject: "Willkommen bei Glatko Pro — Bewerbung genehmigt",
    preview: "Profil vervollständigen und Angebote senden",
    headline: "Ihre Bewerbung ist genehmigt — willkommen bei Glatko!",
    intro:
      "Sie erhalten passende Anfragen, senden Angebote und werden von Kundinnen und Kunden ausgewählt.",
    stepMatch: "📬 Passende Anfragen erscheinen in Ihrem Dashboard",
    stepBid: "💼 Senden Sie klare, faire Angebote",
    stepChosen: "🤝 Die Kundin wählt das beste Angebot",
    freeBidLine: "Ihr erstes Angebot pro neuer Anfrage ist nach den aktuellen Regeln kostenlos.",
    supportLine: "Fragen? Antworten Sie auf diese E-Mail oder nutzen Sie die Hilfe in der App.",
    ctaProfile: "Profi-Profil vervollständigen",
    adminNoteLabel: "Hinweis vom Team",
  },
  ar: {
    subject: "مرحباً بك في Glatko Pro — تمت الموافقة على طلبك",
    preview: "أكمل ملفك وابدأ بإرسال العروض",
    headline: "تمت الموافقة على طلبك — مرحباً بك في Glatko!",
    intro:
      "يمكنك الآن استلام الطلبات المطابقة وإرسال العروض واختيارك من قبل العملاء.",
    stepMatch: "📬 ستظهر الطلبات المطابقة في لوحة التحكم",
    stepBid: "💼 أرسل عروضاً واضحة وعادلة",
    stepChosen: "🤝 يختار العميل الأنسب",
    freeBidLine: "عرضك الأول لكل طلب جديد مجاني وفق قواعد المنصة الحالية.",
    supportLine: "للأسئلة رد على هذا البريد أو استخدم المساعدة داخل التطبيق.",
    ctaProfile: "أكمل ملف المحترف",
    adminNoteLabel: "ملاحظة من الفريق",
  },
  it: {
    subject: "Benvenuto su Glatko Pro — domanda approvata",
    preview: "Completa il profilo e inizia a fare preventivi",
    headline: "Domanda approvata — benvenuto su Glatko!",
    intro:
      "Ora puoi ricevere richieste pertinenti, inviare preventivi ed essere scelto dai clienti.",
    stepMatch: "📬 Le richieste pertinenti appariranno nella dashboard",
    stepBid: "💼 Invia preventivi chiari ed equi",
    stepChosen: "🤝 Il cliente sceglie l’offerta migliore",
    freeBidLine: "La tua prima offerta su ogni nuova richiesta è gratuita secondo le regole attuali.",
    supportLine: "Domande? Rispondi a questa email o usa l’aiuto in app.",
    ctaProfile: "Completa il profilo professionista",
    adminNoteLabel: "Nota dal team",
  },
  me: {
    subject: "Dobrodošli na Glatko Pro — prijava odobrena",
    preview: "Dovršite profil i počnite slati ponude",
    headline: "Prijava odobrena — dobrodošli na Glatko!",
    intro:
      "Sada možete primati odgovarajuće zahtjeve, slati ponude i biti izabrani od klijenata.",
    stepMatch: "📬 Podudarni zahtjevi pojaviće se na kontrolnoj tabli",
    stepBid: "💼 Šaljite jasne i fer ponude",
    stepChosen: "🤝 Klijent bira najbolju ponudu",
    freeBidLine: "Vaša prva ponuda na svakom novom zahtjevu je besplatna prema trenutnim pravilima.",
    supportLine: "Pitanja? Odgovorite na ovu e-poruku ili koristite pomoć u aplikaciji.",
    ctaProfile: "Dovršite profesionalni profil",
    adminNoteLabel: "Napomena tima",
  },
  ru: {
    subject: "Добро пожаловать в Glatko Pro — заявка одобрена",
    preview: "Заполните профиль и начните отправлять предложения",
    headline: "Заявка одобрена — добро пожаловать в Glatko!",
    intro:
      "Теперь вы получаете подходящие заявки, отправляете предложения и вас выбирают клиенты.",
    stepMatch: "📬 Подходящие заявки появятся в панели",
    stepBid: "💼 Отправляйте понятные и честные предложения",
    stepChosen: "🤝 Клиент выбирает лучшее",
    freeBidLine: "Первое предложение по каждой новой заявке бесплатно по текущим правилам платформы.",
    supportLine: "Вопросы? Ответьте на это письмо или используйте помощь в приложении.",
    ctaProfile: "Заполнить профиль профи",
    adminNoteLabel: "Заметка команды",
  },
  sr: {
    subject: "Dobrodošli na Glatko Pro — prijava odobrena",
    preview: "Dovršite profil i počnite da šaljete ponude",
    headline: "Prijava odobrena — dobrodošli na Glatko!",
    intro:
      "Sada možete primati odgovarajuće zahteve, slati ponude i biti izabrani od klijenata.",
    stepMatch: "📬 Podudarni zahtevi pojaviće se na kontrolnoj tabli",
    stepBid: "💼 Šaljite jasne i fer ponude",
    stepChosen: "🤝 Klijent bira najbolju ponudu",
    freeBidLine: "Vaša prva ponuda na svakom novom zahtevu je besplatna prema trenutnim pravilima.",
    supportLine: "Pitanja? Odgovorite na ovu e-poruku ili koristite pomoć u aplikaciji.",
    ctaProfile: "Dovršite profesionalni profil",
    adminNoteLabel: "Napomena tima",
  },
  uk: {
    subject: "Ласкаво просимо до Glatko Pro — заявку схвалено",
    preview: "Заповніть профіль і почніть надсилати пропозиції",
    headline: "Заявку схвалено — ласкаво просимо до Glatko!",
    intro:
      "Тепер ви отримуєте відповідні заявки, надсилаєте пропозиції та вас обирають клієнти.",
    stepMatch: "📬 Відповідні заявки з’являться в панелі",
    stepBid: "💼 Надсилайте зрозумілі та чесні пропозиції",
    stepChosen: "🤝 Клієнт обирає найкращу",
    freeBidLine: "Перша пропозиція на кожну нову заявку безкоштовна згідно з поточними правилами.",
    supportLine: "Питання? Відповідайте на цей лист або скористайтеся допомогою в застосунку.",
    ctaProfile: "Заповнити профіль профі",
    adminNoteLabel: "Примітка команди",
  },
};

export function getProWelcomeEmailCopy(locale: EmailLocale): ProWelcomeEmailCopy {
  return proWelcomeEmail[locale] ?? proWelcomeEmail.en;
}

/* ─── complete profile reminder (cron, not scheduled in repo) ─── */
export type CompleteProfileReminderCopy = {
  subject: string;
  preview: string;
  headline: string;
  intro: string;
  listTitle: string;
  itemAvatar: string;
  itemPhone: string;
  itemName: string;
  cta: string;
};

const completeProfileReminderEmail: Record<
  EmailLocale,
  CompleteProfileReminderCopy
> = {
  en: {
    subject: "Complete your Glatko profile for better matches",
    preview: "Add a few details so pros can reach you",
    headline: "Complete your profile for better matches",
    intro:
      "A complete profile helps professionals understand you and improves your experience on Glatko.",
    listTitle: "Still missing:",
    itemAvatar: "Profile photo",
    itemPhone: "Phone number",
    itemName: "Display name",
    cta: "Complete profile",
  },
  tr: {
    subject: "Daha iyi eşleşmeler için profilinizi tamamlayın",
    preview: "Profesyonellerin size ulaşması için birkaç bilgi ekleyin",
    headline: "Daha iyi eşleşmeler için profilinizi tamamlayın",
    intro:
      "Tam profil, profesyonellerin sizi daha iyi anlamasını sağlar ve Glatko deneyiminizi iyileştirir.",
    listTitle: "Eksik görünenler:",
    itemAvatar: "Profil fotoğrafı",
    itemPhone: "Telefon numarası",
    itemName: "Görünen ad",
    cta: "Profili tamamla",
  },
  de: {
    subject: "Vervollständigen Sie Ihr Glatko-Profil für bessere Treffer",
    preview: "Ein paar Angaben helfen Profis, Sie zu erreichen",
    headline: "Profil vervollständigen für bessere Treffer",
    intro:
      "Ein vollständiges Profil hilft Profis, Sie besser zu verstehen, und verbessert Ihre Erfahrung.",
    listTitle: "Noch offen:",
    itemAvatar: "Profilfoto",
    itemPhone: "Telefonnummer",
    itemName: "Anzeigename",
    cta: "Profil vervollständigen",
  },
  ar: {
    subject: "أكمل ملفك في Glatko لتحصل على تطابق أفضل",
    preview: "أضف بعض التفاصيل ليتمكن المحترفون من التواصل",
    headline: "أكمل ملفك لتحصل على تطابق أفضل",
    intro:
      "الملف الكامل يساعد المحترفين على فهمك ويحسّن تجربتك على Glatko.",
    listTitle: "ما زال ناقصاً:",
    itemAvatar: "صورة الملف",
    itemPhone: "رقم الهاتف",
    itemName: "الاسم الظاهر",
    cta: "إكمال الملف",
  },
  it: {
    subject: "Completa il profilo Glatko per abbinamenti migliori",
    preview: "Aggiungi alcuni dettagli così i professionisti possono contattarti",
    headline: "Completa il profilo per abbinamenti migliori",
    intro:
      "Un profilo completo aiuta i professionisti a capirti e migliora la tua esperienza su Glatko.",
    listTitle: "Manca ancora:",
    itemAvatar: "Foto profilo",
    itemPhone: "Numero di telefono",
    itemName: "Nome visualizzato",
    cta: "Completa profilo",
  },
  me: {
    subject: "Dovršite Glatko profil za bolje podudaranje",
    preview: "Dodajte nekoliko detalja kako bi vas stručnjaci lakše kontaktirali",
    headline: "Dovršite profil za bolje podudaranje",
    intro:
      "Potpun profil pomaže stručnjacima da vas bolje razumiju i poboljšava iskustvo na Glatko.",
    listTitle: "Još nedostaje:",
    itemAvatar: "Profilna fotografija",
    itemPhone: "Broj telefona",
    itemName: "Prikazano ime",
    cta: "Dovrši profil",
  },
  ru: {
    subject: "Заполните профиль Glatko для лучших совпадений",
    preview: "Добавьте данные, чтобы специалисты могли связаться с вами",
    headline: "Заполните профиль для лучших совпадений",
    intro:
      "Полный профиль помогает специалистам понимать вас и улучшает опыт на Glatko.",
    listTitle: "Пока не заполнено:",
    itemAvatar: "Фото профиля",
    itemPhone: "Телефон",
    itemName: "Отображаемое имя",
    cta: "Заполнить профиль",
  },
  sr: {
    subject: "Dovršite Glatko profil za bolje podudaranje",
    preview: "Dodajte nekoliko detalja kako bi vas stručnjaci lakše kontaktirali",
    headline: "Dovršite profil za bolje podudaranje",
    intro:
      "Potpun profil pomaže stručnjacima da vas bolje razumeju i poboljšava iskustvo na Glatko.",
    listTitle: "Još nedostaje:",
    itemAvatar: "Profilna fotografija",
    itemPhone: "Broj telefona",
    itemName: "Prikazano ime",
    cta: "Dovrši profil",
  },
  uk: {
    subject: "Заповніть профіль Glatko для кращих збігів",
    preview: "Додайте кілька деталей, щоб фахівці могли зв’язатися",
    headline: "Заповніть профіль для кращих збігів",
    intro:
      "Повний профіль допомагає фахівцям краще вас зрозуміти та покращує досвід на Glatko.",
    listTitle: "Ще бракує:",
    itemAvatar: "Фото профілю",
    itemPhone: "Телефон",
    itemName: "Відображуване ім’я",
    cta: "Заповнити профіль",
  },
};

export function getCompleteProfileReminderCopy(
  locale: EmailLocale,
): CompleteProfileReminderCopy {
  return (
    completeProfileReminderEmail[locale] ?? completeProfileReminderEmail.en
  );
}

export function interpolate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

/* ─── G-REQ-1: admin pending-request notification ─── */
export type AdminPendingRequestCopy = {
  subject: string;
  preview: string;
  heading: string;
  intro: string;
  categoryLabel: string;
  cityLabel: string;
  requestorLabel: string;
  budgetLabel: string;
  dateLabel: string;
  cta: string;
  footer: string;
};

const adminPendingRequest: Record<EmailLocale, AdminPendingRequestCopy> = {
  en: {
    subject: "New request awaiting moderation",
    preview: "A new service request needs review",
    heading: "New request waiting for review",
    intro:
      "A new service request has landed in the moderation queue. Open the admin panel to approve or reject it.",
    categoryLabel: "Category",
    cityLabel: "City",
    requestorLabel: "Requestor",
    budgetLabel: "Budget",
    dateLabel: "Preferred date",
    cta: "Open admin panel",
    footer: "Glatko admin notification",
  },
  tr: {
    subject: "Yeni talep moderasyon bekliyor",
    preview: "Yeni bir hizmet talebi inceleme bekliyor",
    heading: "Yeni talep moderasyonda",
    intro:
      "Yeni bir hizmet talebi moderasyon kuyruğuna düştü. Onaylamak veya reddetmek için admin panelini aç.",
    categoryLabel: "Kategori",
    cityLabel: "Şehir",
    requestorLabel: "Talep eden",
    budgetLabel: "Bütçe",
    dateLabel: "Tercih edilen tarih",
    cta: "Admin paneli aç",
    footer: "Glatko admin bildirimi",
  },
  de: {
    subject: "Neue Anfrage zur Moderation",
    preview: "Eine neue Service-Anfrage benötigt Prüfung",
    heading: "Neue Anfrage zur Prüfung",
    intro:
      "Eine neue Service-Anfrage ist in der Moderationsschlange. Öffnen Sie das Admin-Panel, um sie freizugeben oder abzulehnen.",
    categoryLabel: "Kategorie",
    cityLabel: "Stadt",
    requestorLabel: "Anfragende:r",
    budgetLabel: "Budget",
    dateLabel: "Wunschtermin",
    cta: "Admin-Panel öffnen",
    footer: "Glatko Admin-Benachrichtigung",
  },
  ar: {
    subject: "طلب جديد بانتظار المراجعة",
    preview: "طلب خدمة جديد يحتاج إلى مراجعة",
    heading: "طلب جديد بانتظار المراجعة",
    intro:
      "وصل طلب خدمة جديد إلى قائمة المراجعة. افتح لوحة الإدارة للموافقة أو الرفض.",
    categoryLabel: "الفئة",
    cityLabel: "المدينة",
    requestorLabel: "مقدم الطلب",
    budgetLabel: "الميزانية",
    dateLabel: "التاريخ المفضل",
    cta: "افتح لوحة الإدارة",
    footer: "إشعار إدارة Glatko",
  },
  it: {
    subject: "Nuova richiesta in attesa di moderazione",
    preview: "Una nuova richiesta di servizio richiede revisione",
    heading: "Nuova richiesta in attesa",
    intro:
      "Una nuova richiesta di servizio è arrivata in coda di moderazione. Apri il pannello admin per approvarla o rifiutarla.",
    categoryLabel: "Categoria",
    cityLabel: "Città",
    requestorLabel: "Richiedente",
    budgetLabel: "Budget",
    dateLabel: "Data preferita",
    cta: "Apri pannello admin",
    footer: "Notifica admin Glatko",
  },
  me: {
    subject: "Novi zahtjev čeka moderaciju",
    preview: "Novi zahtjev za uslugu čeka pregled",
    heading: "Novi zahtjev na čekanju",
    intro:
      "Novi zahtjev za uslugu je u redu za moderaciju. Otvori admin panel da odobriš ili odbiješ.",
    categoryLabel: "Kategorija",
    cityLabel: "Grad",
    requestorLabel: "Podnosilac",
    budgetLabel: "Budžet",
    dateLabel: "Željeni datum",
    cta: "Otvori admin panel",
    footer: "Glatko admin obavještenje",
  },
  ru: {
    subject: "Новая заявка ждёт модерации",
    preview: "Новая заявка требует проверки",
    heading: "Новая заявка на модерации",
    intro:
      "Новая заявка попала в очередь модерации. Откройте админ-панель, чтобы одобрить или отклонить.",
    categoryLabel: "Категория",
    cityLabel: "Город",
    requestorLabel: "Заявитель",
    budgetLabel: "Бюджет",
    dateLabel: "Желаемая дата",
    cta: "Открыть админ-панель",
    footer: "Glatko уведомление администратора",
  },
  sr: {
    subject: "Novi zahtev čeka moderaciju",
    preview: "Novi zahtev za uslugu čeka pregled",
    heading: "Novi zahtev na čekanju",
    intro:
      "Novi zahtev za uslugu je u redu za moderaciju. Otvori admin panel da odobriš ili odbiješ.",
    categoryLabel: "Kategorija",
    cityLabel: "Grad",
    requestorLabel: "Podnosilac",
    budgetLabel: "Budžet",
    dateLabel: "Željeni datum",
    cta: "Otvori admin panel",
    footer: "Glatko admin obaveštenje",
  },
  uk: {
    subject: "Нова заявка очікує модерації",
    preview: "Нова заявка потребує перевірки",
    heading: "Нова заявка на модерації",
    intro:
      "Нова заявка на послугу потрапила в чергу модерації. Відкрийте адмін-панель для схвалення чи відхилення.",
    categoryLabel: "Категорія",
    cityLabel: "Місто",
    requestorLabel: "Заявник",
    budgetLabel: "Бюджет",
    dateLabel: "Бажана дата",
    cta: "Відкрити адмін-панель",
    footer: "Сповіщення адміністратора Glatko",
  },
};

export function getAdminPendingRequestCopy(
  locale: EmailLocale,
): AdminPendingRequestCopy {
  return adminPendingRequest[locale] ?? adminPendingRequest.en;
}

/* ─── G-REQ-1: user request approved ─── */
export type RequestApprovedCopy = {
  subject: string;
  preview: string;
  heading: string;
  body: string;
  proCountSingular: string;
  proCountPlural: string;
  noProsHint: string;
  cta: string;
};

const requestApproved: Record<EmailLocale, RequestApprovedCopy> = {
  en: {
    subject: "Your request has been approved",
    preview: "Pros are now seeing your request",
    heading: "Your request is live",
    body: 'Your "{category}" request in {city} has been approved. {proLine}',
    proCountSingular: "1 verified pro can now bid on it.",
    proCountPlural: "{count} verified pros can now bid on it.",
    noProsHint:
      "We will notify you as soon as a pro picks it up — your request is visible to qualifying professionals.",
    cta: "View your requests",
  },
  tr: {
    subject: "Talebiniz onaylandı",
    preview: "Profesyoneller artık talebinizi görüyor",
    heading: "Talebiniz yayında",
    body: "{city} için \"{category}\" talebiniz onaylandı. {proLine}",
    proCountSingular: "1 doğrulanmış profesyonel artık teklif verebilir.",
    proCountPlural: "{count} doğrulanmış profesyonel artık teklif verebilir.",
    noProsHint:
      "Talebiniz uygun profesyonellere açıldı; ilk teklif geldiğinde size haber veririz.",
    cta: "Taleplerimi görüntüle",
  },
  de: {
    subject: "Ihre Anfrage wurde freigegeben",
    preview: "Profis sehen jetzt Ihre Anfrage",
    heading: "Ihre Anfrage ist live",
    body: 'Ihre "{category}"-Anfrage in {city} wurde freigegeben. {proLine}',
    proCountSingular: "1 verifizierter Profi kann jetzt ein Angebot abgeben.",
    proCountPlural: "{count} verifizierte Profis können jetzt Angebote abgeben.",
    noProsHint:
      "Wir benachrichtigen Sie, sobald ein Profi reagiert — Ihre Anfrage ist für qualifizierte Profis sichtbar.",
    cta: "Meine Anfragen ansehen",
  },
  ar: {
    subject: "تمت الموافقة على طلبك",
    preview: "يرى المحترفون الآن طلبك",
    heading: "طلبك مباشر",
    body: "تمت الموافقة على طلبك \"{category}\" في {city}. {proLine}",
    proCountSingular: "محترف موثوق واحد يمكنه الآن تقديم عرض.",
    proCountPlural: "{count} محترفًا موثوقًا يمكنهم الآن تقديم عروض.",
    noProsHint:
      "سنخبرك بمجرد رد أحد المحترفين — طلبك ظاهر للمحترفين المؤهلين.",
    cta: "عرض طلباتي",
  },
  it: {
    subject: "La tua richiesta è stata approvata",
    preview: "I professionisti vedono ora la tua richiesta",
    heading: "La tua richiesta è online",
    body: 'La tua richiesta "{category}" a {city} è stata approvata. {proLine}',
    proCountSingular: "1 professionista verificato può ora fare un’offerta.",
    proCountPlural:
      "{count} professionisti verificati possono ora fare un’offerta.",
    noProsHint:
      "Ti avviseremo non appena un professionista risponde — la tua richiesta è visibile ai pro idonei.",
    cta: "Vedi le mie richieste",
  },
  me: {
    subject: "Vaš zahtjev je odobren",
    preview: "Profesionalci sada vide vaš zahtjev",
    heading: "Vaš zahtjev je aktivan",
    body: 'Vaš zahtjev "{category}" u gradu {city} je odobren. {proLine}',
    proCountSingular: "1 provjereni profesionalac sada može dati ponudu.",
    proCountPlural:
      "{count} provjerenih profesionalaca sada može dati ponudu.",
    noProsHint:
      "Javićemo vam čim neki profesionalac odgovori — zahtjev je vidljiv kvalifikovanim profesionalcima.",
    cta: "Pregledaj moje zahtjeve",
  },
  ru: {
    subject: "Ваш запрос одобрен",
    preview: "Специалисты теперь видят ваш запрос",
    heading: "Ваш запрос опубликован",
    body: "Ваш запрос «{category}» в {city} одобрен. {proLine}",
    proCountSingular: "1 проверенный специалист теперь может оставить ставку.",
    proCountPlural:
      "{count} проверенных специалистов теперь могут оставить ставки.",
    noProsHint:
      "Мы сообщим, как только один из специалистов откликнется — ваш запрос виден подходящим мастерам.",
    cta: "Мои запросы",
  },
  sr: {
    subject: "Vaš zahtev je odobren",
    preview: "Profesionalci sada vide vaš zahtev",
    heading: "Vaš zahtev je aktivan",
    body: 'Vaš zahtev "{category}" u gradu {city} je odobren. {proLine}',
    proCountSingular: "1 verifikovan profesionalac sada može poslati ponudu.",
    proCountPlural:
      "{count} verifikovanih profesionalaca sada može poslati ponudu.",
    noProsHint:
      "Javićemo vam čim neko od profesionalaca odgovori — zahtev je vidljiv kvalifikovanim majstorima.",
    cta: "Pregledaj moje zahteve",
  },
  uk: {
    subject: "Ваш запит схвалено",
    preview: "Фахівці тепер бачать ваш запит",
    heading: "Ваш запит активний",
    body: 'Ваш запит "{category}" у місті {city} схвалено. {proLine}',
    proCountSingular: "1 перевірений фахівець може зробити пропозицію.",
    proCountPlural:
      "{count} перевірених фахівців можуть зробити пропозиції.",
    noProsHint:
      "Сповістимо вас, щойно фахівець відгукнеться — ваш запит видно кваліфікованим спеціалістам.",
    cta: "Переглянути мої запити",
  },
};

export function getRequestApprovedCopy(locale: EmailLocale): RequestApprovedCopy {
  return requestApproved[locale] ?? requestApproved.en;
}

/* ─── G-REQ-1: user request rejected ─── */
export type RequestRejectedCopy = {
  subject: string;
  preview: string;
  heading: string;
  intro: string;
  reasonLabel: string;
  outro: string;
  cta: string;
};

const requestRejected: Record<EmailLocale, RequestRejectedCopy> = {
  en: {
    subject: "Your request was not approved",
    preview: "Update on your Glatko request",
    heading: "We could not approve your request",
    intro: 'Your "{category}" request in {city} was not approved.',
    reasonLabel: "Reason",
    outro: "You can submit a new request once the issue is resolved.",
    cta: "Create a new request",
  },
  tr: {
    subject: "Talebiniz onaylanmadı",
    preview: "Glatko talebinizle ilgili güncelleme",
    heading: "Talebinizi onaylayamadık",
    intro: "{city} için \"{category}\" talebiniz onaylanmadı.",
    reasonLabel: "Sebep",
    outro: "Sorunu çözdükten sonra yeni bir talep oluşturabilirsiniz.",
    cta: "Yeni talep oluştur",
  },
  de: {
    subject: "Ihre Anfrage wurde nicht genehmigt",
    preview: "Update zu Ihrer Glatko-Anfrage",
    heading: "Wir konnten Ihre Anfrage nicht freigeben",
    intro: 'Ihre "{category}"-Anfrage in {city} wurde nicht genehmigt.',
    reasonLabel: "Grund",
    outro:
      "Sie können nach Behebung des Problems eine neue Anfrage einreichen.",
    cta: "Neue Anfrage erstellen",
  },
  ar: {
    subject: "لم تتم الموافقة على طلبك",
    preview: "تحديث بشأن طلبك في Glatko",
    heading: "لم نتمكن من الموافقة على طلبك",
    intro: "لم تتم الموافقة على طلبك \"{category}\" في {city}.",
    reasonLabel: "السبب",
    outro: "يمكنك تقديم طلب جديد بعد معالجة المشكلة.",
    cta: "إنشاء طلب جديد",
  },
  it: {
    subject: "La tua richiesta non è stata approvata",
    preview: "Aggiornamento sulla tua richiesta Glatko",
    heading: "Non possiamo approvare la tua richiesta",
    intro: 'La tua richiesta "{category}" a {city} non è stata approvata.',
    reasonLabel: "Motivo",
    outro: "Puoi inviare una nuova richiesta dopo aver risolto il problema.",
    cta: "Crea nuova richiesta",
  },
  me: {
    subject: "Vaš zahtjev nije odobren",
    preview: "Ažuriranje vašeg Glatko zahtjeva",
    heading: "Nismo mogli odobriti vaš zahtjev",
    intro: 'Vaš zahtjev "{category}" u gradu {city} nije odobren.',
    reasonLabel: "Razlog",
    outro: "Možete podnijeti novi zahtjev nakon što riješite problem.",
    cta: "Kreiraj novi zahtjev",
  },
  ru: {
    subject: "Ваш запрос не одобрен",
    preview: "Обновление по запросу Glatko",
    heading: "Мы не смогли одобрить ваш запрос",
    intro: "Ваш запрос «{category}» в {city} не одобрен.",
    reasonLabel: "Причина",
    outro: "После устранения проблемы вы можете отправить новый запрос.",
    cta: "Создать новый запрос",
  },
  sr: {
    subject: "Vaš zahtev nije odobren",
    preview: "Ažuriranje vašeg Glatko zahteva",
    heading: "Nismo mogli da odobrimo vaš zahtev",
    intro: 'Vaš zahtev "{category}" u gradu {city} nije odobren.',
    reasonLabel: "Razlog",
    outro: "Možete podneti novi zahtev nakon što rešite problem.",
    cta: "Kreiraj novi zahtev",
  },
  uk: {
    subject: "Ваш запит не схвалено",
    preview: "Оновлення щодо вашого запиту Glatko",
    heading: "Ми не змогли схвалити ваш запит",
    intro: 'Ваш запит "{category}" у місті {city} не схвалено.',
    reasonLabel: "Причина",
    outro: "Ви можете подати новий запит після усунення проблеми.",
    cta: "Створити новий запит",
  },
};

export function getRequestRejectedCopy(locale: EmailLocale): RequestRejectedCopy {
  return requestRejected[locale] ?? requestRejected.en;
}
