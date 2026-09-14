'use client';

import { useState } from 'react';
import type { FAQItem } from '@/lib/types';

export default function FAQ({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  if (!items?.length) return null;

  return (
    <section className="rounded-2xl border border-surface-border bg-white p-6 shadow-soft">
      <h2 className="mb-4 font-heading text-xl font-bold text-slate-900">Frequently Asked Questions</h2>
      <div className="divide-y divide-surface-border">
        {items.map((item, i) => (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
              className="flex w-full items-center justify-between py-3.5 text-left text-sm font-semibold text-slate-800"
            >
              {item.question}
              <span className="ml-4 text-slate-400">{open === i ? '−' : '+'}</span>
            </button>
            {open === i && <p className="pb-4 text-sm leading-relaxed text-slate-600">{item.answer}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
