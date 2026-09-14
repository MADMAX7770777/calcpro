# CalcPro

A JSON-driven, SEO-first calculator platform built with Next.js 15 (App Router),
TypeScript, and Tailwind CSS. Designed to scale from 5 calculators to 1,000+
without changing route files, components, or hand-writing metadata.

## Setup

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # production build
npm start         # serve the production build
npm run lint
npm test          # formula engine tests (vitest)
```

> This codebase was generated without network access, so dependencies have
> not been installed or build-verified in that environment. Run the commands
> above locally to install packages, resolve any version-specific TypeScript
> issues, and confirm the build passes before deploying.

## Architecture

```
app/                          Routes (App Router)
  page.tsx                    Homepage
  calculators/[slug]/         Calculator detail pages (SSG)
  [category]/                 Category pages, e.g. /finance-calculators (SSG)
  country/[country]/[slug]/   Country-specific calculator pages (SSG)
  about/, privacy-policy/, contact/
  sitemap.ts, robots.ts       Auto-generated from calculator data

components/                   Generic, calculator-agnostic UI
  CalculatorRenderer.tsx      The one renderer every calculator uses
  CalculatorInputs.tsx / CalculatorResults.tsx / ResultsTable.tsx
  DonutChart.tsx / BarChart.tsx
  Formula.tsx / FAQ.tsx / Breadcrumbs.tsx
  RelatedCalculators.tsx / PopularCalculators.tsx / CategoryCard.tsx
  AdSlot.tsx / Navbar.tsx / Footer.tsx / SearchBar.tsx

lib/                          All logic — nothing calculator-specific lives in components
  types.ts                    Shared TypeScript interfaces
  formulas.ts                 Centralized formula registry (the ONLY place math happens)
  formula-display.ts          Display text (expression + legend) per formula, for the Formula component
  calculators.ts              Data-access layer (JSON today, swappable for a DB later)
  mdx.ts                      Loads long-form MDX content by slug
  seo.ts                      Generates metadata (title/description/canonical/OG/Twitter)
  schema.ts                   Generates JSON-LD (WebPage, BreadcrumbList, FAQPage, SoftwareApplication, HowTo)
  utils.ts                    Currency/number/percentage formatting

data/calculators/*.json       One file per calculator — the source of truth
content/*.mdx                 One long-form content file per calculator
tests/formulas.test.ts        Formula engine tests (EMI, SIP, BMI, GST, Age)
```

## How to Add a New Calculator

Adding a calculator requires exactly three things — **no new routes or components**:

1. **A JSON file** in `data/calculators/`, e.g. `data/calculators/discount-calculator.json`:
   ```json
   {
     "slug": "discount-calculator",
     "title": "Discount Calculator",
     "description": "Calculate the final price after a percentage discount.",
     "country": ["india"],
     "category": "everyday",
     "formula": "discount",
     "currency": "INR",
     "inputs": [
       { "name": "price", "label": "Original Price", "type": "currency", "defaultValue": 1000 },
       { "name": "discountPercent", "label": "Discount", "type": "percentage", "defaultValue": 10 }
     ],
     "faqs": [{ "question": "How is the discount applied?", "answer": "..." }]
   }
   ```

2. **A formula function** in `lib/formulas.ts`, added to the registry:
   ```ts
   export function calculateDiscount(inputs: Inputs): CalculatorResult {
     const price = toNumber(inputs.price);
     const pct = toNumber(inputs.discountPercent);
     const discount = price * (pct / 100);
     const final = price - discount;
     return {
       headline: { label: 'Final Price', value: round2(final), format: 'currency', emphasis: true },
       fields: [{ label: 'You Save', value: round2(discount), format: 'currency' }],
       raw: { final: round2(final), discount: round2(discount) },
     };
   }
   // add "discount: calculateDiscount" to formulaRegistry, and 'discount' to FormulaName in types.ts
   ```

3. **An MDX file** in `content/discount-calculator.mdx` with what-is-it / how-it-works / example / FAQ prose.

That's it — the calculator is immediately live at `/calculators/discount-calculator`,
appears in its category page, gets automatic SEO metadata and JSON-LD, and is
included in `sitemap.ts` on the next build.

## How Country Routing Works

Any calculator can list multiple countries in its `country` array:
```json
"country": ["india", "us", "uk"]
```
It then becomes reachable at `/country/india/<slug>`, `/country/us/<slug>`, etc.,
reusing the exact same `CalculatorRenderer` with the country's currency applied.
`generateStaticParams` in `app/country/[country]/[slug]/page.tsx` derives every
valid combination from the data — no manual route registration needed.

## How SEO Works

`lib/seo.ts` generates a Next.js `Metadata` object (title, description, canonical,
OpenGraph, Twitter card) from calculator/category/country data. Every page type
calls one of `calculatorMetadata()`, `categoryMetadata()`, `countryPageMetadata()`,
or `homeMetadata()` — never hand-written per page.

## How Structured Data Works

`lib/schema.ts` builds JSON-LD objects (`WebPage`, `BreadcrumbList`, `FAQPage`,
`SoftwareApplication`, `HowTo`) from the same calculator JSON and injected as a
single `<script type="application/ld+json">` per page via
`calculatorPageSchema()`.

## How to Add a New Category

Add an entry to the `CATEGORIES` array in `lib/calculators.ts`:
```ts
{ slug: 'science', title: 'Science', description: 'Physics, chemistry, and unit conversions' }
```
It automatically appears on the homepage grid, gets a route at
`/science-calculators` via `generateStaticParams`, and picks up any calculator
whose `category` field matches `"science"`.

## Migrating from JSON to a Database

Only `lib/calculators.ts` needs to change. Every function in that file
(`getAllCalculators`, `getCalculatorBySlug`, etc.) currently reads from
`data/calculators/*.json` — replace the file reads with queries against
Postgres/Supabase/Neon/PlanetScale, keeping the same function signatures and
return types (`Calculator[]` / `Calculator | undefined`). No component, route,
or formula code needs to change, since they only ever call these functions.

## Known Limitations / Next Steps

- Dependencies are unverified in this environment (no network access during
  generation) — run `npm install` and `npm run build` locally first.
- MDX content is currently ~300–500 words per calculator as a starting draft;
  expand to the target 1,000–2,000 words with more worked examples before
  launch for stronger SEO depth.
- Only 5 calculators and India-only country data are populated; US/UK/Canada/
  Australia calculators (mortgage, stamp duty, RRSP, superannuation) still
  need their own JSON + formula + MDX per the pattern above.
- Fonts referenced in `globals.css` (`Sora`, `Inter`) aren't yet wired up via
  `next/font` — add that for optimal font-loading performance (LCP).
- No real ad network is wired into `AdSlot.tsx` — it currently only reserves
  space, as specified.
