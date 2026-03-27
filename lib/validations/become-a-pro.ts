import { z } from "zod";

export const AVATAR_REQUIRED = "AVATAR_REQUIRED" as const;
export const CATEGORY_REQUIRED = "CATEGORY_REQUIRED" as const;

function numOrUndef(v: unknown): number | undefined {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** Parsed payload (after normalizing FormData) before createProfessionalProfile. */
export const professionalApplicationSchema = z.object({
  businessName: z.string().max(500).optional(),
  bio: z.string().max(8000).optional(),
  phone: z.string().max(80).optional(),
  city: z.string().max(120).optional(),
  languages: z.array(z.string().max(8)).default([]),
  yearsExperience: z.number().min(0).max(80).optional(),
  hourlyRateMin: z.number().min(0).optional(),
  hourlyRateMax: z.number().min(0).optional(),
  categoryIds: z
    .array(z.string().min(1))
    .min(1, { message: CATEGORY_REQUIRED }),
  primaryCategoryId: z.string().max(64).optional(),
  avatar_url: z.string().trim().min(1, { message: AVATAR_REQUIRED }),
});

export { numOrUndef };

export type ProfessionalApplicationInput = z.infer<
  typeof professionalApplicationSchema
>;
