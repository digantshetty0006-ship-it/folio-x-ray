import Link from "next/link";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Label } from "@/components/ui/Label";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stamp } from "@/components/site/Stamp";
import { DragCarousel } from "@/components/site/DragCarousel";
import { Marquee } from "@/components/site/Marquee";
import { Reveal } from "@/components/motion/Reveal";
import {
  CostCut,
  FutureCut,
  OverlapCut,
  ReturnCut,
  ShieldCut,
} from "@/components/illustrations/PaperCuts";
import { guideMeta } from "@/lib/content/guides";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Folio X-Ray · Understand what your mutual funds actually own",
  description:
    "A free, private mutual fund portfolio X-ray for Indian investors. See XIRR, overlap, Regular plan costs and goal odds. Holdings stay in your browser.",
  alternates: { canonical: "/" },
};

const things = [
  {
    number: "01",
    label: "Returns",
    title: "A return that tells the truth",
    body: "Add a lump sum or a monthly SIP. XIRR accounts for when your money actually went in, so a long-held fund and a fresh one are not compared unfairly.",
    illustration: ReturnCut,
    cta: "Read your XIRR",
  },
  {
    number: "02",
    label: "Portfolio",
    title: "The overlap you cannot see",
    body: "Category and fund weights, concentration flags, and a plain-language note when three or more funds are making the same kind of bet.",
    illustration: OverlapCut,
    cta: "Inspect allocation",
  },
  {
    number: "03",
    label: "Costs",
    title: "The Regular plan bill",
    body: "See how an expense-ratio gap compounds over 10 and 20 years. You set the assumed return and the gap. Nothing is presented as a certainty.",
    illustration: CostCut,
    cta: "Open the cost gap",
  },
  {
    number: "04",
    label: "Goals",
    title: "A thousand possible futures",
    body: "A seeded Monte Carlo projection with SIP, step-up and inflation controls. It reports a range and a probability, never a single promised number.",
    illustration: FutureCut,
    cta: "Run the projection",
  },
];

