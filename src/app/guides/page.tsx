import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/site/JsonLd";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { guideMeta } from "@/lib/content/guides";
import { ogImage, site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Six plain-language guides for Indian mutual fund investors: XIRR, Regular and Direct plans, overlap, SIP versus lump sum, risk profiles and factsheets.",
  alternates: { canonical: "/guides" },
  openGraph: {
    type: "website",
    title: "Guides · Folio X-Ray",
    description:
      "Six plain-language guides about returns, costs, overlap, risk and the parts of a fund statement that deserve a second look.",
    url: "/guides",
    images: [ogImage],
  },
};

export default function GuidesPage() {
  return (
    <div className="page-shell pb-24 pt-6 sm:pt-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Guides · Folio X-Ray",
          url: `${site.url}/guides`,
          description:
            "Six plain-language guides about mutual fund returns, costs, overlap, risk and factsheets.",
          mainEntity: {
            "@type": "ItemList",
            itemListElement: guideMeta.map((guide, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: `${site.url}/guides/${guide.slug}`,
              name: guide.title,
            })),
          },
        }}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-4">
        <p className="label-sm text-muted">Guides · Six pieces</p>
        <p className="label-sm text-muted">Reviewed November 2026</p>
      </div>

      <header className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <h1 className="display-xl">
            Read before
            <br />
            <span className="italic text-accent-ink">you react.</span>
          </h1>
        </div>
        <div className="lg:col-span-4">
          <p className="max-w-md text-[1.02rem] leading-relaxed text-muted">
            Six pieces about returns, costs, overlap, risk and the parts of a
            fund statement that deserve a second look. They describe mechanics.
            They do not recommend funds.
          </p>
        </div>
      </header>

      <div className="mt-12 border-t border-ink">
        {guideMeta.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="group grid gap-4 border-b border-rule py-7 transition-colors hover:bg-paper-deep/20 md:grid-cols-12 md:gap-6 md:py-8"
          >
            <div className="flex items-center justify-between gap-3 md:col-span-1 md:block">
              <span className="label-sm text-accent-ink">
                {guide.number}
              </span>
              <span className="label-sm text-muted md:mt-2 md:block">
                {guide.topic}
              </span>
            </div>

            <div className="md:col-span-7">
              <h2 className="display-md max-w-2xl transition-colors group-hover:text-accent-ink">
                {guide.title}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                {guide.dek}
              </p>
            </div>

            <div className="flex items-end justify-between gap-3 md:col-span-4 md:flex-col md:items-end md:justify-between">
              <span className="label-sm text-muted">
                {guide.readMinutes} min read
              </span>
              <span className="label-sm inline-flex min-h-11 items-center gap-2 text-ink transition-colors group-hover:text-accent-ink">
                Read the guide <span aria-hidden="true">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 grid gap-8 border-t border-rule pt-8 md:grid-cols-12">
        <div className="md:col-span-8">
          <p className="display-md max-w-xl">
            The guides describe mechanics. They do not pick funds.
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
            Every number is either sourced from public NAV data or labelled as a
            hypothetical illustration. The formulas and thresholds behind the
            tool are documented on{" "}
            <Link href="/method" className="ink-link">
              the method page
            </Link>
            .
          </p>
        </div>
        <div className="md:col-span-4 md:justify-self-end">
          <ButtonLink href="/xray">Open the X-Ray</ButtonLink>
        </div>
      </div>
    </div>
  );
}
