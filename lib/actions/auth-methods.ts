"use server";

import { createClient } from "@/supabase/server";

export type AuthMethods = {
  hasPassword: boolean;
  oauthProviders: string[];
};

const EMPTY: AuthMethods = { hasPassword: false, oauthProviders: [] };

/**
 * G-AUTH-2: Look up auth methods for an email via the
 * `public.get_auth_methods(text)` RPC.
 *
 * Returns an empty result for unknown emails or any error so the caller
 * cannot distinguish "no account" from "wrong password" via this endpoint.
 */
export async function lookupAuthMethods(email: string): Promise<AuthMethods> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || trimmed.length > 254 || !trimmed.includes("@")) {
    return EMPTY;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .rpc("get_auth_methods", { p_email: trimmed })
    .maybeSingle<{ has_password: boolean; oauth_providers: string[] | null }>();

  if (error || !data) {
    return EMPTY;
  }

  return {
    hasPassword: Boolean(data.has_password),
    oauthProviders: Array.isArray(data.oauth_providers) ? data.oauth_providers : [],
  };
}
