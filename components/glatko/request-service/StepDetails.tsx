"use client";

import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

interface Props {
  details: Record<string, unknown>;
  setDetails: (d: Record<string, unknown>) => void;
  selectedSubSlug: string;
  t: (key: string) => string;
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-all",
        selected
          ? "border-teal-500 bg-teal-500/10 text-teal-700 shadow-sm shadow-teal-500/10 dark:bg-teal-500/15 dark:text-teal-300"
          : "border-gray-200 bg-gray-50 text-gray-700 hover:border-teal-300 hover:bg-teal-50 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:border-teal-500/30 dark:hover:bg-teal-500/10"
      )}
    >
      {label}
    </button>
  );
}

function MultiChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-all",
        selected
          ? "border-teal-500 bg-teal-500/15 text-teal-700 dark:text-teal-300"
          : "border-gray-200 bg-gray-50 text-gray-700 hover:border-teal-300 hover:bg-teal-50 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:border-teal-500/30 dark:hover:bg-teal-500/10"
      )}
    >
      {label}
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white/70">
      {children}
    </label>
  );
}

function Stepper({
  label,
  value,
  onChange,
  min = 1,
  max = 20,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-30 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/5"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-8 text-center text-lg font-semibold text-gray-900 dark:text-white">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-30 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/5"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={3}
        className="w-full rounded-xl border border-gray-200/80 bg-white/90 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30"
      />
    </div>
  );
}

const CLEANING_SLUGS = ["general-cleaning", "deep-cleaning", "villa-airbnb"];
const RENOVATION_SLUGS = ["renovation", "painting"];
const TECHNICAL_SLUGS = ["electrical", "plumbing", "ac-heating"];
const SIMPLE_SLUGS = ["furniture-assembly", "garden", "pool"];

function set(details: Record<string, unknown>, key: string, value: unknown): Record<string, unknown> {
  return { ...details, [key]: value };
}

function toggle(details: Record<string, unknown>, key: string, value: string): Record<string, unknown> {
  const current = (details[key] as string[] | undefined) ?? [];
  const next = current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value];
  return { ...details, [key]: next };
}

