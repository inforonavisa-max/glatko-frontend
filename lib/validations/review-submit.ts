import { z } from "zod";
import type { ValidationTranslator } from "@/lib/validations/i18n-zod";

export function createReviewSubmitSchema(tr: ValidationTranslator) {
  return z.object({
    serviceRequestId: z.string().uuid({ message: tr("invalidUuid") }),
    bidId: z.string().uuid({ message: tr("invalidUuid") }),
    revieweeId: z.string().uuid({ message: tr("invalidUuid") }),
    reviewerRole: z.enum(["customer", "professional"]),
    overallRating: z
      .number()
      .int()
      .min(1, tr("minNumber", { min: 1 }))
      .max(5, tr("maxNumber", { max: 5 })),
    qualityRating: z
      .number()
      .int()
      .min(1, tr("minNumber", { min: 1 }))
      .max(5, tr("maxNumber", { max: 5 }))
      .optional(),
    communicationRating: z
      .number()
      .int()
      .min(1, tr("minNumber", { min: 1 }))
      .max(5, tr("maxNumber", { max: 5 }))
      .optional(),
    punctualityRating: z
      .number()
      .int()
      .min(1, tr("minNumber", { min: 1 }))
      .max(5, tr("maxNumber", { max: 5 }))
      .optional(),
    reviewText: z
      .string()
      .max(1000, tr("maxLength", { max: 1000 }))
      .optional(),
    photos: z
      .array(z.string().url(tr("invalidUrl")))
      .max(3, tr("maxItems", { max: 3 }))
      .default([]),
  });
}

export type ReviewSubmitInput = z.infer<
  ReturnType<typeof createReviewSubmitSchema>
>;
