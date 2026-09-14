// Display-only formula text (expression + legend) shown on calculator pages.
// Separate from the actual calculation logic in formulas.ts — this is purely
// presentational and keyed by the same FormulaName so any calculator using
// that formula automatically gets the right explanation.

import type { FormulaName } from './types';

interface FormulaDisplay {
  title: string;
  expression: string;
  legend: { symbol: string; meaning: string }[];
}

export const FORMULA_DISPLAY: Partial<Record<FormulaName, FormulaDisplay>> = {
  emi: {
    title: 'EMI Formula',
    expression: 'EMI = [P × r × (1+r)^n] / [(1+r)^n − 1]',
    legend: [
      { symbol: 'P', meaning: 'Principal loan amount' },
      { symbol: 'r', meaning: 'Monthly interest rate (annual rate / 12 / 100)' },
      { symbol: 'n', meaning: 'Loan tenure in months' },
    ],
  },
  mortgage: {
    title: 'Mortgage Payment Formula',
    expression: 'M = [P × r × (1+r)^n] / [(1+r)^n − 1]',
    legend: [
      { symbol: 'P', meaning: 'Principal loan amount' },
      { symbol: 'r', meaning: 'Monthly interest rate' },
      { symbol: 'n', meaning: 'Loan tenure in months' },
    ],
  },
  bmi: {
    title: 'BMI Formula',
    expression: 'BMI = weight (kg) / [height (m)]²',
    legend: [
      { symbol: 'weight', meaning: 'Body weight in kilograms' },
      { symbol: 'height', meaning: 'Height in meters' },
    ],
  },
  sip: {
    title: 'SIP Maturity Formula',
    expression: 'M = P × [{(1+i)^n − 1} / i] × (1+i)',
    legend: [
      { symbol: 'P', meaning: 'Monthly investment amount' },
      { symbol: 'i', meaning: 'Monthly rate of return (annual rate / 12 / 100)' },
      { symbol: 'n', meaning: 'Number of monthly installments' },
    ],
  },
  gst: {
    title: 'GST Formula',
    expression: 'GST Amount = Base Amount × (GST Rate / 100)',
    legend: [
      { symbol: 'Base Amount', meaning: 'Amount before GST' },
      { symbol: 'GST Rate', meaning: 'Applicable GST percentage (5%, 12%, 18%, 28%)' },
    ],
  },
  age: {
    title: 'Age Calculation',
    expression: 'Age = Calculation Date − Date of Birth',
    legend: [
      { symbol: 'Calculation Date', meaning: 'The reference date (defaults to today)' },
      { symbol: 'Date of Birth', meaning: 'Your date of birth' },
    ],
  },
};
