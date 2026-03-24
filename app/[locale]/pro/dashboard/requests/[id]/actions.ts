"use server";

import { z } from "zod";
import { createClient } from "@/supabase/server";
import { createBid, getProfessionalProfile } from "@/lib/supabase/glatko.server";

const bidSchema = z.object({
  serviceRequestId: z.string().uuid(),
  professionalId: z.string().uuid(),
  price: z.number().positive().max(100000),
  priceType: z.enum(["fixed", "hourly", "estimate"]),
  message: z.string().min(10).max(2000),
  estimatedDurationHours: z.number().positive().max(1000).optional(),
  availableDate: z.string().optional(),
});

interface SubmitResult {
  success: boolean;
  error?: string;
}

export async function submitBid(formData: FormData): Promise<SubmitResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const profile = await getProfessionalProfile(user.id);
  if (!profile || profile.verification_status !== "approved") {
    return { success: false, error: "Professional profile not approved" };
  }

  const raw = {
    serviceRequestId: formData.get("serviceRequestId") as string,
    professionalId: formData.get("professionalId") as string,
    price: Number(formData.get("price")),
    priceType: formData.get("priceType") as string,
    message: formData.get("message") as string,
    estimatedDurationHours: formData.get("estimatedDurationHours")
      ? Number(formData.get("estimatedDurationHours"))
      : undefined,
    availableDate: (formData.get("availableDate") as string) || undefined,
  };

  const parsed = bidSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstField = Object.keys(fieldErrors)[0];
    const firstMsg = firstField
      ? `${firstField}: ${(fieldErrors as Record<string, string[]>)[firstField]?.[0]}`
      : "Validation failed";
    return { success: false, error: firstMsg };
  }

  try {
    await createBid({
      service_request_id: parsed.data.serviceRequestId,
      professional_id: parsed.data.professionalId,
      price: parsed.data.price,
      price_type: parsed.data.priceType,
      message: parsed.data.message,
      estimated_duration_hours: parsed.data.estimatedDurationHours,
      available_date: parsed.data.availableDate,
    });
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create bid";
    return { success: false, error: msg };
  }
}
