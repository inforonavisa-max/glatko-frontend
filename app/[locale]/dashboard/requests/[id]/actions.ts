"use server";

import { cancelServiceRequest } from "@/lib/supabase/glatko.server";

interface CancelResult {
  success: boolean;
  error?: string;
}

export async function cancelRequest(
  requestId: string,
  userId: string
): Promise<CancelResult> {
  if (!requestId || !userId) {
    return { success: false, error: "Missing request or user ID." };
  }

  const result = await cancelServiceRequest(requestId, userId);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true };
}
