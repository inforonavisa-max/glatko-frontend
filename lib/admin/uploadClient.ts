"use client";

/**
 * G-ADMIN-PROVIDER-CREATE-01 — admin client-side upload helper.
 *
 * Two-step flow: ask the server for a signed upload URL keyed to a
 * specific target_user_id + bucket + filename, then PUT the file directly
 * to that URL. The endpoint (app/api/admin/upload-signed-url) gates on
 * isAdminEmail and only allows the avatars / pro-portfolio buckets.
 *
 * Returns the publicly-readable URL the caller should store on the form
 * state and ultimately persist on the DB row.
 */

export type AdminUploadBucket = "avatars" | "pro-portfolio";

export interface AdminUploadOptions {
  bucket: AdminUploadBucket;
  targetUserId: string;
  file: File;
}

export async function adminUploadFile(opts: AdminUploadOptions): Promise<string> {
  const stem = opts.file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
  const ext = opts.file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `${Date.now()}-${stem}.${ext}`;

  const reqRes = await fetch("/api/admin/upload-signed-url", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      bucket: opts.bucket,
      target_user_id: opts.targetUserId,
      filename,
    }),
  });
  if (!reqRes.ok) {
    let msg = `Signed URL request failed (${reqRes.status})`;
    try {
      const j = (await reqRes.json()) as { error?: string };
      if (j.error) msg = j.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  const { signedUrl, publicUrl } = (await reqRes.json()) as {
    signedUrl: string;
    publicUrl: string;
  };

  const upRes = await fetch(signedUrl, {
    method: "PUT",
    headers: { "content-type": opts.file.type || "application/octet-stream" },
    body: opts.file,
  });
  if (!upRes.ok) {
    throw new Error(`Upload failed (${upRes.status})`);
  }
  return publicUrl;
}
