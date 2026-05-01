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
