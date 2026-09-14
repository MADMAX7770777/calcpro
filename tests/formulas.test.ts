import { describe, it, expect } from 'vitest';
import { calculateEMI, calculateSIP, calculateBMI, calculateGST, calculateAge } from '../lib/formulas';

describe('calculateEMI', () => {
  it('computes a standard EMI correctly', () => {
    const result = calculateEMI({ loanAmount: 500000, interestRate: 8.5, loanTenure: 5 });
    expect(result.headline.value).toBeCloseTo(10258.28, 0);
  });

  it('handles zero interest rate (straight-line repayment)', () => {
    const result = calculateEMI({ loanAmount: 120000, interestRate: 0, loanTenure: 1 });
    expect(result.headline.value).toBeCloseTo(10000, 0);
  });

  it('returns 0 for zero tenure (avoids divide-by-zero)', () => {
    const result = calculateEMI({ loanAmount: 100000, interestRate: 8, loanTenure: 0 });
    expect(result.headline.value).toBe(0);
  });
});

describe('calculateSIP', () => {
  it('computes SIP maturity value', () => {
    const result = calculateSIP({ monthlyInvestment: 5000, returnRate: 12, years: 10 });
    expect(Number(result.raw.invested)).toBe(600000);
    expect(Number(result.raw.maturity)).toBeGreaterThan(600000);
  });

  it('handles zero return rate (no growth)', () => {
    const result = calculateSIP({ monthlyInvestment: 1000, returnRate: 0, years: 1 });
    expect(result.raw.maturity).toBe(12000);
  });
});

describe('calculateBMI', () => {
  it('computes metric BMI and category', () => {
    const result = calculateBMI({ unitSystem: 'metric', heightCm: 170, weightKg: 65 });
    expect(result.headline.value).toBeCloseTo(22.49, 1);
    expect(result.raw.category).toBe('Normal weight');
  });

  it('computes imperial BMI', () => {
    const result = calculateBMI({ unitSystem: 'imperial', heightInches: 67, weightLbs: 143 });
    expect(Number(result.headline.value)).toBeGreaterThan(20);
  });
});

describe('calculateGST', () => {
  it('computes exclusive GST correctly', () => {
    const result = calculateGST({ amount: 10000, gstRate: 18, mode: 'exclusive' });
    expect(result.raw.gst).toBe(1800);
    expect(result.raw.total).toBe(11800);
  });

  it('computes inclusive GST correctly', () => {
    const result = calculateGST({ amount: 11800, gstRate: 18, mode: 'inclusive' });
    expect(Number(result.raw.base)).toBeCloseTo(10000, 0);
  });
});

describe('calculateAge', () => {
  it('computes age between two known dates', () => {
    const result = calculateAge({ dob: '1995-03-15', asOfDate: '2026-09-15' });
    expect(result.raw.years).toBe(31);
    expect(result.raw.months).toBe(6);
    expect(result.raw.days).toBe(0);
  });

  it('returns an error result for a future date of birth', () => {
    const result = calculateAge({ dob: '2099-01-01', asOfDate: '2026-09-15' });
    expect(result.headline.value).toBe('—');
  });
});
