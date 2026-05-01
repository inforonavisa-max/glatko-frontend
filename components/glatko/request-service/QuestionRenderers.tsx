"use client";

import { Camera, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type {
  AnswerValue,
  QuestionValidation,
  RequestQuestion,
} from "@/lib/types/request-questions";

const inputCls = cn(
  "block w-full rounded-xl border border-gray-200 dark:border-white/[0.08]",
  "bg-gray-50/50 dark:bg-white/[0.03] px-4 py-3 text-sm",
  "text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30",
  "focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all",
);

function pickLocalized(
  obj: Record<string, string> | null | undefined,
  locale: string,
  fallback = "",
): string {
  if (!obj) return fallback;
  return obj[locale] || obj.en || fallback;
}

interface RendererProps {
  question: RequestQuestion;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  errorMessage?: string;
  locale: string;
}

/* ─── Field shell (label + help + error) ──────────────────────────────── */

function FieldShell({
  question,
  errorMessage,
  locale,
  children,
}: {
  question: RequestQuestion;
  errorMessage?: string;
  locale: string;
  children: React.ReactNode;
}) {
  const label = pickLocalized(question.label, locale, question.question_key);
  const helpText = pickLocalized(question.help_text, locale);
  const required = question.is_required || question.validation?.required;

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">
        {label}
        {required ? (
          <span className="ml-1 text-teal-500" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {children}
      {helpText ? (
        <p className="text-xs text-gray-500 dark:text-white/40">{helpText}</p>
      ) : null}
      {errorMessage ? (
        <p className="text-xs font-medium text-red-500 dark:text-red-400">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

/* ─── Individual renderers ────────────────────────────────────────────── */

function TextRenderer({ question, value, onChange, locale }: RendererProps) {
  const placeholder = pickLocalized(question.placeholder, locale);
  return (
    <input
      type="text"
      value={(value as string) ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || undefined}
      className={inputCls}
      maxLength={question.validation?.maxLength}
    />
  );
}

function TextareaRenderer({
  question,
  value,
  onChange,
  locale,
}: RendererProps) {
  const placeholder = pickLocalized(question.placeholder, locale);
  return (
    <textarea
      value={(value as string) ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || undefined}
      rows={4}
      maxLength={question.validation?.maxLength}
      className={cn(inputCls, "resize-none")}
    />
  );
}

function NumberRenderer({ question, value, onChange, locale }: RendererProps) {
  const placeholder = pickLocalized(question.placeholder, locale);
  const v = question.validation;
  return (
    <input
      type="number"
      value={value === null || value === undefined ? "" : String(value)}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === "") {
          onChange(null);
          return;
        }
        const num = Number(raw);
        onChange(Number.isNaN(num) ? null : num);
      }}
      placeholder={placeholder || undefined}
      min={v?.min}
      max={v?.max}
      step="any"
      className={inputCls}
    />
  );
}

function DateRenderer({ question, value, onChange }: RendererProps) {
  void question;
  return (
    <input
      type="date"
      value={(value as string) ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
    />
  );
}

function SelectRenderer({ question, value, onChange, locale }: RendererProps) {
  const options = question.options ?? [];
  const selected = (value as string) ?? "";
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isActive = selected === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(isActive ? null : opt.value)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
              isActive
                ? "border-teal-500/40 bg-teal-500/10 text-teal-700 shadow-sm shadow-teal-500/10 dark:border-teal-500/30 dark:bg-teal-500/15 dark:text-teal-300"
                : "border-gray-200/80 bg-white/60 text-gray-700 hover:border-teal-400/40 hover:bg-teal-50/50 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/70 dark:hover:border-teal-500/20 dark:hover:bg-white/[0.06]",
            )}
          >
            {pickLocalized(opt.label, locale, opt.value)}
          </button>
        );
      })}
    </div>
  );
}

function MultiselectRenderer({
  question,
  value,
  onChange,
  locale,
}: RendererProps) {
  const options = question.options ?? [];
  const selected = Array.isArray(value) ? (value as string[]) : [];
  const toggle = (optValue: string) => {
    if (selected.includes(optValue)) {
      onChange(selected.filter((v) => v !== optValue));
    } else {
      onChange([...selected, optValue]);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isActive = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
              isActive
                ? "border-teal-500/40 bg-teal-500/15 text-teal-700 dark:border-teal-500/30 dark:text-teal-300"
                : "border-gray-200/80 bg-white/60 text-gray-700 hover:border-teal-400/40 hover:bg-teal-50/50 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/70 dark:hover:border-teal-500/20 dark:hover:bg-white/[0.06]",
            )}
          >
            {isActive ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
            {pickLocalized(opt.label, locale, opt.value)}
          </button>
        );
      })}
    </div>
  );
}

function SliderRenderer({ question, value, onChange }: RendererProps) {
  const v: QuestionValidation = question.validation ?? {};
  const min = v.min ?? 0;
  const max = v.max ?? 100;
  const numeric = typeof value === "number" ? value : min;
  return (
    <div className="space-y-2">
      <input
        type="range"
        min={min}
        max={max}
        step="any"
        value={numeric}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full appearance-none rounded-lg bg-gray-200 accent-teal-500 dark:bg-white/10"
      />
      <div className="flex justify-between text-xs text-gray-500 dark:text-white/40">
        <span>{min}</span>
        <span className="font-semibold text-teal-600 dark:text-teal-300">
          {numeric}
        </span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function FileFallbackRenderer({ locale }: { locale: string }) {
  // file question_type is registered in DB seed but actual photo upload
  // is consolidated into the next wizard step (StepPhotos.tsx). Render a
  // small explanatory hint so categories that ship a `photos` question
  // still feel coherent.
  const HINTS: Record<string, string> = {
    me: "Fotografije se dodaju u sljedećem koraku.",
    sr: "Fotografije se dodaju u sledećem koraku.",
    en: "You can attach photos in the next step.",
    tr: "Fotoğrafları bir sonraki adımda ekleyebilirsiniz.",
    de: "Fotos können Sie im nächsten Schritt hinzufügen.",
    it: "Le foto si aggiungono nel prossimo passaggio.",
    ru: "Фото можно добавить на следующем шаге.",
    ar: "يمكنك إضافة الصور في الخطوة التالية.",
    uk: "Фото можна додати на наступному кроці.",
  };
  const hint = HINTS[locale] || HINTS.en;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-600 dark:border-white/[0.08] dark:bg-white/[0.02] dark:text-white/60">
      <Camera
        className="h-4 w-4 shrink-0 text-teal-500"
        aria-hidden="true"
      />
      <span>{hint}</span>
    </div>
  );
}

/* ─── Top-level dispatcher ────────────────────────────────────────────── */

export function QuestionRenderer(props: RendererProps) {
  const { question, errorMessage, locale } = props;

  let body: React.ReactNode;
  switch (question.question_type) {
    case "text":
      body = <TextRenderer {...props} />;
      break;
    case "textarea":
      body = <TextareaRenderer {...props} />;
      break;
    case "number":
      body = <NumberRenderer {...props} />;
      break;
    case "date":
      body = <DateRenderer {...props} />;
      break;
    case "select":
      body = <SelectRenderer {...props} />;
      break;
    case "multiselect":
      body = <MultiselectRenderer {...props} />;
      break;
    case "slider":
      body = <SliderRenderer {...props} />;
      break;
    case "file":
      body = <FileFallbackRenderer locale={locale} />;
      break;
    default:
      body = null;
  }

  return (
    <FieldShell
      question={question}
      errorMessage={errorMessage}
      locale={locale}
    >
      {body}
    </FieldShell>
  );
}

