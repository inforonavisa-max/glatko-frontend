"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AsYouType, isValidPhoneNumber, type CountryCode } from "libphonenumber-js";
import { PHONE_COUNTRIES } from "@/lib/phone/countries";
import { cn } from "@/lib/utils";

/**
 * Shared phone input — country selector + as-you-type formatting + lenient blur
 * validation with inline guidance. Used by the pro onboarding wizard, profile
 * settings, and the service-request flow.
 *
 * Design (G-PHONE; avatar-hard-wall lesson): NEVER blocks typing or clears the
 * field. It guides ("e.g. +382 67 123 456") and emits a best-effort E.164 to the
 * parent (so a typed national number carries its country). The server action is
 * the authoritative validator/normalizer — this is UX only.
 *
 * `onChange` receives the resolved E.164 when the number parses, else the raw
 * text; the parent submits that and the server re-normalizes via libphonenumber.
 */

// ME + TR first (Glatko's most frequent markets), then the rest in list order.
const ORDERED = [
  ...PHONE_COUNTRIES.filter((c) => c.iso === "ME" || c.iso === "TR"),
  ...PHONE_COUNTRIES.filter((c) => c.iso !== "ME" && c.iso !== "TR"),
];

const onlyDigits = (s: string) => s.replace(/\D/g, "");

function resolveE164(text: string, iso: string): string {
  const raw = text.trim();
  if (!raw) return "";
  try {
    const ayt = new AsYouType(iso as CountryCode);
    ayt.input(raw);
    const parsed = ayt.getNumber();
    return parsed?.number ?? raw;
  } catch {
    return raw;
  }
}

type Props = {
  value: string;
  onChange: (v: string) => void;
  defaultCountry?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
};

export function PhoneInput({
  value,
  onChange,
  defaultCountry = "ME",
  id,
  name,
  placeholder = "+382 67 123 456",
  className,
  required,
}: Props) {
  const t = useTranslations("validation");
  const [country, setCountry] = useState<string>(defaultCountry);
  const [text, setText] = useState<string>(value ?? "");
  const [touched, setTouched] = useState(false);
  const lastEmit = useRef<string>(value ?? "");

  // Re-sync display when the parent changes `value` externally (draft restore,
  // "start fresh" clear) — detected by digit mismatch vs what we last emitted.
  useEffect(() => {
    if (onlyDigits(value ?? "") !== onlyDigits(lastEmit.current)) {
      setText(value ?? "");
      lastEmit.current = value ?? "";
    }
  }, [value]);

  function emit(next: string, iso: string) {
    const resolved = resolveE164(next, iso);
    lastEmit.current = resolved;
    onChange(resolved);
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    // As-you-type format, but pass deletions straight through so backspace
    // doesn't fight the formatter.
    const deleting = raw.length < text.length;
    const display = deleting
      ? raw
      : new AsYouType(country as CountryCode).input(raw);
    setText(display);
    emit(display, country);
  }

  function handleCountry(e: React.ChangeEvent<HTMLSelectElement>) {
    const iso = e.target.value;
    setCountry(iso);
    emit(text, iso); // re-resolve the same text against the new region
  }

  const invalid =
    touched &&
    text.trim().length > 0 &&
    (() => {
      try {
        return !isValidPhoneNumber(text.trim(), country as CountryCode);
      } catch {
        return true;
      }
    })();

  return (
    <div className="w-full">
      <div className="flex gap-2">
        <select
          aria-label="Country code"
          value={country}
          onChange={handleCountry}
          className={cn(
            "shrink-0 rounded-xl border border-gray-200 bg-gray-50 px-2 text-sm dark:border-white/10 dark:bg-white/5",
            "focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/30",
          )}
        >
          {ORDERED.map((c) => (
            <option key={c.iso} value={c.iso}>
              {c.flag} +{c.dial}
            </option>
          ))}
        </select>
        <input
          id={id}
          name={name}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required={required}
          value={text}
          onChange={handleInput}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          className={cn(
            "w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 transition-all dark:bg-white/5 dark:text-white",
            "placeholder:text-gray-400 dark:placeholder:text-white/30",
            "focus:outline-none focus:ring-1",
            invalid
              ? "border-red-300 focus:border-red-400 focus:ring-red-300/40 dark:border-red-500/40"
              : "border-gray-200 focus:border-teal-500/50 focus:ring-teal-500/30 dark:border-white/10",
            className,
          )}
        />
      </div>
      {invalid && (
        <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          {t("phoneInvalid")}
        </p>
      )}
    </div>
  );
}
