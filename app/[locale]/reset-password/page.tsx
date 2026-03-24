"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { Lock, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { createClient } from "@/supabase/browser";
import { useTranslations } from "next-intl";
import { PageBackground } from "@/components/ui/PageBackground";
import { cn } from "@/lib/utils";

const inputCls = cn(
  "w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5",
  "py-3 pl-11 pr-4 text-sm text-gray-900 dark:text-white",
  "placeholder:text-gray-400 dark:placeholder:text-white/30",
  "focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition-all"
);

export default function ResetPasswordPage() {
  const t = useTranslations();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError(t("auth.passwordMismatch")); return; }
    if (password.length < 8) { setError(t("auth.passwordTooShort")); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateErr } = await supabase.auth.updateUser({ password });
      if (updateErr) throw updateErr;
      router.push("/");
      router.refresh();
    } catch { setError(t("auth.updatePasswordError")); } finally { setLoading(false); }
  }

  return (
    <PageBackground opacity={0.08}>
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><div className="h-[600px] w-[600px] rounded-full bg-teal-500/5 blur-[120px]" /></div>
      <div className="relative z-10 w-full max-w-md py-12">
        <div className="mb-8 flex flex-col items-center text-center gap-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/10">
            <ShieldCheck className="h-8 w-8 text-teal-500" strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-3xl font-semibold text-gray-900 dark:text-white">{t("auth.resetPasswordTitle")}</h1>
          <p className="text-sm text-gray-500 dark:text-white/50 max-w-sm">{t("auth.resetPasswordDesc")}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/90 dark:bg-white/[0.04] backdrop-blur-xl p-8">
          {error && <div className="mb-6 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-white/50">{t("auth.newPassword")}</label>
              <div className="relative"><Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-white/30" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" className={inputCls} placeholder="••••••••" /></div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-white/50">{t("auth.confirmPassword")}</label>
              <div className="relative"><Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-white/30" /><input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" className={inputCls} placeholder="••••••••" /></div>
            </div>
            <button type="submit" disabled={loading} className={cn("w-full rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 py-3 text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-all")}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("auth.updatePassword")}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-white/50"><Link href="/login" className="font-semibold text-teal-500">{t("auth.backToLogin")}</Link></p>
        </div>
        <div className="mt-8 text-center"><Link href="/" className="inline-flex items-center gap-2 text-xs text-gray-400 dark:text-white/30"><ArrowLeft className="h-3 w-3" />{t("auth.backToHome")}</Link></div>
      </div>
    </div>
    </PageBackground>
  );
}
