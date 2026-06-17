"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CircleSlash, Loader2 } from "lucide-react";

/**
 * Glatko Sağlık — H5b appointment manage/cancel (Client Component).
 *
 * Patient self-service action reached from the confirm SMS/email manage link.
 * Only a 'confirmed' appointment is cancellable: a destructive CTA opens an
 * are-you-sure step, which POSTs the opaque manage_token to /api/health/cancel.
 * On success the card flips to a terminal 'cancelled' state in place (no reload).
 * Any non-200/throw surfaces a generic, aria-live cancel error. completed/no_show
 * show no action — nothing here is reversible from the patient side.
 */

type AppointmentStatus = "confirmed" | "cancelled" | "completed" | "no_show";

export function ManageAppointment({
  token,
  initialStatus,
}: {
  token: string;
  initialStatus: AppointmentStatus;
  locale: string;
}) {
  const t = useTranslations("healthVertical.booking");

  const [status, setStatus] = useState<AppointmentStatus>(initialStatus);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function doCancel() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/health/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const payload: { ok?: boolean } = await res.json().catch(() => ({}));
      if (res.ok && payload.ok) {
        setStatus("cancelled");
        setConfirming(false);
        return;
      }
      setError(t("cancelError"));
    } catch {
      setError(t("cancelError"));
    } finally {
      setBusy(false);
    }
  }

  // ── Terminal: already cancelled ───────────────────────────────────────────
  if (status === "cancelled") {
    return (
      <section className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center dark:border-white/10 dark:bg-white/5">
        <CircleSlash className="mx-auto h-9 w-9 text-gray-400 dark:text-white/40" />
        <h2 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
          {t("cancelledTitle")}
        </h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-gray-600 dark:text-white/70">
          {t("cancelledBody")}
        </p>
      </section>
    );
  }

  // ── Non-confirmed, non-cancelled (completed / no_show): no action ──────────
  if (status !== "confirmed") {
    return null;
  }

  // ── Confirmed: cancellable ─────────────────────────────────────────────────
  return (
    <section className="mt-6">
      {error && (
        <p
          role="alert"
          aria-live="assertive"
          className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300"
        >
          {error}
        </p>
      )}

      {confirming ? (
        <div className="rounded-2xl border border-red-200 bg-red-50/60 p-5 dark:border-red-500/30 dark:bg-red-500/10">
          <p className="text-sm text-gray-700 dark:text-white/80">
            {t("cancelConfirm")}
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={doCancel}
              disabled={busy}
              className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {busy ? t("cancelling") : t("cancelConfirmCta")}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={busy}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 dark:border-white/15 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
            >
              {t("keepCta")}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
          {t("cancelCta")}
        </button>
      )}
    </section>
  );
}
