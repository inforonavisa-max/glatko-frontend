export type VerifiedBot =
  | "googlebot"
  | "bingbot"
  | "duckduckbot"
  | "yandexbot"
  | "baiduspider"
  | "slurp";

const VERIFIED_BOT_PATTERNS: Array<{ bot: VerifiedBot; re: RegExp }> = [
  { bot: "googlebot", re: /googlebot/i },
  { bot: "bingbot", re: /bingbot/i },
  { bot: "duckduckbot", re: /duckduckbot/i },
  { bot: "yandexbot", re: /yandexbot/i },
  { bot: "baiduspider", re: /baiduspider/i },
  { bot: "slurp", re: /slurp/i },
];

export function detectVerifiedBot(userAgent: string | null | undefined): VerifiedBot | null {
  const ua = (userAgent ?? "").trim();
  if (!ua) return null;
  for (const { bot, re } of VERIFIED_BOT_PATTERNS) {
    if (re.test(ua)) return bot;
  }
  return null;
}

export function isHighRiskScrapingSurface(pathname: string): boolean {
  return pathname.startsWith("/api/search") || pathname.startsWith("/api/map-assets");
}

export function computeSuspicionScore(params: {
  userAgent: string;
  acceptLanguage: string | null;
  secFetchSite: string | null;
  secFetchMode: string | null;
}): number {
  const ua = params.userAgent || "";
  const uaLower = ua.toLowerCase();

  let score = 0;
  if (/\b(headless|puppeteer|playwright|selenium)\b/.test(uaLower)) score += 50;
  if (/\b(python|requests|scrapy|httpclient|urllib|go-http-client)\b/.test(uaLower)) score += 40;
  if (/\b(bot|crawler|scraper|spider)\b/.test(uaLower)) score += 30;
  if (!params.acceptLanguage) score += 10;
  if (!params.secFetchSite) score += 10;
  if (!params.secFetchMode) score += 10;
  if (ua.trim().length < 10) score += 20;
  if (uaLower.includes("mozilla/")) score -= 10;
  if (score < 0) score = 0;
  if (score > 100) score = 100;
  return score;
}

export type BotDecision = {
  verifiedBot: VerifiedBot | null;
  suspicionScore: number;
  overrideRouteClass: "verified-bot" | "bot-suspicious" | null;
};

export function decideBotDecision(params: {
  pathname: string;
  userAgent: string | null;
  acceptLanguage: string | null;
  secFetchSite: string | null;
  secFetchMode: string | null;
}): BotDecision {
  const verifiedBot = detectVerifiedBot(params.userAgent);
  if (verifiedBot) {
    return { verifiedBot, suspicionScore: 0, overrideRouteClass: "verified-bot" };
  }

  const suspicionScore = computeSuspicionScore({
    userAgent: params.userAgent ?? "",
    acceptLanguage: params.acceptLanguage,
    secFetchSite: params.secFetchSite,
    secFetchMode: params.secFetchMode,
  });

  if (isHighRiskScrapingSurface(params.pathname) && suspicionScore >= 60) {
    return { verifiedBot: null, suspicionScore, overrideRouteClass: "bot-suspicious" };
  }

  return { verifiedBot: null, suspicionScore, overrideRouteClass: null };
}
