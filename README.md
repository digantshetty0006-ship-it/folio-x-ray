# Folio X-Ray

A free, browser-first mutual fund portfolio X-ray for Indian investors. Search a fund, add units or a SIP, and read a report that describes XIRR, allocation, concentration, Regular-plan costs, a risk mirror and a seeded Monte Carlo range. Holdings never leave the browser.

The site is built with the Next.js App Router, strict TypeScript, Tailwind CSS v4, Framer Motion, Recharts, zod and Vitest. It has no database, accounts, analytics or advertising pixels.

## What is in the product

- `/` — editorial homepage and tool entry point.
- `/xray` — fund search, optional CAS PDF import, holdings, report and print stylesheet.
- `/guides` — six long-form guides on returns, costs, overlap, SIPs, risk and factsheets.
- `/method` — formulas, thresholds, assumptions and limitations.
- `/about`, `/privacy`, `/legal` — project context, data-flow disclosure and disclaimers.
- `/api/funds/search?q=` — trimmed fund search results.
- `/api/funds/[code]` — fund metadata and NAV history.

The report includes current value, invested amount, gain/loss, XIRR, category and fund allocation, concentration flags, a Regular-vs-Direct cost illustration, a three-input risk mirror and a 1,000-run Monte Carlo projection. The print view is designed for A4 PDF export.

## Privacy model

| Data | Where it goes |
| --- | --- |
| Fund search terms and six-digit fund codes | Sent to this site's server, which proxies public NAV data from `api.mfapi.in`. |
| Units, amounts, purchase dates, SIP details, risk answers | Stay in the browser. Never sent as a portfolio. |
| Saved folio | `localStorage`, only when "Remember this folio on this device" is on. Off by default. |
| CAS PDF, PAN and date of birth | Parsed in the browser with `pdfjs-dist`. The PDF and credentials are not uploaded. |
| Report and charts | Calculated and rendered in the browser. |
| Analytics, accounts, ad pixels | None. |

The server can see search terms and fund codes in request paths. It does not receive a list of your holdings, values, gains, dates or XIRR. The in-memory rate limiter uses a coarse client key and does not persist a portfolio.

"Clear all my data" removes the saved folio and the remember preference from the browser.

## Stack

- Next.js 16.4.5 (App Router, webpack build)
- React 19.3
- TypeScript in strict mode
- Tailwind CSS v4
- Framer Motion
- Recharts, restyled to the site palette
- zod
- Vitest and jsdom
- `pdfjs-dist` for optional client-side CAS parsing

The design uses paper `#F2EEE6`, ink `#14130F` and accent `#E5482B`. No gradients, stock photography or default Recharts colours.

## Local development

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The scripts deliberately use `next dev --webpack` and `next build --webpack`. On some Windows and OneDrive setups the native Next SWC binary cannot be loaded (`not a valid Win32 application`); webpack keeps the build reproducible. If your environment loads SWC correctly, you can switch to the default Next commands, but test a production build first.

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

Run `typecheck`, `lint`, `test` and `build` sequentially. A production build writes to `.next`; restart `npm start` after rebuilding if you are testing locally.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | No | Public origin used for canonical URLs, Open Graph, JSON-LD, sitemap and robots. Defaults to `https://folio-x-ray.vercel.app`. |

There are no secrets, database URLs or third-party API keys.

Because `NEXT_PUBLIC_SITE_URL` is inlined at build time, set it to the final production origin before the production build. If you deploy to a different Vercel URL, update it and redeploy so metadata does not point at the old origin.

## Architecture

```text
src/
  app/                 routes, metadata, API handlers, sitemap, robots, manifest
  components/          site chrome, editorial blocks, X-Ray tool and charts
  lib/
    api/               mfapi client, schemas, cache and rate limiter
    content/           guide copy, risk questions, sample portfolio
    engine/            pure valuation, SIP, XIRR, allocation, flags,
                       cost-gap, risk-mirror and Monte Carlo functions
    portfolio/         client state, storage schema and CAS import helpers
```

The engine is intentionally independent of React and the network. Its functions take plain inputs and return plain results, which keeps the arithmetic testable. The UI calls the engine through `src/lib/engine/portfolio.ts`.

### API behaviour

Both API routes:

- Validate input with zod.
- Apply a per-IP in-memory rate limit.
- Time out upstream requests after 8 seconds with `AbortController`.
- Return trimmed payloads instead of the raw upstream response.
- Use typed error codes: `upstream_down`, `not_found`, `bad_input`, `rate_limited`.
- Cache fund detail for about six hours and search results for about one hour at the CDN, with stale-while-revalidate.

Error shape:

```json
{
  "ok": false,
  "error": {
    "code": "upstream_down",
    "message": "The fund data source is not responding. Try again shortly.",
    "retryable": true
  }
}
```

### Engine notes

