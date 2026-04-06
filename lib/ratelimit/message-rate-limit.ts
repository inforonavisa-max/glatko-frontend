import { Redis } from "@upstash/redis/cloudflare";
import { Ratelimit } from "@upstash/ratelimit";

const MESSAGE_RATE_PREFIX = "glatko:message-send";
/** Per user, rolling 1-minute window */
const MESSAGES_PER_MINUTE = 60;

let messageLimiter: Ratelimit | null | undefined;

function getMessageLimiter(): Ratelimit | null {
  if (messageLimiter !== undefined) return messageLimiter;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    messageLimiter = null;
    return null;
  }

  const redis = new Redis({ url, token });
  messageLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(MESSAGES_PER_MINUTE, "1 m"),
    analytics: false,
    prefix: MESSAGE_RATE_PREFIX,
  });

  return messageLimiter;
}

export type MessageRateResult = { ok: true } | { ok: false; reason: string };

/**
 * Soft cap on chat send frequency. Fail-open if Redis is missing or errors.
 */
export async function checkMessageSendRateLimit(
  senderUserId: string,
): Promise<MessageRateResult> {
  const limiter = getMessageLimiter();
  if (!limiter) {
    return { ok: true };
  }

  try {
    const key = senderUserId.trim().toLowerCase();
    const { success } = await limiter.limit(key);
    if (!success) {
      return { ok: false, reason: "rate_limited" };
    }
    return { ok: true };
  } catch (err) {
    console.warn(
      "[GLATKO:message-rate] limit check failed; allowing send",
      err instanceof Error ? err.message : err,
    );
    return { ok: true };
  }
}
