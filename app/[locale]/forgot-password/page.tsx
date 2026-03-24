"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Mail, Loader2, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";
import { createClient } from "@/supabase/browser";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const inputCls = cn(
  "w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5",
  "py-3 pl-11 pr-4 text-sm text-gray-900 dark:text-white",
  "placeholder:text-gray-400 dark:placeholder:text-white/30",
  "focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition-all"
);

export default function ForgotPasswordPage() {
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setError(t("auth.resetError")); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${baseUrl}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
      });
      if (resetErr) throw resetErr;
      setSent(true);
    } catch { setError(t("auth.resetError")); } finally { setLoading(false); }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#080808] flex items-center justify-center px-4">
        <div className="relative z-10 w-full max-w-md">
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-10 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" strokeWidth={1.5} />
            </div>
            <h2 className="font-serif text-xl font-semibold text-gray-900 dark:text-white">{t("auth.resetLinkSent")}</h2>
            <p className="mt-3 text-sm text-gray-500 dark:text-white/50 break-all">{email}</p>
            <Link href="/login" className="mt-8 inline-flex items-center justify-center rounded-xl bg-teal-500 px-6 py-3 text-sm font-semibold text-white">{t("auth.backToLogin")}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#080808] flex flex-col items-center justify-center relative overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><div className="h-[600px] w-[600px] rounded-full bg-teal-500/5 blur-[120px]" /></div>
      <div className="relative z-10 w-full max-w-md py-12">
        <div className="mb-8 flex flex-col items-center text-center gap-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/10">
            <KeyRound className="h-8 w-8 text-teal-500" strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-3xl font-semibold text-gray-900 dark:text-white">{t("auth.forgotPassword")}</h1>
          <p className="text-sm text-gray-500 dark:text-white/50 max-w-sm">{t("auth.forgotPasswordDesc")}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-8">
          {error && <div className="mb-6 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-white/50">{t("auth.email")}</label>
              <div className="relative"><Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-white/30" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={inputCls} placeholder="name@example.com" /></div>
            </div>
            <button type="submit" disabled={loading} className={cn("w-full rounded-xl bg-teal-500 py-3 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-50 flex items-center justify-center gap-2")}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("auth.sendResetLink")}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-white/50"><Link href="/login" className="font-semibold text-teal-500">{t("auth.backToLogin")}</Link></p>
        </div>
        <div className="mt-8 text-center"><Link href="/" className="inline-flex items-center gap-2 text-xs text-gray-400 dark:text-white/30"><ArrowLeft className="h-3 w-3" />{t("auth.backToHome")}</Link></div>
      </div>
    </div>
  );
}