const steps = [
  {
    number: "01",
    title: "Add what you hold",
    body: "Search a real fund by name or code. Enter units, or the SIP amount and start date. You can try the sample portfolio first.",
  },
  {
    number: "02",
    title: "We read public NAV history",
    body: "Only the fund code goes to our server. It fetches public data from api.mfapi.in. Your units and amounts stay on your device.",
  },
  {
    number: "03",
    title: "Read the report",
    body: "Get allocation, concentration notes, a cost illustration, a risk mirror and a goal projection. Print it or save it as a PDF.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="page-shell pb-16 pt-6 sm:pb-24 sm:pt-10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-4">
          <p className="label-sm text-muted">Mutual fund X-Ray · Edition 01</p>
          <p className="label-sm text-muted">
            Fresh: guide no. 06,{" "}
            <Link
              href="/guides/mutual-fund-factsheet"
              className="ink-link normal-case tracking-normal"
            >
              reading a factsheet
            </Link>
          </p>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-9">
            <h1 className="display-hero">
              <span className="block">Know</span>
              <span className="block pl-[0.16em]">what you</span>
              <span className="block italic">actually</span>
              <span className="block text-accent-ink">own.</span>
            </h1>
          </div>

          <div className="lg:col-span-3">
            <div className="flex items-start justify-between gap-5 lg:block">
              <div className="lg:flex lg:justify-end">
                <Stamp />
              </div>
              <p className="mt-4 max-w-[16rem] text-sm leading-relaxed text-muted lg:mt-8 lg:max-w-none">
                A free X-ray for Indian mutual fund portfolios. See the
                returns, overlap and costs behind the statement.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 border-t border-rule pt-8 md:grid-cols-12">
          <p className="max-w-2xl text-[1.08rem] leading-relaxed md:col-span-7">
            Most portfolio apps stop at a return number. This one shows you the
            machinery: what each fund holds, what two funds share, what a
            Regular plan quietly costs, and how a goal looks across a thousand
            possible markets. Your holdings never leave your browser.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row md:col-span-5 md:justify-end">
            <ButtonLink href="/xray">Open the X-Ray</ButtonLink>
            <ButtonLink href="/xray?sample=1" variant="secondary">
              Try a sample
            </ButtonLink>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[0.7rem] text-muted">
          <span>No signup</span>
          <span aria-hidden="true">·</span>
          <span>No portfolio upload</span>
          <span aria-hidden="true">·</span>
          <span>About four minutes</span>
          <span aria-hidden="true">·</span>
          <span>{site.location}</span>
        </div>
      </section>

      <Reveal>
        <section className="border-y border-rule bg-paper-deep/35">
          <div className="page-shell section-space">
            <SectionHeading
              label="Four things, one report"
              title={
                <>
                  Not a dashboard.
                  <br />
                  <span className="italic">A closer reading.</span>
                </>
              }
              intro="Each part answers one question about your portfolio. They are meant to be read together, not as buy or sell signals."
            />

            <DragCarousel
              label="What the X-Ray shows"
              className="mt-10"
              hint="Tip: drag sideways"
            >
              {things.map((thing, index) => {
                const Illustration = thing.illustration;
                return (
                  <article
                    key={thing.number}
                    className="card card-hover flex min-w-[82vw] snap-start flex-col p-5 sm:min-w-[340px] lg:min-w-[360px]"
                  >
                    <div className="flex items-start justify-between">
                      <Label className="text-muted">
                        {thing.number} / {thing.label}
                      </Label>
                      <Illustration className="h-24 w-24 text-ink sm:h-28 sm:w-28" />
                    </div>
                    <h3 className="display-md mt-6 max-w-[16ch]">
                      {thing.title}
                    </h3>
                    <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">
                      {thing.body}
                    </p>
                    <Link
                      href="/xray"
                      className="label-sm mt-7 inline-flex min-h-11 items-center justify-between border-t border-rule pt-3 text-ink hover:text-accent-ink"
                    >
                      {thing.cta}
                      <span aria-hidden="true">→</span>
                    </Link>
                    <span className="sr-only">Card {index + 1} of 4</span>
                  </article>
                );
              })}
            </DragCarousel>
          </div>
        </section>
      </Reveal>

      <section className="page-shell section-space">
        <SectionHeading
          label="How it works"
          title={
            <>
              Three steps. No account.
              <br />
              No upload.
            </>
          }
          action={
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              The boring part is the point: public data in, private
              calculations out.
            </p>
          }
        />

        <ol className="mt-12 grid gap-0 border-t border-ink md:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.number}
              className="border-b border-rule py-7 md:border-b-0 md:border-r md:px-7 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
            >
              <span className="label-sm text-accent-ink">{step.number}</span>
              <h3 className="display-md mt-4">{step.title}</h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <Reveal>
        <section className="border-y border-rule bg-paper-deep/35">
          <div className="page-shell section-space">
            <SectionHeading
              label="Guides"
              title="Read before you react."
              intro="Six plain-language pieces about returns, costs and the parts of a fund statement that deserve a second look."
              action={
                <ButtonLink href="/guides" variant="secondary">
                  All guides
                </ButtonLink>
              }
            />

            <DragCarousel
              label="Guide articles"
              className="mt-10"
              hint="Tip: drag sideways"
            >
              {guideMeta.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  className="card card-hover flex min-w-[82vw] snap-start flex-col p-5 sm:min-w-[330px] lg:min-w-[350px]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Label className="text-muted">Guide no. {guide.number}</Label>
                    <span className="label-sm text-accent-ink">
                      {guide.topic}
                    </span>
                  </div>
                  <h3 className="display-md mt-8">{guide.title}</h3>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">
                    {guide.dek}
                  </p>
                  <span className="label-sm mt-7 flex min-h-11 items-center justify-between border-t border-rule pt-3">
                    {guide.readMinutes} min read
                    <span aria-hidden="true">→</span>
                  </span>
                </Link>
              ))}
            </DragCarousel>
          </div>
        </section>
      </Reveal>

      <section className="page-shell section-space">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-4">
            <ShieldCut className="h-36 w-36 text-ink sm:h-44 sm:w-44" />
          </div>
          <div className="lg:col-span-8">
            <p className="eyebrow mb-5">Privacy by design</p>
            <h2 className="display-lg max-w-3xl">
              A portfolio is personal.
              <br />
              <span className="italic">We treat it that way.</span>
            </h2>
            <div className="mt-8 grid gap-6 border-t border-rule pt-6 sm:grid-cols-2">
              {[
                {
                  title: "Holdings stay here",
                  body: "Units, SIP amounts and dates are calculated in your browser. They are never sent to our server.",
                },
                {
                  title: "Fund codes only",
                  body: "When you search or load a fund, the server sees a fund code or query. Not your portfolio.",
                },
                {
                  title: "Memory is optional",
                  body: "“Remember on this device” uses localStorage and is off by default. A clear-all button removes it.",
                },
                {
                  title: "No analytics",
                  body: "No trackers, advertising pixels, session recording or third-party scripts. No cookies for advertising.",
                },
              ].map((item) => (
                <div key={item.title}>
                  <h3 className="text-[0.95rem] font-semibold">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
            <Link
              href="/privacy"
              className="label-sm mt-8 inline-flex min-h-11 items-center gap-3 border-b border-ink pb-1 hover:text-accent-ink"
            >
              Read the privacy note <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <Marquee />

      <section className="page-shell py-12 sm:py-16">
        <div className="flex flex-col gap-6 border-b border-rule pb-10 sm:flex-row sm:items-end sm:justify-between">
          <p className="display-md max-w-xl">
            Educational tool. Not advice. Not a sales pitch.
          </p>
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            Folio X-Ray is not SEBI-registered and is not affiliated with any
            fund house or AMC. It describes your portfolio. Decisions remain
            yours.
          </p>
        </div>
      </section>
    </>
  );
}
