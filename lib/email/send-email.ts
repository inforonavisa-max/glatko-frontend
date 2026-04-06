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
  | { ok: true; id?: string }
  | { ok: false; error: string; skipped?: boolean };

export type SendEmailOptions = {
  to: string;
  subject: string;
  react: ReactElement;
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
    console.warn("[GLATKO-EMAIL] skip send: Resend client unavailable");
    return {
      ok: false,
      error: "Resend not configured",
      skipped: true,
    };
  }

  const limiter = getEmailOutboundLimiter();
  if (limiter) {
    try {
      const recipientKey = options.to.toLowerCase().trim();
      const { success } = await limiter.limit(recipientKey);
      if (!success) {
        console.warn(
          "[GLATKO-EMAIL] rate limit exceeded for recipient",
          recipientKey,
        );
        return {
          ok: false,
          error: "Email rate limit exceeded for this recipient",
          skipped: true,
        };
      }
    } catch (err) {
      console.warn(
        "[GLATKO-EMAIL] rate limit check failed; continuing (fail-open)",
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
      ok: false,
      error: err instanceof Error ? err.message : "Email render failed",
    };
  }

  try {
    const { data, error } = await client.emails.send({
      from: EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html,
    });

    if (error) {
      console.error("[GLATKO-EMAIL] Resend API error", error);
      return { ok: false, error: error.message };
    }

    return { ok: true, id: data?.id };
  } catch (err) {
    console.error("[GLATKO-EMAIL] send failed", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Email send failed",
    };
  }
}
