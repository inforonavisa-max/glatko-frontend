"use server";

import { createClient } from "@/supabase/server";
import { createProfessionalProfile } from "@/lib/supabase/glatko.server";

interface FormState {
  success: boolean;
  error?: string;
}

export async function submitProfessionalApplication(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Authentication required" };

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

  if (categoryIds.length === 0) {
    return { success: false, error: "Select at least one service category" };
  }

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
