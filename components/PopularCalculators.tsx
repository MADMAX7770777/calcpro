import Link from 'next/link';
import type { Calculator } from '@/lib/types';

export default function PopularCalculators({ calculators }: { calculators: Calculator[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {calculators.map((c) => (
        <Link
          key={c.slug}
          href={`/calculators/${c.slug}`}
          className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="font-heading text-lg font-bold text-slate-900">{c.title}</p>
          <p className="mt-1 text-sm text-slate-500">{c.description}</p>
        </Link>
      ))}
    </div>
  );
}
