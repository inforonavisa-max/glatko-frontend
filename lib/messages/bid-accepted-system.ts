/** System line when a customer accepts a bid — text in the professional's (recipient's) language. */
export const BID_ACCEPTED_SYSTEM_MESSAGES: Record<string, string> = {
  en: "✅ Bid accepted! You can now discuss the details here.",
  tr: "✅ Teklif kabul edildi! Detayları burada konuşabilirsiniz.",
  de: "✅ Angebot angenommen! Sie können die Details hier besprechen.",
  ru: "✅ Предложение принято! Вы можете обсудить детали здесь.",
  sr: "✅ Ponuda prihvaćena! Možete razgovarati o detaljima ovde.",
  me: "✅ Ponuda prihvaćena! Možete razgovarati o detaljima ovdje.",
  it: "✅ Offerta accettata! Potete discutere i dettagli qui.",
  ar: "✅ تم قبول العرض! يمكنكم مناقشة التفاصيل هنا.",
  uk: "✅ Пропозицію прийнято! Ви можете обговорити деталі тут.",
};

/** Professional's preferred_locale (or fallback) selects the copy they see in chat. */
export function getBidAcceptedMessageForRecipientLocale(
  locale: string | null | undefined,
): string {
  const raw = (locale ?? "en").trim().toLowerCase();
  const key = raw.split(/[-_]/)[0] || "en";
  if (BID_ACCEPTED_SYSTEM_MESSAGES[key]) return BID_ACCEPTED_SYSTEM_MESSAGES[key];
  return BID_ACCEPTED_SYSTEM_MESSAGES.en;
}
