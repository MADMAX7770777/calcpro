import Link from 'next/link';
import type { CalculatorCategory } from '@/lib/types';

export default function CategoryCard({ category, count }: { category: CalculatorCategory; count: number }) {
  return (
    <Link
      href={`/${category.slug}-calculators`}
      className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <p className="font-heading text-lg font-bold text-slate-900">{category.title}</p>
      <p className="mt-1 text-sm text-slate-500">{category.description}</p>
      <p className="mt-3 text-xs font-semibold text-brand-600">{count} calculator{count === 1 ? '' : 's'}</p>
    </Link>
  );
}
