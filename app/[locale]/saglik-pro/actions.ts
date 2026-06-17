"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/supabase/server";
import { isHealthVerticalEnabled } from "@/lib/saglik/flags";
import type { Locale } from "@/i18n/routing";
import {
  profileSchema,
  licenseSchema,
  locationSchema,
  serviceSchema,
  scheduleSetSchema,
  settingsSchema,
} from "@/lib/saglik/provider-validation";
import {
  upsertProfile,
  setLicense,
  upsertLocation,
  deleteLocation,
  upsertService,
  deleteService,
  setSchedules,
  upsertSettings,
  submitForReview,
  getOwnProvider,
  type OwnProvider,
  type ProviderRpcError,
} from "@/lib/saglik/provider";

/**
 * Glatko Sağlık — H7a provider mutation server actions.
 *
 * THE single write path for provider data. Every action:
 *   1. flag-guards (no-op surface when the vertical is off),
 *   2. reads the REAL identity from the auth cookie (createClient().auth.getUser()) —
 *      the client NEVER supplies user_id/provider_id; we inject user.id ourselves,
 *   3. zod-validates the payload (the migration-077 RPC re-checks ownership + ranges),
 *   4. calls the owner-checked service-role RPC via lib/saglik/provider.ts,
 *   5. revalidates the affected pages.
 *
 * Results are discriminated unions ({ok:true} | {ok:false, error}) so the client
 * renders inline errors without throwing.
 */

export type ActionResult<T = Record<never, never>> =
  | ({ ok: true } & T)
  | { ok: false; error: ProviderRpcError | "UNAUTHORIZED" | "VALIDATION" };

async function requireUserId(): Promise<string | null> {
  if (!isHealthVerticalEnabled()) return null;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

function revalidateProviderTree() {
  // Locale-prefixed routes share these path prefixes; "layout" scope covers all 9.
  revalidatePath("/[locale]/saglik-pro", "layout");
}

// ─────────────────────────────────────────────────────────────────────────────
// Read (own draft) — used by page Server Components AND for action refresh.
// ─────────────────────────────────────────────────────────────────────────────

export async function loadOwnProvider(
  locale: Locale,
): Promise<{ ok: true; provider: OwnProvider | null } | { ok: false }> {
  const userId = await requireUserId();
  if (!userId) return { ok: false };
  const provider = await getOwnProvider(userId, locale);
  return { ok: true, provider };
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — profile
// ─────────────────────────────────────────────────────────────────────────────

export async function saveProfile(
  raw: unknown,
): Promise<ActionResult<{ providerId: string; slug: string }>> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "UNAUTHORIZED" };
  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "VALIDATION" };
  const r = await upsertProfile(userId, {
    providerType: parsed.data.providerType,
    fullName: parsed.data.fullName,
    title: parsed.data.title ?? null,
    bio: parsed.data.bio,
    photoUrl: parsed.data.photoUrl ?? null,
    languages: parsed.data.languages,
    specialtySlugs: parsed.data.specialtySlugs,
  });
  if (!r.ok) return { ok: false, error: r.code };
  revalidateProviderTree();
  return { ok: true, providerId: r.providerId, slug: r.slug };
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — license
// ─────────────────────────────────────────────────────────────────────────────

export async function saveLicense(raw: unknown): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "UNAUTHORIZED" };
  const parsed = licenseSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "VALIDATION" };
  // Defense-in-depth: the file path (if any) must live under the caller's folder.
  if (parsed.data.filePath && !parsed.data.filePath.startsWith(`${userId}/`)) {
    return { ok: false, error: "INVALID_FILE_PATH" };
  }
  const r = await setLicense(userId, {
    licenseNumber: parsed.data.licenseNumber ?? null,
    chamber: parsed.data.chamber ?? null,
    filePath: parsed.data.filePath ?? null,
  });
  if (!r.ok) return { ok: false, error: r.code };
  revalidateProviderTree();
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — locations
// ─────────────────────────────────────────────────────────────────────────────

