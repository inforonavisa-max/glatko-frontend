import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/supabase/server";
import { isAdminEmail } from "@/lib/admin";

/**
 * G-ADMIN-PROVIDER-CREATE-01 — admin signed-URL upload endpoint.
 *
 * Why this exists: the bucket-side RLS policies on `avatars` and
 * `pro-portfolio` gate writes to the file owner (auth.uid() = user_id in
 * the path). When the admin uploads a photo on BEHALF of another user,
 * the admin's auth.uid() doesn't match the path's user_id, so the RLS
 * blocks it.
 *
 * The fix: the admin hits this endpoint, we verify they're an admin via
 * isAdminEmail(), and we mint a signed upload URL using the service-role
 * client. The signed URL bypasses RLS — but only briefly, and only for
 * the exact path we cement in.
 *
 * Bucket allowlist below is intentional. Don't extend it without a
 * security review; admin should not be able to write to arbitrary
 * buckets via this endpoint.
 */

const ALLOWED_BUCKETS = new Set(["avatars", "pro-portfolio"]);
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

interface RequestBody {
  bucket?: string;
  target_user_id?: string;
  filename?: string;
}

export async function POST(req: Request) {
  // ── Auth gate ──────────────────────────────────────────────────────
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ── Parse + validate input ─────────────────────────────────────────
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const bucket = (body.bucket ?? "").trim();
  const targetUserId = (body.target_user_id ?? "").trim();
  const filename = (body.filename ?? "").trim();

  if (!ALLOWED_BUCKETS.has(bucket)) {
    return NextResponse.json(
      { error: `Bucket not allowed: ${bucket}` },
      { status: 400 },
    );
  }
  if (!/^[0-9a-f-]{36}$/i.test(targetUserId)) {
    return NextResponse.json(
      { error: "target_user_id must be a UUID" },
      { status: 400 },
    );
  }

  const ext = filename.toLowerCase().split(".").pop() ?? "";
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json(
      { error: `File extension not allowed: .${ext}` },
      { status: 400 },
    );
  }

  // Sanitize filename: keep only alnum/hyphen/underscore/dot, then
  // re-attach the validated extension. Avoids path traversal and weird
  // S3 quirks.
  const stem = filename
    .slice(0, filename.lastIndexOf("."))
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 80) || "file";
  const safeFilename = `${stem}.${ext}`;
  const path = `${targetUserId}/${safeFilename}`;

  // ── Mint signed upload URL ─────────────────────────────────────────
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(bucket)
    .createSignedUploadUrl(path, { upsert: true });

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Could not create signed URL" },
      { status: 500 },
    );
  }

  const {
    data: { publicUrl },
  } = admin.storage.from(bucket).getPublicUrl(path);

  return NextResponse.json({
    signedUrl: data.signedUrl,
    token: data.token,
    path,
    publicUrl,
    bucket,
  });
}
