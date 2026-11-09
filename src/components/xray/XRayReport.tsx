"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { ChartFrame } from "@/components/ui/ChartFrame";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { Label } from "@/components/ui/Label";
import { RiskMirror } from "./RiskMirror";
import { MonteCarloPanel } from "./MonteCarloPanel";
import type { PortfolioSummary, XirrResult } from "@/lib/engine/types";
import type { ToolHolding } from "@/lib/portfolio/tool-holding";
import { computeCostGap } from "@/lib/engine/cost-gap";
import { categoryLabels } from "@/lib/fund-mapping";
import { costGapDefaults } from "@/lib/config";
import {
  formatDisplayDate,
  formatINR,
  formatPct,
  formatSignedPct,
} from "@/lib/format";

const AllocationChart = dynamic(() => import("./AllocationChart"), {
  ssr: false,
  loading: () => (
    <div className="h-[250px] animate-pulse border border-rule bg-paper-deep/40" />
  ),
});

const CostGapChart = dynamic(() => import("./CostGapChart"), {
  ssr: false,
  loading: () => (
    <div className="h-[230px] animate-pulse border border-rule bg-paper-deep/40" />
  ),
});

function xirrDisplay(result: XirrResult): string {
  if (result.rate === null) return "Not available";
  return formatPct(result.rate * 100, 2);
}

function holdingMode(holding: ToolHolding): string {
  if (holding.mode === "sip") {
    return `SIP ${formatINR(holding.sipAmount ?? 0)} / ${
      holding.sipFrequency === "monthly"
        ? "month"
        : holding.sipFrequency === "weekly"
          ? "week"
          : "quarter"
    }`;
  }
  return `${holding.units?.toLocaleString("en-IN", {
    maximumFractionDigits: 4,
  })} units`;
}

