'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    const slug = query.trim().toLowerCase().replace(/\s+/g, '-');
    router.push(`/calculators/${slug}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative mx-auto max-w-xl">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search calculator..."
        aria-label="Search calculators"
        className="w-full rounded-full border border-surface-border bg-white py-3.5 pl-12 pr-4 text-slate-700 shadow-soft outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
      <svg
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </form>
  );
}
