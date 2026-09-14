import Link from 'next/link';
import type { Calculator } from '@/lib/types';

export default function RelatedCalculators({ calculators, title = 'Related Calculators' }: { calculators: Calculator[]; title?: string }) {
  if (!calculators.length) return null;
  return (
    <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-soft">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h3>
      <ul className="space-y-2">
        {calculators.map((c) => (
          <li key={c.slug}>
            <Link href={`/calculators/${c.slug}`} className="text-sm font-medium text-brand-600 hover:underline">
              {c.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
