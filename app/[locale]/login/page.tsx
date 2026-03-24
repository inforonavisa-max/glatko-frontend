"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { Mail, Lock, Loader2, ShieldCheck, ArrowLeft, Chrome } from "lucide-react";
import { createClient } from "@/supabase/browser";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

function safeRedirect(raw: string | null): string {
  if (!raw) return "/";
  const t = raw.trim();
  if (t.startsWith("/") && !t.startsWith("//")) return t;
  return "/";
}

const inputCls = cn(
  "w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5",
  "py-3 pl-11 pr-4 text-sm text-gray-900 dark:text-white",
  "placeholder:text-gray-400 dark:placeholder:text-white/30",
  "focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition-all"
);

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirect(searchParams?.get("redirect") ?? null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError(t("auth.emailRequired"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      router.push(redirectTo);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("email not confirmed")) {
        setError(t("auth.emailNotConfirmed"));
      } else {
        setError(t("auth.invalidCredentials"));
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setOauthLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${baseUrl}/auth/callback?next=${encodeURIComponent(redirectTo)}` },
      });
      if (oauthError) throw oauthError;
    } catch {
      setError(t("auth.googleError"));
      setOauthLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#080808] flex flex-col items-center justify-center relative overflow-hidden px-4 transition-colors duration-300">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[600px] w-[600px] rounded-full bg-teal-500/5 blur-[120px]" />
      </div>
      <div className="relative z-10 w-full max-w-md py-12">
        <div className="mb-10 flex flex-col items-center text-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/10">
            <ShieldCheck className="h-8 w-8 text-teal-500" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-semibold text-gray-900 dark:text-white">{t("auth.login")}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-white/50">{t("brand.tagline")}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 backdrop-blur-sm shadow-sm">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</div>
          )}
          <button onClick={handleGoogleLogin} disabled={oauthLoading || loading} className={cn("mb-6 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-white/5 px-4 py-3 text-sm font-medium text-gray-700 dark:text-white/80 transition-all hover:bg-gray-50 dark:hover:bg-white/10 active:scale-95 disabled:opacity-50")}>
            {oauthLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Chrome className="h-4 w-4" />}
            {t("auth.google")}
          </button>
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
            <span className="text-xs text-gray-400 dark:text-white/30">{t("common.or")}</span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
          </div>
          <div className="mb-4 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-white/50">{t("auth.email")}</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-white/30" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="name@example.com" className={inputCls} />
            </div>
          </div>
          <div className="mb-6 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-500 dark:text-white/50">{t("auth.password")}</label>
              <Link href="/forgot-password" className="text-xs text-teal-500/80 hover:text-teal-500 transition-colors">{t("auth.forgotPassword")}</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-white/30" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="••••••••" className={inputCls} />
            </div>
          </div>
          <button onClick={handleLogin} disabled={loading || oauthLoading} className={cn("w-full rounded-xl bg-teal-500 py-3 text-sm font-semibold text-white transition-all hover:bg-teal-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2")}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("auth.login")}
          </button>
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-white/50">
            {t("auth.noAccount")}{" "}
            <Link href="/register" className="font-semibold text-teal-500 hover:text-teal-600 transition-colors">{t("auth.registerNow")}</Link>
          </p>
        </div>
        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 transition-colors">
            <ArrowLeft className="h-3 w-3" />
            {t("auth.backToMarketplace")}
          </Link>
        </div>
      </div>
    </div>
  );
}
