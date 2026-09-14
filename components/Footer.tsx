import Link from 'next/link';
import { CATEGORIES } from '@/lib/calculators';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-surface-border bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 sm:grid-cols-3">
        <div>
          <p className="font-heading text-lg font-bold text-slate-900">CalcPro</p>
          <p className="mt-2 text-sm text-slate-500">Free, fast, accurate calculators for everyday decisions.</p>
        </div>
        <div>
          <p className="mb-2 text-sm font-bold text-slate-700">Company</p>
          <ul className="space-y-1.5 text-sm text-slate-500">
            <li><Link href="/about" className="hover:text-brand-600">About</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-brand-600">Privacy Policy</Link></li>
            <li><Link href="/contact" className="hover:text-brand-600">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-2 text-sm font-bold text-slate-700">Categories</p>
          <ul className="space-y-1.5 text-sm text-slate-500">
            {CATEGORIES.slice(0, 5).map((c) => (
              <li key={c.slug}>
                <Link href={`/${c.slug}-calculators`} className="hover:text-brand-600">{c.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-surface-border py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} CalcPro. All calculators provided for informational purposes only.
      </div>
    </footer>
  );
}
