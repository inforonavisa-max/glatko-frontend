/**
 * AI usage quota enforcement — Glatko.
 * Full implementation will be added when AI features are built.
 */

export type AiEndpoint = "concierge" | "search_embeddings" | "nl_parse";
export type AiUsageStatus = "ok" | "rate_limited" | "blocked" | "error";
