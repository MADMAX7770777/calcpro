import SearchBar from '@/components/SearchBar';
import CategoryCard from '@/components/CategoryCard';
import PopularCalculators from '@/components/PopularCalculators';
import { CATEGORIES, getAllCalculators, getPopularCalculators, getCalculatorsByCategory } from '@/lib/calculators';

export default function HomePage() {
  const popular = getPopularCalculators(6);
  const all = getAllCalculators();

  return (
    <div className="space-y-16">
      <section className="text-center">
        <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
          100% Free Calculators
        </span>
        <h1 className="mx-auto mt-4 max-w-2xl font-heading text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
          Fast, Simple &amp; Free Online Calculators
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-500">
          All calculators you need for daily life, finance, health, math and more — fast, accurate and easy to use.
        </p>
        <div className="mt-8">
          <SearchBar />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Browse by Category</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.slug} category={cat} count={getCalculatorsByCategory(cat.slug).length} />
          ))}
        </div>
      </section>

      {popular.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Popular Calculators</h2>
          <PopularCalculators calculators={popular} />
        </section>
      )}

      <section className="rounded-2xl bg-brand-50/60 p-8 text-center">
        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-4">
          {['100% Free', 'Accurate Results', 'Mobile Friendly', 'Privacy Friendly'].map((t) => (
            <div key={t}>
              <p className="font-heading text-sm font-bold text-slate-800">{t}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="prose prose-slate max-w-none">
        <h2 className="font-heading text-2xl font-bold text-slate-900">Why CalcPro?</h2>
        <p className="text-slate-600">
          CalcPro brings together {all.length}+ free calculators spanning finance, health, math, time and everyday
          life — each one built for speed, accuracy, and clarity, with no sign-up required.
        </p>
      </section>
    </div>
  );
}
