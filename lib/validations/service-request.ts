import { z } from "zod";
import type { ValidationTranslator } from "@/lib/validations/i18n-zod";

export function createServiceRequestSchema(tr: ValidationTranslator) {
  return z.object({
    categoryId: z.string().uuid({ message: tr("invalidUuid") }),
    title: z
      .string()
      .min(3, tr("minLength", { min: 3 }))
      .max(200, tr("maxLength", { max: 200 })),
    description: z
      .string()
      .max(2000, tr("maxLength", { max: 2000 }))
      .optional(),
    details: z.record(z.unknown()),
    municipality: z.string().min(1, tr("required")),
    address: z
      .string()
      .max(500, tr("maxLength", { max: 500 }))
      .optional(),
    budgetMin: z.number().positive(tr("minNumber", { min: 1 })).optional().nullable(),
    budgetMax: z.number().positive(tr("minNumber", { min: 1 })).optional().nullable(),
    urgency: z.enum(["asap", "this_week", "flexible", "specific_date"]),
    preferredDateStart: z.string().optional().nullable(),
    preferredDateEnd: z.string().optional().nullable(),
    photos: z
      .array(z.string().url(tr("invalidUrl")))
      .max(5, tr("maxItems", { max: 5 }))
      .default([]),
    phone: z
      .string()
      .min(6, tr("minLength", { min: 6 }))
      .max(20, tr("maxLength", { max: 20 })),
    email: z.preprocess(
      (v) => (v === "" || v === undefined ? null : v),
      z.union([z.null(), z.string().email(tr("email"))]),
    ),
  });
}
