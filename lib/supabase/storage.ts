import { createClient } from "@/supabase/browser";

const BUCKET = "glatko-request-photos";

const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/** Public avatar in glatko-request-photos bucket under avatars/{userId}/ */
export async function uploadProfileAvatar(
  file: File,
  userId: string
): Promise<string> {
  if (!AVATAR_TYPES.includes(file.type as (typeof AVATAR_TYPES)[number])) {
    throw new Error("Invalid image type");
  }
  if (file.size > AVATAR_MAX_BYTES) {
    throw new Error("File too large (max 2MB)");
  }
  const supabase = createClient();
  const ext =
    file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const fileName = `avatars/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    if (error.message?.includes("Bucket not found") || error.message?.includes("not found")) {
      throw new Error(
        `Storage bucket "${BUCKET}" does not exist. Please create it in the Supabase Dashboard.`
      );
    }
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function uploadRequestPhoto(
  file: File,
  requestId: string
): Promise<string> {
  const supabase = createClient();
  const fileExt = file.name.split(".").pop() ?? "jpg";
  const fileName = `${requestId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    if (error.message?.includes("Bucket not found") || error.message?.includes("not found")) {
      throw new Error(
        `Storage bucket "${BUCKET}" does not exist. Please create it in the Supabase Dashboard.`
      );
    }
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}
