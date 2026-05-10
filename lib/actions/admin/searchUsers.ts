"use server";

import { createAdminClient, createClient } from "@/supabase/server";
import { isAdminEmail } from "@/lib/admin";

interface UserSearchRow {
  id: string;
  full_name: string | null;
  email: string;
  is_pro: boolean;
}

/**
 * Admin-only user search for the promote-existing-user flow's combobox.
 * Joins profiles + auth.users + glatko_professional_profiles (via id IN
 * lookup) to surface "is this user already a pro?" in the dropdown.
 */
export async function searchUsersForPromoteAction(
  query: string,
): Promise<UserSearchRow[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email || !isAdminEmail(user.email)) return [];

  const admin = createAdminClient();

  // Search by full_name first (cheapest). If short, also try email by
  // listing auth users (rate-limited to 200) and filtering in memory.
  const { data: byName } = await admin
    .from("profiles")
    .select("id, full_name, email")
    .ilike("full_name", `%${trimmed}%`)
    .limit(15);

  const candidates = new Map<
    string,
    { id: string; full_name: string | null; email: string }
  >();
  for (const r of byName ?? []) {
    candidates.set(r.id as string, {
      id: r.id as string,
      full_name: (r.full_name as string | null) ?? null,
      email: (r.email as string) ?? "",
    });
  }

  // Also attempt email-substring match (cheap because profiles table is
  // small at launch volume).
  const { data: byEmail } = await admin
    .from("profiles")
    .select("id, full_name, email")
    .ilike("email", `%${trimmed}%`)
    .limit(15);
  for (const r of byEmail ?? []) {
    if (!candidates.has(r.id as string)) {
      candidates.set(r.id as string, {
        id: r.id as string,
        full_name: (r.full_name as string | null) ?? null,
        email: (r.email as string) ?? "",
      });
    }
  }

  if (candidates.size === 0) return [];

  // Mark which ones already have a pro profile.
  const ids = Array.from(candidates.keys());
  const { data: existingPros } = await admin
    .from("glatko_professional_profiles")
    .select("id")
    .in("id", ids);
  const proSet = new Set((existingPros ?? []).map((r) => r.id as string));

  return Array.from(candidates.values())
    .map((c) => ({
      ...c,
      is_pro: proSet.has(c.id),
    }))
    .sort((a, b) => (a.is_pro === b.is_pro ? 0 : a.is_pro ? 1 : -1))
    .slice(0, 12);
}
