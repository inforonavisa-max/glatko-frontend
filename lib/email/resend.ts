/**
 * Resend client singleton + shared email/site configuration.
 * Safe at build time: missing env returns null client (no throw).
 */
import { Resend } from "resend";

let resend: Resend | null = null;

export function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[GLATKO-EMAIL] RESEND_API_KEY is not set; outbound email disabled.",
      );
    }
    return null;
  }
  if (!resend) {
    resend = new Resend(key);
  }
  return resend;
}

export const EMAIL_FROM: string =
  process.env.RESEND_FROM_EMAIL ?? "noreply@glatko.app";

export function getSiteUrl(): string {
  const primary = process.env.NEXT_PUBLIC_APP_URL;
  if (primary) return primary.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`.replace(/\/$/, "");
  return "https://glatko.app";
}
