"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, createClient } from "@/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin/audit";
import {
  adminProviderCreateSchema,
  type AdminProviderCreateInput,
} from "@/lib/validations/admin/provider";
import { glatkoCaptureException } from "@/lib/sentry/glatko-capture";

interface CreateProviderResult {
  success: boolean;
  error?: string;
  code?: string;
  providerId?: string;
  foundingNumber?: number | null;
  redirectUrl?: string;
}

async function requireAdmin(): Promise<
  | { ok: true; userId: string; email: string }
  | { ok: false; error: string }
> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return { ok: false, error: "Unauthorized" };
  if (!isAdminEmail(user.email)) return { ok: false, error: "Forbidden" };
  return { ok: true, userId: user.id, email: user.email };
}

type PromoteInput = Extract<AdminProviderCreateInput, { mode: "promote" }>;

type PromoteWriteResult =
  | { success: true; providerId: string; foundingNumber: number | null; slug: string }
  | { success: false; error: string; code?: string };

/**
 * G-ADMIN-PROMOTE-PHONE-OTP — direct (non-RPC) write for the promote flow.
 *
 * The atomic glatko_admin_create_provider RPC (migration 048) reads
 * profiles.email and treats a NULL email as "Profile not found", which
 * permanently blocks phone-OTP users: a phone-only signup legitimately has
 * NULL email in BOTH auth.users and profiles. Relaxing the RPC needs a prod
 * migration, and preview shares the prod database — so to keep the fix
 * code-only and prod-safe pre-launch, the promote path writes the rows here.
 *
 * Mirrors the RPC's column logic: slug-collision suffixing (the slug UNIQUE
 * index is the final guard), founding numbering (the partial unique index
 * `glatko_pp_founding_number_unique` guards the rare concurrent race), and
 * verified_at derivation. No multi-statement transaction is available outside
 * the RPC, so a failed services insert compensates by deleting the just-
 * created pro row, leaving nothing half-written for the admin to clean up.
 *
 * Caller guarantees: the auth user exists and has no existing pro profile.
 */