export async function saveLocation(
  raw: unknown,
): Promise<ActionResult<{ locationId: string }>> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "UNAUTHORIZED" };
  const parsed = locationSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "VALIDATION" };
  const r = await upsertLocation(userId, {
    locationId: parsed.data.locationId ?? null,
    label: parsed.data.label,
    address: parsed.data.address,
    city: parsed.data.city,
    lat: parsed.data.lat ?? null,
    lng: parsed.data.lng ?? null,
  });
  if (!r.ok) return { ok: false, error: r.code };
  revalidateProviderTree();
  return { ok: true, locationId: r.locationId };
}

export async function removeLocation(locationId: string): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "UNAUTHORIZED" };
  if (!/^[0-9a-f-]{36}$/i.test(locationId)) return { ok: false, error: "VALIDATION" };
  const r = await deleteLocation(userId, locationId);
  if (!r.ok) return { ok: false, error: r.code };
  revalidateProviderTree();
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 4 — services
// ─────────────────────────────────────────────────────────────────────────────

export async function saveService(
  raw: unknown,
): Promise<ActionResult<{ serviceId: string }>> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "UNAUTHORIZED" };
  const parsed = serviceSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "VALIDATION" };
  const r = await upsertService(userId, {
    serviceId: parsed.data.serviceId ?? null,
    name: parsed.data.name,
    durationMin: parsed.data.durationMin,
    priceEur: parsed.data.priceEur ?? null,
    mode: parsed.data.mode,
    isActive: parsed.data.isActive,
  });
  if (!r.ok) return { ok: false, error: r.code };
  revalidateProviderTree();
  return { ok: true, serviceId: r.serviceId };
}

export async function removeService(serviceId: string): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "UNAUTHORIZED" };
  if (!/^[0-9a-f-]{36}$/i.test(serviceId)) return { ok: false, error: "VALIDATION" };
  const r = await deleteService(userId, serviceId);
  if (!r.ok) return { ok: false, error: r.code };
  revalidateProviderTree();
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 5 / takvim — weekly schedule rows for one location
// ─────────────────────────────────────────────────────────────────────────────

export async function saveSchedules(
  raw: unknown,
): Promise<ActionResult<{ count: number }>> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "UNAUTHORIZED" };
  const parsed = scheduleSetSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "VALIDATION" };
  const r = await setSchedules(userId, {
    locationId: parsed.data.locationId,
    rows: parsed.data.rows,
  });
  if (!r.ok) return { ok: false, error: r.code };
  revalidateProviderTree();
  return { ok: true, count: r.count };
}

// ─────────────────────────────────────────────────────────────────────────────
// ayarlar — provider_settings
// ─────────────────────────────────────────────────────────────────────────────

export async function saveSettings(raw: unknown): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "UNAUTHORIZED" };
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "VALIDATION" };
  const r = await upsertSettings(userId, {
    bufferMin: parsed.data.bufferMin,
    minNoticeMin: parsed.data.minNoticeMin,
    horizonDays: parsed.data.horizonDays,
    dailyCap: parsed.data.dailyCap ?? null,
    slotGridMin: parsed.data.slotGridMin,
  });
  if (!r.ok) return { ok: false, error: r.code };
  revalidateProviderTree();
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Wizard finalize
// ─────────────────────────────────────────────────────────────────────────────

export async function finalizeOnboarding(): Promise<
  | { ok: true; providerId: string; slug: string }
  | { ok: false; missing: string[] }
  | { ok: false; error: ProviderRpcError | "UNAUTHORIZED" }
> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "UNAUTHORIZED" };
  const r = await submitForReview(userId);
  if (r.ok) {
    revalidateProviderTree();
    return { ok: true, providerId: r.providerId, slug: r.slug };
  }
  if ("missing" in r) return { ok: false, missing: r.missing };
  return { ok: false, error: r.code };
}
