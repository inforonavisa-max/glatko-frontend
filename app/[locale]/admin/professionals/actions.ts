"use server";

import { updateVerificationStatus } from "@/lib/supabase/glatko.server";
import type { VerificationStatus } from "@/types/glatko";

export async function updateProfessionalStatus(
  professionalId: string,
  status: VerificationStatus,
  reason?: string
) {
  return updateVerificationStatus(professionalId, status, reason);
}
