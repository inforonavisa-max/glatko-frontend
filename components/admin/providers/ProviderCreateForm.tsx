"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
  businessNameToSlug,
  type SupportedLocale,
} from "@/lib/validations/admin/provider";
import { createProviderAction } from "@/lib/actions/admin/createProvider";
import { searchUsersForPromoteAction } from "@/lib/actions/admin/searchUsers";

import { ProviderUserSearch, type UserSearchRow } from "./ProviderUserSearch";
import { ProviderAvatarUpload } from "./ProviderAvatarUpload";
import { ProviderPhotoUpload } from "./ProviderPhotoUpload";
import {
  ProviderCategorySelect,
  type CategoryOption,
  type SelectedService,
} from "./ProviderCategorySelect";
import { ProviderLanguageSelect } from "./ProviderLanguageSelect";
import { ProviderServiceArea } from "./ProviderServiceArea";
import { ProviderBioField } from "./ProviderBioField";
import { ProviderVerificationFields } from "./ProviderVerificationFields";
import { ProviderCreateAuthFields } from "./ProviderCreateAuthFields";
import {
  FormSection,
  FormField,
  formInputCls,
} from "./ProviderFormPrimitives";

export type FormMode = "promote" | "create";

export interface PrefillUser {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  preferred_locale: string | null;
  avatar_url: string | null;
}

interface Props {
  mode: FormMode;
  prefillUser?: PrefillUser;
  categories: CategoryOption[];
}

interface FormState {
  promote_user_id: string | null;
  prefill_email: string | null;
  new_email: string;
  new_password: string;

  full_name: string;
  phone: string;
  city_display: string;
  location_city: string;
  preferred_locale: SupportedLocale;
  avatar_url: string | null;

  business_name: string;
  slug: string;
  slug_overridden: boolean;
  bio: string;
  hourly_rate_min: string;
  hourly_rate_max: string;
  years_experience: string;
  service_radius_km: number;
  languages: SupportedLocale[];

  is_verified: boolean;
  verification_status: "pending" | "approved" | "rejected";
  verification_tier: "basic" | "business" | "professional";
  is_active: boolean;
  is_founding_provider: boolean;

  services: SelectedService[];
  portfolio_images: string[];
}

function makeInitial(props: Props): FormState {
  const u = props.prefillUser;
  return {
    promote_user_id: u?.id ?? null,
    prefill_email: u?.email ?? null,
    new_email: "",
    new_password: "",
    full_name: u?.full_name ?? "",
    phone: u?.phone ?? "",
    city_display: u?.city ?? "",
    location_city: "",
    preferred_locale:
      ((u?.preferred_locale as SupportedLocale | undefined) ?? "me") as SupportedLocale,
    avatar_url: u?.avatar_url ?? null,
    business_name: "",
    slug: "",
    slug_overridden: false,
    bio: "",
    hourly_rate_min: "",
    hourly_rate_max: "",
    years_experience: "",
    service_radius_km: 25,
    languages: ["me", "sr"],
    is_verified: true,
    verification_status: "approved",
    verification_tier: "basic",
    is_active: true,
    is_founding_provider: false,
    services: [],
    portfolio_images: [],
  };
}

