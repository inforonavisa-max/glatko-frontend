"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Plus, Trash2, Check } from "lucide-react";

import { saveSchedules } from "@/app/[locale]/saglik-pro/actions";
import { hasWeekdayOverlap } from "@/lib/saglik/provider-validation";
import type { OwnProviderLocation, OwnProviderScheduleRow } from "@/lib/saglik/provider";
import type { Locale } from "@/i18n/routing";

/**
 * Glatko Sağlık — weekly recurring-hours editor (H7a /takvim). Doctors are
 * phone-first (MASTER_PLAN DoD), so this is MOBILE-FIRST: one location selector +
 * a stacked list of 7 weekday cards (0=Mon … 6=Sun, DB convention), each a column
 * of time-range rows you add/remove — NOT a desktop table squeezed onto a phone.
 * Saving replaces ALL rows for the selected location atomically (set_schedules RPC).
 * Override management (holiday/break/extra) is H7b.
 */

type Row = { weekday: number; startTime: string; endTime: string };

const WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export function WeeklyScheduleEditor({
  locale: _locale,
  locations,
  initialSchedules,
}: {
  locale: Locale;
  locations: OwnProviderLocation[];
  initialSchedules: OwnProviderScheduleRow[];
}) {
  const t = useTranslations("healthVertical");
  const sc = (k: string) => t(`pro.schedule.${k}`);
  const [pending, startTransition] = useTransition();

  const [locationId, setLocationId] = useState(locations[0]?.id ?? "");

  // rowsByLocation: locationId → Row[]; seeded from the loaded draft.
  const seed = useMemo(() => {
    const map: Record<string, Row[]> = {};
    for (const loc of locations) map[loc.id] = [];
    for (const r of initialSchedules) {
      if (!map[r.locationId]) map[r.locationId] = [];
      map[r.locationId].push({ weekday: r.weekday, startTime: r.startTime, endTime: r.endTime });
    }
    return map;
  }, [locations, initialSchedules]);

  const [rowsByLocation, setRowsByLocation] = useState<Record<string, Row[]>>(seed);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const rows = rowsByLocation[locationId] ?? [];

  function updateRows(next: Row[]) {
    setSaved(false);
    setError(null);
    setRowsByLocation((prev) => ({ ...prev, [locationId]: next }));
  }

  function addRow(weekday: number) {
    const dayRows = rows.filter((r) => r.weekday === weekday);
    const last = dayRows[dayRows.length - 1];
    const start = last ? last.endTime : "09:00";
    const end = last ? minutesToHm(Math.min(hmToMinutes(last.endTime) + 60, 23 * 60 + 30)) : "17:00";
    updateRows([...rows, { weekday, startTime: start, endTime: end }]);
  }

  function removeRow(index: number) {
    updateRows(rows.filter((_, i) => i !== index));
  }

  function patchRow(index: number, patch: Partial<Row>) {
    updateRows(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function submit() {
    setError(null);
    setSaved(false);
    // Per-row validity (start<end) + intra-weekday overlap.
    for (const r of rows) {
      if (r.startTime >= r.endTime) {
        setError(sc("errStartEnd"));
        return;
      }
    }
    if (hasWeekdayOverlap(rows)) {
      setError(sc("errOverlap"));
      return;
    }
    startTransition(async () => {
      const res = await saveSchedules({ locationId, rows });
      if (res.ok) {
        setSaved(true);
      } else {
        setError(res.error === "SCHEDULE_OVERLAP" ? sc("errOverlap") : sc("saveError"));
      }
    });
  }

  const timeCls =
    "rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-900 focus:border-brandHealth focus:outline-none focus:ring-1 focus:ring-brandHealth dark:border-white/10 dark:bg-white/5 dark:text-white";

  return (
    <div>
      <h1 className="font-serif text-2xl font-light tracking-tight text-gray-900 dark:text-white">
        {sc("title")}
      </h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-white/60">{sc("subtitle")}</p>

      {locations.length > 1 && (
        <div className="mt-5">
          <label className="block text-sm font-medium text-gray-700 dark:text-white/70" htmlFor="loc">
            {sc("location")}
          </label>
          <select
            id="loc"
            className={
              "mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brandHealth focus:outline-none focus:ring-1 focus:ring-brandHealth dark:border-white/10 dark:bg-white/5 dark:text-white"
            }
            value={locationId}
            onChange={(e) => {
              setSaved(false);
              setError(null);
              setLocationId(e.target.value);
            }}
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.label} — {loc.city}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-5 space-y-3">
        {WEEKDAY_KEYS.map((dayKey, weekday) => {
          const dayRows = rows
            .map((r, i) => ({ r, i }))
            .filter(({ r }) => r.weekday === weekday);
          return (
            <div
              key={dayKey}
              className="rounded-2xl border border-gray-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {sc(`weekday.${dayKey}`)}
                </span>
                <button
                  type="button"
                  onClick={() => addRow(weekday)}
                  className="inline-flex items-center gap-1 rounded-full border border-brandHealth-200 px-3 py-1 text-xs font-medium text-brandHealth-700 transition hover:bg-brandHealth-50 dark:border-brandHealth/30 dark:text-brandHealth dark:hover:bg-brandHealth/10"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden /> {sc("addRange")}
                </button>
              </div>
              {dayRows.length === 0 ? (
                <p className="mt-2 text-xs text-gray-400 dark:text-white/30">{sc("closed")}</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {dayRows.map(({ r, i }) => (
                    <li key={i} className="flex items-center gap-2">
                      <input
                        type="time"
                        className={timeCls}
                        value={r.startTime}
                        onChange={(e) => patchRow(i, { startTime: e.target.value })}
                        aria-label={sc("startTime")}
                      />
                      <span className="text-gray-400" aria-hidden>
                        –
                      </span>
                      <input
                        type="time"
                        className={timeCls}
                        value={r.endTime}
                        onChange={(e) => patchRow(i, { endTime: e.target.value })}
                        aria-label={sc("endTime")}
                      />
                      <button
                        type="button"
                        onClick={() => removeRow(i)}
                        className="ml-auto rounded-full p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                        aria-label={sc("removeRange")}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
      {saved && !error && (
        <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-brandHealth-700 dark:text-brandHealth">
          <Check className="h-4 w-4" aria-hidden /> {sc("saved")}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={pending || !locationId}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-brandHealth-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brandHealth-700 disabled:opacity-60"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {sc("save")}
      </button>
    </div>
  );
}

function hmToMinutes(hm: string): number {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}

function minutesToHm(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
