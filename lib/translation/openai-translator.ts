/**
 * G-MSG-2 — gpt-4o thread message translator.
 *
 * Translation flow:
 *   1. Skip when source_locale === target_locale (zero tokens spent)
 *   2. SHA-256 cache_key over (source_locale, target_locale, text); look it
 *      up via glatko_lookup_translation RPC. UPDATE … RETURNING bumps
 *      hit_count + last_used_at atomically.
 *   3. Cache miss → openai.chat.completions.create with a system prompt
 *      that pins tone/emoji preservation. Response is persisted via
 *      glatko_save_translation (ON CONFLICT keeps the first translation).
 *   4. Returns null on misconfiguration or API error so callers can fall
 *      back to the original body without surfacing an error to the user.
 *
 * Cost is computed locally so we can attribute spend without tailing
 * the OpenAI billing dashboard. Pricing is hard-coded; revisit if/when
 * we change models.
 */

import OpenAI from "openai";
import { createHash } from "crypto";
import { createAdminClient } from "@/supabase/server";
import { glatkoCaptureException } from "@/lib/sentry/glatko-capture";

const LOCALE_NAMES: Record<string, string> = {
  me: "Montenegrin (Latin script)",
  sr: "Serbian (Latin script)",
  en: "English",
  tr: "Turkish",
  de: "German",
  it: "Italian",
  ru: "Russian",
  ar: "Arabic",
  uk: "Ukrainian",
};

const PRICING = {
  "gpt-4o": {
    inputPerToken: 2.5 / 1_000_000,
    outputPerToken: 10.0 / 1_000_000,
  },
} as const;

const MODEL = "gpt-4o";

export interface TranslationResult {
  translated: string;
  fromCache: boolean;
  model: string;
  costUsd?: number;
  tokenInput?: number;
  tokenOutput?: number;
}

export type TranslationOutcome =
  | { ok: true; result: TranslationResult }
  | { ok: false; reason: "same_locale" | "unknown_locale" | "no_api_key" | "api_error" | "empty_body"; error?: string };

function buildCacheKey(
  text: string,
  sourceLocale: string,
  targetLocale: string,
): string {
  return createHash("sha256")
    .update(`${sourceLocale}|${targetLocale}|${text}`)
    .digest("hex")
    .substring(0, 32);
}

let _client: OpenAI | null = null;
function client(): OpenAI | null {
  if (_client) return _client;
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  _client = new OpenAI({ apiKey: key });
  return _client;
}

export async function translateText(
  text: string,
  sourceLocale: string,
  targetLocale: string,
): Promise<TranslationOutcome> {
  const trimmed = (text ?? "").trim();
  if (!trimmed) {
    return { ok: false, reason: "empty_body" };
  }

  if (sourceLocale === targetLocale) {
    return { ok: false, reason: "same_locale" };
  }

  if (!LOCALE_NAMES[sourceLocale] || !LOCALE_NAMES[targetLocale]) {
    return { ok: false, reason: "unknown_locale" };
  }

  const cacheKey = buildCacheKey(trimmed, sourceLocale, targetLocale);
  const supabase = createAdminClient();

  // Cache lookup — RPC bumps hit_count atomically and yields the row.
  try {
    const { data: cached } = await supabase.rpc("glatko_lookup_translation", {
      p_cache_key: cacheKey,
    });
    if (Array.isArray(cached) && cached.length > 0) {
      const hit = cached[0] as { translated_text: string; model: string };
      return {
        ok: true,
        result: {
          translated: hit.translated_text,
          fromCache: true,
          model: hit.model,
        },
      };
    }
  } catch (err) {
    glatkoCaptureException(err, {
      module: "translator",
      op: "cache_lookup",
    });
    // Continue to API; cache miss is recoverable.
  }

  const openai = client();
  if (!openai) {
    return { ok: false, reason: "no_api_key" };
  }

  try {
    const sourceLangName = LOCALE_NAMES[sourceLocale];
    const targetLangName = LOCALE_NAMES[targetLocale];

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: [
            "You are a professional translator for Glatko, a Montenegro service marketplace.",
            `Translate the user's chat message from ${sourceLangName} to ${targetLangName}.`,
            "Rules:",
            "- Preserve tone (casual or formal as appropriate).",
            "- Preserve emojis and punctuation exactly.",
            "- Output ONLY the translation. No explanations, no surrounding quotes, no labels.",
            `- If the message is already in ${targetLangName}, return it unchanged.`,
            "- For service vocabulary (boat antifouling, plumbing, electrical, cleaning, captain hire, etc.) use the natural professional term in the target language.",
          ].join("\n"),
        },
        { role: "user", content: trimmed },
      ],
      temperature: 0.3,
      max_tokens: 600,
    });

    const translated =
      response.choices[0]?.message?.content?.trim() || trimmed;
    const tokenInput = response.usage?.prompt_tokens ?? 0;
    const tokenOutput = response.usage?.completion_tokens ?? 0;
    const costUsd =
      tokenInput * PRICING[MODEL].inputPerToken +
      tokenOutput * PRICING[MODEL].outputPerToken;

    // Persist to cache (best-effort — translation already succeeded).
    try {
      await supabase.rpc("glatko_save_translation", {
        p_source_text: trimmed,
        p_source_locale: sourceLocale,
        p_target_locale: targetLocale,
        p_translated_text: translated,
        p_model: MODEL,
        p_token_input: tokenInput,
        p_token_output: tokenOutput,
        p_cost_usd: Number(costUsd.toFixed(6)),
        p_cache_key: cacheKey,
      });
    } catch (err) {
      glatkoCaptureException(err, {
        module: "translator",
        op: "cache_save",
      });
    }

    return {
      ok: true,
      result: {
        translated,
        fromCache: false,
        model: MODEL,
        costUsd: Number(costUsd.toFixed(6)),
        tokenInput,
        tokenOutput,
      },
    };
  } catch (err) {
    glatkoCaptureException(err, {
      module: "translator",
      op: "openai_completion",
      sourceLocale,
      targetLocale,
    });
    return {
      ok: false,
      reason: "api_error",
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}
