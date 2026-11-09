import type { Metadata } from "next";
import Link from "next/link";
import { EditorialPage } from "@/components/site/EditorialPage";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ogImage, site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How Folio X-Ray handles data: holdings stay in your browser, fund lookups reach the server, no accounts, no analytics and no portfolio uploads.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "website",
    title: "Privacy · Folio X-Ray",
    description:
      "What leaves your browser, what stays on your device, and what the server can see.",
    url: "/privacy",
    images: [ogImage],
  },
};

const contents = [
  { href: "#short", label: "The short version" },
  { href: "#browser", label: "What stays in the browser" },
  { href: "#server", label: "What reaches the server" },
  { href: "#cas", label: "CAS PDF import" },
  { href: "#storage", label: "Remembering a portfolio" },
  { href: "#logs", label: "Logs and hosting" },
  { href: "#trackers", label: "Cookies and trackers" },
  { href: "#choices", label: "Your choices" },
  { href: "#contact", label: "Contact" },
];

export default function PrivacyPage() {
  return (
    <EditorialPage
      label="Privacy · Plain language"
      meta="Reviewed November 2026"
      title={
        <>
          What leaves your
          <br />
          browser, and what{" "}
          <span className="italic text-accent-ink">does not.</span>
        </>
      }
      intro="The short version: your holdings stay on your device. Fund lookups reach a server. There is no account to delete because there is no account."
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
            <p className="label-sm text-muted">The clearest test</p>
            <p className="display-md mt-3">Turn off the network.</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              The report still calculates from holdings already loaded in the
              browser. Searching for a new fund needs the network because the
              NAV data is public and remote.
            </p>
            <ButtonLink href="/xray" className="mt-5 w-full">
              Open the X-Ray
            </ButtonLink>
          </div>
          <p className="text-xs leading-relaxed text-muted">
            Privacy questions:{" "}
            <a href={`mailto:${site.contactEmail}`} className="ink-link">
              {site.contactEmail}
            </a>
          </p>
        </div>
      }
    >
      <div className="prose-editorial">
        <div id="short" className="card scroll-mt-28 p-5">
          <p className="label-sm text-muted">The short version</p>
          <ul className="mt-4">
            <li>
              Units, amounts, purchase dates, SIP details, risk answers and the
              finished report stay in your browser.
            </li>
            <li>
              A fund search term or six-digit fund code is sent to the server so
              it can fetch public NAV data.
            </li>
            <li>
              There are no accounts, no portfolio uploads, no analytics and no
              advertising pixels.
            </li>
            <li>
              “Remember on this device” is optional, off by default, and can be
              cleared from the tool.
            </li>
            <li>
              The CAS PDF import runs in the browser. The PDF, PAN and date of
              birth are not uploaded.
            </li>
          </ul>
        </div>

        <h2 id="browser" className="scroll-mt-28">
          What stays in the browser
        </h2>
        <p>
          The X-Ray is a client-side calculator. The holdings you add, the units
          or SIP amounts you type, the purchase dates, the risk-mirror answers and
          the calculated report are processed in the browser. They are not sent
          to the server as a portfolio. The server does not receive a list of
          your funds, your total value, your gains or your XIRR.
        </p>
        <p>
          The tool does need public NAV data to value a holding. That is why a
          fund lookup makes a network request. The request contains the search
          term or the fund code, not the amount you hold. Once the NAV history is
          loaded, the arithmetic happens locally.
        </p>

        <h2 id="server" className="scroll-mt-28">
          What reaches the server
        </h2>
        <p>
          There are two API routes. A search request sends the text you typed to{" "}
          <code>/api/funds/search?q=</code>. A fund request sends a six-digit
          AMFI code to <code>/api/funds/[code]</code>. The server validates the
          input, applies a rate limit, checks its cache, and forwards the request
          to{" "}
          <a href="https://api.mfapi.in" className="ink-link">
            api.mfapi.in
          </a>
          . The upstream service sees the search term or fund code as well.
        </p>
        <p>
          The server may also see standard request metadata: the IP address,
          user agent, requested path and timestamp. The rate limiter uses a
          client key derived from the request to count requests in a
          one-minute window. It does not build a portfolio profile. The server
          does not store your holdings, because it never receives them.
        </p>
        <p>
          Search terms can contain personal information if you type it into the
          search box. A fund name or code is the intended input. Do not type an
          account number, PAN, email address or anything else personal into the
          search field.
        </p>

        <h2 id="cas" className="scroll-mt-28">
          CAS PDF import
        </h2>
        <p>
          The optional CAS import reads a consolidated account statement PDF in
          the browser using a bundled PDF worker. The PAN and date of birth you
          enter are used locally to open the document. The PDF and the extracted
          fund codes are not uploaded to the server. The importer looks for
          labelled six-digit AMFI codes; if it cannot find usable codes, it
          explains the fallback and leaves you to add holdings manually.
        </p>
        <p>
          The PDF remains in the browser’s memory while the import runs. Folio
          X-Ray does not save the file, the PAN or the date of birth to local
          storage. Your browser or device may keep its own temporary copies or
          downloads; that behaviour is controlled by the browser, not by this
          site.
        </p>

        <h2 id="storage" className="scroll-mt-28">
          Remembering a portfolio
        </h2>
        <p>
          By default, a portfolio exists only for the life of the page. If you
          turn on “Remember on this device”, the tool writes the holdings to
          your browser’s local storage under the keys{" "}
          <code>folio-xray.portfolio.v1</code> and{" "}
          <code>folio-xray.remember.v1</code>. The data stays on that device. It
          is not synced to an account or sent to the server.
        </p>
        <p>
          Local storage is readable by anyone who can use that browser profile.
          On a shared or public device, leave the setting off. The tool has a
          visible clear-all control that removes both keys. Clearing site data
          in the browser settings also removes them. The sample portfolio is
          never saved, and the remember controls are hidden while the sample is
          loaded.
        </p>

        <h2 id="logs" className="scroll-mt-28">
          Logs and hosting
        </h2>
        <p>
          The site is hosted on Vercel. Like most hosting providers, Vercel may
          process technical logs such as IP address, request path, timestamp,
          user agent and error information for security, reliability and
          abuse prevention. Folio X-Ray does not add a separate analytics layer
          on top of those logs, and it does not use them to build an investment
          profile.
        </p>
        <p>
          The rate limiter is in memory. It resets when the server process
          restarts and is not a permanent record. There is no database of users,
          portfolios or reports. If you email the contact address, your email
          provider and the recipient’s email service will process the message;
          that is ordinary email, outside the tool.
        </p>

        <h2 id="trackers" className="scroll-mt-28">
          Cookies and trackers
        </h2>
        <p>
          Folio X-Ray does not set advertising or analytics cookies. It does not
          include third-party analytics, advertising pixels, session recording,
          social embeds or cross-site tracking scripts. Fonts are served by the
          site rather than requested from a third-party font service at runtime.
          The charts and interface are bundled with the application.
        </p>
        <p>
          The public data source and the hosting provider are the two external
          services involved in a fund lookup. Their own technical processing is
          governed by their policies. Folio X-Ray does not sell personal data or
          share it for advertising.
        </p>

        <h2 id="choices" className="scroll-mt-28">
          Your choices
        </h2>
        <p>
          You can use the tool without remembering anything. You can clear the
          stored portfolio from the tool or from your browser settings. You can
          avoid entering personal information in the fund search. You can use a
          private browsing window if you do not want local storage to persist
          after the session.
        </p>
        <p>
          If you are in India, applicable data protection law may give you
          rights over personal data. Because Folio X-Ray does not hold an
          account or a server-side portfolio, most of the relevant data is on
          your device and under your control. For questions about server logs or
          anything else, write to the contact address below.
        </p>

        <h2 id="contact" className="scroll-mt-28">
          Contact and changes
        </h2>
        <p>
          Privacy questions and corrections can be sent to{" "}
          <a href={`mailto:${site.contactEmail}`} className="ink-link">
            {site.contactEmail}
          </a>
          . This page is reviewed when the data flow changes. The review date at
          the top is the date of the last substantive edit. The{" "}
          <Link href="/legal" className="ink-link">
            legal and disclaimer page
          </Link>{" "}
          covers the limits of the tool; the{" "}
          <Link href="/method" className="ink-link">
            method page
          </Link>{" "}
          covers the calculations.
        </p>
      </div>
    </EditorialPage>
  );
}
