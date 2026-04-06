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

/* ─── verification approved ─── */
export type VerificationSimpleCopy = {
  subject: string;
  title: string;
  body: string;
  cta: string;
};

const verificationApprovedEmail: Record<EmailLocale, VerificationSimpleCopy> = {
  en: {
    subject: "Your Glatko professional account is approved",
    title: "You’re approved",
    body: "You can now receive requests and send quotes on Glatko.",
    cta: "Go to pro dashboard",
  },
  tr: {
    subject: "Glatko profesyonel hesabınız onaylandı",
    title: "Hesabınız onaylandı",
    body: "Artık talepleri alabilir ve teklif gönderebilirsiniz.",
    cta: "Pro panele git",
  },
  de: {
    subject: "Ihr Glatko-Profi-Konto wurde freigeschaltet",
    title: "Freigabe erteilt",
    body: "Sie können jetzt Anfragen erhalten und Angebote senden.",
    cta: "Zum Pro-Dashboard",
  },
  ar: {
    subject: "تمت الموافقة على حسابك المهني في Glatko",
    title: "تمت الموافقة",
    body: "يمكنك الآن استلام الطلبات وإرسال العروض على Glatko.",
    cta: "لوحة المحترفين",
  },
  it: {
    subject: "Il tuo account professionale Glatko è approvato",
    title: "Approvazione completata",
    body: "Ora puoi ricevere richieste e inviare preventivi su Glatko.",
    cta: "Vai alla dashboard pro",
  },
  me: {
    subject: "Vaš Glatko profesionalni nalog je odobren",
    title: "Odobreno",
    body: "Sada možete primati zahtjeve i slati ponude na Glatko.",
    cta: "Idi na pro kontrolnu tablu",
  },
  ru: {
    subject: "Ваш профессиональный аккаунт Glatko одобрен",
    title: "Аккаунт одобрен",
    body: "Теперь вы можете получать заявки и отправлять предложения в Glatko.",
    cta: "К панели профи",
  },
  sr: {
    subject: "Vaš Glatko profesionalni nalog je odobren",
    title: "Odobreno",
    body: "Sada možete primati zahteve i slati ponude na Glatko.",
    cta: "Idi na pro kontrolnu tablu",
  },
  uk: {
    subject: "Ваш професійний акаунт Glatko схвалено",
    title: "Обліковий запис схвалено",
    body: "Тепер ви можете отримувати заявки та надсилати пропозиції в Glatko.",
    cta: "До панелі профі",
  },
};

export function getVerificationApprovedEmailCopy(
  locale: EmailLocale,
): VerificationSimpleCopy {
  return verificationApprovedEmail[locale] ?? verificationApprovedEmail.en;
}

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
