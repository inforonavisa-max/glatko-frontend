"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/supabase/server";
import { createReview, createNotification } from "@/lib/supabase/glatko.server";
import {
  createReviewSubmitSchema,
  type ReviewSubmitInput,
} from "@/lib/validations/review-submit";

type ReviewInput = ReviewSubmitInput;

export async function submitReviewAction(
  input: ReviewInput
): Promise<{ success: boolean; error?: string }> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "validation" });
  const reviewSchema = createReviewSubmitSchema((key, values) => t(key, values));
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    const d = parsed.data;
    await createReview({
      service_request_id: d.serviceRequestId,
      bid_id: d.bidId,
      reviewer_id: user.id,
      reviewee_id: d.revieweeId,
      reviewer_role: d.reviewerRole,
      overall_rating: d.overallRating,
      quality_rating: d.qualityRating,
      communication_rating: d.communicationRating,
      punctuality_rating: d.punctualityRating,
      review_text: d.reviewText,
      photos: d.photos,
    });

    await createNotification({
      user_id: d.revieweeId,
      type: "review",
      title: "New review received",
      body: `You received a ${d.overallRating}-star review`,
      data: {
        requestId: d.serviceRequestId,
        overallRating: d.overallRating,
      },
    }).catch(() => {});

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to submit review",
    };
  }
}