export function ProviderCreateForm(props: Props) {
  const [state, setState] = useState<FormState>(() => makeInitial(props));
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, startSubmit] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  // Auto-generate slug from business_name unless admin overrode it.
  useEffect(() => {
    if (state.slug_overridden) return;
    const generated = businessNameToSlug(state.business_name);
    setState((s) => (s.slug === generated ? s : { ...s, slug: generated }));
  }, [state.business_name, state.slug_overridden]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function onUserSelected(uid: string | null, row: UserSearchRow | null) {
    if (uid && row) {
      setState((s) => ({
        ...s,
        promote_user_id: uid,
        prefill_email: row.email,
        full_name: row.full_name ?? s.full_name,
      }));
    } else {
      setState((s) => ({ ...s, promote_user_id: null, prefill_email: null }));
    }
  }

  function buildPayload(): unknown {
    const base = {
      full_name: state.full_name,
      phone: state.phone,
      city_display: state.city_display,
      preferred_locale: state.preferred_locale,
      business_name: state.business_name,
      slug: state.slug,
      location_city: state.location_city,
      bio: state.bio,
      hourly_rate_min: state.hourly_rate_min ? Number(state.hourly_rate_min) : undefined,
      hourly_rate_max: state.hourly_rate_max ? Number(state.hourly_rate_max) : undefined,
      years_experience: state.years_experience ? Number(state.years_experience) : undefined,
      service_radius_km: state.service_radius_km,
      languages: state.languages,
      is_verified: state.is_verified,
      verification_status: state.verification_status,
      verification_tier: state.verification_tier,
      is_active: state.is_active,
      is_founding_provider: state.is_founding_provider,
      services: state.services,
      avatar_url: state.avatar_url ?? "",
      portfolio_images: state.portfolio_images,
    };
    return props.mode === "promote"
      ? { mode: "promote" as const, promote_user_id: state.promote_user_id ?? "", ...base }
      : { mode: "create" as const, new_email: state.new_email, new_password: state.new_password, ...base };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (props.mode === "promote" && !state.promote_user_id) {
      setSubmitError("Önce bir kullanıcı seç.");
      return;
    }
    if (props.mode === "create") {
      if (!state.new_email || !state.new_password) {
        setSubmitError("Email ve şifre zorunlu.");
        return;
      }
    }
    if (state.services.length === 0) {
      setSubmitError("En az 1 hizmet kategorisi seç.");
      return;
    }
    if (state.services.filter((s) => s.is_primary).length !== 1) {
      setSubmitError("Tam olarak 1 birincil kategori olmalı.");
      return;
    }

    startSubmit(async () => {
      const result = await createProviderAction(buildPayload());
      if (result.success) {
        toast.success(
          result.foundingNumber != null
            ? `Provider yaratıldı, Founding #${result.foundingNumber} olarak işaretlendi`
            : "Provider yaratıldı",
        );
        if (result.redirectUrl) router.push(result.redirectUrl);
      } else {
        setSubmitError(result.error ?? "Bilinmeyen hata");
        toast.error(result.error ?? "Bilinmeyen hata");
      }
    });
  }

  const submitDisabled =
    submitting ||
    !state.business_name ||
    !state.slug ||
    !state.phone ||
    !state.city_display ||
    !state.location_city ||
    state.services.length === 0;

  // Photo uploads need a real target_user_id. In create-mode the UID
  // is only known after submit, so photos are added in a follow-up edit.
  const targetUidForPhotos = useMemo(
    () => (props.mode === "promote" ? state.promote_user_id ?? "" : ""),
    [props.mode, state.promote_user_id],
  );

  return (
    <form onSubmit={onSubmit} className="space-y-8 pb-12">
      {/* Mode-specific top */}
      {props.mode === "promote" ? (
        <FormSection title="1. Kullanıcı seç" badge="Promote akışı">
          {props.prefillUser ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.03]">
              <p className="font-medium text-gray-900 dark:text-white">
                {props.prefillUser.full_name ?? "(adsız)"}
              </p>
              <p className="text-sm text-gray-500 dark:text-white/50">
                {props.prefillUser.email}
              </p>
            </div>
          ) : (
            <ProviderUserSearch
              value={state.promote_user_id}
              onChange={onUserSelected}
              search={searchUsersForPromoteAction}
            />
          )}
        </FormSection>
      ) : (
        <FormSection title="1. Yeni hesap" badge="Create akışı">
          <ProviderCreateAuthFields
            email={state.new_email}
            onEmailChange={(v) => update("new_email", v)}
            password={state.new_password}
            onPasswordChange={(v) => update("new_password", v)}
            showPassword={showPassword}
            onShowPasswordChange={setShowPassword}
          />
        </FormSection>
      )}

      <FormSection title="2. Profil bilgileri">
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Ad-soyad">
            <input
              type="text"
              required
              value={state.full_name}
              onChange={(e) => update("full_name", e.target.value)}
              className={formInputCls}
            />
          </FormField>
          <FormField label="Telefon">
            <input
              type="tel"
              required
              value={state.phone}
              onChange={(e) => update("phone", e.target.value)}
              className={formInputCls}
              placeholder="+382 69 868 069"
            />
          </FormField>
          <FormField label="Tercih edilen dil">
            <select
              value={state.preferred_locale}
              onChange={(e) => update("preferred_locale", e.target.value as SupportedLocale)}
              className={formInputCls}
            >
              <option value="me">Crnogorski</option>
              <option value="sr">Srpski</option>
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
              <option value="ru">Русский</option>
              <option value="uk">Українська</option>
              <option value="ar">العربية</option>
            </select>
          </FormField>
        </div>
      </FormSection>

      <FormSection title="3. Hizmet alanı">
        <ProviderServiceArea
          cityDisplay={state.city_display}
          onCityDisplayChange={(v) => update("city_display", v)}
          locationCity={state.location_city}
          onLocationCityChange={(v) => update("location_city", v)}
          serviceRadiusKm={state.service_radius_km}
          onServiceRadiusChange={(v) => update("service_radius_km", v)}
        />
      </FormSection>

      <FormSection title="4. Pro kimliği">
        <div className="space-y-3">
          <FormField label="İşletme adı">
            <input
              type="text"
              required
              value={state.business_name}
              onChange={(e) => update("business_name", e.target.value)}
              className={formInputCls}
              placeholder="Miloš Golubović"
            />
          </FormField>
          <FormField
            label="Slug"
            hint="business_name'den otomatik üretiliyor. Override etmek için 'Düzenle'."
          >
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={state.slug}
                disabled={!state.slug_overridden}
                onChange={(e) =>
                  update(
                    "slug",
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                  )
                }
                className={cn(formInputCls, "font-mono text-sm")}
              />
              <button
                type="button"
                onClick={() => update("slug_overridden", !state.slug_overridden)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs",
                  state.slug_overridden
                    ? "border-teal-500/40 bg-teal-500/5 text-teal-700 dark:text-teal-300"
                    : "border-gray-200 text-gray-600 hover:border-teal-500/30 dark:border-white/[0.08] dark:text-white/70",
                )}
              >
                <Pencil className="h-3.5 w-3.5" />
                {state.slug_overridden ? "Otomatik" : "Düzenle"}
              </button>
            </div>
          </FormField>
          <FormField label="Bio (opsiyonel)">
            <ProviderBioField value={state.bio} onChange={(v) => update("bio", v)} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="5. Fiyat & deneyim (opsiyonel)">
        <div className="grid gap-3 sm:grid-cols-3">
          <FormField label="Saatlik fiyat min (€)">
            <input
              type="number"
              min={0}
              max={10000}
              value={state.hourly_rate_min}
              onChange={(e) => update("hourly_rate_min", e.target.value)}
              className={formInputCls}
            />
          </FormField>
          <FormField label="Saatlik fiyat max (€)">
            <input
              type="number"
              min={0}
              max={10000}
              value={state.hourly_rate_max}
              onChange={(e) => update("hourly_rate_max", e.target.value)}
              className={formInputCls}
            />
          </FormField>
          <FormField label="Tecrübe (yıl)">
            <input
              type="number"
              min={0}
              max={60}
              value={state.years_experience}
              onChange={(e) => update("years_experience", e.target.value)}
              className={formInputCls}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="6. Dil bilgileri">
        <ProviderLanguageSelect
          value={state.languages}
          onChange={(v) => update("languages", v)}
        />
      </FormSection>

      <FormSection
        title="7. Hizmet kategorileri"
        hint="En az 1 alt seç; 1 tanesi birincil olmalı."
      >
        <ProviderCategorySelect
          options={props.categories}
          value={state.services}
          onChange={(v) => update("services", v)}
        />
      </FormSection>

      {targetUidForPhotos ? (
        <FormSection title="8. Fotoğraflar">
          <FormField label="Avatar (opsiyonel)">
            <ProviderAvatarUpload
              targetUserId={targetUidForPhotos}
              url={state.avatar_url}
              onChange={(u) => update("avatar_url", u)}
            />
          </FormField>
          <FormField label="Portfolio (max 10)">
            <ProviderPhotoUpload
              targetUserId={targetUidForPhotos}
              urls={state.portfolio_images}
              onChange={(urls) => update("portfolio_images", urls)}
            />
          </FormField>
        </FormSection>
      ) : (
        <FormSection
          title="8. Fotoğraflar"
          hint="Photo upload Promote akışında doğrudan kullanılabilir; Create akışında provider yaratıldıktan sonra ayrı bir adımda eklenir."
        >
          <p className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/[0.08] dark:text-amber-300">
            {props.mode === "create"
              ? "Yeni hesap önce yaratılır, sonra fotoğraflar provider sayfasından yüklenir."
              : "Önce bir kullanıcı seç, sonra foto yükleyebilirsin."}
          </p>
        </FormSection>
      )}

      <FormSection title="9. Doğrulama & founding">
        <ProviderVerificationFields
          isVerified={state.is_verified}
          onIsVerifiedChange={(v) => update("is_verified", v)}
          verificationStatus={state.verification_status}
          onVerificationStatusChange={(v) => update("verification_status", v)}
          verificationTier={state.verification_tier}
          onVerificationTierChange={(v) => update("verification_tier", v)}
          isActive={state.is_active}
          onIsActiveChange={(v) => update("is_active", v)}
          isFoundingProvider={state.is_founding_provider}
          onIsFoundingProviderChange={(v) => update("is_founding_provider", v)}
        />
      </FormSection>

      {submitError && (
        <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/[0.08] dark:text-red-300">
          {submitError}
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-gray-200 pt-6 dark:border-white/[0.08]">
        <button
          type="submit"
          disabled={submitDisabled}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/20",
            "transition-all hover:shadow-teal-500/30 disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          {props.mode === "promote" ? "Pro olarak kaydet" : "Provider yarat"}
        </button>
        <p className="text-xs text-gray-500 dark:text-white/40">
          Submit edince audit log&apos;a yazılır + provider profil sayfasına yönlendirilir.
        </p>
      </div>
    </form>
  );
}
