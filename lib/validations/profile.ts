import { z } from "zod";
import type { ValidationTranslator } from "@/lib/validations/i18n-zod";

export function createProfileFieldsSchema(tr: ValidationTranslator) {
  return z.object({
    full_name: z
      .string()
      .trim()
      .min(2, tr("minLength", { min: 2 }))
      .max(100, tr("maxLength", { max: 100 })),
    phone: z.string().max(20, tr("maxLength", { max: 20 })),
    city: z.string().max(100, tr("maxLength", { max: 100 })),
    bio: z.string().max(500, tr("maxLength", { max: 500 })),
  });
}

export type ProfileFormValues = z.infer<
  ReturnType<typeof createProfileFieldsSchema>
>;

export function normalizeProfilePayload(values: ProfileFormValues) {
  return {
    full_name: values.full_name,
    phone: values.phone.trim() === "" ? null : values.phone.trim(),
    city: values.city.trim() === "" ? null : values.city.trim(),
    bio: values.bio.trim() === "" ? null : values.bio.trim(),
  };
}

export function createPasswordSchema(tr: ValidationTranslator) {
  return z
    .object({
      current_password: z.string().min(1, tr("required")),
      new_password: z.string().min(8, tr("minLength", { min: 8 })),
      confirm_password: z.string(),
    })
    .refine((data) => data.new_password === data.confirm_password, {
      message: tr("passwordMismatch"),
      path: ["confirm_password"],
    });
}