export function XRayReport({
  holdings,
  portfolio,
}: {
  holdings: ToolHolding[];
  portfolio: PortfolioSummary;
}) {
  const [assumedReturn, setAssumedReturn] = useState<number>(
    costGapDefaults.assumedReturnPct,
  );
  const [expenseGap, setExpenseGap] = useState<number>(
    costGapDefaults.expenseGapPct,
  );

  const costGap = useMemo(
    () => computeCostGap(portfolio.holdings, assumedReturn, expenseGap),
    [portfolio.holdings, assumedReturn, expenseGap],
  );

  const latestDate = holdings
    .map((holding) => holding.fund.latestDate)
    .sort()
    .at(-1);
  const categoryCount = portfolio.allocation.byCategory.length;
  const topFund = portfolio.allocation.byFund[0];
  const hasAllocation =
    portfolio.allocation.byCategory.length > 0 && portfolio.totalValue > 0;

  const allocationSummary = [
    ...portfolio.allocation.byCategory.map(
      (slice) => `${slice.label} ${slice.pct.toFixed(1)}%`,
    ),
    topFund ? `largest fund ${topFund.label} at ${topFund.pct.toFixed(1)}%` : "",
  ]
    .filter(Boolean)
    .join(", ");

  const costSummary = costGap.hasRegular
    ? `Regular-plan value ${formatINR(costGap.regularValue)}. At ${assumedReturn}% a year with a ${expenseGap.toFixed(
        1,
      )} percentage point gap, the illustrative difference is ${formatINR(
        costGap.totals[0]?.difference ?? 0,
      )} over 10 years and ${formatINR(
        costGap.totals[1]?.difference ?? 0,
      )} over 20 years.`
    : "There are no Regular-plan holdings in this portfolio, so this block has nothing to project.";

  return (
    <div id="report" className="scroll-mt-24">
      <header className="print-avoid-break border-t border-ink pt-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="label text-accent-ink">Step 2 / Your report</p>
            <h2 className="display-lg mt-3">Portfolio X-Ray</h2>
            <p className="mt-2 text-sm text-muted">
              {holdings.length} holding{holdings.length === 1 ? "" : "s"} ·{" "}
              {categoryCount} categor{categoryCount === 1 ? "y" : "ies"} · NAVs
              up to {latestDate ? formatDisplayDate(latestDate) : "the latest date"}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary no-print"
            onClick={() => window.print()}
          >
            Save as PDF
          </button>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-12 sm:items-end">
          <div className="sm:col-span-6">
            <p className="label-sm text-muted">Current value</p>
            <p className="display-xl mt-2 tabular">
              {formatINR(portfolio.totalValue)}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-4 sm:col-span-6 sm:grid-cols-3">
            <div>
              <dt className="label-sm text-muted">Invested</dt>
              <dd className="mt-1 tabular text-lg">
                {formatINR(portfolio.totalInvested)}
              </dd>
            </div>
            <div>
              <dt className="label-sm text-muted">Gain / loss</dt>
              <dd className="mt-1 tabular text-lg">
                {formatINR(portfolio.gain)}
                <span className="block text-xs text-muted">
                  {portfolio.gainPct === null
                    ? "Not available"
                    : formatSignedPct(portfolio.gainPct, 1)}
                </span>
              </dd>
            </div>
            <div>
              <dt className="label-sm text-muted">Portfolio XIRR</dt>
              <dd className="mt-1 tabular text-lg">
                {xirrDisplay(portfolio.xirr)}
                {portfolio.xirr.rate === null && portfolio.xirr.reason ? (
                  <span className="block max-w-[16rem] text-[0.65rem] font-normal leading-snug text-muted">
                    {portfolio.xirr.reason}
                  </span>
                ) : null}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 border-t border-rule pt-3">
          <Disclaimer>
            Values use the latest published NAV for each fund, which may be from
            different dates. XIRR is annualised and cash-flow weighted. It is
            not the same as a fund&apos;s published point-to-point return.
          </Disclaimer>
        </div>
      </header>

      <section
        className="print-page mt-14 border-t border-ink pt-5 print:mt-0"
        aria-labelledby="report-allocation"
      >
        <p className="label text-accent-ink">01 / Allocation</p>
        <h3 id="report-allocation" className="display-lg mt-3">
          Where the value sits.
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Category labels come from the fund data source. “Gold & other” includes
          index funds, fund of funds and commodity schemes, so it is a broad
          bucket rather than a single asset.
        </p>

        {hasAllocation ? (
          <>
            <div className="mt-7 print:mt-4">
              <ChartFrame
                label="Allocation"
                title="By category and by fund"
                summary={`Allocation: ${allocationSummary}.`}
                disclaimer="Category labels are simplified from scheme_category. Always check the scheme information document for the actual mandate."
              >
                <AllocationChart
                  byCategory={portfolio.allocation.byCategory}
                  byFund={portfolio.allocation.byFund}
                />
              </ChartFrame>
            </div>

            <div className="mt-6 grid gap-6 print:mt-4 print:grid-cols-2 print:gap-4 lg:grid-cols-2">
              <div className="min-w-0">
                <Label className="text-muted">By category</Label>
                <dl className="mt-2 border-t border-rule print:mt-1">
                  {portfolio.allocation.byCategory.map((slice) => (
                    <div
                      key={slice.key}
                      className="flex justify-between gap-3 border-b border-rule py-2 text-sm print:py-1"
                    >
                      <dt className="min-w-0">{slice.label}</dt>
                      <dd className="tabular shrink-0 text-right">
                        {formatINR(slice.value)}{" "}
                        <span className="text-muted">
                          {slice.pct.toFixed(1)}%
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="min-w-0">
                <Label className="text-muted">By fund</Label>
                <dl className="mt-2 border-t border-rule print:mt-1">
                  {portfolio.allocation.byFund.map((slice) => (
                    <div
                      key={slice.key}
                      className="flex justify-between gap-3 border-b border-rule py-2 text-sm print:py-1"
                    >
                      <dt className="min-w-0 flex-1 truncate">{slice.label}</dt>
                      <dd className="tabular shrink-0 text-right">
                        {formatINR(slice.value)}{" "}
                        <span className="text-muted">
                          {slice.pct.toFixed(1)}%
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-7 border border-rule bg-paper/60 p-5 print:p-3">
            <p className="label-sm text-muted">No allocation yet</p>
            <p className="display-md mt-2">There is no priced value to divide.</p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              The holdings in this report have no units at the latest published
              NAV. That can happen when a purchase or SIP date is later than the
              fund&apos;s last NAV, or when the data source has stopped updating
              the scheme. Check the holding dates and the fund&apos;s NAV
              history.
            </p>
          </div>
        )}
      </section>

      <section
        className="print-page mt-14 border-t border-ink pt-5 print:mt-0"
        aria-labelledby="report-flags"
      >
        <p className="label text-accent-ink">02 / What stands out</p>
        <h3 id="report-flags" className="display-lg mt-3">
          Plain-language notes.
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          These are observations from the numbers you entered. They are not
          instructions.
        </p>

        <div className="mt-7">
          {portfolio.flags.length > 0 ? (
            <ul className="border-t border-ink">
              {portfolio.flags.map((flag) => (
                <li
                  key={flag.id}
                  className="grid gap-2 border-b border-rule py-5 sm:grid-cols-12"
                >
                  <div className="sm:col-span-4">
                    <p className="label-sm text-accent-ink">
                      {flag.kind === "single-fund"
                        ? "Single-fund weight"
                        : flag.kind === "category"
                          ? "Category weight"
                          : "Shared category"}
                    </p>
                    <p className="mt-1 text-sm font-medium">{flag.title}</p>
                  </div>
                  <p className="text-sm leading-relaxed text-muted sm:col-span-8">
                    {flag.detail}
                  </p>
                </li>
              ))}
            </ul>
          ) : hasAllocation ? (
            <div className="border-y border-rule py-6">
              <p className="display-md">No threshold flags were triggered.</p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                That means this portfolio did not cross the specific thresholds
                used here. It does not prove the portfolio is diversified or
                suitable for your goals.
              </p>
            </div>
          ) : (
            <div className="border-y border-rule py-6">
              <p className="display-md">There is no priced value to assess.</p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                Threshold flags need a current value. The holdings below were
                left out or valued at zero, so this section has nothing to
                compare.
              </p>
            </div>
          )}
        </div>

        <Disclaimer className="mt-5">
          Flags use the thresholds shown on /method: one fund at or above 35% of
          value, one category at or above 80%, or three funds sharing a
          category. Different funds can still own the same securities.
        </Disclaimer>

        <div className="mt-10">
          <Label className="text-muted">Holdings and cash-flow returns</Label>
          <p className="mt-2 text-[0.68rem] leading-relaxed text-muted sm:hidden">
            Swipe the table sideways to see every column.
          </p>
          <div
            className="mt-2 overflow-x-auto"
            tabIndex={0}
            role="region"
            aria-label="Holdings and cash-flow returns table. Scroll sideways for more columns."
          >
            <table className="w-full min-w-[44rem] border-collapse text-left text-xs print:min-w-0">
              <caption className="sr-only">
                Your holdings with values, invested amounts and XIRR
              </caption>
              <thead>
                <tr className="border-b border-ink">
                  <th scope="col" className="label-sm py-2 font-normal">
                    Fund
                  </th>
                  <th scope="col" className="label-sm py-2 font-normal">
                    Plan / mode
                  </th>
                  <th scope="col" className="label-sm py-2 text-right font-normal">
                    Value
                  </th>
                  <th scope="col" className="label-sm py-2 text-right font-normal">
                    Invested
                  </th>
                  <th scope="col" className="label-sm py-2 text-right font-normal">
                    XIRR
                  </th>
                </tr>
              </thead>
              <tbody>
                {portfolio.holdings.map((evaluation) => {
                  const holding = holdings.find((item) => item.id === evaluation.id);
                  return (
                    <tr key={evaluation.id} className="border-b border-rule align-top">
                      <th scope="row" className="max-w-[18rem] py-3 pr-3 font-normal">
                        {evaluation.fundName}
                        <span className="mt-0.5 block text-[0.65rem] font-normal text-muted">
                          {categoryLabels[evaluation.category]}
                        </span>
                      </th>
                      <td className="py-3 pr-3 text-muted">
                        {evaluation.planType === "direct" ? "Direct" : "Regular"}
                        <span className="block text-[0.65rem]">
                          {holding ? holdingMode(holding) : evaluation.mode}
                        </span>
                      </td>
                      <td className="tabular py-3 pr-3 text-right">
                        {formatINR(evaluation.value)}
                      </td>
                      <td className="tabular py-3 pr-3 text-right">
                        {formatINR(evaluation.invested)}
                      </td>
                      <td className="tabular py-3 text-right">
                        {xirrDisplay(evaluation.xirr)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {portfolio.holdings.some((holding) => !holding.ok) ? (
          <div className="mt-4 border-l-2 border-accent pl-3">
            <p className="label-sm text-accent-ink">Holdings left out</p>
            {portfolio.holdings
              .filter((holding) => !holding.ok)
              .map((holding) => (
                <p key={holding.id} className="mt-1 text-xs leading-relaxed">
                  <strong>{holding.fundName}:</strong> {holding.error}
                </p>
              ))}
          </div>
        ) : null}

        <Disclaimer className="mt-5">
          Cost basis uses the fund NAV on or after the date you entered. It
          ignores stamp duty, loads, taxes and distributions. For IDCW schemes,
          payouts can make the NAV-only XIRR incomplete.
        </Disclaimer>
      </section>

      <section
        className="print-page mt-14 border-t border-ink pt-5 print:mt-0"
        aria-labelledby="report-cost"
      >
        <p className="label text-accent-ink">03 / The cost gap</p>
        <h3 id="report-cost" className="display-lg mt-3">
          What the Regular plan bill could compound to.
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          This is an illustration, not a claim about your fund&apos;s actual
          expense ratio. Set your own assumption. Check the actual total expense
          ratio in the scheme documents.
        </p>

        <div className="no-print mt-6 grid max-w-xl gap-4 border border-rule p-4 sm:grid-cols-2">
          <div>
            <label htmlFor="assumed-return" className="field-label">
              Assumed gross return
            </label>
            <div className="relative">
              <input
                id="assumed-return"
                type="number"
                min={costGapDefaults.minAssumedReturnPct}
                max={costGapDefaults.maxAssumedReturnPct}
                step="0.5"
                className="field tabular pr-8"
                value={assumedReturn}
                onChange={(event) =>
                  setAssumedReturn(
                    Math.max(
                      costGapDefaults.minAssumedReturnPct,
                      Math.min(
                        costGapDefaults.maxAssumedReturnPct,
                        Number(event.target.value) || 0,
                      ),
                    ),
                  )
                }
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">
                %
              </span>
            </div>
          </div>
          <div>
            <label htmlFor="expense-gap" className="field-label">
              Expense-ratio gap
            </label>
            <div className="relative">
              <input
                id="expense-gap"
                type="number"
                min={costGapDefaults.minExpenseGapPct}
                max={costGapDefaults.maxExpenseGapPct}
                step="0.1"
                className="field tabular pr-8"
                value={expenseGap}
                onChange={(event) =>
                  setExpenseGap(
                    Math.max(
                      costGapDefaults.minExpenseGapPct,
                      Math.min(
                        costGapDefaults.maxExpenseGapPct,
                        Number(event.target.value) || 0,
                      ),
                    ),
                  )
                }
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">
                pp
              </span>
            </div>
          </div>
          <p className="text-[0.68rem] leading-relaxed text-muted sm:col-span-2">
            Illustrative, check your actual TER. The default 1.0 percentage point
            gap is an assumption, not a quoted figure.
          </p>
        </div>

        <div className="mt-3 hidden text-[0.7rem] text-muted print:block">
          Assumptions: {assumedReturn}% annual gross return and a{" "}
          {expenseGap.toFixed(1)} percentage point annual expense gap.
        </div>

        {costGap.hasRegular ? (
          <>
            <div className="mt-7 grid gap-6 print:mt-4 print:grid-cols-12 print:gap-3 lg:grid-cols-12">
              <div className="print:col-span-7 lg:col-span-7">
                <ChartFrame
                  label="Cost illustration"
                  title="Projected difference"
                  note="Projection of today’s Regular-plan value. Not a forecast."
                  summary={costSummary}
                  disclaimer="Compounding an assumed gap is a simplified illustration. It is not a prediction of fund returns or a statement that one plan is right for you."
                >
                  <CostGapChart totals={costGap.totals} />
                </ChartFrame>
              </div>
              <div className="print:col-span-5 lg:col-span-5">
                <div className="grid gap-3 print:gap-2">
                  {costGap.totals.map((total) => (
                    <div key={total.years} className="border border-rule p-4 print:p-2">
                      <Label className="text-muted">{total.years}-year difference</Label>
                      <p className="display-md mt-2 tabular text-accent-ink">
                        {formatINR(total.difference)}
                      </p>
                      <p className="mt-1 text-[0.68rem] leading-relaxed text-muted">
                        With gap {formatINR(total.withGap)} · without gap{" "}
                        {formatINR(total.withoutGap)}
                      </p>
                    </div>
                  ))}
                  <p className="border-l-2 border-accent pl-3 text-xs leading-relaxed text-muted">
                    Regular-plan value: {formatINR(costGap.regularValue)}. Only
                    Regular-plan holdings are included.
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-7 text-[0.68rem] leading-relaxed text-muted print:mt-4 sm:hidden">
              Swipe the table sideways to see every column.
            </p>
            <div
              className="mt-2 overflow-x-auto print:mt-1"
              tabIndex={0}
              role="region"
              aria-label="Regular-plan holdings and cost-gap table. Scroll sideways for more columns."
            >
              <table className="w-full min-w-[38rem] border-collapse text-left text-xs print:min-w-0">
                <caption className="sr-only">
                  Regular-plan holdings and illustrative cost gap
                </caption>
                <thead>
                  <tr className="border-b border-ink">
                    <th scope="col" className="label-sm py-2 font-normal">
                      Regular-plan fund
                    </th>
                    <th scope="col" className="label-sm py-2 text-right font-normal">
                      Value
                    </th>
                    <th scope="col" className="label-sm py-2 text-right font-normal">
                      10-year gap
                    </th>
                    <th scope="col" className="label-sm py-2 text-right font-normal">
                      20-year gap
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {costGap.rows.map((row) => (
                    <tr key={row.holdingId} className="border-b border-rule">
                      <th scope="row" className="max-w-[20rem] py-2 pr-3 font-normal">
                        {row.fundName}
                      </th>
                      <td className="tabular py-2 pr-3 text-right">
                        {formatINR(row.value)}
                      </td>
                      <td className="tabular py-2 pr-3 text-right">
                        {formatINR(row.projections[0]?.difference ?? 0)}
                      </td>
                      <td className="tabular py-2 text-right">
                        {formatINR(row.projections[1]?.difference ?? 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="mt-7 border-y border-rule py-6">
            <p className="display-md">No Regular-plan holdings.</p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              This block only projects holdings marked as Regular plans by the
              fund name. If that label is wrong, check the scheme documents.
            </p>
          </div>
        )}

        <Disclaimer className="mt-5">
          This illustration compounds a single Regular-plan value at a constant
          return. Real returns vary, taxes apply, and your actual expense ratio
          may differ. It is not a recommendation to change plans.
        </Disclaimer>
      </section>

      <section
        className="no-print print-page mt-14 border-t border-ink pt-5 print:mt-0"
        aria-labelledby="report-risk"
      >
        <p className="label text-accent-ink">04 / Risk mirror</p>
        <h3 id="report-risk" className="display-lg mt-3">
          A mirror, not a label.
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Three direct questions about horizon, tolerance and how much this
          portfolio represents. The result compares your answers with the mix
          you hold. No score, no target, no label.
        </p>
        <div className="mt-7">
          <RiskMirror currentAllocation={portfolio.allocation.byCategory} />
        </div>
      </section>

      <section
        className="print-page mt-14 border-t border-ink pt-5 print:mt-0"
        aria-labelledby="report-monte-carlo"
      >
        <p className="label text-accent-ink">05 / Goal projection</p>
        <h3 id="report-monte-carlo" className="display-lg mt-3">
          A thousand possible futures.
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Change the assumptions to match your own plan. The result is a range
          and a probability, not a promised corpus.
        </p>
        <div className="mt-7">
          <MonteCarloPanel currentValue={portfolio.totalValue} />
        </div>
      </section>

      <div className="print-disclaimer print-avoid-break" aria-hidden="true">
        Folio X-Ray is an educational tool, not investment advice. It is not
        SEBI-registered and is not affiliated with any fund house, AMC or
        financial institution. Past performance and projections do not guarantee
        future results. Generated from public NAV data and the assumptions shown.
      </div>
    </div>
  );
}
