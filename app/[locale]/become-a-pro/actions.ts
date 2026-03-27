"use server";

import { createClient } from "@/supabase/server";
import { createProfessionalProfile } from "@/lib/supabase/glatko.server";
import {
  professionalApplicationSchema,
  numOrUndef,
  AVATAR_REQUIRED,
} from "@/lib/validations/become-a-pro";

interface FormState {
  success: boolean;
  error?: string;
}

function firstZodIssueMessage(
  issues: { path: (string | number)[]; message: string }[]
): string {
  const first = issues[0];
  return first?.message ?? "Validation failed";
}

export async function submitProfessionalApplication(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Authentication required" };

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (profileErr) {
    return { success: false, error: profileErr.message };
  }

  const dbAvatar = profile?.avatar_url?.trim() ?? "";
  if (!dbAvatar) {
    return { success: false, error: AVATAR_REQUIRED };
  }

  const primaryRaw = String(formData.get("primaryCategoryId") ?? "").trim();

  const rawPayload = {
    businessName: String(formData.get("businessName") ?? "") || undefined,
    bio: String(formData.get("bio") ?? "") || undefined,
    phone: String(formData.get("phone") ?? "") || undefined,
    city: String(formData.get("city") ?? "") || undefined,
    languages: formData.getAll("languages") as string[],
    yearsExperience: numOrUndef(formData.get("yearsExperience")),
    hourlyRateMin: numOrUndef(formData.get("hourlyRateMin")),
    hourlyRateMax: numOrUndef(formData.get("hourlyRateMax")),
    categoryIds: formData.getAll("categoryIds") as string[],
    primaryCategoryId: primaryRaw || undefined,
    avatar_url: String(formData.get("avatar_url") ?? "").trim(),
  };

  const parsed = professionalApplicationSchema.safeParse(rawPayload);
  if (!parsed.success) {
    return {
      success: false,
      error: firstZodIssueMessage(parsed.error.issues),
    };
  }

  if (parsed.data.avatar_url !== dbAvatar) {
    return { success: false, error: AVATAR_REQUIRED };
  }

  const {
    businessName,
    bio,
    phone,
    city,
    languages,
    yearsExperience,
    hourlyRateMin,
    hourlyRateMax,
    categoryIds,
    primaryCategoryId,
  } = parsed.data;

  return createProfessionalProfile({
    userId: user.id,
    businessName: businessName || undefined,
    bio: bio || undefined,
    phone: phone || undefined,
    city: city || undefined,
    languages: languages.length > 0 ? languages : undefined,
    yearsExperience,
    hourlyRateMin,
    hourlyRateMax,
    categoryIds,
    primaryCategoryId: primaryCategoryId || undefined,
  });
}
