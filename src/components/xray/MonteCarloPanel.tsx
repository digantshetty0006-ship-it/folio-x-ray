"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { ChartFrame } from "@/components/ui/ChartFrame";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { Label } from "@/components/ui/Label";
import {
  runMonteCarlo,
} from "@/lib/engine/monte-carlo";
import { monteCarloDefaults } from "@/lib/config";
import type { MonteCarloInput } from "@/lib/engine/types";
import { formatINR, formatPct } from "@/lib/format";

const MonteCarloChart = dynamic(() => import("./MonteCarloChart"), {
  ssr: false,
  loading: () => (
    <div className="h-[280px] animate-pulse border border-rule bg-paper-deep/40" />
  ),
});

type FormState = {
  initialValue: string;
  monthlySip: string;
  years: string;
  stepUpPct: string;
  expectedReturnPct: string;
  volatilityPct: string;
  inflationPct: string;
  goalToday: string;
  seed: string;
};

function toForm(input: MonteCarloInput): FormState {
  return {
    initialValue: String(Math.round(input.initialValue)),
    monthlySip: String(Math.round(input.monthlySip)),
    years: String(input.years),
    stepUpPct: String(input.stepUpPct),
    expectedReturnPct: String(input.expectedReturnPct),
    volatilityPct: String(input.volatilityPct),
    inflationPct: String(input.inflationPct),
    goalToday: String(Math.round(input.goalToday)),
    seed: String(input.seed ?? monteCarloDefaults.seed),
  };
}

function makeDefaults(currentValue: number): MonteCarloInput {
  return {
    initialValue: Math.max(0, Math.round(currentValue)),
    monthlySip: monteCarloDefaults.defaultMonthlySip,
    years: monteCarloDefaults.defaultYears,
    stepUpPct: monteCarloDefaults.defaultStepUpPct,
    expectedReturnPct: monteCarloDefaults.defaultExpectedReturnPct,
    volatilityPct: monteCarloDefaults.defaultVolatilityPct,
    inflationPct: monteCarloDefaults.defaultInflationPct,
    goalToday: 10_000_000,
    seed: monteCarloDefaults.seed,
    runs: monteCarloDefaults.runs,
  };
}

function parseForm(form: FormState, fallbackValue: number): MonteCarloInput | string {
  const initialValue =
    form.initialValue.trim() === "" ? fallbackValue : Number(form.initialValue);
  const monthlySip = Number(form.monthlySip);
  const years = Number(form.years);
  const stepUpPct = Number(form.stepUpPct);
  const expectedReturnPct = Number(form.expectedReturnPct);
  const volatilityPct = Number(form.volatilityPct);
  const inflationPct = Number(form.inflationPct);
  const goalToday = Number(form.goalToday);
  const seed = Number(form.seed);

  if (
    ![
      initialValue,
      monthlySip,
      years,
      stepUpPct,
      expectedReturnPct,
      volatilityPct,
      inflationPct,
      goalToday,
      seed,
    ].every(Number.isFinite)
  ) {
    return "Use numbers in every field.";
  }
  if (initialValue < 0 || monthlySip < 0) {
    return "Starting value and monthly SIP cannot be negative.";
  }
  if (monthlySip === 0 && initialValue === 0) {
    return "Add a starting value or a monthly SIP.";
  }
  if (years < 1 || years > 40) return "Choose a horizon between 1 and 40 years.";
  if (expectedReturnPct < 0 || expectedReturnPct > 30) {
    return "Use an expected annual return between 0% and 30%.";
  }
  if (volatilityPct < 0 || volatilityPct > 60) {
    return "Use annual volatility between 0% and 60%.";
  }
  if (inflationPct < 0 || inflationPct > 20) {
    return "Use inflation between 0% and 20%.";
  }
  if (goalToday <= 0) return "Enter a goal greater than zero.";

  return {
    initialValue,
    monthlySip,
    years,
    stepUpPct,
    expectedReturnPct,
    volatilityPct,
    inflationPct,
    goalToday,
    seed: Math.trunc(seed),
    runs: monteCarloDefaults.runs,
  };
}

