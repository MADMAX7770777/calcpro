interface Props {
  title: string;
  expression: string;
  legend?: { symbol: string; meaning: string }[];
}

export default function Formula({ title, expression, legend }: Props) {
  return (
    <section className="rounded-2xl border border-surface-border bg-white p-6 shadow-soft">
      <h2 className="mb-4 font-heading text-xl font-bold text-slate-900">{title}</h2>
      <div className="overflow-x-auto rounded-xl bg-slate-50 p-4 text-center font-mono text-lg text-slate-800">
        {expression}
      </div>
      {legend && legend.length > 0 && (
        <ul className="mt-4 space-y-1 text-sm text-slate-600">
          {legend.map((l) => (
            <li key={l.symbol}>
              <span className="font-semibold text-slate-800">{l.symbol}</span> = {l.meaning}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
