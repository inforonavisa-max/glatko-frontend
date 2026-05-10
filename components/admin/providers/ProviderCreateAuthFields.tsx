"use client";

import { Copy, Eye, EyeOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FormField, formInputCls } from "./ProviderFormPrimitives";

interface Props {
  email: string;
  onEmailChange: (v: string) => void;
  password: string;
  onPasswordChange: (v: string) => void;
  showPassword: boolean;
  onShowPasswordChange: (v: boolean) => void;
}

function generatePassword(): string {
  const chars =
    "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*";
  let out = "";
  const a = new Uint32Array(16);
  crypto.getRandomValues(a);
  for (let i = 0; i < 16; i++) {
    out += chars[a[i] % chars.length];
  }
  return out;
}

/**
 * Create-mode-only auth section: email + admin-set password with
 * generate / copy / show-hide affordances. Hidden in promote mode.
 */
export function ProviderCreateAuthFields({
  email,
  onEmailChange,
  password,
  onPasswordChange,
  showPassword,
  onShowPasswordChange,
}: Props) {
  function copyPassword() {
    navigator.clipboard.writeText(password).then(
      () => toast.success("Şifre panoya kopyalandı"),
      () => toast.error("Kopyalama başarısız"),
    );
  }

  function regenPassword() {
    onPasswordChange(generatePassword());
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <FormField label="Email">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className={formInputCls}
          placeholder="majstor@example.com"
        />
      </FormField>
      <FormField
        label="Şifre (admin belirler)"
        hint="Provider'a Viber/SMS ile iletilecek; ilk girişte değiştirebilir."
      >
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={12}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              className={cn(formInputCls, "pr-10")}
              placeholder="min 12 karakter"
            />
            <button
              type="button"
              onClick={() => onShowPasswordChange(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Şifreyi göster/gizle"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <button
            type="button"
            onClick={regenPassword}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-2.5 py-2 text-gray-600 hover:border-teal-500/30 hover:text-teal-700 dark:border-white/[0.08] dark:text-white/70"
            aria-label="Yeni şifre oluştur"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          {password && (
            <button
              type="button"
              onClick={copyPassword}
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-2.5 py-2 text-gray-600 hover:border-teal-500/30 hover:text-teal-700 dark:border-white/[0.08] dark:text-white/70"
              aria-label="Şifreyi kopyala"
            >
              <Copy className="h-4 w-4" />
            </button>
          )}
        </div>
      </FormField>
    </div>
  );
}
