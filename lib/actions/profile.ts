"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";
import {
  profileFieldsSchema,
  normalizeProfilePayload,
  passwordSchema,
} from "@/lib/validations/profile";

const VALID_LOCALES = ["tr", "en", "de", "it", "ru", "uk", "sr", "me", "ar"] as const;

/** next-intl middleware locale cookie (default name in v4) */
const LOCALE_COOKIE = "NEXT_LOCALE";

export type UserProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  bio: string | null;
  preferred_locale: string | null;
  is_active: boolean | null;
  notification_prefs: NotificationPrefsRow | null;
  is_deleted: boolean | null;
};

export type NotificationPrefsRow = {
  email_new_bid?: boolean;
  email_new_message?: boolean;
  email_new_review?: boolean;
  /** Pro: new matching requests / lead emails (optional; default on if unset) */
  email_new_request_match?: boolean;
  push_enabled?: boolean;
};

const defaultNotificationPrefs: Required<
  Pick<NotificationPrefsRow, "email_new_bid" | "email_new_message" | "email_new_review">
> = {
  email_new_bid: true,
  email_new_message: true,
  email_new_review: true,
};

export async function getProfileSettings(): Promise<
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
      "id, full_name, avatar_url, phone, city, bio, preferred_locale, is_active, notification_prefs, is_deleted"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  const row: UserProfileRow = {
    id: user.id,
    full_name: profile?.full_name ?? null,
    avatar_url: profile?.avatar_url ?? null,
    phone: profile?.phone ?? null,
    city: profile?.city ?? null,
    bio: profile?.bio ?? null,
    preferred_locale: profile?.preferred_locale ?? "tr",
    is_active: profile?.is_active ?? true,
    notification_prefs: (profile?.notification_prefs as NotificationPrefsRow | null) ?? {
      ...defaultNotificationPrefs,
    },
    is_deleted: profile?.is_deleted ?? false,
  };

  if (row.is_deleted) {
    return { ok: false, error: "Account deleted" };
  }

  return {
    ok: true,
    profile: row,
    email: user.email ?? "",
  };
}

function revalidateProfile() {
  revalidatePath("/", "layout");
}

export async function updateProfile(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "unauthorized" as const };
  }

  const rawData = {
    full_name: String(formData.get("full_name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    city: String(formData.get("city") ?? ""),
    bio: String(formData.get("bio") ?? ""),
  };

  const validated = profileFieldsSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  const normalized = normalizeProfilePayload(validated.data);

  // Partial UPDATE only — never upsert (insert would omit NOT NULL columns like email).
  const { error } = await supabase
    .from("profiles")
    .update({
      ...normalized,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Profile update error:", error);
    return { error: error.message };
  }

  revalidateProfile();
  return { success: true as const };
}

export async function updateAvatar(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "unauthorized" as const };
  }

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) {
    return { error: "no_file" as const };
  }

  if (file.size > 2 * 1024 * 1024) {
    return { error: "file_too_large" as const };
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "invalid_type" as const };
  }

  // Path must be `{user_id}/avatar.{ext}` for storage RLS (foldername[1] = uid).
  const fileExt = file.type.split("/")[1] ?? "jpeg";
  const fileName = `avatar.${fileExt}`;
  const filePath = `${user.id}/${fileName}`;

  const { data: existingFiles } = await supabase.storage.from("avatars").list(user.id);
  if (existingFiles && existingFiles.length > 0) {
    const filesToDelete = existingFiles.map((f) => `${user.id}/${f.name}`);
    await supabase.storage.from("avatars").remove(filesToDelete);
  }

  const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
    upsert: true,
    contentType: file.type,
  });

  if (uploadError) {
    console.error("Avatar upload error:", uploadError);
    return { error: uploadError.message };
  }

  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
  const publicUrl = urlData.publicUrl;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      avatar_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateError) {
    console.error("Profile avatar_url update error:", updateError);
    return { error: updateError.message };
  }

  revalidateProfile();
  return { success: true as const, url: publicUrl };
}

export async function deleteAvatar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "unauthorized" as const };
  }

  await supabase.storage.from("avatars").remove([
    `${user.id}/avatar.jpg`,
    `${user.id}/avatar.png`,
    `${user.id}/avatar.webp`,
  ]);

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: null, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidateProfile();
  return { success: true as const };
}

export async function updateLanguagePreference(locale: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "unauthorized" as const };
  }

  if (!VALID_LOCALES.includes(locale as (typeof VALID_LOCALES)[number])) {
    return { error: "invalid_locale" as const };
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      preferred_locale: locale,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    return { error: error.message };
  }

  try {
    cookies().set(LOCALE_COOKIE, locale, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  } catch {
    /* ignore cookie set failures outside mutable request */
  }

  revalidateProfile();
  return { success: true as const };
}

export async function updateNotificationPrefs(prefs: NotificationPrefsRow) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "unauthorized" as const };
  }

  const merged = {
    email_new_bid: prefs.email_new_bid ?? defaultNotificationPrefs.email_new_bid,
    email_new_message:
      prefs.email_new_message ?? defaultNotificationPrefs.email_new_message,
    email_new_review:
      prefs.email_new_review ?? defaultNotificationPrefs.email_new_review,
    ...(prefs.push_enabled !== undefined ? { push_enabled: prefs.push_enabled } : {}),
  };

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      notification_prefs: merged,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    return { error: error.message };
  }

  revalidateProfile();
  return { success: true as const };
}

export async function changePassword(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { error: "unauthorized" as const };
  }

  const parsed = passwordSchema.safeParse({
    current_password: formData.get("current_password"),
    new_password: formData.get("new_password"),
    confirm_password: formData.get("confirm_password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { error: signErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.current_password,
  });

  if (signErr) {
    return { error: "invalid_current_password" as const };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.new_password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true as const };
}

export async function deactivateAccount() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "unauthorized" as const };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  await supabase.auth.signOut();
  revalidateProfile();
  return { success: true as const };
}

export async function deleteAccount(confirmation: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "unauthorized" as const };
  }

  const ok =
    confirmation === "SİL" ||
    confirmation === "SIL" ||
    confirmation === "DELETE";
  if (!ok) {
    return { error: "invalid_confirmation" as const };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  await supabase.auth.signOut();
  revalidateProfile();
  return { success: true as const };
}
