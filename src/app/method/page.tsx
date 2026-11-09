import type { Metadata } from "next";
import Link from "next/link";
import { EditorialPage } from "@/components/site/EditorialPage";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ogImage, site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Method & formulas",
  description:
    "How Folio X-Ray calculates XIRR, SIP units, allocation, concentration flags, cost gaps, risk-mirror readings and Monte Carlo ranges, with thresholds and limits.",
  alternates: { canonical: "/method" },
  openGraph: {
    type: "website",
    title: "Method & formulas · Folio X-Ray",
    description:
      "The formulas, data rules, thresholds and limits behind the Folio X-Ray report.",
    url: "/method",
    images: [ogImage],
  },
};

const contents = [
  { href: "#data", label: "Data and scope" },
  { href: "#valuation", label: "Valuation and SIP" },
  { href: "#xirr", label: "XIRR" },
  { href: "#allocation", label: "Allocation and flags" },
  { href: "#cost-gap", label: "Cost gap" },
  { href: "#risk", label: "Risk mirror" },
  { href: "#monte-carlo", label: "Monte Carlo" },
  { href: "#api", label: "API behaviour" },
  { href: "#limits", label: "What is not included" },
];

export default function MethodPage() {
  return (
    <EditorialPage
      label="Method · Working notes"
      meta="Reviewed November 2026"
      title={
        <>
          The working,
          <br />
          <span className="italic text-accent-ink">shown.</span>
        </>
      }
      intro="Every number in the report has a formula, a source and a limit. This page documents them so the report can be checked rather than trusted."
      aside={
        <div className="space-y-8 lg:sticky lg:top-28">
          <nav aria-label="On this page" className="border-t border-ink pt-4">
            <p className="label-sm text-muted">On this page</p>
            <ol className="mt-3 space-y-1.5 text-sm">
              {contents.map((item, index) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="flex gap-3 py-1 text-muted transition-colors hover:text-accent-ink"
                  >
                    <span className="label-sm pt-1 text-accent-ink">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="card p-5">
            <p className="label-sm text-muted">The short rule</p>
            <p className="display-md mt-3">Describe, do not prescribe.</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              The report can show a concentration, a cost gap or a range of
              outcomes. It cannot tell you what to buy, sell or hold.
            </p>
            <ButtonLink href="/xray" className="mt-5 w-full">
              Open the X-Ray
            </ButtonLink>
          </div>
          <p className="text-xs leading-relaxed text-muted">
            Data questions? Write to{" "}
            <a href={`mailto:${site.contactEmail}`} className="ink-link">
              {site.contactEmail}
            </a>
            .
          </p>
        </div>
      }
    >
      <div className="prose-editorial">
        <p>
          Folio X-Ray is a calculator with an editorial layer. It takes public
          NAV history, the holding details you enter, and a small set of
          assumptions you can see. It returns arithmetic. It does not rank
          funds, score managers or issue recommendations.
        </p>

        <h2 id="data" className="scroll-mt-28">
          Data and scope
        </h2>
        <p>
          Fund search and NAV history come from{" "}
          <a href="https://api.mfapi.in" className="ink-link">
            api.mfapi.in
          </a>
          , a free public service that mirrors AMFI scheme data. The server
          requests a scheme by name or six-digit AMFI code, then keeps up to 25
          years of daily NAV history. The latest published NAV is used as the
          valuation point. The source can be delayed, incomplete or briefly
          unavailable; the report shows an error rather than inventing a value.
        </p>
        <p>
          The source does not provide a normalised asset class, so the tool maps
          its free-text <code>scheme_category</code> into four buckets: equity,
          debt, hybrid, and gold and other. The mapping checks for gold,
          commodity and silver labels first, then hybrid and arbitrage labels,
          then equity and ELSS labels, then debt and liquid labels. Anything
          unrecognised falls into gold and other. That bucket also contains
          index funds and fund-of-funds when the source labels them as “Other
          Scheme”. It is a transparent limitation, not a claim of precision.
        </p>
        <p>
          Plan type is read from the scheme name: a name containing the word
          “Direct” is treated as Direct, and everything else as Regular. Option
          is read from the name as IDCW, Growth or other. These are name-based
          inferences. A malformed or unusual scheme name can be classified
          incorrectly.
        </p>

        <h2 id="valuation" className="scroll-mt-28">
          Valuation and SIP
        </h2>
        <p>
          For a lump-sum holding, the current value is units multiplied by the
          latest NAV. The invested amount is units multiplied by the NAV on the
          purchase date. If that date has no published NAV, the first published
          NAV on or after it is used, and the report shows a warning. If the
          purchase date is after the latest available NAV, the holding is
          rejected.
        </p>
        <div className="formula">
          value = units × latest NAV
          <br />
          invested = units × purchase NAV
          <br />
          gain = value − invested
          <br />
          gain % = gain ÷ invested × 100
        </div>
        <p>
          For a SIP, the tool generates each scheduled instalment from the start
          date to the latest NAV date. Monthly, weekly and quarterly frequencies
          are supported. Each instalment buys units at the first published NAV
          on or after its scheduled date. If the exact date is a holiday, the
          next published NAV is used and a warning records the delay. The
          invested amount is the sum of the instalments; the value is the total
          units multiplied by the latest NAV.
        </p>
        <div className="formula">
          units per instalment = instalment amount ÷ NAV on or after the
          scheduled date
          <br />
          total units = sum of all instalment units
          <br />
          invested = sum of all instalment amounts
          <br />
          value = total units × latest NAV
        </div>
        <p>
          The SIP generator stops at 6,000 contributions to keep the calculation
          bounded. It does not model a paused SIP, a changed amount, a
          reinvested dividend or a switch between plans. Those events would need
          separate cash flows to be represented accurately.
        </p>

        <h2 id="xirr" className="scroll-mt-28">
          XIRR
        </h2>
        <p>
          XIRR finds the single annual rate that makes the present value of all
          dated cash flows equal zero. Purchases are negative flows; the current
          value is a positive flow. The exponent is the number of days since the
          first flow divided by 365.
        </p>
        <div className="formula">
          Σ [ cash flow<sub>i</sub> ÷ (1 + rate)<sup>(days<sub>i</sub> ÷ 365)</sup> ]
          = 0
        </div>
        <p>
          The solver starts with Newton-Raphson at an initial guess of 10%. It
          stops when the absolute net present value is below 1e-8, or when the
          rate change is below 1e-11 and the residual is below 1e-5. If the
          derivative is too small, the rate leaves the valid range, or the
          method does not settle within 120 iterations, it falls back to
          bisection. Bisection searches from just above −100% upward, expanding
          the upper bound by a factor of ten until it finds a sign change, then
          runs up to 240 iterations. If no consistent rate exists, the result is
          a plain-language reason, not a fabricated number.
        </p>
        <p>
          Fund-level XIRR uses that fund’s cash flows. Portfolio XIRR combines
          the cash flows of every valid holding and adds their combined current
          value. This is a money-weighted return: it depends on the size and
          timing of your contributions, not just on the fund’s NAV path. It is
          not a time-weighted return and it is not comparable to a fund’s
          published point-to-point CAGR without adjusting for cash-flow timing.
        </p>
        <p>
          XIRR uses NAV, which is published after fund expenses are deducted.
          It does not include exit load, stamp duty, capital gains tax, advisory
          fees or platform charges unless those are entered as separate cash
          flows. It also does not adjust for inflation or risk.
        </p>

        <h2 id="allocation" className="scroll-mt-28">
          Allocation and flags
        </h2>
        <p>
          Allocation is calculated twice: once by asset category and once by
          fund. Each holding’s value is divided by the total value of all valid
          holdings. Percentages are rounded to one decimal place using the
          largest-remainder method, so the displayed slices add to 100% even
          when the raw divisions do not.
        </p>
        <p>
          Three observations can appear. A single fund at or above 35% of the
          portfolio triggers a single-fund note. An asset category at or above
          80% triggers a category note. Three or more distinct funds in the same
          category trigger a duplicate-category note. The thresholds are fixed
          in the product configuration; they are editorial choices, not
          regulatory limits or advice.
        </p>
        <p>
          The flags see categories and fund names, not underlying stocks or
          bonds. The public data source provides NAV history, not portfolio
          holdings. Two funds in different categories can still own the same
          company, and two funds in the same category can be genuinely
          different. The factsheet is the place to check holdings overlap; the
          X-Ray can only point at the category-level pattern.
        </p>

        <h2 id="cost-gap" className="scroll-mt-28">
          Cost gap
        </h2>
        <p>
          The cost illustration applies only to holdings marked Regular and
          with a positive value. It projects today’s value forward at a gross
          return you choose, once without an expense gap and once with the gap
          deducted. The default assumptions are an 11% annual return and a one
          percentage-point gap, with horizons of 10 and 20 years. The controls
          allow 1% to 20% for the return and 0% to 3% for the gap.
        </p>
        <div className="formula">
          without gap = value × (1 + assumed return)<sup>years</sup>
          <br />
          with gap = value × (1 + assumed return − expense gap)<sup>years</sup>
          <br />
          difference = without gap − with gap
        </div>
        <p>
          The gap is not a TER claim. The tool does not fetch your actual
          expense ratio, and it does not know whether the gap will stay
          constant. It is an illustration of compounding, not a bill. The
          projection also ignores taxes, exit loads and changes in the assumed
          return. A different set of assumptions will produce a different
          number, which is why the controls are visible.
        </p>

        <h2 id="risk" className="scroll-mt-28">
          Risk mirror
        </h2>
        <p>
          The mirror asks three questions: when you expect to need the money,
          the largest temporary fall you could hold through without selling,
          and how much of your investable savings this portfolio represents.
          It does not score you, assign a band or produce a target allocation.
        </p>
        <p>
          The report compares those answers with the portfolio’s current
          equity, debt and other shares. Where the two may be in tension, it
          lists a plain-language observation. A short horizon and a meaningful
          equity share is one example. A low tolerance and a meaningful equity
          share is another. The mirror also notes when a long horizon and a
          high tolerance sit alongside a low equity share.
        </p>
        <div className="formula">
          Equity above 30% + horizon under 3 years → horizon tension
          <br />
          Equity above 30% + fall tolerance of 10% → tolerance tension
          <br />
          Equity at or above 70% + more than 75% of savings → savings
          concentration
        </div>
        <p>
          These are observations, not a suitability assessment. The mirror
          cannot see income, loans, dependants, taxes, insurance, an emergency
          fund or the rest of your savings. It does not recommend an
          allocation, and it does not say which side of a gap is wrong. Three
          answers cannot carry the weight of a full risk profile.
        </p>

        <h2 id="monte-carlo" className="scroll-mt-28">
          Monte Carlo
        </h2>
        <p>
          The projection runs 1,000 simulated paths by default. It uses a
          seeded pseudo-random generator, so the same inputs and seed produce
          the same result. Each path starts with the initial value you enter and
          adds a monthly SIP at the start of every month. The annual step-up is
          applied at the start of each 12-month block. The goal is inflated to
          the horizon at the inflation rate you choose.
        </p>
        <div className="formula">
          monthly volatility = annual volatility ÷ √12
          <br />
          monthly log drift = ln(1 + annual return) ÷ 12 − ½ × monthly
          volatility²
          <br />
          monthly return = exp(log drift + monthly volatility × shock) − 1
          <br />
          goal at horizon = goal today × (1 + inflation)<sup>years</sup>
        </div>
        <p>
          Returns are drawn from a lognormal distribution using a Box-Muller
          normal shock. The model reports the 10th, 50th and 90th percentile
          paths across the runs, plus the share of runs that end at or above the
          inflated goal. The probability is a property of the model and its
          assumptions, not a prediction about the market or about you.
        </p>
        <p>
          The model assumes a constant expected return and volatility, no
          taxes, no fund expenses, no exit loads, no behaviour changes and no
          correlation between assets. It does not simulate a specific fund or a
          specific asset mix. A different return or volatility assumption can
          move the range substantially. The seed makes the output reproducible;
          it does not make the assumptions true.
        </p>

        <h2 id="api" className="scroll-mt-28">
          API behaviour
        </h2>
        <p>
          Search requests are limited to 80 characters. Fund detail requests
          require a positive six-digit scheme code. The server allows 30
          requests per minute per client key, uses an eight-second upstream
          timeout, and returns typed errors: <code>bad_input</code>,{" "}
          <code>not_found</code>, <code>rate_limited</code> and{" "}
          <code>upstream_down</code>. Search responses are cached for one hour;
          fund detail responses are cached for six hours. The cache is a
          performance measure, not a store of your portfolio.
        </p>
        <p>
          Search terms and fund codes reach the server and are forwarded to the
          public data source. Units, amounts, dates and the calculated report
          stay in the browser. The{" "}
          <Link href="/privacy" className="ink-link">
            privacy note
          </Link>{" "}
          describes the full data flow, including the optional local-storage
          remember setting and the browser-only CAS import.
        </p>

        <h2 id="limits" className="scroll-mt-28">
          What is not included
        </h2>
        <ul>
          <li>Taxes, exit loads, stamp duty and transaction charges.</li>
          <li>
            Your actual expense ratio, advisory fee or platform fee, except as
            assumptions you enter.
          </li>
          <li>
            Dividends and IDCW payouts, unless they are represented as separate
            cash flows.
          </li>
          <li>
            Stock-level or bond-level overlap between funds; the data source
            does not provide holdings.
          </li>
          <li>
            Fund manager changes, strategy drift, liquidity, credit risk and
            other qualitative information.
          </li>
          <li>
            Inflation-adjusted returns outside the Monte Carlo goal, and any
            risk-adjusted performance measure.
          </li>
          <li>
            A recommendation, a ranking or a suitability assessment. The tool
            is educational.
          </li>
        </ul>
        <p>
          If a number looks wrong, the useful first step is to check the
          purchase date, the NAV date and the plan type. If the data itself is
          wrong, write to{" "}
          <a href={`mailto:${site.contactEmail}`} className="ink-link">
            {site.contactEmail}
          </a>{" "}
          with the fund code and the date. Corrections are part of the method.
        </p>
      </div>
    </EditorialPage>
  );
}
