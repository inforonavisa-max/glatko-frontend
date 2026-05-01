"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  shouldShowQuestion,
  validateAnswer,
} from "@/lib/utils/question-visibility";
import { fetchProApplicationQuestions } from "@/lib/supabase/glatko-questions";
import { QuestionRenderer } from "@/components/glatko/request-service/QuestionRenderers";
import type {
  AnswerValue,
  AnswersMap,
  RequestQuestion,
} from "@/lib/types/request-questions";

interface CategoryRef {
  slug: string;
  name: string;
}

interface Props {
  /** Categories selected in StepServiceAreas, with localized display names. */
  categories: CategoryRef[];
  /** Per-category answers map: { categorySlug: AnswersMap }. */
  answers: Record<string, AnswersMap>;
  setAnswers: (next: Record<string, AnswersMap>) => void;
  locale: string;
  t: (key: string) => string;
  validateRef?: React.MutableRefObject<(() => boolean) | null>;
}

interface QuestionsBySlug {
  [slug: string]: RequestQuestion[];
}

/**
 * G-PRO-1 Faz 4: DB-driven pro application questions step. Fetches
 * pro-spesifik soruları each selected category için (parent inheritance via
 * glatko_get_pro_application_questions RPC) and renders them grouped per
 * category. Reuses G-REQ-1 QuestionRenderer + validateAnswer (same schema).
 */
export function StepApplicationQuestions({
  categories,
  answers,
  setAnswers,
  locale,
  t,
  validateRef,
}: Props) {
  const [questionsBySlug, setQuestionsBySlug] = useState<QuestionsBySlug>({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>(
    {},
  );

  useEffect(() => {
    if (categories.length === 0) {
      setQuestionsBySlug({});
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all(
      categories.map(async (c) => ({
        slug: c.slug,
        questions: await fetchProApplicationQuestions(c.slug),
      })),
    ).then((results) => {
      if (cancelled) return;
      const map: QuestionsBySlug = {};
      for (const r of results) map[r.slug] = r.questions;
      setQuestionsBySlug(map);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [categories]);

  const visibleBySlug = useMemo(() => {
    const out: QuestionsBySlug = {};
    for (const [slug, list] of Object.entries(questionsBySlug)) {
      const a = answers[slug] ?? {};
      out[slug] = list.filter((q) => shouldShowQuestion(q, a));
    }
    return out;
  }, [questionsBySlug, answers]);

  function setAnswer(slug: string, key: string, value: AnswerValue) {
    const slugAnswers: AnswersMap = { ...(answers[slug] ?? {}), [key]: value };
    setAnswers({ ...answers, [slug]: slugAnswers });
    const slugErrors = errors[slug];
    if (slugErrors?.[key]) {
      const nextSlugErrs = { ...slugErrors };
      delete nextSlugErrs[key];
      setErrors({ ...errors, [slug]: nextSlugErrs });
    }
  }

  useEffect(() => {
    if (!validateRef) return;
    validateRef.current = () => {
      const nextAll: Record<string, Record<string, string>> = {};
      let firstError = true;
      let pass = true;

      for (const cat of categories) {
        const list = visibleBySlug[cat.slug] ?? [];
        const slugAnswers = answers[cat.slug] ?? {};
        const slugErrs: Record<string, string> = {};
        for (const q of list) {
          const err = validateAnswer(
            q,
            (slugAnswers[q.question_key] ?? null) as AnswerValue,
          );
          if (err) {
            const params = (err.params ?? {}) as Record<
              string,
              string | number
            >;
            const translate = t as unknown as (
              key: string,
              values?: Record<string, string | number>,
            ) => string;
            slugErrs[q.question_key] = translate(err.key, params);
            pass = false;
            firstError = false;
          }
        }
        if (Object.keys(slugErrs).length > 0) nextAll[cat.slug] = slugErrs;
        void firstError;
      }
      setErrors(nextAll);
      return pass;
    };
    return () => {
      if (validateRef.current) validateRef.current = null;
    };
  }, [validateRef, visibleBySlug, answers, categories, locale, t]);

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

  const totalQuestions = Object.values(visibleBySlug).reduce(
    (acc, qs) => acc + qs.length,
    0,
  );

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
        {t("becomePro.steps.applicationQuestions")}
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-white/50">
        {t("becomePro.applicationQuestions.subtitle")}
      </p>

      {totalQuestions === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/40 p-6 text-center text-sm text-gray-500 dark:border-white/[0.08] dark:bg-white/[0.02] dark:text-white/50">
          {t("becomePro.applicationQuestions.noQuestions")}
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => {
            const list = visibleBySlug[cat.slug] ?? [];
            if (list.length === 0) return null;

            const grouped = new Map<number, RequestQuestion[]>();
            for (const q of list) {
              const arr = grouped.get(q.step_order) ?? [];
              arr.push(q);
              grouped.set(q.step_order, arr);
            }
            grouped.forEach((arr) =>
              arr.sort((a, b) => a.field_order - b.field_order),
            );
            const ordered = Array.from(grouped.entries()).sort(
              (a, b) => a[0] - b[0],
            );

            const slugAnswers = answers[cat.slug] ?? {};
            const slugErrs = errors[cat.slug] ?? {};

            return (
              <div
                key={cat.slug}
                className="rounded-2xl border border-gray-100/80 bg-white/40 p-5 backdrop-blur-sm dark:border-white/[0.06] dark:bg-white/[0.02]"
              >
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-8 w-1 rounded-full bg-gradient-to-b from-teal-400 to-teal-600" />
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {cat.name}
                  </h3>
                </div>
                <div className="space-y-5">
                  {ordered.map(([stepOrder, group]) => (
                    <div key={stepOrder} className="space-y-4">
                      {group.map((q) => (
                        <QuestionRenderer
                          key={q.id}
                          question={q}
                          value={
                            (slugAnswers[q.question_key] ?? null) as AnswerValue
                          }
                          onChange={(v) => setAnswer(cat.slug, q.question_key, v)}
                          errorMessage={slugErrs[q.question_key]}
                          locale={locale}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
