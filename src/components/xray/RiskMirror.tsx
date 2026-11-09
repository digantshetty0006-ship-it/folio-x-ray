"use client";

import { useMemo, useState } from "react";
import type { AllocationSlice } from "@/lib/engine/types";
import { readRiskMirror } from "@/lib/engine/risk";
import {
  riskQuestions,
  type RiskAnswerValue,
  type RiskQuestion,
  type RiskQuestionId,
} from "@/lib/content/risk-questions";
import { Disclaimer } from "@/components/ui/Disclaimer";

function answerLabel(
  question: RiskQuestion,
  value: RiskAnswerValue | undefined,
): string {
  return (
    question.options.find((option) => option.value === value)?.label ??
    "Not answered"
  );
}

export function RiskMirror({
  currentAllocation,
}: {
  currentAllocation: AllocationSlice[];
}) {
  const [answers, setAnswers] = useState<
    Partial<Record<RiskQuestionId, RiskAnswerValue>>
  >({});
  const answeredCount = Object.keys(answers).length;
  const result = useMemo(
    () => readRiskMirror(answers, currentAllocation),
    [answers, currentAllocation],
  );

  return (
    <div>
      <div className="no-print">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className="label-sm text-muted">
            {answeredCount} of {riskQuestions.length} answered
          </p>
          {answeredCount > 0 ? (
            <button
              type="button"
              className="label-sm min-h-10 border-b border-ink/30 hover:text-accent-ink"
              onClick={() => setAnswers({})}
            >
              Clear answers
            </button>
          ) : null}
        </div>

        <ol className="mt-5 space-y-5">
          {riskQuestions.map((question, index) => (
            <li key={question.id} className="border-t border-rule pt-4">
              <fieldset>
                <legend className="text-sm font-medium leading-snug">
                  <span className="label-sm mr-2 text-accent-ink">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {question.prompt}
                </legend>
                <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted">
                  {question.help}
                </p>
                <div className="mt-3 grid gap-1.5 sm:grid-cols-3">
                  {question.options.map((option) => (
                    <label
                      key={option.value}
                      className={`flex min-h-11 cursor-pointer items-start gap-2 border px-3 py-2 text-xs leading-relaxed transition-colors ${
                        answers[question.id] === option.value
                          ? "border-ink bg-paper-deep"
                          : "border-rule hover:border-ink/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option.value}
                        checked={answers[question.id] === option.value}
                        onChange={() =>
                          setAnswers((current) => ({
                            ...current,
                            [question.id]: option.value,
                          }))
                        }
                        className="mt-0.5 size-4 shrink-0 accent-[var(--accent)]"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </li>
          ))}
        </ol>
      </div>

      {result.ok ? (
        <div className="mt-7 border-t border-ink pt-5">
          <p className="label-sm text-muted">What the mirror shows</p>
          <p className="display-md mt-1 max-w-2xl text-accent-ink">
            {result.headline}
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="label-sm text-muted">Your answers</p>
              <dl className="mt-2 space-y-2">
                {riskQuestions.map((question) => (
                  <div key={question.id} className="border-b border-rule pb-2">
                    <dt className="text-xs leading-relaxed text-muted">
                      {question.prompt}
                    </dt>
                    <dd className="mt-0.5 text-sm font-medium">
                      {answerLabel(question, answers[question.id])}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <p className="label-sm text-muted">Your current mix</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                {(["equity", "debt", "other"] as const).map((key) => (
                  <div key={key} className="border border-rule p-2">
                    <p className="tabular display-md text-2xl">
                      {result.current[key].toFixed(1)}%
                    </p>
                    <p className="label-sm mt-1 text-muted">{key}</p>
                  </div>
                ))}
              </div>

              <ul className="mt-4 space-y-2">
                {result.notes.map((note) => (
                  <li
                    key={note}
                    className="border-t border-rule pt-2 text-sm leading-relaxed text-muted"
                  >
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-4 text-[0.68rem] leading-relaxed text-muted">
            Hybrid and Gold & other are grouped under “other” for this
            comparison. Percentages only. No score, band or target allocation is
            produced.
          </p>
        </div>
      ) : (
        <p className="mt-6 border-t border-rule pt-4 text-sm text-muted">
          Answer all three questions to see how your answers compare with the
          mix you hold.
        </p>
      )}

      <Disclaimer className="mt-5">
        The mirror compares three stated answers with the portfolio’s current
        category shares. It does not score you, recommend an allocation, or
        account for your income, loans, dependants, taxes, insurance or goals.
        Not investment advice.
      </Disclaimer>
    </div>
  );
}
