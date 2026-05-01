"use server";

import { createClient, createAdminClient } from "@/supabase/server";
import {
  updateVerificationStatus,
  createNotification,
} from "@/lib/supabase/glatko.server";
import { isAdminEmail } from "@/lib/admin";
import {
  sendProApprovedEmail,
  sendProRejectedEmail,
} from "@/lib/email/pro-emails";
import { glatkoCaptureException } from "@/lib/sentry/glatko-capture";
import type { VerificationStatus } from "@/types/glatko";

async function lookupProfessionalEmailAndLocale(
  professionalId: string,
): Promise<{ email: string | null; locale: string }> {
  const admin = createAdminClient();
  try {
    const { data, error } = await admin.auth.admin.getUserById(professionalId);
    if (error) return { email: null, locale: "en" };
    const userMeta = (data.user?.user_metadata ?? {}) as Record<string, unknown>;
    const localeFromMeta =
      typeof userMeta.locale === "string" ? userMeta.locale : null;
    return {
      email: data.user?.email ?? null,
      locale: localeFromMeta ?? "en",
    };
  } catch {
    return { email: null, locale: "en" };
  }
}

export async function updateProfessionalStatus(
  professionalId: string,
  status: VerificationStatus,
  reason?: string,
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) {
    return { success: false, error: "Unauthorized" };
  }

  const result = await updateVerificationStatus(professionalId, status, reason);

  if (!result.success) return result;

  // In-app notification (existing behaviour)
  if (status === "approved") {
    await createNotification({
      user_id: professionalId,
      type: "verification_approved",
      title: "Account approved!",
      body: "Your professional account has been verified",
    }).catch(() => {});
  } else if (status === "rejected") {
    await createNotification({
      user_id: professionalId,
      type: "verification_rejected",
      title: "Application rejected",
      body: reason || "Your professional application was not approved",
    }).catch(() => {});
  }

  // G-PRO-1: transactional email on approve/reject
  if (status === "approved" || status === "rejected") {
    const admin = createAdminClient();
    const { data: profileRow } = await admin
      .from("glatko_professional_profiles")
      .select("business_name")
      .eq("id", professionalId)
      .maybeSingle();
    const businessName =
      (profileRow?.business_name as string | null) ?? "Professional";

    const { email, locale } = await lookupProfessionalEmailAndLocale(
      professionalId,
    );

    if (email) {
      if (status === "approved") {
        void sendProApprovedEmail({
          to: email,
          locale,
          professionalName: businessName,
        }).catch((err) => {
          glatkoCaptureException(err, {
            module: "admin/professionals/actions",
            op: "approved_email",
            professionalId,
          });
        });
      } else {
        void sendProRejectedEmail({
          to: email,
          locale,
          professionalName: businessName,
          rejectReason: reason ?? "",
        }).catch((err) => {
          glatkoCaptureException(err, {
            module: "admin/professionals/actions",
            op: "rejected_email",
            professionalId,
          });
        });
      }
    }
  }

  return result;
}
