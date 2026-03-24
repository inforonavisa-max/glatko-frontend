"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { createClient } from "@/supabase/browser";
import { BackgroundGrids } from "@/components/aceternity/background-grids";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        <BackgroundGrids />
        {/* Teal mesh blobs */}
        <motion.div
          animate={{ x: [0, 60, 0], y: [0, -40, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-teal-500/[0.07] blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 30, 0], scale: [1.1, 0.9, 1.1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-cyan-500/[0.05] blur-[100px]"
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-[#080808]/60 dark:bg-[#080808]/60 bg-[#F8F6F0]/60" />
      </div>

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="rounded-3xl border border-white/[0.08] dark:border-white/[0.08] border-gray-200/50 bg-white/[0.03] dark:bg-white/[0.03] bg-white/70 backdrop-blur-2xl shadow-2xl shadow-black/10 p-8 md:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <span className="text-3xl font-bold tracking-tight text-white dark:text-white text-gray-900">
                Glatko
                <span className="text-teal-500 ml-0.5">.</span>
              </span>
            </Link>
            <p className="mt-2 text-sm text-white/50 dark:text-white/50 text-gray-500">
              {t("brand.tagline")}
            </p>
          </div>

          {/* Google login */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/[0.1] dark:border-white/[0.1] border-gray-200 bg-white/[0.05] dark:bg-white/[0.05] bg-white py-3 px-4 text-sm font-medium text-white dark:text-white text-gray-700 hover:bg-white/[0.08] dark:hover:bg-white/[0.08] hover:bg-gray-50 transition-all duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {t("auth.google")}
          </motion.button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08] dark:border-white/[0.08] border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#080808] dark:bg-[#080808] bg-white px-4 text-white/40 dark:text-white/40 text-gray-400 rounded">
                {t("auth.orContinueWith")}
              </span>
            </div>
          </div>

          {/* Email/Password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/60 dark:text-white/60 text-gray-500 mb-1.5 uppercase tracking-wider">
                {t("auth.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-white/[0.1] dark:border-white/[0.1] border-gray-200 bg-white/[0.05] dark:bg-white/[0.05] bg-white px-4 py-3 text-sm text-white dark:text-white text-gray-900 placeholder-white/30 dark:placeholder-white/30 placeholder-gray-400 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all duration-200"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-white/60 dark:text-white/60 text-gray-500 uppercase tracking-wider">
                  {t("auth.password")}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                >
                  {t("auth.forgotPassword")}
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-white/[0.1] dark:border-white/[0.1] border-gray-200 bg-white/[0.05] dark:bg-white/[0.05] bg-white px-4 py-3 text-sm text-white dark:text-white text-gray-900 placeholder-white/30 dark:placeholder-white/30 placeholder-gray-400 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all duration-200"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              whileHover={{ scale: 1.01, boxShadow: "0 0 30px rgba(20,184,166,0.2)" }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? t("common.loading") : t("auth.login")}
            </motion.button>
          </form>

          {/* Register link */}
          <p className="mt-6 text-center text-sm text-white/40 dark:text-white/40 text-gray-500">
            {t("auth.noAccount")}{" "}
            <Link
              href="/register"
              className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
            >
              {t("auth.registerNow")}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
