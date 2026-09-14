'use client';

import type { CalculatorInput } from '@/lib/types';

interface Props {
  inputs: CalculatorInput[];
  values: Record<string, number | string>;
  onChange: (name: string, value: number | string) => void;
  onReset: () => void;
}

export default function CalculatorInputs({ inputs, values, onChange, onReset }: Props) {
  return (
    <div className="space-y-5">
      {inputs.map((input) => (
        <div key={input.name}>
          <label htmlFor={input.name} className="mb-1.5 block text-sm font-semibold text-slate-800">
            {input.label}
            {input.unit ? <span className="ml-1 font-normal text-slate-400">({input.unit})</span> : null}
          </label>

          {input.type === 'select' ? (
            <select
              id={input.name}
              value={values[input.name] ?? ''}
              onChange={(e) => onChange(input.name, e.target.value)}
              className="w-full rounded-xl border border-surface-border bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              {input.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : input.type === 'radio' ? (
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={input.label}>
              {input.options?.map((opt) => {
                const selected = String(values[input.name]) === String(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => onChange(input.name, opt.value)}
                    className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition ${
                      selected
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-surface-border bg-white text-slate-600 hover:border-brand-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          ) : input.type === 'date' ? (
            <input
              id={input.name}
              type="date"
              value={String(values[input.name] ?? '')}
              onChange={(e) => onChange(input.name, e.target.value)}
              className="w-full rounded-xl border border-surface-border bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          ) : (
            <div className="relative">
              {input.type === 'currency' && (
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  ₹
                </span>
              )}
              <input
                id={input.name}
                type="number"
                inputMode="decimal"
                min={input.min}
                max={input.max}
                step={input.step ?? 'any'}
                value={values[input.name] ?? ''}
                onChange={(e) => onChange(input.name, e.target.value === '' ? '' : Number(e.target.value))}
                className={`w-full rounded-xl border border-surface-border bg-white py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${
                  input.type === 'currency' ? 'pl-8 pr-4' : 'px-4'
                }`}
                aria-describedby={input.helpText ? `${input.name}-help` : undefined}
              />
              {input.type === 'percentage' && (
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  %
                </span>
              )}
            </div>
          )}

          {input.helpText && (
            <p id={`${input.name}-help`} className="mt-1 text-xs text-slate-400">
              {input.helpText}
            </p>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={onReset}
        className="w-full rounded-xl border border-surface-border bg-white py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
      >
        Reset
      </button>
    </div>
  );
}
