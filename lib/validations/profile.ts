import { z } from "zod";

export const profileFieldsSchema = z.object({
  full_name: z.string().trim().min(2, "min2").max(100),
  phone: z.string().max(20),
  city: z.string().max(100),
  bio: z.string().max(500, "bioMax"),
});

export type ProfileFormValues = z.infer<typeof profileFieldsSchema>;

export function normalizeProfilePayload(values: ProfileFormValues) {
  return {
    full_name: values.full_name,
    phone: values.phone.trim() === "" ? null : values.phone.trim(),
    city: values.city.trim() === "" ? null : values.city.trim(),
    bio: values.bio.trim() === "" ? null : values.bio.trim(),
  };
}

export const passwordSchema = z
  .object({
    current_password: z.string().min(1, "required"),
    new_password: z.string().min(8, "min8"),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "mismatch",
    path: ["confirm_password"],
  });
