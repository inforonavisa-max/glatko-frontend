import type { ReactElement } from "react";
import { render } from "@react-email/render";
import { Redis } from "@upstash/redis/cloudflare";
import { Ratelimit } from "@upstash/ratelimit";
import { getResendClient, EMAIL_FROM } from "@/lib/email/resend";

const EMAIL_RATE_PREFIX = "glatko:email-outbound";
const EMAIL_PER_RECIPIENT_PER_HOUR = 10;

let emailOutboundLimiter: Ratelimit | null | undefined;

function getEmailOutboundLimiter(): Ratelimit | null {
  if (emailOutboundLimiter !== undefined) return emailOutboundLimiter;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    emailOutboundLimiter = null;
    return null;
  }

  const redis = new Redis({ url, token });
  emailOutboundLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      EMAIL_PER_RECIPIENT_PER_HOUR,
      "1 h",
    ),
    analytics: false,
    prefix: EMAIL_RATE_PREFIX,
  });

  return emailOutboundLimiter;
}

export type SendEmailResult =
  | { success: true; messageId?: string }
  | { success: false; error: string; skipped?: boolean };

export type SendEmailOptions = {
  to: string;
  subject: string;
  react: ReactElement;
  /** Optional plain-text fallback (improves deliverability + accessibility). */
  text?: string;
  /** Optional Resend tags for analytics filtering (e.g. category=auth, type=recovery). */
  tags?: { name: string; value: string }[];
  /**
   * Skip the Upstash 10/recipient/hour rate limiter. Use for system-critical
   * flows (auth password reset, signup confirmation) where dropping a mail
   * is worse than letting an attacker burn the bucket — Supabase's own
   * minimum-interval setting acts as the upstream limiter for those.
   */
  skipRateLimit?: boolean;
};

/**
 * Renders a React Email template and sends via Resend.
 * Optional Upstash limit: max 10 emails per recipient per hour (fail-open if Redis errors / missing).
 */
export async function sendEmail(
  options: SendEmailOptions,
): Promise<SendEmailResult> {
  const client = getResendClient();
  if (!client) {
    console.warn("[GLATKO:email] skip send: Resend client unavailable");
    return {
      success: false,
      error: "Resend not configured",
      skipped: true,
    };
  }

  const limiter = options.skipRateLimit ? null : getEmailOutboundLimiter();
  if (limiter) {
    try {
      const recipientKey = options.to.toLowerCase().trim();
      const { success } = await limiter.limit(recipientKey);
      if (!success) {
        console.warn(
          "[GLATKO:email] rate limit exceeded for recipient",
          recipientKey,
        );
        return {
          success: false,
          error: "Email rate limit exceeded for this recipient",
          skipped: true,
        };
      }
    } catch (err) {
      console.warn(
        "[GLATKO:email] rate limit check failed; continuing (fail-open)",
        err instanceof Error ? err.message : err,
      );
    }
  }

  let html: string;
  try {
    html = await render(options.react);
  } catch (err) {
    console.error("[GLATKO-EMAIL] render failed", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Email render failed",
    };
  }

  try {
    const { data, error } = await client.emails.send({
      from: EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html,
      ...(options.text ? { text: options.text } : {}),
      ...(options.tags && options.tags.length > 0 ? { tags: options.tags } : {}),
    });

    if (error) {
      console.error("[GLATKO:email] Resend API error", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error("[GLATKO:email] send failed", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Email send failed",
    };
  }
}
