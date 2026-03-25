import { createClient } from "@/supabase/browser";

const BUCKET = "glatko-request-photos";

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