- XIRR uses Newton's method with a bisection fallback. It needs at least two cash flows on different dates.
- SIP units are generated from the NAV on or after each contribution date.
- Allocation groups funds by `scheme_category` into equity, debt, hybrid and gold-and-other.
- Concentration flags trigger at 35% for one fund, 80% for one category, or three funds sharing a category.
- The cost gap compounds a single Regular-plan value at a constant assumed return and expense gap. It is an illustration, not a TER claim.
- The risk mirror asks three questions and reports tension between stated horizon, fall tolerance, share of savings and the current mix. It produces no score, band or target allocation.
- Monte Carlo runs 1,000 seeded paths and reports a range and a probability, not a promised corpus.

## Assumptions

- Search terms and fund codes necessarily reach the server so it can proxy public NAV data. The privacy copy says this explicitly.
- Category mapping uses the upstream `scheme_category`. "Other Scheme - Index Funds" and similar labels fall into `gold-and-other`, which is a broad bucket.
- The CAS importer extracts labelled six-digit AMFI codes, or codes at the start of a line. Bare six-digit numbers are ignored to avoid guessing.
- The sample portfolio uses real fund names with invented holdings. It is clearly labelled, loaded only when requested and never persisted.
- The rate limiter is in-memory and best-effort. It resets when a serverless instance is replaced.
- The report is a description of the numbers entered. It is not a suitability assessment, a recommendation or a tax calculation.

## Known limitations and TODOs

Known limitations:

- Upstream NAV data can be stale or incomplete. A scheme may stop updating, which can leave a holding with no priced units; the report now shows an explicit empty state instead of blank charts.
- IDCW distributions, stamp duty, exit loads and taxes are not modelled. NAV-only XIRR can be incomplete for distribution schemes.
- Fund overlap is based on category labels, not disclosed portfolio holdings.
- The CAS importer supports the layouts it can label reliably; it is not a full transaction-history parser.
- The risk mirror is three questions, not a full risk profile. It cannot see income, loans, dependants, insurance, taxes or goals.
- Monte Carlo assumes a constant expected return and volatility; real markets have fatter tails and regime changes.
- The site is designed for Indian mutual funds and INR amounts.
- Accessibility has been checked at mobile and desktop widths, with keyboard focus and reduced motion, but not with a formal screen-reader audit.
- Lighthouse scores vary by machine and network. Run the audit against the production build.

TODOs:

- Add a durable rate-limit store if traffic grows beyond a single instance.
- Add end-to-end browser tests for search, add holding, restore, clear, CAS fallback and print.
- Expand the CAS parser for more statement layouts and transaction history.
- Add holdings-based overlap once a reliable portfolio-disclosure source is available.
- Add tax and exit-load modelling, clearly separated from the NAV-only return.
- Run a formal WCAG 2.2 AA audit with screen readers.
- Add a CI workflow that runs typecheck, lint, tests and a production build on every push.
- Set `NEXT_PUBLIC_SITE_URL` to the custom domain and add the domain in Vercel.

## Deployment on Vercel

1. Set the production origin before building:

   ```bash
   npx vercel env add NEXT_PUBLIC_SITE_URL production
   ```

   Enter the final origin, for example `https://folio-xray.example.com`. If you do not have a custom domain yet, use the Vercel production URL assigned to the project and update this value if the URL changes.

2. Log in and deploy:

   ```bash
   npx vercel login
   npx vercel --prod
   ```

   Vercel detects Next.js, runs `npm run build` and serves the App Router output. The repository does not need a database or any other service.

3. Verify the deployment:

   ```bash
   curl -I https://your-origin/
   curl https://your-origin/api/funds/search?q=hdfc
   curl https://your-origin/sitemap.xml
   curl https://your-origin/robots.txt
   curl https://your-origin/manifest.webmanifest
   ```

   Then open `/xray?sample=1`, confirm the report and charts render, and print or save one PDF.

4. Add a custom domain in the Vercel dashboard under Project → Settings → Domains, or with:

   ```bash
   npx vercel domains add your-domain.example
   ```

   Point the DNS records Vercel shows, wait for the certificate, then set `NEXT_PUBLIC_SITE_URL` to the custom origin and redeploy. Canonical URLs, Open Graph, JSON-LD, sitemap and robots all read that value.

The API routes call `api.mfapi.in` at request time. Vercel's serverless functions need outbound network access, which is available by default. The app has no cron jobs or background workers.

## Content and editorial rules

The guides and report copy describe what the numbers show. They do not recommend a fund, a plan, an allocation or a time to buy or sell. The site is not SEBI-registered, is not a financial adviser and is not affiliated with any fund house, AMC, distributor or financial institution.

## Licence and contact

This is a personal educational project. See `/legal` for the full disclaimer. The contact address in `src/lib/config.ts` is a placeholder; replace it with a monitored address before treating the site as a public service.
