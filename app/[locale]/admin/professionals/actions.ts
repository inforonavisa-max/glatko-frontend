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
import { sendFoundingProviderWelcomeEmail } from "@/lib/email/founding-emails";
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

  // G-PRO-1 + G-LAUNCH-1: transactional email on approve/reject.
  // Approve path also fires the FoundingProviderWelcome mailer when the
  // pre-update trigger flipped is_founding_provider on this row (i.e.
  // the pro just landed inside the first-50 window).
  if (status === "approved" || status === "rejected") {
    const admin = createAdminClient();
    const { data: profileRow } = await admin
      .from("glatko_professional_profiles")
      .select(
        "business_name, is_founding_provider, founding_provider_number",
      )
      .eq("id", professionalId)
      .maybeSingle();
    const businessName =
      (profileRow?.business_name as string | null) ?? "Professional";
    const isFoundingProvider = Boolean(profileRow?.is_founding_provider);
    const foundingNumber =
      (profileRow?.founding_provider_number as number | null) ?? null;

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

        // G-LAUNCH-1 deferred integration: founding provider welcome
        // mailer fires alongside the regular approve mailer (not instead
        // of it) so the celebratory email reads naturally as a follow-up.
        if (isFoundingProvider && foundingNumber !== null) {
          void sendFoundingProviderWelcomeEmail({
            to: email,
            locale,
            professionalName: businessName,
            foundingNumber,
          }).catch((err) => {
            glatkoCaptureException(err, {
              module: "admin/professionals/actions",
              op: "founding_welcome_email",
              professionalId,
            });
          });
        }
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

export type VerificationTier = "basic" | "business" | "professional";

export interface TierDocsInput {
  business_registration?: boolean;
  license?: boolean;
  insurance?: boolean;
  tax_certificate?: boolean;
}

interface SetTierResult {
  success: boolean;
  error?: string;
}

/**
 * G-PRO-2 Faz 4 — Admin tier setter.
 *
 * Calls glatko_admin_set_tier RPC to flip the pro's verification_tier
 * and update the per-document tier_documents JSONB in one go. Admin
 * gate is enforced both here (isAdminEmail) and in the RPC (is_admin()).
 *
 * docs argument is sparse — only the verified flags caller wants to
 * change. Existing tier_documents JSONB is the merge base; passing
 * undefined for a doc keeps the current state.
 */
export async function adminSetProTier(
  professionalId: string,
  tier: VerificationTier,
  docs: TierDocsInput,
): Promise<SetTierResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) {
    return { success: false, error: "Unauthorized" };
  }

  const admin = createAdminClient();

  // Read existing tier_documents to merge (sparse update)
  const { data: existing } = await admin
    .from("glatko_professional_profiles")
    .select("tier_documents")
    .eq("id", professionalId)
    .maybeSingle();

  const current = (existing?.tier_documents ?? {}) as Record<
    string,
    { verified?: boolean; verified_at?: string; admin?: string }
  >;

  const adminLabel = user?.email ?? "admin";
  const nowIso = new Date().toISOString();
  const merged: Record<
    string,
    { verified: boolean; verified_at?: string; admin?: string }
  > = { ...current } as Record<
    string,
    { verified: boolean; verified_at?: string; admin?: string }
  >;

  for (const docType of [
    "business_registration",
    "license",
    "insurance",
    "tax_certificate",
  ] as const) {
    if (typeof docs[docType] === "boolean") {
      merged[docType] = {
        verified: docs[docType] as boolean,
        verified_at: docs[docType] ? nowIso : undefined,
        admin: docs[docType] ? adminLabel : undefined,
      };
    }
  }

  const { data, error } = await admin.rpc("glatko_admin_set_tier", {
    p_professional_id: professionalId,
    p_tier: tier,
    p_documents: merged,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (data === false) {
    return { success: false, error: "Pro not found" };
  }

  return { success: true };
}
