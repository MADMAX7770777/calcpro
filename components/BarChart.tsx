// Lightweight, dependency-free bar chart for year-over-year style breakdowns.

import { formatCurrency } from '@/lib/utils';
import type { CalculatorChartDatum } from '@/lib/types';

interface Props {
  data: CalculatorChartDatum[];
  currency?: string;
}

export default function BarChart({ data, currency = 'INR' }: Props) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-3" role="img" aria-label="Bar chart breakdown">
      {data.map((d) => (
        <div key={d.label}>
          <div className="mb-1 flex justify-between text-xs text-slate-500">
            <span>{d.label}</span>
            <span className="font-semibold text-slate-700">{formatCurrency(d.value, currency)}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${(d.value / max) * 100}%`, backgroundColor: d.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
