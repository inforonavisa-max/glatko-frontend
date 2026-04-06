"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

type Props = {
  userId: string | null;
  email: string | null | undefined;
};

/**
 * Binds the signed-in Supabase user to Sentry for client-side error context.
 */
export function SentryUserScope({ userId, email }: Props) {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
    if (userId) {
      Sentry.setUser({
        id: userId,
        email: email ?? undefined,
      });
    } else {
      Sentry.setUser(null);
    }
  }, [userId, email]);

  return null;
}
