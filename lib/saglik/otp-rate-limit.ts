import "server-only";

import { createHash } from "crypto";
import { Redis } from "@upstash/redis/cloudflare";
import { Ratelimit } from "@upstash/ratelimit";

/**
 * Glatko Sağlık — H5a OTP rate limiting (guest health booking).
 *
 * Reuses the SAME Upstash sliding-window mechanism as lib/rateLimit.ts and
 * lib/ratelimit/sms-otp-limit.ts (salted SHA-256 identifiers, fail-open on any
 * Redis error / missing config) — only the buckets are health-scoped so they
 * never collide with the auth phone-verification limiters. The middleware
 * already caps /api/health/* per-IP at 12/min ("public-form"); these add the
 * task's per-PHONE 3/hour gate plus a per-IP 10/hour OTP-specific ceiling.
 *
 * Guest flow → no user id exists; keyed only on the E.164 phone and client IP.
 */

const SALT = process.env.RATE_LIMIT_SALT || "dev-no-salt";
const PREFIX = "glatko:health-otp";

const PER_PHONE_PER_HOUR = 3;
const PER_IP_PER_HOUR = 10;

let cachedRedis: Redis | null | undefined;
let phoneLimiter: Ratelimit | null | undefined;
let ipLimiter: Ratelimit | null | undefined;

function getRedis(): Redis | null {
  if (cachedRedis !== undefined) return cachedRedis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  cachedRedis = url && token ? new Redis({ url, token }) : null;
  return cachedRedis;
}

function getPhoneLimiter(): Ratelimit | null {
  if (phoneLimiter !== undefined) return phoneLimiter;
  const redis = getRedis();
  phoneLimiter = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(PER_PHONE_PER_HOUR, "1 h"),
        analytics: false,
        prefix: `${PREFIX}:phone`,
      })
    : null;
  return phoneLimiter;
}

function getIpLimiter(): Ratelimit | null {
  if (ipLimiter !== undefined) return ipLimiter;
  const redis = getRedis();
  ipLimiter = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(PER_IP_PER_HOUR, "1 h"),
        analytics: false,
        prefix: `${PREFIX}:ip`,
      })
    : null;
  return ipLimiter;
}

function hashKey(value: string): string {
  return createHash("sha256").update(`${value}:${SALT}`).digest("hex");
}

export type HealthOtpLimitResult =
  | { allowed: true }
  | { allowed: false; reason: "phone_hourly" | "ip_hourly" };

/**
 * Consumes the per-phone and per-IP OTP windows. Fail-open on any error or when
 * Upstash is unconfigured (local dev) so an outage never blocks a legit booking.
 */
export async function checkHealthOtpLimit(
  e164Phone: string,
  ip: string,
): Promise<HealthOtpLimitResult> {
  const phone = getPhoneLimiter();
  if (phone) {
    try {
      const { success } = await phone.limit(hashKey(`p:${e164Phone}`));
      if (!success) return { allowed: false, reason: "phone_hourly" };
    } catch (err) {
      console.warn(
        "[health-otp] per-phone limiter failed; allowing (fail-open)",
        err instanceof Error ? err.message : err,
      );
    }
  }

  const ipl = getIpLimiter();
  if (ipl && ip && ip !== "unknown") {
    try {
      const { success } = await ipl.limit(hashKey(`i:${ip}`));
      if (!success) return { allowed: false, reason: "ip_hourly" };
    } catch (err) {
      console.warn(
        "[health-otp] per-ip limiter failed; allowing (fail-open)",
        err instanceof Error ? err.message : err,
      );
    }
  }

  return { allowed: true };
}
