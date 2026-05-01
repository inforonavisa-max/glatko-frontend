/**
 * G-REQ-1: Type definitions for the DB-driven request wizard.
 * Mirrors the glatko_request_questions table shape returned by the
 * glatko_get_request_questions(p_category_slug) RPC.
 */

export type QuestionType =
  | "text"
  | "textarea"
  | "select"
  | "multiselect"
  | "number"
  | "date"
  | "file"
  | "slider";

export interface QuestionOption {
  value: string;
  label: Record<string, string>; // 9-locale localized labels
}

export interface QuestionValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  minSelected?: number;
  pattern?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export type QuestionShowIfOperator =
  | "eq"
  | "ne"
  | "gt"
  | "lt"
  | "gte"
  | "lte"
  | "in"
  | "not_in";

export interface QuestionShowIf {
  question_key: string;
  operator: QuestionShowIfOperator;
  value: string | number | boolean | Array<string | number>;
}

export interface RequestQuestion {
  id: string;
  question_key: string;
  question_type: QuestionType;
  label: Record<string, string>;
  placeholder: Record<string, string> | null;
  help_text: Record<string, string> | null;
  options: QuestionOption[] | null;
  validation: QuestionValidation | null;
  show_if: QuestionShowIf | null;
  step_order: number;
  field_order: number;
  is_required: boolean;
}

/**
 * Allowed answer shapes per `QuestionType`. The wizard form generator
 * stores the full `details` dict (already part of the parent wizard's
 * state) using these values keyed by `question_key`.
 */
export type AnswerValue =
  | string
  | number
  | string[]
  | boolean
  | null;

export type AnswersMap = Record<string, AnswerValue>;
