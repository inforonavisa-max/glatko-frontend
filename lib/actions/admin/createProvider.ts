"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, createClient } from "@/supabase/server";
import { normalizePhoneE164 } from "@/lib/phone/normalize";
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

/**
 * G-ADMIN-PROVIDER-CREATE-01 — admin manual provider onboarding.
 *
 * Replaces the docs/operations/founding-majstor-template.sql copy-paste
 * flow. Single entry point for both flows:
 *   - mode="promote": existing user_id → upgrade to pro
 *   - mode="create":  brand-new email + admin-set password → user + pro
 *
 * Both flows resolve a user_id + expected_email and then call the SAME atomic
 * RPC glatko_admin_create_provider (migrations 048 + 065). The RPC does all
 * the writes in one transaction (profiles UPDATE + glatko_professional_profiles
 * INSERT + glatko_pro_services INSERT) with its own pre-flight guards; this
 * action is the orchestration around it: auth gate, Zod parse, account
 * creation in create-mode, the user lookup in promote-mode, RPC call, audit
 * log, cache revalidation.
 *
 * Phone-OTP note (G-ADMIN-PROMOTE-PHONE-OTP): a phone-only signup has a NULL
 * email in BOTH auth.users and profiles. The promote lookup therefore resolves
 * the user by id (never by email) and the RPC (migration 065) checks profile
 * existence by row, not by email-null, and sources contact from auth.users.
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

  // G-PHONE: authoritative E.164 normalization (libphonenumber-js, ME default) —
  // also lets the admin enter a bare local number (067…) instead of forcing the
  // explicit +382 the regex required. (Admin UI is TR-hardcoded per policy.)
  const adminPhone = normalizePhoneE164(input.phone);
  if (!adminPhone.ok) {
    return {
      success: false,
      error: "Geçerli bir telefon numarası girin (ör. +382 67 123 456).",
    };
  }
  input.phone = adminPhone.e164;

  const admin = createAdminClient();

  // ── Resolve user_id + expected_email by mode ───────────────────────
  let userId: string;
  let expectedEmail: string;

  if (input.mode === "promote") {
    userId = input.promote_user_id;

    // Resolve the auth user by id — NEVER by email. A phone-OTP signup has a
    // NULL email in auth.users AND profiles, so an email lookup spuriously
    // "not found"s a user that exists. The id is authoritative (it comes from
    // the /admin/users/[id] route). Existence is checked on the user, not on
    // its email.
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
    // Empty when the user has no email (phone-OTP) → the RPC skips its
    // email-match guard. For an email user this is their email and the RPC
    // confirms it matches profiles.email.
    expectedEmail = authData.user.email ?? "";
  } else {
    // mode === "create"
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
    expectedEmail = input.new_email;

    // The handle_new_user trigger (migration 047) creates the profiles
    // row synchronously inside the same INSERT, so by the time the RPC
    // runs below, profiles will be populated. No race window.
  }

  // ── Build RPC payload (identical shape for both modes) ─────────────
  // is_verified is passed through from the form's own toggle (the RPC honors
  // it independently of verification_status), so promote and create persist
  // identical data for identical input.
  const payload = {
    user_id: userId,
    expected_email: expectedEmail,
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

  // ── Call the atomic RPC ────────────────────────────────────────────
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

    // If we created an auth user (create-mode) but the pro write failed, the
    // auth user is now orphaned. Compensate by deleting it so the admin can
    // retry with the same email; the trigger-created profiles row cascades via
    // the auth.users.id FK. Promote-mode never created the user, so leave it.
    if (input.mode === "create") {
      try {
        await admin.auth.admin.deleteUser(userId);
      } catch (cleanupErr) {
        glatkoCaptureException(cleanupErr, {
          module: "admin-create-provider",
          op: "cleanup-auth-user",
          userId,
        });
      }
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
    // RPC-level rejection (e.g. DUPLICATE_SLUG, DUPLICATE_PRO, EMAIL_MISMATCH).
    // Roll back the just-created auth user in create-mode so the admin can fix
    // the input and retry; promote-mode has nothing to roll back.
    if (input.mode === "create") {
      try {
        await admin.auth.admin.deleteUser(userId);
      } catch (cleanupErr) {
        glatkoCaptureException(cleanupErr, {
          module: "admin-create-provider",
          op: "cleanup-auth-user-rpc-reject",
          userId,
        });
      }
    }

    return {
      success: false,
      error: result.error ?? "RPC rejected the payload",
      code: result.code,
    };
  }

  // ── Audit log (best-effort) ────────────────────────────────────────
  await logAdminAction({
    actionType: "pro_create_admin",
    targetTable: "glatko_professional_profiles",
    targetId: userId,
    payload: {
      mode: input.mode,
      slug: input.slug,
      services_count: input.services.length,
      is_founding_provider: input.is_founding_provider,
      founding_number: result.founding_number ?? null,
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
    foundingNumber: result.founding_number ?? null,
    redirectUrl: `/provider/${userId}`,
  };
}
