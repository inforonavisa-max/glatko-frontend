"use server";

import { createClient } from "@/supabase/server";
import { updateVerificationStatus, createNotification } from "@/lib/supabase/glatko.server";
import type { VerificationStatus } from "@/types/glatko";

const ADMIN_EMAILS = new Set([
  "rohat@glatko.app",
  "admin@glatko.app",
  "contact@glatko.app",
]);

export async function updateProfessionalStatus(
  professionalId: string,
  status: VerificationStatus,
  reason?: string
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email || !ADMIN_EMAILS.has(user.email)) {
    return { success: false, error: "Unauthorized" };
  }

  const result = await updateVerificationStatus(professionalId, status, reason);

  if (result.success) {
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
  }

  return result;
}
