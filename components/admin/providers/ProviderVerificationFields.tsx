"use client";

import { cn } from "@/lib/utils";

interface Props {
  isVerified: boolean;
  onIsVerifiedChange: (v: boolean) => void;
  verificationStatus: "pending" | "approved" | "rejected";
  onVerificationStatusChange: (v: "pending" | "approved" | "rejected") => void;
  verificationTier: "basic" | "business" | "professional";
  onVerificationTierChange: (v: "basic" | "business" | "professional") => void;
  isActive: boolean;
  onIsActiveChange: (v: boolean) => void;
  isFoundingProvider: boolean;
  onIsFoundingProviderChange: (v: boolean) => void;
  disabled?: boolean;
}

function Toggle({
  label,
  hint,
  value,
  onChange,
  disabled,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={cn(
        "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
        value
          ? "border-teal-500/40 bg-teal-500/5"
          : "border-gray-200 bg-white dark:border-white/[0.08] dark:bg-white/[0.03]",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        {hint && (
          <p className="mt-0.5 text-xs text-gray-500 dark:text-white/40">{hint}</p>
        )}
      </div>
      <span
        className={cn(
          "ml-3 flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
          value ? "bg-teal-500" : "bg-gray-300 dark:bg-white/[0.2]",
        )}
      >
        <span
          className={cn(
            "h-4 w-4 transform rounded-full bg-white shadow transition-transform",
            value ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}

const STATUSES: Array<"pending" | "approved" | "rejected"> = [
  "pending",
  "approved",
  "rejected",
];
const TIERS: Array<"basic" | "business" | "professional"> = [
  "basic",
  "business",
  "professional",
];

export function ProviderVerificationFields({
  isVerified,
  onIsVerifiedChange,
  verificationStatus,
  onVerificationStatusChange,
  verificationTier,
  onVerificationTierChange,
  isActive,
  onIsActiveChange,
  isFoundingProvider,
  onIsFoundingProviderChange,
  disabled,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <Toggle
          label="is_verified"
          hint="Admin offline doğrulama yapmışsa true."
          value={isVerified}
          onChange={onIsVerifiedChange}
          disabled={disabled}
        />
        <Toggle
          label="is_active"
          hint="Liste/aramada görünür. Default: true."
          value={isActive}
          onChange={onIsActiveChange}
          disabled={disabled}
        />
        <Toggle
          label="is_founding_provider"
          hint="Founding rozet (#N otomatik atanır). Default: false."
          value={isFoundingProvider}
          onChange={onIsFoundingProviderChange}
          disabled={disabled}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-white/60">
            verification_status
          </label>
          <div className="flex gap-1">
            {STATUSES.map((s) => (
              <button
                type="button"
                key={s}
                disabled={disabled}
                onClick={() => onVerificationStatusChange(s)}
                className={cn(
                  "flex-1 rounded-xl border px-3 py-2 text-sm capitalize transition-colors",
                  verificationStatus === s
                    ? "border-teal-500 bg-teal-500/10 text-teal-800 dark:text-teal-200"
                    : "border-gray-200 hover:border-gray-300 dark:border-white/[0.1] dark:text-white/70",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-white/60">
            verification_tier
          </label>
          <div className="flex gap-1">
            {TIERS.map((t) => (
              <button
                type="button"
                key={t}
                disabled={disabled}
                onClick={() => onVerificationTierChange(t)}
                className={cn(
                  "flex-1 rounded-xl border px-3 py-2 text-sm capitalize transition-colors",
                  verificationTier === t
                    ? "border-teal-500 bg-teal-500/10 text-teal-800 dark:text-teal-200"
                    : "border-gray-200 hover:border-gray-300 dark:border-white/[0.1] dark:text-white/70",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
