/**
 * G-WA-OPTOUT — pure STOP/START keyword matcher for inbound WhatsApp messages.
 *
 * PURE (no IO) — the webhook (app/api/webhooks/infobip-whatsapp) classifies
 * every inbound text through this module and acts on the result:
 *   "stop"  → suppress (profiles.messaging_opt_in=false) + audit opt_out
 *   "start" → audit optin_request ONLY — never auto re-opt-in (consent must
 *             come explicitly through the settings UI, WhatsApp policy)
 *   "none"  → audit only
 *
 * Matching rule: the ENTIRE message (trimmed, trailing .!?… punctuation
 * stripped) must EXACTLY equal a keyword — no substring matching, so a real
 * reply like "lütfen stop deme" can never false-positive. Case folding tries
 * both toUpperCase() and toLocaleUpperCase("tr-TR") so Turkish dotted/dotless
 * I both resolve ("iptal"→İPTAL, "ıptal"→IPTAL).
 *
 * Coverage is pragmatic, not exhaustive: universal STOP + the most common
 * native equivalents per supported locale (V2 can extend; everything else
 * still lands in the audit log for review).
 */

export type WaInboundAction = "stop" | "start" | "none";

const STOP_KEYWORDS = new Set<string>([
  // universal
  "STOP",
  // tr
  "DUR",
  "DURDUR",
  "İPTAL",
  "IPTAL",
  // en
  "UNSUBSCRIBE",
  "CANCEL",
  // ru (СТОП covers uk spelling too)
  "СТОП",
  "ОТПИСАТЬСЯ",
  // uk
  "ВІДПИСАТИСЯ",
  // de
  "STOPP",
  // it
  "ANNULLA",
  // sr / me
  "ZAUSTAVI",
  "PREKINI",
  // ar (no letter case)
  "إيقاف",
  "توقف",
]);

const START_KEYWORDS = new Set<string>(["START", "BAŞLAT", "BASLAT", "СТАРТ"]);

/** Trimmed, trailing-punctuation-stripped uppercase candidates (both case folds). */
function normalizedCandidates(text: string): string[] {
  const core = text.trim().replace(/[.!?…]+$/, "").trim();
  if (!core) return [];
  return [core.toUpperCase(), core.toLocaleUpperCase("tr-TR")];
}

/** Classify one inbound message text. Non-strings (media etc.) → "none". */
export function classifyWaInbound(text: string | null | undefined): WaInboundAction {
  if (typeof text !== "string") return "none";
  const candidates = normalizedCandidates(text);
  if (candidates.some((c) => STOP_KEYWORDS.has(c))) return "stop";
  if (candidates.some((c) => START_KEYWORDS.has(c))) return "start";
  return "none";
}
