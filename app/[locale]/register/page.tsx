"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { User, Mail, Lock, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { createClient } from "@/supabase/browser";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const inputCls = cn(
  "w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5",
  "py-3 pl-11 pr-4 text-sm text-gray-900 dark:text-white",
  "placeholder:text-gray-400 dark:placeholder:text-white/30",
  "focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition-all"
);

export default function RegisterPage() {
  const t = useTranslations();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleRegister() {
    setError(null);
    if (!fullName.trim() || !email.trim() || !password.trim() || !passwordConfirm.trim()) {
      setError(t("auth.allFieldsRequired"));
      return;
    }
    if (password.length < 8) { setError(t("auth.passwordTooShort")); return; }
    if (password !== passwordConfirm) { setError(t("auth.passwordMismatch")); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const { data, error: authError } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName }, emailRedirectTo: `${baseUrl}/auth/callback?next=/` },
      });
      if (authError) throw authError;
      if (data.user) { await supabase.from("profiles").upsert({ id: data.user.id, full_name: fullName }); }
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally { setLoading(false); }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#080808] flex items-center justify-center px-4">
        <div className="relative z-10 w-full max-w-md">
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-10 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" strokeWidth={1.5} />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-gray-900 dark:text-white">{t("auth.verifyEmail")}</h2>
            <p className="mt-3 text-sm text-gray-500 dark:text-white/50"><strong className="text-gray-700 dark:text-white/80">{email}</strong> {t("auth.verifyEmailDesc")}</p>
            <Link href="/login" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-sm font-semibold text-white">{t("auth.goToLogin")}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#080808] flex flex-col items-center justify-center relative overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><div className="h-[600px] w-[600px] rounded-full bg-teal-500/5 blur-[120px]" /></div>
      <div className="relative z-10 w-full max-w-md py-12">
        <div className="mb-10 flex flex-col items-center text-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/10">
            <User className="h-8 w-8 text-teal-500" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-semibold text-gray-900 dark:text-white">{t("auth.register")}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-white/50">{t("auth.freeAccount")}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 backdrop-blur-sm shadow-sm">
          {error && <div className="mb-6 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</div>}
          <div className="mb-4 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-white/50">{t("auth.fullName")}</label>
            <div className="relative"><User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-white/30" /><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t("auth.fullName")} className={inputCls} /></div>
          </div>
          <div className="mb-4 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-white/50">{t("auth.email")}</label>
            <div className="relative"><Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-white/30" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className={inputCls} /></div>
          </div>
          <div className="mb-4 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-white/50">{t("auth.password")}</label>
            <div className="relative"><Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-white/30" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} /></div>
          </div>
          <div className="mb-6 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-white/50">{t("auth.confirmPassword")}</label>
            <div className="relative"><Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-white/30" /><input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleRegister()} placeholder="••••••••" className={inputCls} /></div>
          </div>
          <button onClick={handleRegister} disabled={loading} className={cn("w-full rounded-xl bg-teal-500 py-3 text-sm font-semibold text-white transition-all hover:bg-teal-600 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2")}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("auth.createAccount")}
          </button>
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-white/50">{t("auth.hasAccount")}{" "}<Link href="/login" className="font-semibold text-teal-500">{t("auth.loginNow")}</Link></p>
        </div>
        <div className="mt-8 text-center"><Link href="/" className="inline-flex items-center gap-2 text-xs text-gray-400 dark:text-white/30"><ArrowLeft className="h-3 w-3" />{t("auth.backToMarketplace")}</Link></div>
      </div>
    </div>
  );
}
