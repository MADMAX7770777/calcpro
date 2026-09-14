import type { MetadataRoute } from 'next';
import { CATEGORIES, COUNTRIES, getAllCalculators, getCalculatorsByCountry } from '@/lib/calculators';
import { SITE_URL } from '@/lib/seo';

// Fully derived from calculator data — adding a calculator, category, or
// country automatically adds its URLs here. Nothing is manually maintained.
export default function sitemap(): MetadataRoute.Sitemap {
  const calculators = getAllCalculators();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: now, priority: 0.3 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: now, priority: 0.2 },
    { url: `${SITE_URL}/contact`, lastModified: now, priority: 0.2 },
  ];

  const calculatorPages: MetadataRoute.Sitemap = calculators.map((c) => ({
    url: `${SITE_URL}/calculators/${c.slug}`,
    lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
    priority: 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${SITE_URL}/${cat.slug}-calculators`,
    lastModified: now,
    priority: 0.6,
  }));

  const countryPages: MetadataRoute.Sitemap = COUNTRIES.flatMap((country) =>
    getCalculatorsByCountry(country.slug).map((c) => ({
      url: `${SITE_URL}/country/${country.slug}/${c.slug}`,
      lastModified: now,
      priority: 0.7,
    }))
  );

  return [...staticPages, ...calculatorPages, ...categoryPages, ...countryPages];
}