async function writeProviderProfileForPromote(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  input: PromoteInput,
  resolvedPhone: string,
): Promise<PromoteWriteResult> {
  // ── Slug collision → numeric suffix ──────────────────────────────────
  // The form derives the slug from business_name; if it (or a `<slug>-N`
  // variant) is taken, pick the next free suffix. A race past this check is
  // still caught by the slug UNIQUE index and surfaced as UNIQUE_VIOLATION.
  const baseSlug = input.slug;
  let slug = baseSlug;
  const { data: takenRows } = await admin
    .from("glatko_professional_profiles")
    .select("slug")
    .ilike("slug", `${baseSlug}%`);
  const taken = new Set((takenRows ?? []).map((r) => r.slug as string));
  if (taken.has(slug)) {
    let n = 2;
    while (taken.has(`${baseSlug}-${n}`)) n += 1;
    slug = `${baseSlug}-${n}`;
  }

  // ── Founding number (race-guarded by the partial unique index) ───────
  let foundingNumber: number | null = null;
  if (input.is_founding_provider) {
    const { data: maxRow } = await admin
      .from("glatko_professional_profiles")
      .select("founding_provider_number")
      .eq("is_founding_provider", true)
      .order("founding_provider_number", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();
    foundingNumber = (maxRow?.founding_provider_number ?? 0) + 1;
  }

  const nowIso = new Date().toISOString();
  // verification_status is the source of truth for the verified flag.
  const isVerified = input.verification_status === "approved";

  // ── UPSERT the professional profile (CREATE when the row is missing) ─
  const { error: ppErr } = await admin
    .from("glatko_professional_profiles")
    .upsert(
      {
        id: userId,
        business_name: input.business_name || null,
        slug,
        phone: resolvedPhone || null,
        bio: input.bio || null,
        hourly_rate_min: input.hourly_rate_min ?? null,
        hourly_rate_max: input.hourly_rate_max ?? null,
        years_experience: input.years_experience ?? null,
        location_city: input.location_city || null,
        service_radius_km: input.service_radius_km,
        languages: input.languages,
        is_verified: isVerified,
        verified_at: isVerified ? nowIso : null,
        is_active: input.is_active,
        verification_status: input.verification_status,
        verification_tier: input.verification_tier,
        insurance_status: "none",
        portfolio_images: input.portfolio_images ?? [],
        is_founding_provider: input.is_founding_provider,
        founding_provider_at: input.is_founding_provider ? nowIso : null,
        founding_provider_number: foundingNumber,
      },
      { onConflict: "id" },
    );
  if (ppErr) {
    glatkoCaptureException(ppErr, {
      module: "admin-create-provider",
      op: "promote-upsert-profile",
      userId,
    });
    return {
      success: false,
      error: ppErr.message,
      code: ppErr.code === "23505" ? "UNIQUE_VIOLATION" : "PROFILE_WRITE_FAILED",
    };
  }

  // ── Services (≥1, exactly one primary — enforced by the Zod schema) ──
  const { error: svcErr } = await admin.from("glatko_pro_services").insert(
    input.services.map((s) => ({
      professional_id: userId,
      category_id: s.category_id,
      is_primary: s.is_primary,
    })),
  );
  if (svcErr) {
    glatkoCaptureException(svcErr, {
      module: "admin-create-provider",
      op: "promote-insert-services",
      userId,
    });
    // Compensate: no transaction outside the RPC, so drop the pro row we
    // just created rather than leave a serviceless provider behind.
    await admin.from("glatko_professional_profiles").delete().eq("id", userId);
    return {
      success: false,
      error: `Service insert failed: ${svcErr.message}`,
      code: "SERVICE_WRITE_FAILED",
    };
  }

  // ── Refresh profiles contact (best-effort; only overwrite non-empty) ─
  const profilePatch: Record<string, unknown> = { updated_at: nowIso };
  if (input.full_name) profilePatch.full_name = input.full_name;
  if (resolvedPhone) profilePatch.phone = resolvedPhone;
  if (input.city_display) profilePatch.city = input.city_display;
  if (input.preferred_locale) profilePatch.preferred_locale = input.preferred_locale;
  if (input.avatar_url) profilePatch.avatar_url = input.avatar_url;
  const { error: profErr } = await admin
    .from("profiles")
    .update(profilePatch)
    .eq("id", userId);
  if (profErr) {
    // Non-fatal: the pro profile is the source of truth for the public page.
    glatkoCaptureException(profErr, {
      module: "admin-create-provider",
      op: "promote-update-profile",
      userId,
    });
  }

  return { success: true, providerId: userId, foundingNumber, slug };
}

/**
 * G-ADMIN-PROVIDER-CREATE-01 — admin manual provider onboarding.
 *
 * Replaces the docs/operations/founding-majstor-template.sql copy-paste
 * flow. Single entry point for both flows:
 *   - mode="promote": existing user_id → upgrade to pro
 *   - mode="create":  brand-new email + admin-set password → user + pro
 *
 * The atomic write happens inside the glatko_admin_create_provider RPC
 * (migration 048). This action is the orchestration around it: auth gate,
 * Zod parse, account creation in create-mode, RPC call, audit log,
 * cache revalidation.
 *
 * Audit log is best-effort (lib/admin/audit.ts); a failure to log never
 * blocks the success path.
 */
export async function createProviderAction(
  rawInput: unknown,
): Promise<CreateProviderResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = adminProviderCreateSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; "),
      code: "VALIDATION",
    };
  }
  const input: AdminProviderCreateInput = parsed.data;

  const admin = createAdminClient();

  let userId: string;
  let writtenSlug = input.slug;
  let foundingNumber: number | null = null;

  if (input.mode === "promote") {
    // ── PROMOTE: resolve by id, write directly (bypass the RPC) ────────
    // Look the auth user up by id — NEVER by email. Phone-OTP signups have a
    // NULL email in auth.users AND profiles, so an email lookup spuriously
    // "not found"s a user that exists (the original misleading bug). The id
    // is authoritative and comes straight from the /admin/users/[id] route.
    userId = input.promote_user_id;

    const { data: authData, error: authErr } =
      await admin.auth.admin.getUserById(userId);
    if (authErr) {
      return {
        success: false,
        error: `Failed to load auth user ${userId}: ${authErr.message}`,
        code: "AUTH_LOOKUP_FAILED",
      };
    }
    if (!authData?.user) {
      return {
        success: false,
        error: `auth user not found for id ${userId}`,
        code: "USER_NOT_FOUND",
      };
    }
    const authUser = authData.user;

    // Contact resolves form → auth → profiles. The profiles row may be
    // sparse: phone-OTP signups have NULL email AND NULL phone there — the
    // number lives only on auth.users.phone.
    const { data: profile } = await admin
      .from("profiles")
      .select("email, phone, full_name")
      .eq("id", userId)
      .maybeSingle();
    const resolvedPhone = input.phone || authUser.phone || profile?.phone || "";

    // Refuse to clobber an existing pro profile (friendly early message; the
    // upsert would otherwise overwrite it).
    const { data: existingPro } = await admin
      .from("glatko_professional_profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    if (existingPro) {
      return {
        success: false,
        error: "Bu kullanıcı zaten bir profesyonel profile sahip.",
        code: "DUPLICATE_PRO",
      };
    }

    const write = await writeProviderProfileForPromote(
      admin,
      userId,
      input,
      resolvedPhone,
    );
    if (!write.success) {
      return { success: false, error: write.error, code: write.code };
    }
    writtenSlug = write.slug;
    foundingNumber = write.foundingNumber;
  } else {
    // ── CREATE: brand-new account + atomic RPC (unchanged path) ────────
    const { data: created, error: createErr } =
      await admin.auth.admin.createUser({
        email: input.new_email,
        password: input.new_password,
        email_confirm: true,
        user_metadata: { full_name: input.full_name },
      });
    if (createErr || !created?.user) {
      return {
        success: false,
        error: createErr?.message ?? "Auth user creation failed",
        code: "AUTH_CREATE_FAILED",
      };
    }
    userId = created.user.id;

    // The handle_new_user trigger (migration 047) creates the profiles
    // row synchronously inside the same INSERT, so by the time the RPC
    // runs below, profiles will be populated. No race window.
    const payload = {
      user_id: userId,
      expected_email: input.new_email,
      full_name: input.full_name,
      phone: input.phone,
      city_display: input.city_display,
      preferred_locale: input.preferred_locale,
      avatar_url: input.avatar_url || "",

      business_name: input.business_name,
      slug: input.slug,
      bio: input.bio || "",
      location_city: input.location_city,
      hourly_rate_min: input.hourly_rate_min ?? "",
      hourly_rate_max: input.hourly_rate_max ?? "",
      years_experience: input.years_experience ?? "",
      service_radius_km: input.service_radius_km,
      languages: input.languages,
      is_verified: input.is_verified,
      verification_status: input.verification_status,
      verification_tier: input.verification_tier,
      is_active: input.is_active,
      is_founding_provider: input.is_founding_provider,
      portfolio_images: input.portfolio_images ?? [],

      services: input.services,
    };

    const { data: rpcResult, error: rpcErr } = await admin.rpc(
      "glatko_admin_create_provider",
      { payload },
    );

    if (rpcErr) {
      glatkoCaptureException(rpcErr, {
        module: "admin-create-provider",
        mode: input.mode,
        userId,
      });

      // The auth user we just created is now orphaned (the pro insert
      // failed). Compensate by deleting it so the admin can retry with the
      // same email; the trigger-created profiles row cascades via FK.
      try {
        await admin.auth.admin.deleteUser(userId);
      } catch (cleanupErr) {
        glatkoCaptureException(cleanupErr, {
          module: "admin-create-provider",
          op: "cleanup-auth-user",
          userId,
        });
      }

      return { success: false, error: rpcErr.message, code: "RPC_FAILED" };
    }

    const result = rpcResult as {
      success: boolean;
      error?: string;
      code?: string;
      provider_id?: string;
      founding_number?: number | null;
    };

    if (!result.success) {
      // RPC-level rejection (e.g. DUPLICATE_SLUG). Roll back the just-created
      // auth user so the admin can fix the input and retry.
      try {
        await admin.auth.admin.deleteUser(userId);
      } catch (cleanupErr) {
        glatkoCaptureException(cleanupErr, {
          module: "admin-create-provider",
          op: "cleanup-auth-user-rpc-reject",
          userId,
        });
      }

      return {
        success: false,
        error: result.error ?? "RPC rejected the payload",
        code: result.code,
      };
    }

    foundingNumber = result.founding_number ?? null;
  }

  // ── Audit log (best-effort) ────────────────────────────────────────
  await logAdminAction({
    actionType: "pro_create_admin",
    targetTable: "glatko_professional_profiles",
    targetId: userId,
    payload: {
      mode: input.mode,
      slug: writtenSlug,
      services_count: input.services.length,
      is_founding_provider: input.is_founding_provider,
      founding_number: foundingNumber,
      portfolio_count: input.portfolio_images?.length ?? 0,
    },
    reason: input.mode === "create" ? "Created new auth user" : "Promoted existing user",
  });

  // ── Cache revalidation ─────────────────────────────────────────────
  revalidatePath(`/[locale]/admin/users`, "page");
  revalidatePath(`/[locale]/admin/users/${userId}`, "page");
  revalidatePath(`/[locale]/admin/providers`, "page");
  revalidatePath(`/[locale]/provider/${userId}`, "page");

  return {
    success: true,
    providerId: userId,
    foundingNumber,
    redirectUrl: `/provider/${userId}`,
  };
}
