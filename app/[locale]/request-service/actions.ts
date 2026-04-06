"use server";

import { z } from "zod";
import { createClient } from "@/supabase/server";
import { pickLocalizedLabel } from "@/lib/i18n/pick-localized-label";
import {
  createServiceRequest,
  notifyProfessionalsOfNewRequest,
} from "@/lib/supabase/glatko.server";

const createRequestSchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  details: z.record(z.unknown()),
  municipality: z.string().min(1),
  address: z.string().max(500).optional(),
  budgetMin: z.number().positive().optional().nullable(),
  budgetMax: z.number().positive().optional().nullable(),
  urgency: z.enum(["asap", "this_week", "flexible", "specific_date"]),
  preferredDateStart: z.string().optional().nullable(),
  preferredDateEnd: z.string().optional().nullable(),
  photos: z.array(z.string().url()).max(5).default([]),
  phone: z.string().min(6).max(20),
  email: z.string().email().optional().nullable(),
});

interface SubmitResult {
  success: boolean;
  requestId?: string;
  categoryLabel?: string;
  error?: string;
}

export async function submitServiceRequest(
  formData: FormData
): Promise<SubmitResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Authentication required." };
  const customerId = user.id;

  let details: Record<string, unknown> = {};
  const detailsRaw = formData.get("details") as string | null;
  if (detailsRaw) {
    try {
      details = JSON.parse(detailsRaw) as Record<string, unknown>;
    } catch {
      return { success: false, error: "Invalid details format." };
    }
  }

  let photos: string[] = [];
  const photosRaw = formData.get("photos") as string | null;
  if (photosRaw) {
    try {
      photos = JSON.parse(photosRaw) as string[];
    } catch {
      photos = [];
    }
  }

  const budgetMinStr = formData.get("budgetMin") as string | null;
  const budgetMaxStr = formData.get("budgetMax") as string | null;
  const emailStr = (formData.get("email") as string) || "";
  const phone = (formData.get("phone") as string) || "";

  const rawData = {
    categoryId: (formData.get("categoryId") as string) || "",
    title: ((formData.get("title") as string) || "").trim(),
    description: ((formData.get("description") as string) || "").trim() || undefined,
    details,
    municipality: (formData.get("municipality") as string) || "",
    address: ((formData.get("address") as string) || "").trim() || undefined,
    budgetMin: budgetMinStr ? Number(budgetMinStr) : null,
    budgetMax: budgetMaxStr ? Number(budgetMaxStr) : null,
    urgency: ((formData.get("urgency") as string) || "flexible") as z.infer<typeof createRequestSchema>["urgency"],
    preferredDateStart: (formData.get("dateStart") as string) || null,
    preferredDateEnd: (formData.get("dateEnd") as string) || null,
    photos,
    phone,
    email: emailStr || null,
  };

  const parsed = createRequestSchema.safeParse(rawData);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstField = Object.keys(fieldErrors)[0];
    const firstMsg = firstField
      ? `${firstField}: ${(fieldErrors as Record<string, string[]>)[firstField]?.[0]}`
      : "Validation failed.";
    return { success: false, error: firstMsg };
  }

  const data = parsed.data;
  data.details.phone = phone;
  if (emailStr) data.details.email = emailStr;

  const preferredRaw = (formData.get("preferredProfessionalId") as string) || "";
  let preferred_professional_id: string | null = null;
  if (preferredRaw) {
    const u = z.string().uuid().safeParse(preferredRaw.trim());
    if (u.success) preferred_professional_id = u.data;
  }

  const result = await createServiceRequest({
    customer_id: customerId,
    category_id: data.categoryId,
    title: data.title,
    description: data.description,
    details: data.details,
    municipality: data.municipality,
    address: data.address,
    budget_min: data.budgetMin ?? undefined,
    budget_max: data.budgetMax ?? undefined,
    urgency: data.urgency,
    preferred_date_start: data.preferredDateStart ?? undefined,
    preferred_date_end: data.preferredDateEnd ?? undefined,
    photos: data.photos,
    preferred_professional_id,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  const row = result.request;

  const { data: catRow } = await supabase
    .from("glatko_service_categories")
    .select("name")
    .eq("id", row.category_id)
    .maybeSingle();

  const categoryNames =
    (catRow?.name as Record<string, string> | null | undefined) ?? {};

  const summaryLocale = ((formData.get("summaryLocale") as string) || "en").trim();

  await notifyProfessionalsOfNewRequest({
    requestId: row.id,
    customerId: row.customer_id,
    categoryId: row.category_id,
    title: row.title,
    municipality: row.municipality,
    preferredProfessionalId: row.preferred_professional_id,
    categoryNames,
  }).catch(() => {});

  const categoryLabel = pickLocalizedLabel(categoryNames, summaryLocale);

  return { success: true, requestId: row.id, categoryLabel };
}
