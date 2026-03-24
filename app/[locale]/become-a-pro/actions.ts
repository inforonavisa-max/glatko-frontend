"use server";

import { createProfessionalProfile } from "@/lib/supabase/glatko.server";

interface FormState {
  success: boolean;
  error?: string;
}

export async function submitProfessionalApplication(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const userId = formData.get("userId") as string;
  const businessName = formData.get("businessName") as string;
  const bio = formData.get("bio") as string;
  const phone = formData.get("phone") as string;
  const city = formData.get("city") as string;
  const languages = formData.getAll("languages") as string[];
  const yearsExperience = Number(formData.get("yearsExperience")) || undefined;
  const hourlyRateMin = Number(formData.get("hourlyRateMin")) || undefined;
  const hourlyRateMax = Number(formData.get("hourlyRateMax")) || undefined;
  const categoryIds = formData.getAll("categoryIds") as string[];
  const primaryCategoryId = formData.get("primaryCategoryId") as string;

  if (!userId) {
    return { success: false, error: "User ID required" };
  }

  if (categoryIds.length === 0) {
    return { success: false, error: "Select at least one service category" };
  }

  return createProfessionalProfile({
    userId,
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
