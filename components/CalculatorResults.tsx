import type { CalculatorResult } from '@/lib/types';
import { formatResultValue } from '@/lib/utils';
import DonutChart from './DonutChart';
import BarChart from './BarChart';
import ResultsTable from './ResultsTable';

interface Props {
  result: CalculatorResult;
  chart?: 'donut' | 'bar' | 'none';
  currency?: string;
}

export default function CalculatorResults({ result, chart = 'none', currency = 'INR' }: Props) {
  return (
    <div className="rounded-2xl border border-surface-border bg-white p-6 shadow-soft">
      <p className="text-sm font-medium text-slate-500">{result.headline.label}</p>
      <p className="mt-1 font-heading text-4xl font-bold text-brand-600">
        {formatResultValue(result.headline.value, result.headline.format, currency)}
      </p>

      <dl className="mt-5 space-y-2 border-t border-surface-border pt-4">
        {result.fields.map((f) => (
          <div key={f.label} className="flex items-center justify-between text-sm">
            <dt className="text-slate-500">{f.label}</dt>
            <dd className="font-semibold text-slate-800">{formatResultValue(f.value, f.format, currency)}</dd>
          </div>
        ))}
      </dl>

      {chart !== 'none' && result.chartData && result.chartData.length > 0 && (
        <div className="mt-6 border-t border-surface-border pt-5">
          <p className="mb-3 text-sm font-semibold text-slate-700">Breakdown</p>
          {chart === 'donut' ? (
            <DonutChart data={result.chartData} currency={currency} />
          ) : (
            <BarChart data={result.chartData} currency={currency} />
          )}
        </div>
      )}

      {result.table && (
        <div className="mt-6 border-t border-surface-border pt-5">
          <ResultsTable table={result.table} />
        </div>
      )}
    </div>
  );
}
