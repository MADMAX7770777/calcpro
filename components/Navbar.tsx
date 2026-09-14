import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="border-b border-surface-border bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-heading text-xl font-extrabold text-slate-900">
          CalcPro
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <Link href="/calculators" className="hover:text-brand-600">Calculators</Link>
          <Link href="/finance-calculators" className="hover:text-brand-600">Categories</Link>
          <Link href="/about" className="hover:text-brand-600">About</Link>
        </nav>
      </div>
    </header>
  );
}
