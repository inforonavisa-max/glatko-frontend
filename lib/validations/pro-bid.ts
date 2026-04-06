import { z } from "zod";
import type { ValidationTranslator } from "@/lib/validations/i18n-zod";

export function createProBidSchema(tr: ValidationTranslator) {
  return z.object({
    serviceRequestId: z.string().uuid({ message: tr("invalidUuid") }),
    professionalId: z.string().uuid({ message: tr("invalidUuid") }),
    price: z
      .number()
      .positive(tr("minNumber", { min: 1 }))
      .max(100000, tr("maxNumber", { max: 100000 })),
    priceType: z.enum(["fixed", "hourly", "estimate"]),
    message: z
      .string()
      .min(10, tr("minLength", { min: 10 }))
      .max(2000, tr("maxLength", { max: 2000 })),
    estimatedDurationHours: z
      .number()
      .positive(tr("minNumber", { min: 1 }))
      .max(1000, tr("maxNumber", { max: 1000 }))
      .optional(),
    availableDate: z.string().optional(),
  });
}
