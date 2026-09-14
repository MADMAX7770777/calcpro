'use client';

// The single generic renderer every calculator uses. It takes a Calculator
// config object, manages input state, runs the matching formula on change,
// and renders inputs + results. Adding a new calculator NEVER touches this
// file — only data/calculators/*.json, lib/formulas.ts, and content/*.mdx.

import { useMemo, useState } from 'react';
import type { Calculator } from '@/lib/types';
import { runFormula } from '@/lib/formulas';
import CalculatorInputs from './CalculatorInputs';
import CalculatorResults from './CalculatorResults';

interface Props {
  calculator: Calculator;
}

function buildDefaults(calculator: Calculator): Record<string, number | string> {
  const defaults: Record<string, number | string> = {};
  for (const input of calculator.inputs) {
    if (input.defaultValue !== undefined) {
      defaults[input.name] = input.defaultValue as number | string;
    } else if (input.type === 'select' || input.type === 'radio') {
      defaults[input.name] = input.options?.[0]?.value ?? '';
    } else if (input.type === 'date') {
      defaults[input.name] = new Date().toISOString().slice(0, 10);
    } else {
      defaults[input.name] = '';
    }
  }
  return defaults;
}

export default function CalculatorRenderer({ calculator }: Props) {
  const [values, setValues] = useState<Record<string, number | string>>(() => buildDefaults(calculator));

  const result = useMemo(() => {
    try {
      return runFormula(calculator.formula, values);
    } catch (err) {
      return {
        headline: { label: 'Error', value: 'Unable to calculate', format: 'text' as const },
        fields: [{ label: 'Details', value: (err as Error).message, format: 'text' as const }],
        raw: {},
      };
    }
  }, [calculator.formula, values]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-surface-border bg-white p-6 shadow-soft">
        <CalculatorInputs
          inputs={calculator.inputs}
          values={values}
          onChange={(name, value) => setValues((prev) => ({ ...prev, [name]: value }))}
          onReset={() => setValues(buildDefaults(calculator))}
        />
      </div>

      <CalculatorResults result={result} chart={calculator.chart} currency={calculator.currency} />
    </div>
  );
}
