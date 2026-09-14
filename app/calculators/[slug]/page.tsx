import { notFound } from 'next/navigation';
import CalculatorRenderer from '@/components/CalculatorRenderer';
import Breadcrumbs from '@/components/Breadcrumbs';
import Formula from '@/components/Formula';
import FAQ from '@/components/FAQ';
import RelatedCalculators from '@/components/RelatedCalculators';
import AdSlot from '@/components/AdSlot';
import {
  getAllCalculators,
  getCalculatorBySlug,
  getRelatedCalculators,
  getPopularCalculators,
  getCategory,
} from '@/lib/calculators';
import { calculatorMetadata, SITE_URL } from '@/lib/seo';
import { calculatorPageSchema } from '@/lib/schema';
import { FORMULA_DISPLAY } from '@/lib/formula-display';

export function generateStaticParams() {
  return getAllCalculators().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const calculator = getCalculatorBySlug(slug);
  if (!calculator) return {};
  return calculatorMetadata(calculator);
}

export default async function CalculatorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const calculator = getCalculatorBySlug(slug);
  if (!calculator) notFound();

  const category = getCategory(calculator.category);
  const related = getRelatedCalculators(calculator.slug, 5);
  const popular = getPopularCalculators(4);
  const display = FORMULA_DISPLAY[calculator.formula];

  const breadcrumbs = [
    { name: 'Home', url: SITE_URL },
    ...(category ? [{ name: category.title, url: `${SITE_URL}/${category.slug}-calculators` }] : []),
    { name: calculator.title, url: `${SITE_URL}/calculators/${calculator.slug}` },
  ];
  const schemas = calculatorPageSchema(calculator, breadcrumbs);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />

      <div className="space-y-8">
        <Breadcrumbs
          items={[
            { name: 'Home', href: '/' },
            ...(category ? [{ name: category.title, href: `/${category.slug}-calculators` }] : []),
            { name: calculator.title },
          ]}
        />

        <div>
          <h1 className="font-heading text-3xl font-extrabold text-slate-900">{calculator.title}</h1>
          <p className="mt-2 max-w-2xl text-slate-500">{calculator.description}</p>
        </div>

        <AdSlot placement="above-calculator" />

        <CalculatorRenderer calculator={calculator} />

        <AdSlot placement="below-calculator" />

        {display && <Formula title={display.title} expression={display.expression} legend={display.legend} />}

        {calculator.faqs && calculator.faqs.length > 0 && <FAQ items={calculator.faqs} />}

        <AdSlot placement="between-sections" />
      </div>

      <aside className="space-y-6">
        <RelatedCalculators calculators={related} />
        <RelatedCalculators calculators={popular} title="Popular Calculators" />
        <AdSlot placement="sidebar" />
      </aside>
    </div>
  );
}
