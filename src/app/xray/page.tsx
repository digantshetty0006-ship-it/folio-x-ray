import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/site/JsonLd";
import { XRayTool } from "@/components/xray/XRayTool";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "The X-Ray · Read your mutual fund portfolio",
  description:
    "A free, private mutual fund portfolio X-Ray for Indian investors. Add holdings to see XIRR, allocation, concentration notes, cost illustrations and goal projections. Units and amounts stay in your browser.",
  alternates: { canonical: "/xray" },
};

export default async function XRayPage({
  searchParams,
}: {
  searchParams: Promise<{ sample?: string | string[] }>;
}) {
  const params = await searchParams;
  const sample = Array.isArray(params.sample)
    ? params.sample[0]
    : params.sample;

  return (
    <div className="page-shell pb-24 pt-6 print:pb-0 print:pt-0 sm:pt-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: site.name,
          url: `${site.url}/xray`,
          applicationCategory: "FinanceApplication",
          operatingSystem: "Web",
          browserRequirements: "Requires JavaScript",
          isAccessibleForFree: true,
          description:
            "A private mutual fund portfolio X-ray for Indian investors. Calculate XIRR, allocation, concentration notes, Regular plan cost illustrations and goal projections without uploading a portfolio.",
          privacyPolicy: `${site.url}/privacy`,
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "INR",
          },
          publisher: {
            "@type": "Person",
            name: site.author.name,
            url: `${site.url}/about`,
          },
        }}
      />
      <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-4">
        <p className="label-sm text-muted">The X-Ray · No upload</p>
        <p className="label-sm text-muted">Report in about four minutes</p>
      </div>

      <header className="no-print mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <h1 className="display-xl">
            Put your folio
            <br />
            <span className="italic text-accent-ink">under the light.</span>
          </h1>
        </div>
        <div className="lg:col-span-4">
          <p className="max-w-md text-[1.02rem] leading-relaxed text-muted">
            Add a fund, enter what you hold, and read the report. The tool
            describes the numbers; it does not tell you what to buy or sell.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Read the thresholds on{" "}
            <Link href="/method" className="ink-link">
              /method
            </Link>{" "}
            and the data rules on{" "}
            <Link href="/privacy" className="ink-link">
              /privacy
            </Link>
            .
          </p>
        </div>
      </header>

      <div className="no-print mt-8 grid gap-3 border-y border-rule py-4 text-xs leading-relaxed text-muted sm:grid-cols-3">
        <p>
          <span className="label-sm mr-2 text-ink">01</span>
          Search terms and fund codes reach our data proxy.
        </p>
        <p>
          <span className="label-sm mr-2 text-ink">02</span>
          Units, amounts and dates stay in this browser.
        </p>
        <p>
          <span className="label-sm mr-2 text-ink">03</span>
          No signup, no portfolio upload, no trackers.
        </p>
      </div>

      <div className="mt-12 print:mt-0">
        <XRayTool autoSample={sample === "1"} />
      </div>
    </div>
  );
}
