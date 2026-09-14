// Shared formatting helpers. Keep these dependency-free for bundle size.

const CURRENCY_LOCALE: Record<string, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  GBP: 'en-GB',
  CAD: 'en-CA',
  AUD: 'en-AU',
};

export function formatCurrency(value: number, currency = 'INR'): string {
  const locale = CURRENCY_LOCALE[currency] ?? 'en-IN';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(0)}`;
  }
}

export function formatPercentage(value: number): string {
  return `${Number(value).toFixed(1)}%`;
}

export function formatNumber(value: number, locale = 'en-IN'): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatResultValue(
  value: number | string,
  format?: 'currency' | 'percentage' | 'number' | 'text' | 'years',
  currency = 'INR'
): string {
  if (format === 'currency') return formatCurrency(Number(value), currency);
  if (format === 'percentage') return formatPercentage(Number(value));
  if (format === 'number') return formatNumber(Number(value));
  return String(value);
}

export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
