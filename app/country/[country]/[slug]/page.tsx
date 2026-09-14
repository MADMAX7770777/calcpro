import { notFound } from 'next/navigation';
import CalculatorRenderer from '@/components/CalculatorRenderer';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import { COUNTRIES, getCalculatorForCountry, getCalculatorsByCountry, getCountry } from '@/lib/calculators';
import { countryPageMetadata } from '@/lib/seo';

export function generateStaticParams() {
  return COUNTRIES.flatMap((country) =>
    getCalculatorsByCountry(country.slug).map((calc) => ({ country: country.slug, slug: calc.slug }))
  );
}

export async function generateMetadata({ params }: { params: Promise<{ country: string; slug: string }> }) {
  const { country: countryParam, slug } = await params;
  const country = getCountry(countryParam);
  const calculator = country ? getCalculatorForCountry(country.slug, slug) : undefined;
  if (!country || !calculator) return {};
  return countryPageMetadata(country, calculator);
}

export default async function CountryCalculatorPage({ params }: { params: Promise<{ country: string; slug: string }> }) {
  const { country: countryParam, slug } = await params;
  const country = getCountry(countryParam);
  if (!country) notFound();

  const calculator = getCalculatorForCountry(country.slug, slug);
  if (!calculator) notFound();

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { name: 'Home', href: '/' },
          { name: country.name, href: `/country/${country.slug}` },
          { name: calculator.title },
        ]}
      />
      <div>
        <h1 className="font-heading text-3xl font-extrabold text-slate-900">
          {calculator.title} — {country.name}
        </h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          {calculator.description} Localized with {country.currency} formatting for {country.name}.
        </p>
      </div>

      <CalculatorRenderer calculator={{ ...calculator, currency: country.currency }} />

      {calculator.faqs && calculator.faqs.length > 0 && <FAQ items={calculator.faqs} />}
    </div>
  );
}
