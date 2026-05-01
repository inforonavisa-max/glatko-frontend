"use server";

import { revalidatePath } from "next/cache";

import { createClient, createAdminClient } from "@/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { notifyProfessionalsOfNewRequest } from "@/lib/supabase/glatko.server";
import {
  sendRequestApprovedEmail,
  sendRequestRejectedEmail,
} from "@/lib/email/request-emails";

/**
 * Look up an email for the request's owner. Logged-in users come from
 * `auth.users` via the admin API; anonymous submissions store their
 * email directly on the row.
 */
async function lookupRequestorEmail(
  customerId: string | null,
  anonymousEmail: string | null,
): Promise<string | null> {
  if (anonymousEmail) return anonymousEmail;
  if (!customerId) return null;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.getUserById(customerId);
    if (error) return null;
    return data.user?.email ?? null;
  } catch {
    return null;
  }
}

interface ActionResult {
  success: boolean;
  error?: string;
}

async function requireAdmin(): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Unauthorized" };
  if (!isAdminEmail(user.email)) return { ok: false, error: "Forbidden" };
  return { ok: true, userId: user.id };
}

/**
 * Approve a pending_moderation request → publish it and trigger the
 * existing notifyProfessionalsOfNewRequest fan-out (which is the same
 * helper the original wizard called inline before G-REQ-1 introduced
 * the moderation gate).
 */
export async function approveRequest(requestId: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false, error: auth.error };

  const admin = createAdminClient();

  const { data: row, error } = await admin
    .from("glatko_service_requests")
    .update({
      status: "published",
      moderated_by: auth.userId,
      moderated_at: new Date().toISOString(),
      moderation_reason: null,
    })
    .eq("id", requestId)
    .eq("status", "pending_moderation")
    .select(
      "id, category_id, customer_id, anonymous_email, locale, title, municipality, preferred_professional_id",
    )
    .single();

  if (error || !row) {
    return {
      success: false,
      error: error?.message ?? "Approve failed (row not in pending state).",
    };
  }

  const { data: catRow } = await admin
    .from("glatko_service_categories")
    .select("name")
    .eq("id", row.category_id)
    .maybeSingle();

  const categoryNames =
    (catRow?.name as Record<string, string> | null | undefined) ?? {};

  // Fire notify for matching pros (best-effort — never blocks the approve).
  if (row.customer_id) {
    await notifyProfessionalsOfNewRequest({
      requestId: row.id as string,
      customerId: row.customer_id as string,
      categoryId: row.category_id as string,
      title: row.title as string,
      municipality: row.municipality as string,
      preferredProfessionalId:
        (row.preferred_professional_id as string | null) ?? null,
      categoryNames,
    }).catch(() => {
      // Notify failure shouldn't roll back the approve. A future cron
      // can re-fan-out unread requests; the row is now `published`.
    });
  }

  // User mailer: localized "your request is live" with verified-pro count.
  const userEmail = await lookupRequestorEmail(
    (row.customer_id as string | null) ?? null,
    (row.anonymous_email as string | null) ?? null,
  );
  if (userEmail) {
    const userLocale = (row.locale as string | null) ?? "en";
    const categoryName =
      categoryNames[userLocale] ?? categoryNames.en ?? row.title;

    const { count: proCount } = await admin
      .from("glatko_pro_services")
      .select("id", { count: "exact", head: true })
      .eq("category_id", row.category_id as string);

    void sendRequestApprovedEmail({
      to: userEmail,
      locale: userLocale,
      categoryName: categoryName as string,
      city: row.municipality as string,
      proCount: proCount ?? 0,
    }).catch(() => {
      /* helper logs to Sentry */
    });
  }

  revalidatePath("/[locale]/admin/requests", "page");
  return { success: true };
}

/**
 * Reject a pending_moderation request with an admin-supplied reason.
 * Keeps the row for the audit trail; user notification is queued in
 * Faz 9 (Resend integration). For now the moderation_reason text is
 * the source of truth admins can re-read on the dashboard.
 */
export async function rejectRequest(
  requestId: string,
  reason: string,
): Promise<ActionResult> {
  const trimmed = (reason ?? "").trim();
  if (trimmed.length === 0) {
    return { success: false, error: "Reject reason is required." };
  }
  if (trimmed.length > 1000) {
    return { success: false, error: "Reject reason too long." };
  }

  const auth = await requireAdmin();
  if (!auth.ok) return { success: false, error: auth.error };

  const admin = createAdminClient();
  const { data: row, error } = await admin
    .from("glatko_service_requests")
    .update({
      status: "rejected",
      moderated_by: auth.userId,
      moderated_at: new Date().toISOString(),
      moderation_reason: trimmed,
    })
    .eq("id", requestId)
    .eq("status", "pending_moderation")
    .select(
      "id, category_id, customer_id, anonymous_email, locale, municipality, title",
    )
    .single();

  if (error || !row) {
    return {
      success: false,
      error: error?.message ?? "Reject failed (row not in pending state).",
    };
  }

  const { data: catRow } = await admin
    .from("glatko_service_categories")
    .select("name")
    .eq("id", row.category_id as string)
    .maybeSingle();
  const categoryNames =
    (catRow?.name as Record<string, string> | null | undefined) ?? {};

  const userEmail = await lookupRequestorEmail(
    (row.customer_id as string | null) ?? null,
    (row.anonymous_email as string | null) ?? null,
  );
  if (userEmail) {
    const userLocale = (row.locale as string | null) ?? "en";
    const categoryName =
      categoryNames[userLocale] ?? categoryNames.en ?? row.title;

    void sendRequestRejectedEmail({
      to: userEmail,
      locale: userLocale,
      categoryName: categoryName as string,
      city: row.municipality as string,
      rejectReason: trimmed,
    }).catch(() => {
      /* helper logs to Sentry */
    });
  }

  revalidatePath("/[locale]/admin/requests", "page");
  return { success: true };
}
