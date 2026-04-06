import OpenAI from "openai";

export interface TranslationResult {
  translatedContent: string;
  detectedLocale: string;
}

/** Enough non-emoji, non-whitespace code points to bother translating (no \\p — TS target safe). */
function hasEnoughTranslatableText(content: string): boolean {
  let meaningful = 0;
  for (let i = 0; i < content.length; ) {
    const cp = content.codePointAt(i);
    if (cp === undefined) break;
    const w = cp > 0xffff ? 2 : 1;
    i += w;
    if (cp === 0x20 || (cp >= 9 && cp <= 0xd) || cp === 0xa0) continue;
    if (
      (cp >= 0x1f300 && cp <= 0x1fadf) ||
      (cp >= 0x1f600 && cp <= 0x1f64f) ||
      (cp >= 0x2600 && cp <= 0x26ff) ||
      (cp >= 0x2700 && cp <= 0x27bf) ||
      (cp >= 0xfe00 && cp <= 0xfe0f) ||
      cp === 0x200d
    ) {
      continue;
    }
    meaningful++;
  }
  return meaningful >= 3;
}

const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  tr: "Turkish",
  de: "German",
  ru: "Russian",
  sr: "Serbian",
  me: "Montenegrin",
  it: "Italian",
  ar: "Arabic",
  uk: "Ukrainian",
};

const TRANSLATION_TIMEOUT_MS = 14_000;

async function translateMessageCore(
  content: string,
  targetLocale: string,
): Promise<TranslationResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("[GLATKO:translate] OPENAI_API_KEY not set, skipping translation");
    return null;
  }

  const targetNorm =
    targetLocale.trim().toLowerCase().split(/[-_]/)[0] || "en";

  if (!hasEnoughTranslatableText(content)) return null;

  const targetLang =
    LOCALE_NAMES[targetNorm] ?? LOCALE_NAMES.en ?? "English";

  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.1,
    max_tokens: 500,
    messages: [
      {
        role: "system",
        content: `You are a message translator for a service marketplace. Translate the user's message to ${targetLang}. Rules:
- Preserve emojis, numbers, names, and formatting exactly
- Keep the tone casual and natural (this is a chat, not a document)
- If the message is already in ${targetLang}, respond with exactly: SAME_LANGUAGE
- Respond ONLY with the translation, nothing else
- Detect the source language and include it as the first line in format: LANG:xx (use ISO-style codes: en, tr, de, ru, sr, me, it, ar, uk)
- After the first line, output the translation on following lines
Example:
LANG:tr
Hello, I can come tomorrow at 3 PM.`,
      },
      { role: "user", content },
    ],
  });

  const raw = response.choices[0]?.message?.content?.trim();
  if (!raw) return null;
  const upper = raw.toUpperCase();
  if (upper === "SAME_LANGUAGE" || upper.startsWith("SAME_LANGUAGE")) {
    return null;
  }

  const lines = raw.split("\n");
  let detectedLocale = "unknown";
  let translatedContent = raw;

  if (lines[0]?.trim().toUpperCase().startsWith("LANG:")) {
    detectedLocale = lines[0].replace(/^LANG:\s*/i, "").trim().toLowerCase();
    translatedContent = lines.slice(1).join("\n").trim();
  }

  if (!translatedContent) return null;
  if (detectedLocale === targetNorm) return null;

  return { translatedContent, detectedLocale };
}

/**
 * Translates chat text to the recipient's locale. Returns null if translation is skipped or fails.
 * Never throws — callers should always fall back to original content.
 * Times out so slow or failing API does not block message send.
 */
export async function translateMessage(
  content: string,
  targetLocale: string,
): Promise<TranslationResult | null> {
  try {
    return await Promise.race([
      translateMessageCore(content, targetLocale),
      new Promise<null>((resolve) =>
        setTimeout(() => {
          console.warn("[GLATKO:translate] Translation timed out; using original text");
          resolve(null);
        }, TRANSLATION_TIMEOUT_MS),
      ),
    ]);
  } catch (err) {
    console.error("[GLATKO:translate] Translation failed:", err);
    return null;
  }
}
