// Data-access layer for calculator configuration.
// Everything reads from JSON in /data/calculators today. Swap the file-reads
// in this module for DB queries later (Postgres/Supabase/Neon/PlanetScale) —
// nothing outside this file needs to change, since callers only see typed
// Calculator objects, never the storage mechanism.

import fs from 'node:fs';
import path from 'node:path';
import type { Calculator, CalculatorCategory, Country } from './types';

const DATA_DIR = path.join(process.cwd(), 'data', 'calculators');

export const CATEGORIES: CalculatorCategory[] = [
  { slug: 'finance', title: 'Finance', description: 'EMI, SIP, Loan, GST and more' },
  { slug: 'health', title: 'Health', description: 'BMI, BMR, Age, Calorie and more' },
  { slug: 'math', title: 'Math', description: 'Percentage, Ratio, Algebra and more' },
  { slug: 'time', title: 'Time', description: 'Date, Time, Duration, Age and more' },
  { slug: 'converters', title: 'Converters', description: 'Currency, Unit, Length and more' },
  { slug: 'everyday', title: 'Everyday', description: 'Discount, Fuel, Tip and more' },
  { slug: 'business', title: 'Business', description: 'GST, Margin, Payroll and more' },
  { slug: 'education', title: 'Education', description: 'Grade, GPA, Percentage and more' },
];

export const COUNTRIES: Country[] = [
  { slug: 'india', name: 'India', currency: 'INR' },
  { slug: 'us', name: 'United States', currency: 'USD' },
  { slug: 'uk', name: 'United Kingdom', currency: 'GBP' },
  { slug: 'canada', name: 'Canada', currency: 'CAD' },
  { slug: 'australia', name: 'Australia', currency: 'AUD' },
];

function validateCalculator(data: unknown, file: string): Calculator {
  const c = data as Calculator;
  if (!c || typeof c !== 'object') {
    throw new Error(`Invalid calculator JSON in ${file}: not an object`);
  }
  const required: (keyof Calculator)[] = ['slug', 'title', 'description', 'category', 'formula', 'inputs'];
  for (const key of required) {
    if (c[key] === undefined) {
      throw new Error(`Invalid calculator JSON in ${file}: missing "${String(key)}"`);
    }
  }
  if (!Array.isArray(c.inputs) || c.inputs.length === 0) {
    throw new Error(`Invalid calculator JSON in ${file}: "inputs" must be a non-empty array`);
  }
  if (!c.country) c.country = [];
  return c;
}

let cache: Calculator[] | null = null;

export function getAllCalculators(): Calculator[] {
  if (cache) return cache;
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'));
  cache = files.map((file) => {
    const raw = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
    return validateCalculator(JSON.parse(raw), file);
  });
  return cache;
}

export function getCalculatorBySlug(slug: string): Calculator | undefined {
  return getAllCalculators().find((c) => c.slug === slug);
}

export function getCalculatorsByCategory(categorySlug: string): Calculator[] {
  return getAllCalculators().filter((c) => c.category === categorySlug);
}

export function getCalculatorsByCountry(countrySlug: string): Calculator[] {
  return getAllCalculators().filter((c) => c.country.includes(countrySlug));
}

export function getCalculatorForCountry(countrySlug: string, slug: string): Calculator | undefined {
  const calc = getCalculatorBySlug(slug);
  if (!calc || !calc.country.includes(countrySlug)) return undefined;
  return calc;
}

export function getPopularCalculators(limit = 6): Calculator[] {
  const popular = getAllCalculators().filter((c) => c.popular);
  return (popular.length ? popular : getAllCalculators()).slice(0, limit);
}

// Related calculators: explicit JSON list wins; otherwise fall back to
// same-category calculators. This keeps internal linking automatic even
// when a calculator doesn't hand-curate its own related list.
export function getRelatedCalculators(slug: string, limit = 5): Calculator[] {
  const current = getCalculatorBySlug(slug);
  if (!current) return [];

  if (current.related?.slugs?.length) {
    return current.related.slugs
      .map((s) => getCalculatorBySlug(s))
      .filter((c): c is Calculator => Boolean(c))
      .slice(0, limit);
  }

  return getAllCalculators()
    .filter((c) => c.slug !== slug && c.category === current.category)
    .slice(0, limit);
}

export function getCategory(slug: string): CalculatorCategory | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getCountry(slug: string): Country | undefined {
  return COUNTRIES.find((c) => c.slug === slug);
}
