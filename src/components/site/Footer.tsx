import Link from "next/link";
import { site } from "@/lib/config";

export function Footer() {
  return (
    <footer className="no-print border-t border-ink bg-ink text-paper">
      <div className="page-shell py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="label text-paper/55">A free tool by an investor, for investors</p>
            <p className="display-xl mt-5 text-paper">Folio X-Ray</p>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-paper/65">
              A clearer look at Indian mutual fund portfolios. No accounts, no
              tracking, no portfolio uploads.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 md:col-span-5">
            <div>
              <p className="label text-paper/55">Explore</p>
              <ul className="mt-4 space-y-2 text-sm">
                {[
                  ["/xray", "Open the X-Ray"],
                  ["/guides", "Guides"],
                  ["/method", "Method & formulas"],
                  ["/about", "About"],
                ].map(([href, label]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-paper/80 underline-offset-4 hover:text-paper hover:underline"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="label text-paper/55">Small print</p>
              <ul className="mt-4 space-y-2 text-sm">
                {[
                  ["/privacy", "Privacy"],
                  ["/legal", "Legal & disclaimer"],
                  [`mailto:${site.contactEmail}`, "Contact"],
                ].map(([href, label]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-paper/80 underline-offset-4 hover:text-paper hover:underline"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    href={site.github}
                    target="_blank"
                    rel="noreferrer"
                    className="text-paper/80 underline-offset-4 hover:text-paper hover:underline"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-paper/15 pt-5 text-[0.7rem] leading-relaxed text-paper/55 sm:flex-row sm:items-end sm:justify-between">
          <p>© {new Date().getFullYear()} Folio X-Ray. Built in Navi Mumbai.</p>
          <p className="max-w-xl sm:text-right">
            Educational tool, not investment advice. Not SEBI-registered. Not
            affiliated with any fund house, AMC or financial institution.
          </p>
        </div>
      </div>
    </footer>
  );
}
