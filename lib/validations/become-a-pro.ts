import { z } from "zod";
import type { ValidationTranslator } from "@/lib/validations/i18n-zod";

function numOrUndef(v: unknown): number | undefined {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** Parsed payload (after normalizing FormData) before createProfessionalProfile. */
export function createProfessionalApplicationSchema(tr: ValidationTranslator) {
  return z.object({
    businessName: z
      .string()
      .max(500, tr("maxLength", { max: 500 }))
      .optional(),
    bio: z.string().max(8000, tr("maxLength", { max: 8000 })).optional(),
    phone: z.string().max(80, tr("maxLength", { max: 80 })).optional(),
    city: z.string().max(120, tr("maxLength", { max: 120 })).optional(),
    languages: z.array(z.string().max(8)).default([]),
    yearsExperience: z
      .number()
      .min(0, tr("minNumber", { min: 0 }))
      .max(80, tr("maxNumber", { max: 80 }))
      .optional(),
    hourlyRateMin: z.number().min(0, tr("minNumber", { min: 0 })).optional(),
    hourlyRateMax: z.number().min(0, tr("minNumber", { min: 0 })).optional(),
    categoryIds: z
      .array(z.string().min(1, tr("required")))
      .min(1, tr("categoryRequired")),
    primaryCategoryId: z
      .string()
      .max(64, tr("maxLength", { max: 64 }))
      .optional(),
    avatar_url: z.string().trim().min(1, tr("avatarRequired")),
  });
}

export { numOrUndef };

export type ProfessionalApplicationInput = z.infer<
  ReturnType<typeof createProfessionalApplicationSchema>
>;
