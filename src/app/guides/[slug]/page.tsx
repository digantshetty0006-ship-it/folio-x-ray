import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GuideBody, getGuideHeadings } from "@/components/guides/GuideBody";
import { JsonLd } from "@/components/site/JsonLd";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getGuideArticle } from "@/lib/content/guide-articles";
import { getGuideMeta, guideMeta } from "@/lib/content/guides";
import { ogImage, site } from "@/lib/config";

export function generateStaticParams() {
  return guideMeta.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideMeta(slug);

  if (!guide) return {};

  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      type: "article",
      title: `${guide.title} · ${site.name}`,
      description: guide.description,
      url: `/guides/${guide.slug}`,
      publishedTime: guide.reviewed,
      modifiedTime: guide.reviewed,
      authors: [site.author.name],
      section: guide.topic,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${guide.title} · ${site.name}`,
      description: guide.description,
      images: [ogImage.url],
    },
  };
}

function formatReviewed(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuideMeta(slug);
  const article = getGuideArticle(slug);

  if (!guide || !article) notFound();

  const index = guideMeta.findIndex((item) => item.slug === guide.slug);
  const previous = index > 0 ? guideMeta[index - 1] : undefined;
  const next = index < guideMeta.length - 1 ? guideMeta[index + 1] : undefined;
  const headings = getGuideHeadings(article.blocks);
  const others = guideMeta.filter((item) => item.slug !== guide.slug);
  const reviewed = formatReviewed(guide.reviewed);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: guide.title,
        description: guide.description,
        datePublished: guide.reviewed,
        dateModified: guide.reviewed,
        articleSection: guide.topic,
        author: {
          "@type": "Person",
          name: site.author.name,
          url: `${site.url}/about`,
        },
        publisher: {
          "@type": "Organization",
          name: site.name,
          url: site.url,
        },
        mainEntityOfPage: `${site.url}/guides/${guide.slug}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Index",
            item: site.url,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Guides",
            item: `${site.url}/guides`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: guide.title,
            item: `${site.url}/guides/${guide.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="page-shell pb-24 pt-6 sm:pt-10">
      <JsonLd data={jsonLd} />

      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-4"
      >
        <ol className="flex items-center gap-2 text-xs text-muted">
          <li>
            <Link href="/guides" className="ink-link">
              Guides
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">Guide {guide.number}</li>
        </ol>
        <p className="label-sm text-muted">
          {guide.topic} · {guide.readMinutes} min read
        </p>
      </nav>

      <header className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="eyebrow">
            Guide no. {guide.number} · {guide.topic}
          </p>
          <h1 className="display-xl mt-5 max-w-4xl">{guide.title}</h1>
          <p className="mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-muted">
            {guide.dek}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
            <span>By {site.author.name}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={guide.reviewed}>Reviewed {reviewed}</time>
            <span aria-hidden="true">·</span>
            <span>{guide.readMinutes} min read</span>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="border-t border-ink pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <p className="label-sm text-muted">The short version</p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed">
              {article.keyPoints.map((point) => (
                <li key={point} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-[0.55rem] h-1 w-1 shrink-0 bg-accent"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-10">
        <article className="min-w-0 lg:col-span-8">
          <GuideBody blocks={article.blocks} />

          <div className="mt-12 border-t border-rule pt-6">
            <p className="label-sm text-muted">Editorial note</p>
            <p className="mt-3 max-w-2xl text-xs leading-relaxed text-muted">
              This guide is educational. It describes how the mechanics work
              and does not recommend a fund, a plan or a course of action. Any
              figures marked as hypothetical are illustrations, not forecasts.
              Read the assumptions on{" "}
              <Link href="/method" className="ink-link">
                the method page
              </Link>
              .
            </p>
          </div>

          <nav
            aria-label="Guide navigation"
            className="mt-10 grid gap-4 border-t border-ink pt-6 sm:grid-cols-2"
          >
            {previous ? (
              <Link
                href={`/guides/${previous.slug}`}
                className="group block border border-rule p-4 transition-colors hover:border-ink"
              >
                <span className="label-sm text-muted">Previous guide</span>
                <span className="mt-2 block text-sm leading-snug transition-colors group-hover:text-accent-ink">
                  {previous.title}
                </span>
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
            {next ? (
              <Link
                href={`/guides/${next.slug}`}
                className="group block border border-rule p-4 transition-colors hover:border-ink sm:text-right"
              >
                <span className="label-sm text-muted">Next guide</span>
                <span className="mt-2 block text-sm leading-snug transition-colors group-hover:text-accent-ink">
                  {next.title}
                </span>
              </Link>
            ) : null}
          </nav>
        </article>

        <aside className="min-w-0 lg:col-span-4">
          <div className="space-y-8 lg:sticky lg:top-28">
            <nav aria-label="In this guide" className="border-t border-ink pt-4">
              <p className="label-sm text-muted">In this guide</p>
              <ol className="mt-3 space-y-1.5 text-sm">
                {headings.map((heading, headingIndex) => (
                  <li key={heading.id}>
                    <a
                      href={`#${heading.id}`}
                      className="flex gap-3 py-1 text-muted transition-colors hover:text-accent-ink"
                    >
                      <span className="label-sm pt-1 text-accent-ink">
                        {String(headingIndex + 1).padStart(2, "0")}
                      </span>
                      <span>{heading.text}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="card p-5">
              <p className="label-sm text-muted">Your own numbers</p>
              <p className="display-md mt-3">Read the report, not the label.</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Add a holding to see XIRR, allocation, concentration notes and
                a cost illustration. Units and amounts stay in your browser.
              </p>
              <ButtonLink href="/xray" className="mt-5 w-full">
                Open the X-Ray
              </ButtonLink>
            </div>

            <div>
              <p className="label-sm text-muted">More guides</p>
              <ul className="mt-3 space-y-2 text-sm">
                {others.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/guides/${item.slug}`}
                      className="group flex gap-3 border-b border-rule py-2 text-muted transition-colors hover:text-accent-ink"
                    >
                      <span className="label-sm pt-1 text-accent-ink">
                        {item.number}
                      </span>
                      <span className="leading-snug">{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