export function StepDetails({ details, setDetails, selectedSubSlug, t }: Props) {
  const d = details;
  const upd = (key: string, value: unknown) => setDetails(set(d, key, value));
  const tog = (key: string, value: string) => setDetails(toggle(d, key, value));

  const isCleaning = CLEANING_SLUGS.includes(selectedSubSlug);
  const isRenovation = RENOVATION_SLUGS.includes(selectedSubSlug);
  const isTechnical = TECHNICAL_SLUGS.includes(selectedSubSlug);
  const isSimple = SIMPLE_SLUGS.includes(selectedSubSlug);
  const isCaptain = selectedSubSlug === "captain-hire";
  const isBoatMaint = ["antifouling", "hull-cleaning", "engine-service"].includes(selectedSubSlug);
  const isBoatLogistics = ["winterization", "charter-prep", "haul-out"].includes(selectedSubSlug);
  const isEmergency = selectedSubSlug === "emergency-repair";

  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
        {t("request.step2.title")}
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-white/50">
        {t("request.step2.subtitle")}
      </p>

      <div className="space-y-6">
        {isCleaning && (
          <>
            <div>
              <FieldLabel>{t("request.step2.propertyType")}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {(["apartment", "house", "villa", "office"] as const).map((pt) => (
                  <Chip
                    key={pt}
                    label={t(`request.step2.${pt}`)}
                    selected={d.propertyType === pt}
                    onClick={() => upd("propertyType", pt)}
                  />
                ))}
              </div>
            </div>
            <Stepper
              label={t("request.step2.rooms")}
              value={(d.rooms as number) ?? 2}
              onChange={(v) => upd("rooms", v)}
            />
            <div>
              <FieldLabel>{t("request.step2.areaRange")}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {(["small", "medium", "large", "xlarge"] as const).map((sz) => (
                  <Chip
                    key={sz}
                    label={t(`request.step2.area.${sz}`)}
                    selected={d.areaRange === sz}
                    onClick={() => upd("areaRange", sz)}
                  />
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>{t("request.step2.frequency")}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {(["oneTime", "weekly", "biweekly", "monthly"] as const).map((f) => (
                  <Chip
                    key={f}
                    label={t(`request.step2.freq.${f}`)}
                    selected={d.frequency === f}
                    onClick={() => upd("frequency", f)}
                  />
                ))}
              </div>
            </div>
            <TextArea
              label={t("request.step2.notes")}
              value={(d.notes as string) ?? ""}
              onChange={(v) => upd("notes", v)}
              placeholder={t("request.step2.notesPlaceholder")}
            />
          </>
        )}

        {isRenovation && (
          <>
            <div>
              <FieldLabel>{t("request.step2.jobType")}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {(["interior", "exterior", "fullReno", "partialReno", "wallPaint", "ceilingPaint"] as const).map((jt) => (
                  <MultiChip
                    key={jt}
                    label={t(`request.step2.job.${jt}`)}
                    selected={((d.jobTypes as string[]) ?? []).includes(jt)}
                    onClick={() => tog("jobTypes", jt)}
                  />
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>{t("request.step2.areaRange")}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {(["small", "medium", "large", "xlarge"] as const).map((sz) => (
                  <Chip
                    key={sz}
                    label={t(`request.step2.area.${sz}`)}
                    selected={d.areaRange === sz}
                    onClick={() => upd("areaRange", sz)}
                  />
                ))}
              </div>
            </div>
            <TextArea
              label={t("request.step2.notes")}
              value={(d.notes as string) ?? ""}
              onChange={(v) => upd("notes", v)}
              placeholder={t("request.step2.notesPlaceholder")}
            />
          </>
        )}

        {isTechnical && (
          <>
            <div>
              <FieldLabel>{t("request.step2.issueType")}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {(["repair", "installation", "inspection", "replacement", "other"] as const).map((it) => (
                  <Chip
                    key={it}
                    label={t(`request.step2.issue.${it}`)}
                    selected={d.issueType === it}
                    onClick={() => upd("issueType", it)}
                  />
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>{t("request.step2.urgent")}</FieldLabel>
              <button
                type="button"
                onClick={() => upd("isUrgent", !d.isUrgent)}
                className={cn(
                  "relative h-8 w-14 rounded-full transition-colors",
                  d.isUrgent
                    ? "bg-teal-500"
                    : "bg-gray-200 dark:bg-white/10"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform",
                    d.isUrgent ? "left-7" : "left-1"
                  )}
                />
              </button>
            </div>
            <TextArea
              label={t("request.step2.notes")}
              value={(d.notes as string) ?? ""}
              onChange={(v) => upd("notes", v)}
              placeholder={t("request.step2.notesPlaceholder")}
            />
          </>
        )}

        {isSimple && (
          <>
            <TextArea
              label={t("request.step2.description")}
              value={(d.description as string) ?? ""}
              onChange={(v) => upd("description", v)}
              placeholder={t("request.step2.descriptionPlaceholder")}
            />
            <TextArea
              label={t("request.step2.notes")}
              value={(d.notes as string) ?? ""}
              onChange={(v) => upd("notes", v)}
              placeholder={t("request.step2.notesPlaceholder")}
            />
          </>
        )}

        {isCaptain && (
          <>
            <div>
              <FieldLabel>{t("request.step2.boatType")}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {(["sailboat", "motorboat", "catamaran", "yacht"] as const).map((bt) => (
                  <Chip
                    key={bt}
                    label={t(`request.step2.boat.${bt}`)}
                    selected={d.boatType === bt}
                    onClick={() => upd("boatType", bt)}
                  />
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>{t("request.step2.boatLength")}</FieldLabel>
              <input
                type="number"
                value={(d.boatLength as string) ?? ""}
                onChange={(e) => upd("boatLength", e.target.value)}
                placeholder={t("request.step2.boatLengthPlaceholder")}
                className="w-full rounded-xl border border-gray-200/80 bg-white/90 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30"
              />
            </div>
            <div>
              <FieldLabel>{t("request.step2.tripDuration")}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {(["halfDay", "fullDay", "multiDay", "weekly"] as const).map((td) => (
                  <Chip
                    key={td}
                    label={t(`request.step2.trip.${td}`)}
                    selected={d.tripDuration === td}
                    onClick={() => upd("tripDuration", td)}
                  />
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>{t("request.step2.hasLicense")}</FieldLabel>
              <button
                type="button"
                onClick={() => upd("hasLicense", !d.hasLicense)}
                className={cn(
                  "relative h-8 w-14 rounded-full transition-colors",
                  d.hasLicense
                    ? "bg-teal-500"
                    : "bg-gray-200 dark:bg-white/10"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform",
                    d.hasLicense ? "left-7" : "left-1"
                  )}
                />
              </button>
            </div>
          </>
        )}

        {isBoatMaint && (
          <>
            <div>
              <FieldLabel>{t("request.step2.boatType")}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {(["sailboat", "motorboat", "catamaran", "yacht"] as const).map((bt) => (
                  <Chip
                    key={bt}
                    label={t(`request.step2.boat.${bt}`)}
                    selected={d.boatType === bt}
                    onClick={() => upd("boatType", bt)}
                  />
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>{t("request.step2.boatLength")}</FieldLabel>
              <input
                type="number"
                value={(d.boatLength as string) ?? ""}
                onChange={(e) => upd("boatLength", e.target.value)}
                placeholder={t("request.step2.boatLengthPlaceholder")}
                className="w-full rounded-xl border border-gray-200/80 bg-white/90 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30"
              />
            </div>
            <div>
              <FieldLabel>{t("request.step2.engineType")}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {(["inboard", "outboard", "diesel", "electric"] as const).map((et) => (
                  <Chip
                    key={et}
                    label={t(`request.step2.engine.${et}`)}
                    selected={d.engineType === et}
                    onClick={() => upd("engineType", et)}
                  />
                ))}
              </div>
            </div>
            <TextArea
              label={t("request.step2.notes")}
              value={(d.notes as string) ?? ""}
              onChange={(v) => upd("notes", v)}
              placeholder={t("request.step2.notesPlaceholder")}
            />
          </>
        )}

        {isBoatLogistics && (
          <>
            <div>
              <FieldLabel>{t("request.step2.boatType")}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {(["sailboat", "motorboat", "catamaran", "yacht"] as const).map((bt) => (
                  <Chip
                    key={bt}
                    label={t(`request.step2.boat.${bt}`)}
                    selected={d.boatType === bt}
                    onClick={() => upd("boatType", bt)}
                  />
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>{t("request.step2.boatLength")}</FieldLabel>
              <input
                type="number"
                value={(d.boatLength as string) ?? ""}
                onChange={(e) => upd("boatLength", e.target.value)}
                placeholder={t("request.step2.boatLengthPlaceholder")}
                className="w-full rounded-xl border border-gray-200/80 bg-white/90 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30"
              />
            </div>
            <div>
              <FieldLabel>{t("request.step2.marina")}</FieldLabel>
              <select
                value={(d.marina as string) ?? ""}
                onChange={(e) => upd("marina", e.target.value)}
                className="w-full rounded-xl border border-gray-200/80 bg-white/90 px-4 py-3 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white"
              >
                <option value="">{t("request.step2.selectMarina")}</option>
                {["Porto Montenegro", "Marina Budva", "Marina Bar", "Lazure Marina", "Marina Kotor"].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <TextArea
              label={t("request.step2.notes")}
              value={(d.notes as string) ?? ""}
              onChange={(v) => upd("notes", v)}
              placeholder={t("request.step2.notesPlaceholder")}
            />
          </>
        )}

        {isEmergency && (
          <>
            <TextArea
              label={t("request.step2.description")}
              value={(d.description as string) ?? ""}
              onChange={(v) => upd("description", v)}
              placeholder={t("request.step2.emergencyPlaceholder")}
              required
            />
          </>
        )}

        {!isCleaning &&
          !isRenovation &&
          !isTechnical &&
          !isSimple &&
          !isCaptain &&
          !isBoatMaint &&
          !isBoatLogistics &&
          !isEmergency && (
            <TextArea
              label={t("request.step2.description")}
              value={(d.description as string) ?? ""}
              onChange={(v) => upd("description", v)}
              placeholder={t("request.step2.descriptionPlaceholder")}
            />
          )}
      </div>
    </div>
  );
}
