// Centralized JSON-LD structured-data generation.
// Every page gets its schema derived from calculator/MDX data here —
// no calculator hand-writes its own JSON-LD.

import type { Calculator, FAQItem } from './types';
import { SITE_NAME, SITE_URL } from './seo';

export function faqSchema(faqs: FAQItem[] = []): Record<string, unknown> | null {
  if (!faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function webPageSchema(title: string, description: string, url: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
  };
}

export function softwareApplicationSchema(calculator: Calculator): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: calculator.title,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    url: `${SITE_URL}/calculators/${calculator.slug}`,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
}

export function howToSchema(calculator: Calculator): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to use the ${calculator.title}`,
    step: calculator.inputs.map((input, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: input.label,
      text: `Enter your ${input.label.toLowerCase()}.`,
    })),
  };
}

// Combines every applicable schema for a calculator page into one array,
// ready to be dropped into a single <script type="application/ld+json">.
export function calculatorPageSchema(
  calculator: Calculator,
  breadcrumbs: { name: string; url: string }[]
): Array<Record<string, unknown>> {
  const url = `${SITE_URL}/calculators/${calculator.slug}`;
  const schemas: Array<Record<string, unknown>> = [
    webPageSchema(calculator.title, calculator.description, url),
    breadcrumbSchema(breadcrumbs),
    softwareApplicationSchema(calculator),
    howToSchema(calculator),
  ];
  const faq = faqSchema(calculator.faqs);
  if (faq) schemas.push(faq);
  return schemas;
}
