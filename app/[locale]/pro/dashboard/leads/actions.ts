"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/supabase/server";

type PricingModel = "hourly" | "fixed" | "per_unit" | "estimate";

interface SubmitQuoteInput {
  request_id: string;
  notification_id: string;
  price_amount: number;
  pricing_model: PricingModel;
  message: string;
}

interface ActionResult {
  success: boolean;
  error?: string;
  quote_id?: string;
}

export async function submitQuote(
  input: SubmitQuoteInput,
): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  if (input.price_amount <= 0) {
    return { success: false, error: "Price must be greater than zero." };
  }
  const trimmed = (input.message ?? "").trim();
  if (trimmed.length < 10) {
    return { success: false, error: "Message must be at least 10 characters." };
  }
  if (trimmed.length > 5000) {
    return { success: false, error: "Message must be at most 5000 characters." };
  }

  // Pull notified_at from the matching notification queue row so the
  // GENERATED response_time_seconds column gets a meaningful delta.
  const { data: notification, error: notifErr } = await supabase
    .from("glatko_request_notifications")
    .select("notified_at, request_id, professional_id")
    .eq("id", input.notification_id)
    .eq("professional_id", user.id)
    .maybeSingle();

  if (notifErr || !notification) {
    return { success: false, error: "Lead not found." };
  }
  if (!notification.notified_at) {
    return {
      success: false,
      error: "This lead is on the wait-list — quotes open once it's activated.",
    };
  }
  if (notification.request_id !== input.request_id) {
    return { success: false, error: "Request mismatch." };
  }

  const { data, error } = await supabase
    .from("glatko_request_quotes")
    .insert({
      request_id: input.request_id,
      professional_id: user.id,
      price_amount: input.price_amount,
      price_currency: "EUR",
      pricing_model: input.pricing_model,
      message: trimmed,
      notified_at: notification.notified_at,
      status: "submitted",
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error: "You have already sent a quote for this request.",
      };
    }
    return { success: false, error: error.message };
  }

  revalidatePath(`/[locale]/pro/dashboard/leads`, "page");
  return { success: true, quote_id: data.id as string };
}
