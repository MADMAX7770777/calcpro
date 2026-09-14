import Link from 'next/link';

export default function Breadcrumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={item.name} className="flex items-center gap-1.5">
            {item.href ? (
              <Link href={item.href} className="hover:text-brand-600">
                {item.name}
              </Link>
            ) : (
              <span className="text-slate-700">{item.name}</span>
            )}
            {i < items.length - 1 && <span className="text-slate-300">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
