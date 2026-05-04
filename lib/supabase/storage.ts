import { createClient } from "@/supabase/browser";

const BUCKET = "glatko-request-photos";

const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
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
    throw new Error("File too large (max 5MB)");
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

/* ─── G-PRO-1: pro portfolio (public bucket) + documents (private) ───────── */

const PRO_PORTFOLIO_BUCKET = "pro-portfolio";
const PRO_DOCUMENTS_BUCKET = "pro-documents";

const PRO_PORTFOLIO_MAX_BYTES = 10 * 1024 * 1024;
const PRO_DOCUMENT_MAX_BYTES = 5 * 1024 * 1024;
const PRO_PORTFOLIO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const PRO_DOCUMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

function fileExt(mime: string, fallback: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "application/pdf") return "pdf";
  return fallback;
}

/**
 * Upload a portfolio image to pro-portfolio (public bucket). Returns the
 * permanent public URL. Path layout: {userId}/portfolio-{ts}-{rand}.ext
 * RLS on storage.objects gates writes via owner match on first folder.
 */
export async function uploadProPortfolioImage(
  file: File,
  userId: string,
): Promise<string> {
  if (!PRO_PORTFOLIO_TYPES.includes(file.type as (typeof PRO_PORTFOLIO_TYPES)[number])) {
    throw new Error("Invalid image type (jpeg/png/webp only)");
  }
  if (file.size > PRO_PORTFOLIO_MAX_BYTES) {
    throw new Error("File too large (max 10MB)");
  }
  const supabase = createClient();
  const ext = fileExt(file.type, "jpg");
  const fileName = `${userId}/portfolio-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(PRO_PORTFOLIO_BUCKET)
    .upload(fileName, file, { cacheControl: "3600", upsert: false });

  if (error) throw new Error(`Portfolio upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage
    .from(PRO_PORTFOLIO_BUCKET)
    .getPublicUrl(data.path);
  return urlData.publicUrl;
}

/**
 * Upload a company document (license/insurance/tax) to pro-documents
 * (private bucket). Returns { path, signedUrl } — signedUrl is a 7-day
 * URL the wizard UI can preview without requiring a re-fetch each render.
 * Admins can read via service-role; pros can read via owner-match RLS.
 */
export async function uploadProDocument(
  file: File,
  userId: string,
  type: string,
): Promise<{ path: string; signedUrl: string; name: string }> {
  if (!PRO_DOCUMENT_TYPES.includes(file.type as (typeof PRO_DOCUMENT_TYPES)[number])) {
    throw new Error("Invalid document type (pdf/jpeg/png only)");
  }
  if (file.size > PRO_DOCUMENT_MAX_BYTES) {
    throw new Error("File too large (max 5MB)");
  }
  const supabase = createClient();
  const ext = fileExt(file.type, "pdf");
  const safeType = type.replace(/[^a-z0-9_-]/gi, "_").slice(0, 32) || "doc";
  const fileName = `${userId}/${safeType}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(PRO_DOCUMENTS_BUCKET)
    .upload(fileName, file, { cacheControl: "3600", upsert: false });

  if (error) throw new Error(`Document upload failed: ${error.message}`);

  const { data: signed, error: signErr } = await supabase.storage
    .from(PRO_DOCUMENTS_BUCKET)
    .createSignedUrl(data.path, 60 * 60 * 24 * 7);
  if (signErr || !signed) {
    throw new Error(`Signed URL failed: ${signErr?.message ?? "unknown"}`);
  }

  return {
    path: data.path,
    signedUrl: signed.signedUrl,
    name: file.name,
  };
}

/** Delete a portfolio image by its full storage path. */
export async function deleteProPortfolioImage(path: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(PRO_PORTFOLIO_BUCKET)
    .remove([path]);
  if (error) throw new Error(`Portfolio delete failed: ${error.message}`);
}

/** Delete a document by storage path. */
export async function deleteProDocument(path: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(PRO_DOCUMENTS_BUCKET)
    .remove([path]);
  if (error) throw new Error(`Document delete failed: ${error.message}`);
}

/**
 * Convert a portfolio public URL back to a storage path (for delete).
 * Public URLs look like: <SUPABASE_URL>/storage/v1/object/public/pro-portfolio/{path}
 */
export function portfolioUrlToPath(url: string): string | null {
  const marker = `/pro-portfolio/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}
