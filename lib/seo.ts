// Centralized SEO metadata generation. Every page derives its <title>,
// description, canonical URL, and social tags from calculator/category/
// country data here — nothing is hand-written per page.

import type { Metadata } from 'next';
import type { Calculator, CalculatorCategory, Country } from './types';

export const SITE_NAME = 'CalcPro';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://calcpro.example.com';

export function calculatorMetadata(calculator: Calculator, countrySlug?: string): Metadata {
  const path = countrySlug
    ? `/country/${countrySlug}/${calculator.slug}`
    : `/calculators/${calculator.slug}`;
  const canonical = `${SITE_URL}${path}`;
  const title = `${calculator.title} - Free Online Calculator | ${SITE_NAME}`;
  const description = calculator.description;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export function categoryMetadata(category: CalculatorCategory): Metadata {
  const canonical = `${SITE_URL}/${category.slug}-calculators`;
  const title = `${category.title} Calculators - Free & Accurate | ${SITE_NAME}`;
  const description = `${category.description}. All ${category.title.toLowerCase()} calculators are free, fast, and accurate.`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, siteName: SITE_NAME, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export function countryPageMetadata(country: Country, calculator: Calculator): Metadata {
  const canonical = `${SITE_URL}/country/${country.slug}/${calculator.slug}`;
  const title = `${calculator.title} for ${country.name} | ${SITE_NAME}`;
  const description = `${calculator.description} Localized for ${country.name}.`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, siteName: SITE_NAME, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export function homeMetadata(): Metadata {
  const title = `${SITE_NAME} - Fast, Simple & Free Online Calculators`;
  const description =
    'All the calculators you need for daily life, finance, health, math and more — fast, accurate and easy to use.';
  return {
    title,
    description,
    alternates: { canonical: SITE_URL },
    openGraph: { title, description, url: SITE_URL, siteName: SITE_NAME, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}
