"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  formatAnswerError,
  shouldShowQuestion,
  validateAnswer,
} from "@/lib/utils/question-visibility";
import { fetchCategoryQuestions } from "@/lib/supabase/glatko-questions";
import type {
  AnswerValue,
  AnswersMap,
  RequestQuestion,
} from "@/lib/types/request-questions";

import { QuestionRenderer } from "./QuestionRenderers";

interface Props {
  /** Wizard parent's `details` state — answers keyed by `question_key`. */
  details: Record<string, unknown>;
  setDetails: (d: Record<string, unknown>) => void;
  selectedSubSlug: string;
  /** Active locale (passed from parent so validation messages are localized). */
  locale: string;
  t: (key: string) => string;
  /** Optional ref the parent uses to flush all-question validation pre-advance. */
  validateRef?: React.MutableRefObject<(() => boolean) | null>;
}

/**
 * G-REQ-1: DB-driven wizard "details" step.
 *
 * Loads category-specific questions from the
 * `glatko_get_request_questions(p_category_slug)` RPC (which already
 * unions in any inherited parent-category questions) and renders them
 * via the typed renderer dispatcher in `./QuestionRenderers`.
 *
 * The component re-uses the parent wizard's `details` state object so
 * the existing `submitServiceRequest` server action (which JSON-stringifies
 * `details`) keeps working without changes — `question_key` becomes the
 * dict key for each answer.
 *
 * Validation is gated through a ref-callback the parent can call before
 * advancing to the next step, so errors render inline next to fields.
 */
export function StepDetails({
  details,
  setDetails,
  selectedSubSlug,
  locale,
  t,
  validateRef,
}: Props) {
  const [questions, setQuestions] = useState<RequestQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Treat parent `details` as our answers map. Reads are cheap, writes
  // pipe straight back to the parent `setDetails`.
  const answers = details as AnswersMap;

  useEffect(() => {
    if (!selectedSubSlug) {
      setQuestions([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void fetchCategoryQuestions(selectedSubSlug).then((qs) => {
      if (cancelled) return;
      setQuestions(qs);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedSubSlug]);

  const visibleQuestions = useMemo(
    () => questions.filter((q) => shouldShowQuestion(q, answers)),
    [questions, answers],
  );

  const stepGroups = useMemo<Array<[number, RequestQuestion[]]>>(() => {
    const map = new Map<number, RequestQuestion[]>();
    for (const q of visibleQuestions) {
      const list = map.get(q.step_order) ?? [];
      list.push(q);
      map.set(q.step_order, list);
    }
    map.forEach((list) => {
      list.sort((a, b) => a.field_order - b.field_order);
    });
    return Array.from(map.entries()).sort(
      (a, b) => a[0] - b[0],
    );
  }, [visibleQuestions]);

  const handleAnswerChange = (questionKey: string, value: AnswerValue) => {
    setDetails({ ...answers, [questionKey]: value });
    if (errors[questionKey]) {
      const next = { ...errors };
      delete next[questionKey];
      setErrors(next);
    }
  };

  // Expose a validate() function to the parent. Returns true when every
  // visible required question passes; false when at least one fails (and
  // populates inline error messages).
  useEffect(() => {
    if (!validateRef) return;
    validateRef.current = () => {
      const next: Record<string, string> = {};
      for (const q of visibleQuestions) {
        const err = validateAnswer(q, (answers[q.question_key] ?? null) as AnswerValue);
        if (err) next[q.question_key] = formatAnswerError(err, locale);
      }
      setErrors(next);
      return Object.keys(next).length === 0;
    };
    return () => {
      if (validateRef.current) validateRef.current = null;
    };
  }, [validateRef, visibleQuestions, answers, locale]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2
          className="h-6 w-6 animate-spin text-teal-500"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
        {t("request.step2.title")}
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-white/50">
        {t("request.step2.subtitle")}
      </p>

      {questions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/40 p-6 text-center text-sm text-gray-500 dark:border-white/[0.08] dark:bg-white/[0.02] dark:text-white/50">
          {t("request.step2.noQuestions")}
        </div>
      ) : (
        <div className="space-y-6">
          {stepGroups.map(([stepOrder, group]) => (
            <div
              key={stepOrder}
              className="space-y-5 rounded-2xl border border-gray-100/80 bg-white/40 p-5 backdrop-blur-sm dark:border-white/[0.06] dark:bg-white/[0.02]"
            >
              {group.map((q) => (
                <QuestionRenderer
                  key={q.id}
                  question={q}
                  value={(answers[q.question_key] ?? null) as AnswerValue}
                  onChange={(value) => handleAnswerChange(q.question_key, value)}
                  errorMessage={errors[q.question_key]}
                  locale={locale}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
