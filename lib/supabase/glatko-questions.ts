"use client";

import { createClient } from "@/supabase/browser";
import type { RequestQuestion } from "@/lib/types/request-questions";

/**
 * Browser-side helper for the wizard's StepDetails component. Calls the
 * `glatko_get_request_questions(p_category_slug)` RPC, which returns the
 * category's own questions plus inherited parent-category questions.
 *
 * Returns [] on RPC error so the wizard renders a "no questions" state
 * rather than blowing up — admin can still inspect the failure via Sentry.
 */
export async function fetchCategoryQuestions(
  categorySlug: string,
): Promise<RequestQuestion[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("glatko_get_request_questions", {
    p_category_slug: categorySlug,
  });

  if (error) {
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
      console.error("[fetchCategoryQuestions] RPC error:", error);
    }
    return [];
  }

  return (data ?? []) as RequestQuestion[];
}

/**
 * G-PRO-1: counterpart for pro application questions. Same shape as
 * glatko_request_questions; fetched via the parallel RPC. Returns [] on
 * error so wizard renders an empty state.
 */
export async function fetchProApplicationQuestions(
  categorySlug: string,
): Promise<RequestQuestion[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc(
    "glatko_get_pro_application_questions",
    { p_category_slug: categorySlug },
  );

  if (error) {
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
      console.error("[fetchProApplicationQuestions] RPC error:", error);
    }
    return [];
  }

  return (data ?? []) as RequestQuestion[];
}
