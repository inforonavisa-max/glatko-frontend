"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/supabase/server";
import { createBid, getProfessionalProfile, createNotification } from "@/lib/supabase/glatko.server";
import { createProBidSchema } from "@/lib/validations/pro-bid";

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

  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "validation" });
  const bidSchema = createProBidSchema((key, values) => t(key, values));
  const parsed = bidSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstField = Object.keys(fieldErrors)[0];
    const firstMsg = firstField
      ? `${firstField}: ${(fieldErrors as Record<string, string[]>)[firstField]?.[0]}`
      : "Validation failed";
    return { success: false, error: firstMsg };
  }

  if (parsed.data.professionalId !== user.id) {
    return { success: false, error: "Invalid professional account" };
  }

  const { data: requestRow, error: reqLookupErr } = await supabase
    .from("glatko_service_requests")
    .select("customer_id, status, expires_at")
    .eq("id", parsed.data.serviceRequestId)
    .single();

  if (reqLookupErr || !requestRow) {
    return { success: false, error: "Request not found" };
  }

  if (requestRow.customer_id === user.id) {
    return { success: false, error: "You cannot bid on your own request" };
  }

  const requestStatus = String(requestRow.status ?? "");
  if (requestStatus !== "published" && requestStatus !== "bidding") {
    return {
      success: false,
      error: "This request is no longer accepting bids",
    };
  }

  const expiresRaw = requestRow.expires_at as string | null | undefined;
  if (expiresRaw) {
    const expMs = new Date(expiresRaw).getTime();
    if (!Number.isNaN(expMs) && expMs < Date.now()) {
      return { success: false, error: "This request has expired" };
    }
  }

  try {
    const bid = await createBid({
      service_request_id: parsed.data.serviceRequestId,
      professional_id: parsed.data.professionalId,
      price: parsed.data.price,
      price_type: parsed.data.priceType,
      message: parsed.data.message,
      estimated_duration_hours: parsed.data.estimatedDurationHours,
      available_date: parsed.data.availableDate,
    });

    const supabaseQ = createClient();
    const { data: request } = await supabaseQ
      .from("glatko_service_requests")
      .select("customer_id, title")
      .eq("id", parsed.data.serviceRequestId)
      .single();

    if (request?.customer_id) {
      const proName =
        profile.business_name || profile.profile?.full_name || "A professional";
      const priceLabel = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(bid.price);
      await createNotification({
        user_id: request.customer_id,
        type: "new_bid",
        title: "New bid received",
        body: `${proName} submitted a bid for your request`,
        data: {
          requestId: parsed.data.serviceRequestId,
          bidId: bid.id,
          professionalName: proName,
          requestTitle: request.title ?? "",
          price: priceLabel,
          message: parsed.data.message,
        },
      }).catch(() => {});
    }

    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const lower = msg.toLowerCase();
    if (
      lower.includes("duplicate") ||
      lower.includes("unique") ||
      lower.includes("23505")
    ) {
      return {
        success: false,
        error: "You have already submitted a bid for this request",
      };
    }
    return { success: false, error: msg || "Failed to create bid" };
  }
}
