"use client";

import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

interface Props {
  details: Record<string, unknown>;
  setDetails: (d: Record<string, unknown>) => void;
  selectedSubSlug: string;
  t: (key: string) => string;
}

const inputCls = cn(
  "block w-full rounded-xl border border-gray-200 dark:border-white/[0.08]",
  "bg-gray-50/50 dark:bg-white/[0.03] px-4 py-3 text-sm",
  "text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30",
  "focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all"
);

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
        "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
        selected
          ? "border-teal-500/40 bg-teal-500/10 text-teal-700 shadow-sm shadow-teal-500/10 dark:border-teal-500/30 dark:bg-teal-500/15 dark:text-teal-300"
          : "border-gray-200/80 bg-white/60 text-gray-700 hover:border-teal-400/40 hover:bg-teal-50/50 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/70 dark:hover:border-teal-500/20 dark:hover:bg-white/[0.06]"
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
        "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
        selected
          ? "border-teal-500/40 bg-teal-500/15 text-teal-700 dark:border-teal-500/30 dark:text-teal-300"
          : "border-gray-200/80 bg-white/60 text-gray-700 hover:border-teal-400/40 hover:bg-teal-50/50 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/70 dark:hover:border-teal-500/20 dark:hover:bg-white/[0.06]"
      )}
    >
      {label}
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">
      {children}
    </label>
  );
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100/80 bg-white/40 p-5 backdrop-blur-sm dark:border-white/[0.06] dark:bg-white/[0.02]">
      {children}
    </div>
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
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-30 dark:border-white/[0.08] dark:text-white/60 dark:hover:bg-white/[0.04]"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-8 text-center text-lg font-bold tabular-nums text-gray-900 dark:text-white">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-30 dark:border-white/[0.08] dark:text-white/60 dark:hover:bg-white/[0.04]"
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
        className={cn(inputCls, "resize-none")}
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
      <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
        {t("request.step2.title")}
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-white/50">
        {t("request.step2.subtitle")}
      </p>

      <div className="space-y-5">
        {isCleaning && (
          <>
            <FieldGroup>
              <FieldLabel>{t("request.step2.propertyType")}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {(["apartment", "house", "villa", "office"] as const).map((pt) => (
                  <Chip key={pt} label={t(`request.step2.${pt}`)} selected={d.propertyType === pt} onClick={() => upd("propertyType", pt)} />
                ))}
              </div>
            </FieldGroup>
            <FieldGroup>
              <Stepper label={t("request.step2.rooms")} value={(d.rooms as number) ?? 2} onChange={(v) => upd("rooms", v)} />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>{t("request.step2.areaRange")}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {(["small", "medium", "large", "xlarge"] as const).map((sz) => (
                  <Chip key={sz} label={t(`request.step2.area.${sz}`)} selected={d.areaRange === sz} onClick={() => upd("areaRange", sz)} />
                ))}
              </div>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>{t("request.step2.frequency")}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {(["oneTime", "weekly", "biweekly", "monthly"] as const).map((f) => (
                  <Chip key={f} label={t(`request.step2.freq.${f}`)} selected={d.frequency === f} onClick={() => upd("frequency", f)} />
                ))}
              </div>
            </FieldGroup>
            <TextArea label={t("request.step2.notes")} value={(d.notes as string) ?? ""} onChange={(v) => upd("notes", v)} placeholder={t("request.step2.notesPlaceholder")} />
          </>
        )}

        {isRenovation && (
          <>
            <FieldGroup>
              <FieldLabel>{t("request.step2.jobType")}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {(["interior", "exterior", "fullReno", "partialReno", "wallPaint", "ceilingPaint"] as const).map((jt) => (
                  <MultiChip key={jt} label={t(`request.step2.job.${jt}`)} selected={((d.jobTypes as string[]) ?? []).includes(jt)} onClick={() => tog("jobTypes", jt)} />
                ))}
              </div>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>{t("request.step2.areaRange")}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {(["small", "medium", "large", "xlarge"] as const).map((sz) => (
                  <Chip key={sz} label={t(`request.step2.area.${sz}`)} selected={d.areaRange === sz} onClick={() => upd("areaRange", sz)} />
                ))}
              </div>
            </FieldGroup>
            <TextArea label={t("request.step2.notes")} value={(d.notes as string) ?? ""} onChange={(v) => upd("notes", v)} placeholder={t("request.step2.notesPlaceholder")} />
          </>
        )}

        {isTechnical && (
          <>
            <FieldGroup>
              <FieldLabel>{t("request.step2.issueType")}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {(["repair", "installation", "inspection", "replacement", "other"] as const).map((it) => (
                  <Chip key={it} label={t(`request.step2.issue.${it}`)} selected={d.issueType === it} onClick={() => upd("issueType", it)} />
                ))}
              </div>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>{t("request.step2.urgent")}</FieldLabel>
              <button
                type="button"
                onClick={() => upd("isUrgent", !d.isUrgent)}
                className={cn("relative h-8 w-14 rounded-full transition-colors", d.isUrgent ? "bg-teal-500" : "bg-gray-200 dark:bg-white/10")}
              >
                <span className={cn("absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform", d.isUrgent ? "left-7" : "left-1")} />
              </button>
            </FieldGroup>
            <TextArea label={t("request.step2.notes")} value={(d.notes as string) ?? ""} onChange={(v) => upd("notes", v)} placeholder={t("request.step2.notesPlaceholder")} />
          </>
        )}

        {isSimple && (
          <>
            <TextArea label={t("request.step2.description")} value={(d.description as string) ?? ""} onChange={(v) => upd("description", v)} placeholder={t("request.step2.descriptionPlaceholder")} />
            <TextArea label={t("request.step2.notes")} value={(d.notes as string) ?? ""} onChange={(v) => upd("notes", v)} placeholder={t("request.step2.notesPlaceholder")} />
          </>
        )}

        {isCaptain && (
          <>
            <FieldGroup>
              <FieldLabel>{t("request.step2.boatType")}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {(["sailboat", "motorboat", "catamaran", "yacht"] as const).map((bt) => (
                  <Chip key={bt} label={t(`request.step2.boat.${bt}`)} selected={d.boatType === bt} onClick={() => upd("boatType", bt)} />
                ))}
              </div>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>{t("request.step2.boatLength")}</FieldLabel>
              <input type="number" value={(d.boatLength as string) ?? ""} onChange={(e) => upd("boatLength", e.target.value)} placeholder={t("request.step2.boatLengthPlaceholder")} className={inputCls} />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>{t("request.step2.tripDuration")}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {(["halfDay", "fullDay", "multiDay", "weekly"] as const).map((td) => (
                  <Chip key={td} label={t(`request.step2.trip.${td}`)} selected={d.tripDuration === td} onClick={() => upd("tripDuration", td)} />
                ))}
              </div>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>{t("request.step2.hasLicense")}</FieldLabel>
              <button type="button" onClick={() => upd("hasLicense", !d.hasLicense)} className={cn("relative h-8 w-14 rounded-full transition-colors", d.hasLicense ? "bg-teal-500" : "bg-gray-200 dark:bg-white/10")}>
                <span className={cn("absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform", d.hasLicense ? "left-7" : "left-1")} />
              </button>
            </FieldGroup>
          </>
        )}

        {isBoatMaint && (
          <>
            <FieldGroup>
              <FieldLabel>{t("request.step2.boatType")}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {(["sailboat", "motorboat", "catamaran", "yacht"] as const).map((bt) => (
                  <Chip key={bt} label={t(`request.step2.boat.${bt}`)} selected={d.boatType === bt} onClick={() => upd("boatType", bt)} />
                ))}
              </div>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>{t("request.step2.boatLength")}</FieldLabel>
              <input type="number" value={(d.boatLength as string) ?? ""} onChange={(e) => upd("boatLength", e.target.value)} placeholder={t("request.step2.boatLengthPlaceholder")} className={inputCls} />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>{t("request.step2.engineType")}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {(["inboard", "outboard", "diesel", "electric"] as const).map((et) => (
                  <Chip key={et} label={t(`request.step2.engine.${et}`)} selected={d.engineType === et} onClick={() => upd("engineType", et)} />
                ))}
              </div>
            </FieldGroup>
            <TextArea label={t("request.step2.notes")} value={(d.notes as string) ?? ""} onChange={(v) => upd("notes", v)} placeholder={t("request.step2.notesPlaceholder")} />
          </>
        )}

        {isBoatLogistics && (
          <>
            <FieldGroup>
              <FieldLabel>{t("request.step2.boatType")}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {(["sailboat", "motorboat", "catamaran", "yacht"] as const).map((bt) => (
                  <Chip key={bt} label={t(`request.step2.boat.${bt}`)} selected={d.boatType === bt} onClick={() => upd("boatType", bt)} />
                ))}
              </div>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>{t("request.step2.boatLength")}</FieldLabel>
              <input type="number" value={(d.boatLength as string) ?? ""} onChange={(e) => upd("boatLength", e.target.value)} placeholder={t("request.step2.boatLengthPlaceholder")} className={inputCls} />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>{t("request.step2.marina")}</FieldLabel>
              <select value={(d.marina as string) ?? ""} onChange={(e) => upd("marina", e.target.value)} className={inputCls}>
                <option value="">{t("request.step2.selectMarina")}</option>
                {["Porto Montenegro", "Marina Budva", "Marina Bar", "Lazure Marina", "Marina Kotor"].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </FieldGroup>
            <TextArea label={t("request.step2.notes")} value={(d.notes as string) ?? ""} onChange={(v) => upd("notes", v)} placeholder={t("request.step2.notesPlaceholder")} />
          </>
        )}

        {isEmergency && (
          <TextArea label={t("request.step2.description")} value={(d.description as string) ?? ""} onChange={(v) => upd("description", v)} placeholder={t("request.step2.emergencyPlaceholder")} required />
        )}

        {!isCleaning && !isRenovation && !isTechnical && !isSimple && !isCaptain && !isBoatMaint && !isBoatLogistics && !isEmergency && (
          <TextArea label={t("request.step2.description")} value={(d.description as string) ?? ""} onChange={(v) => upd("description", v)} placeholder={t("request.step2.descriptionPlaceholder")} />
        )}
      </div>
    </div>
  );
}
