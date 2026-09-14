import { notFound } from 'next/navigation';
import PopularCalculators from '@/components/PopularCalculators';
import Breadcrumbs from '@/components/Breadcrumbs';
import { CATEGORIES, getCalculatorsByCategory, getCategory } from '@/lib/calculators';
import { categoryMetadata } from '@/lib/seo';

// URLs look like /investment-calculators, /health-calculators, etc.
// Category slug is derived by stripping the "-calculators" suffix.
function categorySlugFromParam(param: string): string | null {
  const match = param.match(/^(.+)-calculators$/);
  return match ? match[1] : null;
}

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: `${c.slug}-calculators` }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category: categoryParam } = await params;
  const slug = categorySlugFromParam(categoryParam);
  const category = slug ? getCategory(slug) : undefined;
  if (!category) return {};
  return categoryMetadata(category);
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categoryParam } = await params;
  const slug = categorySlugFromParam(categoryParam);
  const category = slug ? getCategory(slug) : undefined;
  if (!category) notFound();

  const calculators = getCalculatorsByCategory(category.slug);

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: category.title }]} />
      <div>
        <h1 className="font-heading text-3xl font-extrabold text-slate-900">{category.title} Calculators</h1>
        <p className="mt-2 max-w-2xl text-slate-500">{category.description}</p>
      </div>
      {calculators.length > 0 ? (
        <PopularCalculators calculators={calculators} />
      ) : (
        <p className="text-slate-500">More {category.title.toLowerCase()} calculators are coming soon.</p>
      )}
    </div>
  );
}
