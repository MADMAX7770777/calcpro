// Centralized type definitions for the CalcPro data-driven architecture.
// Every calculator, whatever it computes, conforms to these shapes.

export type InputType =
  | 'number'
  | 'currency'
  | 'percentage'
  | 'date'
  | 'select'
  | 'radio'
  | 'toggle';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface CalculatorInput {
  name: string;
  label: string;
  type: InputType;
  defaultValue?: number | string | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: SelectOption[];
  helpText?: string;
  unit?: string; // e.g. "years", "%", "kg"
  required?: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export type FormulaName =
  | 'age'
  | 'emi'
  | 'mortgage'
  | 'bmi'
  | 'sip'
  | 'gst'
  | 'percentage'
  | 'average'
  | 'bmr'
  | 'bodyFat'
  | 'breakEven'
  | 'calorie'
  | 'cgpaToPercentage'
  | 'compoundInterest'
  | 'countdown'
  | 'currencyConvert'
  | 'dateDifference'
  | 'dayOfWeek'
  | 'discount'
  | 'electricityBill'
  | 'fuelCost'
  | 'gpa'
  | 'lcmHcf'
  | 'lengthConvert'
  | 'markup'
  | 'payroll'
  | 'percentile'
  | 'profitMargin'
  | 'quadratic'
  | 'ratio'
  | 'roi'
  | 'simpleInterest'
  | 'speedConvert'
  | 'temperatureConvert'
  | 'timeDuration'
  | 'tip'
  | 'unitPrice'
  | 'waterIntake'
  | 'weightConvert';

export type ChartType = 'donut' | 'bar' | 'none';

export interface RelatedConfig {
  slugs?: string[]; // explicit related calculators
}

export interface Calculator {
  slug: string;
  title: string;
  description: string;
  country: string[]; // e.g. ["india"], ["us","uk"]
  category: string; // e.g. "finance", "health"
  formula: FormulaName;
  currency?: string; // ISO code, e.g. "INR", "USD"
  chart?: ChartType;
  inputs: CalculatorInput[];
  faqs?: FAQItem[];
  related?: RelatedConfig;
  popular?: boolean;
  updatedAt?: string;
}

export interface CalculatorResultField {
  label: string;
  value: number | string;
  format?: 'currency' | 'percentage' | 'number' | 'text' | 'years';
  emphasis?: boolean;
}

export interface CalculatorChartDatum {
  label: string;
  value: number;
  color?: string;
}

export interface CalculatorResult {
  headline: CalculatorResultField;
  fields: CalculatorResultField[];
  chartData?: CalculatorChartDatum[];
  table?: { headers: string[]; rows: (string | number)[][] };
  raw: Record<string, number | string>;
}

export interface CalculatorCategory {
  slug: string;
  title: string;
  description: string;
  icon?: string;
}

export interface Country {
  slug: string;
  name: string;
  currency: string;
}

export interface SeoMeta {
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
}
