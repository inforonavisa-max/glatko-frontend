import type {
  AnswersMap,
  AnswerValue,
  QuestionShowIfOperator,
  QuestionValidation,
  RequestQuestion,
} from "@/lib/types/request-questions";

/**
 * Decide whether a question should render given the current answers.
 * If the question has no `show_if` constraint, it's always visible.
 * If the dependency hasn't been answered yet, the question stays hidden
 * (otherwise validation would fire on a question the user can't see).
 */
export function shouldShowQuestion(
  question: RequestQuestion,
  answers: AnswersMap,
): boolean {
  const condition = question.show_if;
  if (!condition) return true;

  const dependent = answers[condition.question_key];
  if (dependent === undefined || dependent === null || dependent === "") {
    return false;
  }

  return evaluateCondition(condition.operator, dependent, condition.value);
}

function evaluateCondition(
  op: QuestionShowIfOperator,
  left: AnswerValue,
  right: unknown,
): boolean {
  switch (op) {
    case "eq":
      return left === right;
    case "ne":
      return left !== right;
    case "gt":
      return Number(left) > Number(right);
    case "lt":
      return Number(left) < Number(right);
    case "gte":
      return Number(left) >= Number(right);
    case "lte":
      return Number(left) <= Number(right);
    case "in":
      if (!Array.isArray(right)) return false;
      if (Array.isArray(left)) {
        return left.some((v) => (right as Array<string | number>).includes(v));
      }
      return (right as Array<string | number>).includes(
        left as string | number,
      );
    case "not_in":
      if (!Array.isArray(right)) return true;
      if (Array.isArray(left)) {
        return !left.some((v) => (right as Array<string | number>).includes(v));
      }
      return !(right as Array<string | number>).includes(
        left as string | number,
      );
    default:
      return true;
  }
}

/**
 * Run a single answer through the question's validation rules. Returns
 * an i18n message KEY (e.g. `request.errors.required`) plus optional
 * `params` for ICU placeholders. The renderer is responsible for piping
 * this through `useTranslations()` — keeping translation lookups out of
 * the validator means it stays runtime-pure and SSR-safe.
 */
export interface AnswerError {
  key: string;
  params?: Record<string, string | number>;
}

export function validateAnswer(
  question: RequestQuestion,
  value: AnswerValue,
): AnswerError | null {
  const v: QuestionValidation = question.validation ?? {};
  const required = v.required || question.is_required;

  if (required && isEmpty(value)) {
    return { key: "request.errors.required" };
  }

  // Empty-but-optional → no further validation.
  if (isEmpty(value)) return null;

  if (typeof value === "number" && !Number.isNaN(value)) {
    if (v.min !== undefined && value < v.min) {
      return { key: "request.errors.min", params: { min: v.min } };
    }
    if (v.max !== undefined && value > v.max) {
      return { key: "request.errors.max", params: { max: v.max } };
    }
  }

  if (typeof value === "string") {
    if (v.minLength !== undefined && value.length < v.minLength) {
      return { key: "request.errors.minLength", params: { min: v.minLength } };
    }
    if (v.maxLength !== undefined && value.length > v.maxLength) {
      return { key: "request.errors.maxLength", params: { max: v.maxLength } };
    }
    if (v.pattern) {
      try {
        if (!new RegExp(v.pattern).test(value)) {
          return { key: "request.errors.pattern" };
        }
      } catch {
        // Bad pattern in DB — silently ignore so users aren't blocked.
      }
    }
  }

  if (Array.isArray(value)) {
    if (v.minSelected !== undefined && value.length < v.minSelected) {
      return {
        key: "request.errors.minSelected",
        params: { min: v.minSelected },
      };
    }
  }

  return null;
}

function isEmpty(value: AnswerValue): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim().length === 0) return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

/**
 * Render an `AnswerError` into a localized human string. Carries inline
 * 9-locale fallbacks so the wizard ships even before Faz 10 lands the
 * `request.errors.*` dictionary keys. Once those keys exist this helper
 * can be replaced with a `t(error.key, error.params)` call at the call
 * site without touching the renderers.
 */
const ERROR_TEMPLATES: Record<string, Record<string, string>> = {
  "request.errors.required": {
    me: "Ovo polje je obavezno",
    sr: "Ovo polje je obavezno",
    en: "This field is required",
    tr: "Bu alan zorunludur",
    de: "Dieses Feld ist erforderlich",
    it: "Questo campo è obbligatorio",
    ru: "Это поле обязательно",
    ar: "هذا الحقل مطلوب",
    uk: "Це поле обов'язкове",
  },
  "request.errors.min": {
    me: "Minimum vrijednost: {min}",
    sr: "Minimalna vrednost: {min}",
    en: "Minimum value: {min}",
    tr: "Minimum değer: {min}",
    de: "Mindestwert: {min}",
    it: "Valore minimo: {min}",
    ru: "Минимальное значение: {min}",
    ar: "القيمة الدنيا: {min}",
    uk: "Мінімальне значення: {min}",
  },
  "request.errors.max": {
    me: "Maksimum vrijednost: {max}",
    sr: "Maksimalna vrednost: {max}",
    en: "Maximum value: {max}",
    tr: "Maksimum değer: {max}",
    de: "Höchstwert: {max}",
    it: "Valore massimo: {max}",
    ru: "Максимальное значение: {max}",
    ar: "القيمة القصوى: {max}",
    uk: "Максимальне значення: {max}",
  },
  "request.errors.minLength": {
    me: "Minimum {min} karaktera",
    sr: "Najmanje {min} karaktera",
    en: "Minimum {min} characters",
    tr: "En az {min} karakter",
    de: "Mindestens {min} Zeichen",
    it: "Minimo {min} caratteri",
    ru: "Минимум {min} символов",
    ar: "الحد الأدنى {min} أحرف",
    uk: "Щонайменше {min} символів",
  },
  "request.errors.maxLength": {
    me: "Maksimum {max} karaktera",
    sr: "Najviše {max} karaktera",
    en: "Maximum {max} characters",
    tr: "En fazla {max} karakter",
    de: "Maximal {max} Zeichen",
    it: "Massimo {max} caratteri",
    ru: "Максимум {max} символов",
    ar: "الحد الأقصى {max} أحرف",
    uk: "Щонайбільше {max} символів",
  },
  "request.errors.pattern": {
    me: "Neispravan format",
    sr: "Neispravan format",
    en: "Invalid format",
    tr: "Geçersiz format",
    de: "Ungültiges Format",
    it: "Formato non valido",
    ru: "Неверный формат",
    ar: "تنسيق غير صالح",
    uk: "Невірний формат",
  },
  "request.errors.minSelected": {
    me: "Izaberite najmanje {min}",
    sr: "Izaberite najmanje {min}",
    en: "Select at least {min}",
    tr: "En az {min} seçin",
    de: "Mindestens {min} auswählen",
    it: "Selezionane almeno {min}",
    ru: "Выберите минимум {min}",
    ar: "اختر على الأقل {min}",
    uk: "Виберіть щонайменше {min}",
  },
};

export function formatAnswerError(
  error: AnswerError,
  locale: string,
): string {
  const template =
    ERROR_TEMPLATES[error.key]?.[locale] ||
    ERROR_TEMPLATES[error.key]?.en ||
    error.key;

  if (!error.params) return template;
  let out = template;
  for (const [k, v] of Object.entries(error.params)) {
    out = out.replace(`{${k}}`, String(v));
  }
  return out;
}
