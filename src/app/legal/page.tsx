import type { Metadata } from "next";
import Link from "next/link";
import { EditorialPage } from "@/components/site/EditorialPage";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ogImage, site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Legal & disclaimer",
  description:
    "The limits of Folio X-Ray: an educational mutual fund calculator, not investment advice, not SEBI-registered, with no guarantee of data accuracy.",
  alternates: { canonical: "/legal" },
  openGraph: {
    type: "website",
    title: "Legal & disclaimer · Folio X-Ray",
    description:
      "Educational tool, not investment advice. The plain-language limits of the site.",
    url: "/legal",
    images: [ogImage],
  },
};

const contents = [
  { href: "#purpose", label: "Educational purpose" },
  { href: "#advice", label: "Not investment advice" },
  { href: "#data", label: "Data and accuracy" },
  { href: "#liability", label: "No warranty" },
  { href: "#links", label: "External links" },
  { href: "#ip", label: "Intellectual property" },
  { href: "#law", label: "Governing law" },
  { href: "#contact", label: "Contact" },
];

export default function LegalPage() {
  return (
    <EditorialPage
      label="Legal · Small print"
      meta="Reviewed November 2026"
      title={
        <>
          The limits,
          <br />
          in <span className="italic text-accent-ink">plain language.</span>
        </>
      }
      intro="Folio X-Ray is an educational calculator. It is not an adviser, a broker, a distributor or a fund house. This page sets out the limits in language that is meant to be read."
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
            <p className="label-sm text-muted">The one-line version</p>
            <p className="display-md mt-3">
              Educational tool. Not advice. Not SEBI-registered.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              The calculations are illustrations based on public data and the
              assumptions shown. Decisions remain yours.
            </p>
            <ButtonLink href="/method" variant="secondary" className="mt-5 w-full">
              Read the method
            </ButtonLink>
          </div>
          <p className="text-xs leading-relaxed text-muted">
            Legal questions:{" "}
            <a href={`mailto:${site.contactEmail}`} className="ink-link">
              {site.contactEmail}
            </a>
          </p>
        </div>
      }
    >
      <div className="prose-editorial">
        <p>
          By using Folio X-Ray, you accept the limits described on this page. If
          you do not accept them, do not use the site. This page is not itself
          legal advice; it is a plain-language description of the site’s
          position.
        </p>

        <h2 id="purpose" className="scroll-mt-28">
          Educational purpose
        </h2>
        <p>
          Folio X-Ray is a free educational tool for people who want to
          understand a mutual fund portfolio more clearly. It calculates
          valuation, XIRR, allocation, concentration observations, a cost
          illustration, a risk mirror and a Monte Carlo range. It is
          intended to support learning and conversation, not to execute
          transactions or manage money.
        </p>
        <p>
          The site is a personal project. It is not a company, a fund house, a
          distributor, a broker, a portfolio manager or a registered investment
          adviser. It has no access to your folio, your bank account, your KYC
          records or your transactions.
        </p>

        <h2 id="advice" className="scroll-mt-28">
          Not investment advice
        </h2>
        <p>
          Nothing on Folio X-Ray is investment, financial, tax or legal advice.
          No output is a recommendation to buy, sell or hold any mutual fund,
          security or scheme. No output is a suitability assessment or a personal
          recommendation. The tool describes arithmetic; it does not know your
          income, expenses, taxes, dependants, insurance, goals or risk
          capacity beyond what you type into it.
        </p>
        <p>
          Folio X-Ray is not registered with the Securities and Exchange Board
          of India (SEBI) as an investment adviser or in any other capacity. It
          is not affiliated with any fund house, asset management company,
          distributor, platform or financial institution. No advisory,
          fiduciary or professional relationship is created by using the site.
        </p>
        <p>
          If you need advice, consult a qualified professional who can consider
          your full circumstances. Do not rely on a calculator, a guide or a
          single return number to make a financial decision.
        </p>

        <h2 id="data" className="scroll-mt-28">
          Data and accuracy
        </h2>
        <p>
          Fund search results and NAV history come from{" "}
          <a href="https://api.mfapi.in" className="ink-link">
            api.mfapi.in
          </a>
          , a free public service. The data can be delayed, incomplete,
          misclassified or temporarily unavailable. Scheme names, categories,
          plan types and options are inferred from the source’s text fields and
          can be wrong. The tool shows warnings when a NAV date is missing, but
          it cannot detect every data error.
        </p>
        <p>
          The calculations depend entirely on the inputs you provide. A wrong
          purchase date, a wrong number of units, a wrong SIP amount or a wrong
          plan type will produce a wrong result. Verify units, dates, NAVs and
          tax treatment with the AMC, the registrar and the relevant scheme
          documents before relying on any number. The site does not guarantee
          that any figure is accurate, complete or current.
        </p>

        <h2 id="liability" className="scroll-mt-28">
          No warranty and limitation of liability
        </h2>
        <p>
          The site is provided “as is” and “as available”. To the maximum extent
          permitted by applicable law, Folio X-Ray makes no warranty, express or
          implied, about availability, accuracy, fitness for a particular
          purpose or non-infringement. The site may be interrupted, changed or
          withdrawn at any time.
        </p>
        <p>
          To the maximum extent permitted by applicable law, Folio X-Ray and its
          author will not be liable for any direct, indirect, incidental,
          consequential or special loss arising from the use of, or inability to
          use, the site or its calculations. This includes investment losses,
          tax consequences, data loss and decisions made on the basis of the
          output. Nothing on this page excludes liability that cannot lawfully
          be excluded.
        </p>
        <p>
          Past performance does not guarantee future results. A Monte Carlo
          range is a model output, not a forecast. A cost-gap illustration is
          arithmetic under assumptions you choose, not a bill. An XIRR is a
          description of past cash flows, not a promise about the next period.
        </p>

        <h2 id="links" className="scroll-mt-28">
          External links
        </h2>
        <p>
          The site links to external services, including the public data source.
          Those services have their own terms and privacy policies. Folio X-Ray
          does not control their content, availability or data practices and is
          not responsible for them. A link is not an endorsement.
        </p>

        <h2 id="ip" className="scroll-mt-28">
          Intellectual property
        </h2>
        <p>
          The site’s text, design, illustrations and code are the work of the
          author unless otherwise stated. Fund names, scheme names, trademarks
          and logos belong to their respective owners and are used only to
          identify the funds being described. Their use does not imply an
          affiliation or endorsement.
        </p>
        <p>
          You may read, print and share the report for personal, non-commercial
          use. You may quote short passages with attribution. You may not
          republish the site’s content as your own, scrape it at scale or use it
          to train a commercial product without permission.
        </p>

        <h2 id="law" className="scroll-mt-28">
          Governing law
        </h2>
        <p>
          These terms are governed by the laws of India. Subject to applicable
          law, disputes relating to the site are subject to the jurisdiction of
          the courts at Mumbai, Maharashtra. If any provision is found
          unenforceable, the remaining provisions continue to apply.
        </p>
        <p>
          This page may be updated when the site or the law changes. The review
          date at the top is the date of the last substantive edit. Continued use
          after an update means the updated terms apply.
        </p>

        <h2 id="contact" className="scroll-mt-28">
          Contact
        </h2>
        <p>
          Questions about these terms, the data or a calculation can be sent to{" "}
          <a href={`mailto:${site.contactEmail}`} className="ink-link">
            {site.contactEmail}
          </a>
          . The{" "}
          <Link href="/privacy" className="ink-link">
            privacy note
          </Link>{" "}
          explains the data flow, and the{" "}
          <Link href="/method" className="ink-link">
            method page
          </Link>{" "}
          explains the formulas.
        </p>
      </div>
    </EditorialPage>
  );
}
