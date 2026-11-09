"use client";

import { useState } from "react";
import type { FundDetail } from "@/lib/api/schemas";
import type { SipFrequency } from "@/lib/engine/types";
import { categoryLabels } from "@/lib/fund-mapping";
import { formatDisplayDate, formatNumber } from "@/lib/format";

export type HoldingDraft =
  | {
      mode: "units";
      units: number;
      purchaseDate: string;
    }
  | {
      mode: "sip";
      sipAmount: number;
      sipStartDate: string;
      sipFrequency: SipFrequency;
    };

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function HoldingForm({
  fund,
  loading,
  error,
  onRetry,
  onAdd,
  onCancel,
}: {
  fund: FundDetail | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onAdd: (draft: HoldingDraft) => void;
  onCancel: () => void;
}) {
  const [mode, setMode] = useState<"units" | "sip">("units");
  const [units, setUnits] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [sipAmount, setSipAmount] = useState("");
  const [sipStartDate, setSipStartDate] = useState("");
  const [frequency, setFrequency] = useState<SipFrequency>("monthly");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (loading) {
    return (
      <div className="mt-5 border border-rule bg-paper/60 p-5" aria-live="polite">
        <p className="label-sm text-muted">Loading fund data</p>
        <div className="mt-3 h-5 w-3/4 animate-pulse bg-rule" />
        <div className="mt-2 h-4 w-1/2 animate-pulse bg-rule" />
        <p className="mt-4 text-xs text-muted">
          Fetching public NAV history. Your holdings stay in this browser.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-5 border border-accent-ink bg-accent/5 p-5">
        <p className="label-sm text-accent-ink">Fund data unavailable</p>
        <p className="mt-2 text-sm leading-relaxed">{error}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="btn btn-secondary min-h-10 px-3" onClick={onRetry}>
            Retry fund data
          </button>
          <button type="button" className="btn min-h-10 border-transparent px-3" onClick={onCancel}>
            Choose another fund
          </button>
        </div>
      </div>
    );
  }

  if (!fund) return null;

  const historyStart = fund.history[0]?.date;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (mode === "units") {
      const parsedUnits = Number(units);
      if (!Number.isFinite(parsedUnits) || parsedUnits <= 0) {
        nextErrors.units = "Enter a number greater than zero.";
      }
      if (!purchaseDate) {
        nextErrors.purchaseDate = "Choose the date you bought the units.";
      } else if (purchaseDate > todayIso()) {
        nextErrors.purchaseDate = "The purchase date cannot be in the future.";
      } else if (purchaseDate < historyStart) {
        nextErrors.purchaseDate =
          "This date is before the NAV history we hold. XIRR needs a NAV on or after this date.";
      }

      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        return;
      }

      setErrors({});
      onAdd({ mode: "units", units: parsedUnits, purchaseDate });
      return;
    }

    const parsedAmount = Number(sipAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      nextErrors.sipAmount = "Enter a SIP amount greater than zero.";
    }
    if (!sipStartDate) {
      nextErrors.sipStartDate = "Choose the SIP start date.";
    } else if (sipStartDate > todayIso()) {
      nextErrors.sipStartDate = "The SIP start date cannot be in the future.";
    } else if (sipStartDate < historyStart) {
      nextErrors.sipStartDate =
        "This date is before the NAV history we hold. The first available NAV would be used.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    onAdd({
      mode: "sip",
      sipAmount: parsedAmount,
      sipStartDate,
      sipFrequency: frequency,
    });
  }

  return (
    <div className="mt-5 border border-ink/25 bg-paper/70 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label-sm text-accent-ink">Selected fund</p>
          <h3 className="mt-1 max-w-2xl text-base font-semibold leading-snug">
            {fund.name}
          </h3>
          <p className="mt-1 text-xs text-muted">
            {fund.fundHouse || "Fund house not listed"} ·{" "}
            {categoryLabels[fund.category]} ·{" "}
            {fund.planType === "direct" ? "Direct plan" : "Regular plan"} ·{" "}
            {fund.option === "idcw" ? "IDCW option" : fund.option}
          </p>
        </div>
        <button
          type="button"
          className="label-sm min-h-10 border-b border-ink/30 px-1 hover:text-accent-ink"
          onClick={onCancel}
        >
          Change fund
        </button>
      </div>

      <div className="mt-4 grid gap-2 border-y border-rule py-3 text-xs text-muted sm:grid-cols-2">
        <p>
          Latest NAV{" "}
          <span className="tabular text-ink">₹{formatNumber(fund.latestNav, 4)}</span>{" "}
          on {formatDisplayDate(fund.latestDate)}
        </p>
        <p>
          History from{" "}
          <span className="text-ink">{formatDisplayDate(fund.history[0]?.date)}</span>
        </p>
      </div>

      {fund.option === "idcw" ? (
        <p className="mt-4 border-l-2 border-accent pl-3 text-xs leading-relaxed text-muted">
          This is an IDCW scheme. Payouts are not included in this NAV-only
          calculation, so its XIRR can look different from your actual return.
        </p>
      ) : null}

      <form className="mt-5" onSubmit={submit} noValidate>
        <fieldset>
          <legend className="field-label">How did you invest?</legend>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <button
              type="button"
              aria-pressed={mode === "units"}
              className={`min-h-11 border px-3 text-left text-sm ${
                mode === "units"
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/25 bg-transparent"
              }`}
              onClick={() => {
                setMode("units");
                setErrors({});
              }}
            >
              One-time units
            </button>
            <button
              type="button"
              aria-pressed={mode === "sip"}
              className={`min-h-11 border px-3 text-left text-sm ${
                mode === "sip"
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/25 bg-transparent"
              }`}
              onClick={() => {
                setMode("sip");
                setErrors({});
              }}
            >
              SIP
            </button>
          </div>
        </fieldset>

        {mode === "units" ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="units" className="field-label">
                Units held
              </label>
              <input
                id="units"
                type="number"
                inputMode="decimal"
                min="0.0001"
                step="0.0001"
                className="field tabular"
                value={units}
                onChange={(event) => setUnits(event.target.value)}
                aria-invalid={Boolean(errors.units)}
                aria-describedby={errors.units ? "units-error" : undefined}
                placeholder="e.g. 125.7500"
              />
              {errors.units ? (
                <p id="units-error" className="mt-1 text-xs text-accent-ink">
                  {errors.units}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="purchaseDate" className="field-label">
                Purchase date
              </label>
              <input
                id="purchaseDate"
                type="date"
                max={todayIso()}
                className="field"
                value={purchaseDate}
                onChange={(event) => setPurchaseDate(event.target.value)}
                aria-invalid={Boolean(errors.purchaseDate)}
                aria-describedby={
                  errors.purchaseDate ? "purchase-date-error" : "purchase-date-help"
                }
              />
              <p id="purchase-date-help" className="mt-1 text-[0.68rem] text-muted">
                Used to find the NAV for cost and XIRR. Stamp duty and loads are
                ignored.
              </p>
              {errors.purchaseDate ? (
                <p id="purchase-date-error" className="mt-1 text-xs text-accent-ink">
                  {errors.purchaseDate}
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="sipAmount" className="field-label">
                Amount per instalment
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                  ₹
                </span>
                <input
                  id="sipAmount"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  className="field tabular pl-7"
                  value={sipAmount}
                  onChange={(event) => setSipAmount(event.target.value)}
                  aria-invalid={Boolean(errors.sipAmount)}
                  aria-describedby={errors.sipAmount ? "sip-error" : undefined}
                  placeholder="5,000"
                />
              </div>
              {errors.sipAmount ? (
                <p id="sip-error" className="mt-1 text-xs text-accent-ink">
                  {errors.sipAmount}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="sipStartDate" className="field-label">
                SIP start date
              </label>
              <input
                id="sipStartDate"
                type="date"
                max={todayIso()}
                className="field"
                value={sipStartDate}
                onChange={(event) => setSipStartDate(event.target.value)}
                aria-invalid={Boolean(errors.sipStartDate)}
                aria-describedby={errors.sipStartDate ? "sip-date-error" : undefined}
              />
              {errors.sipStartDate ? (
                <p id="sip-date-error" className="mt-1 text-xs text-accent-ink">
                  {errors.sipStartDate}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="frequency" className="field-label">
                Frequency
              </label>
              <select
                id="frequency"
                className="field"
                value={frequency}
                onChange={(event) =>
                  setFrequency(event.target.value as SipFrequency)
                }
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="submit" className="btn btn-primary">
            Add holding
          </button>
          <p className="text-[0.68rem] leading-relaxed text-muted">
            Illustrative. Your actual cost may differ because of loads, stamp
            duty or payout history.
          </p>
        </div>
      </form>
    </div>
  );
}
