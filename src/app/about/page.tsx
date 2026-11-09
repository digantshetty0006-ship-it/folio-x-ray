import type { Metadata } from "next";
import Link from "next/link";
import { EditorialPage } from "@/components/site/EditorialPage";
import { OverlapCut } from "@/components/illustrations/PaperCuts";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ogImage, site } from "@/lib/config";

export const metadata: Metadata = {
  title: "About",
  description:
    "Folio X-Ray is a free, private mutual fund portfolio X-ray built by an investor in Navi Mumbai. No accounts, no trackers, no portfolio uploads.",
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    title: "About · Folio X-Ray",
    description:
      "A personal project about reading mutual fund portfolios more carefully. Free, private and deliberately narrow.",
    url: "/about",
    images: [ogImage],
  },
};

export default function AboutPage() {
  return (
    <EditorialPage
      label="About · A personal project"
      meta="Navi Mumbai, India"
      title={
        <>
          A small tool
          <br />
          with a <span className="italic text-accent-ink">narrow job.</span>
        </>
      }
      intro="Folio X-Ray reads a mutual fund portfolio and describes what it finds. It does not manage money, sell funds or pretend to know the next market move."
      aside={
        <div className="space-y-8 lg:sticky lg:top-28">
          <div className="border-t border-ink pt-4">
            <p className="label-sm text-muted">At a glance</p>
            <dl className="mt-4 space-y-4 text-sm">
              {[
                ["Built by", `${site.author.name}, ${site.author.role}`],
                ["Based in", site.location],
                ["Data", "Public NAV history from api.mfapi.in"],
                ["Cost", "Free, no account"],
                ["Business model", "None. No ads, no data sales."],
              ].map(([term, detail]) => (
                <div key={term} className="border-b border-rule pb-3">
                  <dt className="label-sm text-muted">{term}</dt>
                  <dd className="mt-1 leading-relaxed">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>

          <OverlapCut className="h-36 w-36 text-ink" />

          <div className="card p-5">
            <p className="label-sm text-muted">Try the tool</p>
            <p className="display-md mt-3">Start with the sample.</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              The sample portfolio is clearly labelled and is not saved. It is
              the quickest way to see the report before entering your own
              holdings.
            </p>
            <ButtonLink href="/xray?sample=1" className="mt-5 w-full">
              Open the sample
            </ButtonLink>
          </div>

          <p className="text-xs leading-relaxed text-muted">
            Corrections and questions:{" "}
            <a href={`mailto:${site.contactEmail}`} className="ink-link">
              {site.contactEmail}
            </a>
          </p>
        </div>
      }
    >
      <div className="prose-editorial">
        <p>
          Most mutual fund statements are good at telling you what you put in
          and what it is worth. They are less good at showing the machinery in
          between: when the money went in, what the funds actually own, how much
          two funds share, what a Regular plan costs, and how a goal looks
          across a range of possible markets. Folio X-Ray was built to make that
          machinery easier to read.
        </p>

        <h2 className="scroll-mt-28">Why this exists</h2>
        <p>
          The project started as a personal annoyance. A portfolio with several
          funds looked diversified on the statement, but the factsheets told a
          narrower story: the same large companies, the same sectors, the same
          benchmark. The return number was precise, but it did not answer the
          questions that mattered. A spreadsheet could answer some of them. A
          readable report, available without an account, could answer more.
        </p>
        <p>
          It is also a learning project. Building a calculator that handles
          irregular cash flows, SIP dates, missing NAVs and seeded simulations
          is a useful way to understand the arithmetic behind a fund statement.
          The site is deliberately small because the questions are specific.
        </p>

        <h2 className="scroll-mt-28">What it is, and what it is not</h2>
        <p>
          Folio X-Ray is a free educational tool. It calculates XIRR, allocation,
          concentration notes, a cost illustration, a risk mirror and a
          Monte Carlo range. It describes what the numbers show. It does not
          recommend a fund, a plan, an allocation or a time to buy or sell.
        </p>
        <p>
          It is not SEBI-registered, not a financial adviser, and not affiliated
          with any fund house, AMC, distributor or financial institution. It does
          not know your income, taxes, dependants, insurance or goals beyond
          what you type into the calculator. A report from this site is not a
          substitute for advice from a qualified professional.
        </p>

        <h2 className="scroll-mt-28">Privacy is a design choice</h2>
        <p>
          There are no accounts, no portfolio uploads, no analytics and no
          advertising pixels. Holdings are calculated in the browser. The server
          sees a search term or a fund code when you look up public NAV data; it
          does not receive units, amounts, dates or the finished report. The
          optional “remember on this device” setting uses local storage and is
          off by default. A clear-all control removes it.
        </p>
        <p>
          The full data flow, including the browser-only CAS import and the
          server’s rate-limit behaviour, is documented in the{" "}
          <Link href="/privacy" className="ink-link">
            privacy note
          </Link>
          .
        </p>

        <h2 className="scroll-mt-28">Why it looks like this</h2>
        <p>
          The design borrows from printed research notes: a paper background, a
          serif display face, monospaced labels and rules instead of cards
          floating in space. The goal is to slow the reading down. A dashboard
          can show a dozen numbers and leave the important one unexplained. A
          report should leave a trail from the number to the assumption.
        </p>
        <p>
          The report is also built to print. The print stylesheet removes the
          controls and keeps the holdings, allocation, flags, cost gap,
          Monte Carlo range and disclaimer. On a phone, the tables scroll
          sideways with a visible hint rather than shrinking into illegibility.
        </p>

        <h2 className="scroll-mt-28">How it is built</h2>
        <p>
          The site uses Next.js with the App Router, strict TypeScript, Tailwind
          CSS, Framer Motion for restrained transitions, Recharts for the
          charts, zod for input validation and Vitest for the calculation tests.
          Public NAV data comes from api.mfapi.in. There is no database and no
          user account system.
        </p>
        <p>
          The engine is intentionally separate from the interface. Valuation,
          SIP unit generation, XIRR, allocation, flags, cost-gap arithmetic,
          risk-mirror readings and Monte Carlo simulation are pure functions with tests.
          The formulas and thresholds are on{" "}
          <Link href="/method" className="ink-link">
            the method page
          </Link>
          .
        </p>

        <h2 className="scroll-mt-28">Who made it</h2>
        <p>
          Folio X-Ray is built and maintained by {site.author.name}, a{" "}
          {site.author.role} in {site.author.city}. It is a
          personal project, not a company. There is no team, no funding and no
          data business behind it. The site is free because it is a useful thing
          to build, not because it is a funnel for something else.
        </p>
        <p>
          The limits are part of the honest version: the category mapping is
          approximate, the public data can lag, the tool cannot see stock-level
          overlap, and the Monte Carlo is a model rather than a forecast. If
          something is wrong, a correction is welcome.
        </p>

        <h2 className="scroll-mt-28">What comes next</h2>
        <p>
          The near-term work is maintenance: better category mapping, clearer
          error states, more calculation tests and accessibility checks. Longer
          term, the useful additions are more plain-language guides and a more
          careful treatment of dividends and plan changes. There is no roadmap
          with dates, because this is a small project and promises are easy to
          make badly.
        </p>
        <p>
          If you have a question, a correction or a suggestion, write to{" "}
          <a href={`mailto:${site.contactEmail}`} className="ink-link">
            {site.contactEmail}
          </a>
          . A specific note with a fund code, a date and the number you expected
          is more useful than a general complaint.
        </p>
      </div>
    </EditorialPage>
  );
}
