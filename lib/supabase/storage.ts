import { createClient } from "@/supabase/browser";

export async function uploadRequestPhoto(
  file: File,
  requestId: string
): Promise<string> {
  const supabase = createClient();
  const fileExt = file.name.split(".").pop() ?? "jpg";
  const fileName = `${requestId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("glatko-request-photos")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("glatko-request-photos")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}