export function MonteCarloPanel({ currentValue }: { currentValue: number }) {
  const initial = useMemo(() => makeDefaults(currentValue), [currentValue]);
  const [form, setForm] = useState<FormState>(() => toForm(initial));
  const [applied, setApplied] = useState<MonteCarloInput>(initial);
  const [error, setError] = useState<string | null>(null);
  const result = useMemo(() => runMonteCarlo(applied), [applied]);

  function update(key: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = parseForm(form, currentValue);
    if (typeof parsed === "string") {
      setError(parsed);
      return;
    }
    setError(null);
    setApplied(parsed);
  }

  const summary = `Monte Carlo projection over ${applied.years} years: median ${formatINR(
    result.finalPercentiles.p50,
  )}, 10th percentile ${formatINR(
    result.finalPercentiles.p10,
  )}, 90th percentile ${formatINR(
    result.finalPercentiles.p90,
  )}. Probability of reaching the inflation-adjusted goal of ${formatINR(
    result.goalAtHorizon,
  )} is ${formatPct(result.probabilityPct, 1)}.`;

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="no-print lg:col-span-4">
          <form onSubmit={submit} className="border border-rule bg-paper/50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="label-sm text-muted">Assumptions</p>
              <button
                type="button"
                className="label-sm min-h-10 text-accent-ink underline underline-offset-4"
                onClick={() => {
                  const next = makeDefaults(currentValue);
                  setForm(toForm(next));
                  setApplied(next);
                  setError(null);
                }}
              >
                Use portfolio value
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Field
                id="mc-initial"
                label="Starting value ₹"
                value={form.initialValue}
                onChange={(value) => update("initialValue", value)}
                hint={`Portfolio: ${formatINR(currentValue)}`}
              />
              <Field
                id="mc-sip"
                label="Monthly SIP ₹"
                value={form.monthlySip}
                onChange={(value) => update("monthlySip", value)}
              />
              <Field
                id="mc-years"
                label="Years"
                value={form.years}
                onChange={(value) => update("years", value)}
                min="1"
                max="40"
              />
              <Field
                id="mc-stepup"
                label="Annual step-up %"
                value={form.stepUpPct}
                onChange={(value) => update("stepUpPct", value)}
              />
              <Field
                id="mc-return"
                label="Expected return %"
                value={form.expectedReturnPct}
                onChange={(value) => update("expectedReturnPct", value)}
              />
              <Field
                id="mc-vol"
                label="Volatility %"
                value={form.volatilityPct}
                onChange={(value) => update("volatilityPct", value)}
              />
              <Field
                id="mc-inflation"
                label="Inflation %"
                value={form.inflationPct}
                onChange={(value) => update("inflationPct", value)}
              />
              <Field
                id="mc-goal"
                label="Goal today ₹"
                value={form.goalToday}
                onChange={(value) => update("goalToday", value)}
              />
              <Field
                id="mc-seed"
                label="Random seed"
                value={form.seed}
                onChange={(value) => update("seed", value)}
                hint="Same seed, same paths"
              />
              <div className="flex items-end">
                <p className="label-sm text-muted">1,000 runs</p>
              </div>
            </div>

            {error ? (
              <p className="mt-3 text-xs text-accent-ink" role="alert">
                {error}
              </p>
            ) : null}

            <button type="submit" className="btn btn-primary mt-4 w-full">
              Run projection
            </button>
            <p className="mt-2 text-[0.66rem] leading-relaxed text-muted">
              A model, not a forecast. Change any assumption and run it again.
            </p>
          </form>
        </div>

        <div className="lg:col-span-8">
          <ChartFrame
            label="Monte Carlo · 1,000 paths"
            title="A range, not a promise"
            note={`Goal in today’s rupees: ${formatINR(
              applied.goalToday,
            )}. Inflation-adjusted at the horizon: ${formatINR(result.goalAtHorizon)}.`}
            summary={summary}
            disclaimer="Simulated monthly returns, not actual market data. A 10th percentile result is not a worst case. No projection can guarantee a goal. Educational only."
          >
            <MonteCarloChart result={result} />
          </ChartFrame>

          <div className="mt-4 grid gap-3 print:mt-3 print:gap-2 sm:grid-cols-3">
            <div className="border border-rule p-3 print:p-2">
              <Label className="text-muted">Chance of goal</Label>
              <p className="display-md mt-2 tabular text-accent-ink">
                {formatPct(result.probabilityPct, 1)}
              </p>
            </div>
            <div className="border border-rule p-3 print:p-2">
              <Label className="text-muted">Median corpus</Label>
              <p className="display-md mt-2 tabular">
                {formatINR(result.finalPercentiles.p50)}
              </p>
            </div>
            <div className="border border-rule p-3 print:p-2">
              <Label className="text-muted">10th to 90th</Label>
              <p className="mt-2 text-sm tabular leading-relaxed">
                {formatINR(result.finalPercentiles.p10)}
                <br />
                to {formatINR(result.finalPercentiles.p90)}
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-rule pt-3 print:mt-3 print:pt-2">
            <p className="label-sm text-muted">Assumptions shown beside the result</p>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[0.7rem] leading-relaxed sm:grid-cols-3">
              {[
                ["Starting value", formatINR(applied.initialValue)],
                ["Monthly SIP", formatINR(applied.monthlySip)],
                ["Step-up", `${applied.stepUpPct}% a year`],
                ["Expected return", `${applied.expectedReturnPct}% a year`],
                ["Volatility", `${applied.volatilityPct}% a year`],
                ["Inflation", `${applied.inflationPct}% a year`],
                ["Horizon", `${applied.years} years`],
                ["Runs", "1,000"],
                ["Seed", String(applied.seed)],
              ].map(([term, value]) => (
                <div key={term} className="flex justify-between gap-2 border-b border-rule py-1 print:py-0.5">
                  <dt className="text-muted">{term}</dt>
                  <dd className="tabular text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <Disclaimer className="mt-4 print:mt-2">
            Projection uses monthly steps, lognormal returns, SIPs invested at
            the start of each month, optional annual step-up and an
            inflation-adjusted goal. It is a simplified model. Taxes, exit
            loads, changing asset allocation and real-world sequence risk are
            not modelled.
          </Disclaimer>
        </div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  hint,
  min,
  max,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  min?: string;
  max?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label text-[0.6rem]">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min ?? "0"}
        max={max}
        step="any"
        className="field tabular min-h-10 px-2 py-1 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? <p className="mt-0.5 text-[0.6rem] text-muted">{hint}</p> : null}
    </div>
  );
}
