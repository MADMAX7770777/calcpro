// Lightweight, dependency-free donut chart built from SVG stroke-dasharray.
// No charting library needed for two-to-four segment breakdowns, which keeps
// the client bundle small.

import { formatCurrency } from '@/lib/utils';
import type { CalculatorChartDatum } from '@/lib/types';

interface Props {
  data: CalculatorChartDatum[];
  currency?: string;
}

const DEFAULT_COLORS = ['#3466e0', '#22c55e', '#f59e0b', '#ef4444'];

export default function DonutChart({ data, currency = 'INR' }: Props) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <svg
        viewBox="0 0 160 160"
        width="150"
        height="150"
        role="img"
        aria-label="Breakdown chart"
      >
        <g transform="translate(80,80) rotate(-90)">
          <circle r={radius} fill="none" stroke="#eef1f6" strokeWidth="20" />
          {data.map((d, i) => {
            const fraction = d.value / total;
            const dash = circumference * fraction;
            const gap = circumference - dash;
            const circle = (
              <circle
                key={d.label}
                r={radius}
                fill="none"
                stroke={d.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                strokeWidth="20"
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += dash;
            return circle;
          })}
        </g>
      </svg>

      <ul className="space-y-2 text-sm">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: d.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}
            />
            <span className="text-slate-500">{d.label}</span>
            <span className="font-semibold text-slate-800">{formatCurrency(d.value, currency)}</span>
            <span className="text-xs text-slate-400">({((d.value / total) * 100).toFixed(1)}%)</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
