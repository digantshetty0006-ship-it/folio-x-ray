# Folio X-Ray

**Live: [folio-x-ray.vercel.app](https://folio-x-ray.vercel.app)**

![The Folio X-Ray homepage](docs/home.png)

I built Folio X-Ray because I wanted a straight answer to a simple question: what do I actually own inside my mutual fund portfolio?

Most trackers want an account and a statement upload before they show you anything. I didn't want that. This is a small, free tool that does the arithmetic in your browser. Add a fund, enter units or a SIP, and you get a report: current value, XIRR, where the money sits, what stands out, what a Regular plan costs next to a Direct one, and a range of possible futures. Your holdings are not uploaded.

I'm a third-year IT student in Navi Mumbai, not a financial adviser. The site describes the numbers you enter. It does not tell you what to buy or sell.

## The X-Ray

![The X-Ray entry screen](docs/xray.png)

The report has six parts:

- **Value and return.** Current value, invested amount, gain or loss, and XIRR. XIRR is annualised and cash-flow weighted, so it is not the same as the point-to-point return printed on a fund factsheet.
- **Allocation.** A category donut and a fund donut, plus the same numbers as plain lists. Category labels come from the data source's `scheme_category`. "Gold & other" is a broad bucket that catches index funds, fund of funds and commodity schemes.
- **Plain-language notes.** Concentration observations at fixed thresholds: one fund at 35% or more, one category at 80% or more, or three funds sharing a category. These are notes, not instructions.
- **The Regular plan bill.** An illustration of what a higher expense ratio could compound to over time, using a constant return and a constant expense gap. It is not a TER claim.
- **A risk mirror.** Three questions about horizon, fall tolerance and how much of your savings this portfolio represents. The result points out tension between your answers and your current mix. There is no score, no band and no target allocation.
- **A thousand possible futures.** A seeded Monte Carlo projection that returns a range and a probability, not a promised corpus.

The print stylesheet is built for A4, so "Save as PDF" gives you a clean report.

## What it deliberately doesn't do

No accounts. No portfolio uploads. No analytics, ad pixels or session recording. No fund recommendations. No suitability score. No tax or exit-load calculation. The tool is for Indian mutual funds and INR amounts, and that is the whole scope.

## Where your data goes

| Data | What happens |
| --- | --- |
| Fund search terms and fund codes | Sent to this site's server, which proxies public NAV data from `api.mfapi.in`. |
| Units, amounts, dates, SIP details, risk answers | Stay in the browser. Never sent as a portfolio. |
| Saved folio | `localStorage`, only if you turn on "Remember this folio on this device". Off by default. |
| CAS PDF, PAN and date of birth | Parsed in the browser with `pdfjs-dist`. The PDF and credentials are not uploaded. |
| Report and charts | Calculated and drawn in the browser. |

The server can see search terms and fund codes in request paths. It never receives your list of holdings, values, gains, dates or XIRR. The rate limiter keeps a coarse client key in memory and does not persist anything about your portfolio.

"Clear all my data" removes the saved folio and the remember preference from the browser.

## How the numbers work

- **XIRR** uses Newton's method with a bisection fallback. It needs at least two cash flows on different dates.
- **SIP units** are generated from the NAV on or after each contribution date.
- **Allocation** groups funds by the upstream `scheme_category` into equity, debt, hybrid and gold-and-other.
- **Concentration flags** fire at 35% for a single fund, 80% for a single category, or three funds in one category.
- **The cost gap** compounds a Regular-plan value at a constant assumed return and expense gap. It is an illustration, not a fee quote.
- **The risk mirror** compares your three answers with the current mix. It produces observations, not a label.
- **Monte Carlo** runs 1,000 seeded paths with a constant expected return and volatility.

The engine lives in `src/lib/engine` and has no React or network dependencies, which is why most of it is covered by tests.

## Stack

Next.js 16.4.5 with the App Router, React 19, strict TypeScript, Tailwind CSS v4, Framer Motion, Recharts, zod, Vitest and `pdfjs-dist` for the optional CAS import. No database and no third-party services beyond the public NAV API.

The palette is paper `#F2EEE6`, ink `#14130F` and accent `#E5482B`. No gradients, stock photos or default Recharts colours.

## Running it locally

You need Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The scripts use `next dev --webpack` and `next build --webpack`. On my Windows and OneDrive setup the native Next SWC binary refuses to load (`not a valid Win32 application`), and webpack keeps the build reproducible. If your machine loads SWC correctly, you can switch back to the default Next commands, but test a production build first.

Other scripts:

```bash
npm run lint
npm run typecheck
npm test
npm run test:watch
npm run coverage
npm run build
npm start
```

Run typecheck, lint, tests and build in that order. A build writes to `.next`, so restart `npm start` afterwards if you are testing locally.

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | No | Public origin used by canonical URLs, Open Graph, JSON-LD, the sitemap and robots. Defaults to `https://folio-x-ray.vercel.app`. |

There are no secrets, database URLs or API keys.

`NEXT_PUBLIC_SITE_URL` is inlined at build time. If you deploy to a different origin, set it before the production build and redeploy, otherwise metadata will point at the old address.

## Deploying

The project is already deployed on Vercel at [folio-x-ray.vercel.app](https://folio-x-ray.vercel.app). To deploy your own copy:

```bash
npx vercel login
npx vercel --prod
```

Vercel detects Next.js and runs `npm run build`. No database or extra service is needed.

If you use a custom domain, add it in Vercel under Project → Settings → Domains, point the DNS records, then set `NEXT_PUBLIC_SITE_URL` to the custom origin and redeploy. Canonical URLs, Open Graph, JSON-LD, the sitemap and robots all read that value.

## What I'd like to fix next

- Add end-to-end browser tests for search, add holding, restore, clear, CAS fallback and print.
- Expand the CAS parser for more statement layouts and transaction history.
- Model IDCW distributions, stamp duty, exit loads and taxes, kept clearly separate from the NAV-only return.
- Add holdings-based overlap once there is a reliable portfolio-disclosure source.
- Run a formal WCAG 2.2 AA audit with screen readers.
- Add a CI workflow for typecheck, lint, tests and a production build.
- Replace the placeholder contact address in `src/lib/config.ts` with one I actually monitor.

## A few honest limitations

NAV data can be stale or incomplete. A scheme may stop updating, which can leave a holding with no priced units; the report now shows an explicit empty state instead of blank charts. Overlap is based on category labels, not disclosed holdings. The risk mirror cannot see income, loans, dependants, insurance, taxes or goals. Monte Carlo assumes a constant return and volatility, and real markets have fatter tails. Lighthouse scores vary by machine and network, so run the audit against the production build.

## Contact

This is a personal educational project. See `/legal` for the full disclaimer. The contact address in `src/lib/config.ts` is still a placeholder, so please replace it before treating the site as a public service.
