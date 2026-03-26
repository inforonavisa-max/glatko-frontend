"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/supabase/server";

export type UserProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  bio: string | null;
  preferred_locale: string | null;
  is_active: boolean | null;
};

export async function getProfileAction(): Promise<
  | { ok: true; profile: UserProfileRow; email: string }
  | { ok: false; error: string }
> {
  const supabase = createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) {
    return { ok: false, error: "Unauthorized" };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, avatar_url, phone, city, bio, preferred_locale, is_active"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  const row: UserProfileRow = profile ?? {
    id: user.id,
    full_name: null,
    avatar_url: null,
    phone: null,
    city: null,
    bio: null,
    preferred_locale: "en",
    is_active: true,
  };

  return {
    ok: true,
    profile: row,
    email: user.email ?? "",
  };
}

export async function updateProfileAction(payload: {
  full_name?: string;
  phone?: string | null;
  city?: string | null;
  bio?: string | null;
  preferred_locale?: string | null;
  avatar_url?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) {
    return { ok: false, error: "Unauthorized" };
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (payload.full_name !== undefined) updates.full_name = payload.full_name;
  if (payload.phone !== undefined) updates.phone = payload.phone;
  if (payload.city !== undefined) updates.city = payload.city;
  if (payload.bio !== undefined) updates.bio = payload.bio;
  if (payload.preferred_locale !== undefined) {
    updates.preferred_locale = payload.preferred_locale;
  }
  if (payload.avatar_url !== undefined) updates.avatar_url = payload.avatar_url;

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      ...updates,
    },
    { onConflict: "id" }
  );

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteAccountAction(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const supabase = createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) {
    return { ok: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return { ok: true };
}
