// Centralized formula engine.
// Every calculation lives here — never inside a React component.
// The renderer looks up `formulaRegistry[calculator.formula]` and calls it
// with the raw input values from the form.

import type { CalculatorResult, FormulaName } from './types';

type Inputs = Record<string, number | string>;
export type FormulaFn = (inputs: Inputs) => CalculatorResult;

function toNumber(v: number | string | undefined, fallback = 0): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : fallback;
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : fallback;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function gcdOf(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

// ---------- EMI ----------
export function calculateEMI(inputs: Inputs): CalculatorResult {
  const principal = Math.max(0, toNumber(inputs.loanAmount));
  const annualRate = Math.max(0, toNumber(inputs.interestRate));
  const years = Math.max(0, toNumber(inputs.loanTenure));
  const monthlyRate = annualRate / 12 / 100;
  const months = Math.round(years * 12);

  let emi = 0;
  if (months <= 0 || principal <= 0) {
    emi = 0;
  } else if (monthlyRate === 0) {
    emi = principal / months;
  } else {
    const factor = Math.pow(1 + monthlyRate, months);
    emi = (principal * monthlyRate * factor) / (factor - 1);
  }

  const totalPayment = emi * months;
  const totalInterest = Math.max(0, totalPayment - principal);

  return {
    headline: { label: 'Monthly EMI', value: round2(emi), format: 'currency', emphasis: true },
    fields: [
      { label: 'Loan Amount', value: round2(principal), format: 'currency' },
      { label: 'Interest Payable', value: round2(totalInterest), format: 'currency' },
      { label: 'Total Payment', value: round2(totalPayment), format: 'currency' },
      { label: 'Loan Tenure', value: `${years} Years`, format: 'text' },
    ],
    chartData: [
      { label: 'Principal Amount', value: round2(principal), color: '#3466e0' },
      { label: 'Interest Amount', value: round2(totalInterest), color: '#22c55e' },
    ],
    raw: { emi: round2(emi), totalPayment: round2(totalPayment), totalInterest: round2(totalInterest), principal: round2(principal), months },
  };
}

// ---------- Mortgage (reuses EMI math; kept distinct for clarity/extension) ----------
export function calculateMortgage(inputs: Inputs): CalculatorResult {
  return calculateEMI(inputs);
}

// ---------- BMI ----------
export function calculateBMI(inputs: Inputs): CalculatorResult {
  const unit = String(inputs.unitSystem ?? 'metric');
  let heightM: number;
  let weightKg: number;

  if (unit === 'imperial') {
    const heightIn = Math.max(0, toNumber(inputs.heightInches));
    const weightLb = Math.max(0, toNumber(inputs.weightLbs));
    heightM = heightIn * 0.0254;
    weightKg = weightLb * 0.453592;
  } else {
    heightM = Math.max(0, toNumber(inputs.heightCm)) / 100;
    weightKg = Math.max(0, toNumber(inputs.weightKg));
  }

  const bmi = heightM > 0 ? weightKg / (heightM * heightM) : 0;

  let category = 'Unknown';
  if (bmi > 0) {
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal weight';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obesity';
  }

  return {
    headline: { label: 'Your BMI', value: round2(bmi), format: 'number', emphasis: true },
    fields: [
      { label: 'Category', value: category, format: 'text' },
      { label: 'Healthy BMI Range', value: '18.5 – 24.9', format: 'text' },
    ],
    raw: { bmi: round2(bmi), category },
  };
}

// ---------- SIP ----------
export function calculateSIP(inputs: Inputs): CalculatorResult {
  const monthly = Math.max(0, toNumber(inputs.monthlyInvestment));
  const annualReturn = Math.max(0, toNumber(inputs.returnRate));
  const years = Math.max(0, toNumber(inputs.years));
  const months = Math.round(years * 12);
  const i = annualReturn / 12 / 100;

  const invested = monthly * months;
  let maturity = 0;
  if (months > 0) {
    if (i === 0) {
      maturity = invested;
    } else {
      maturity = monthly * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
    }
  }
  const returns = Math.max(0, maturity - invested);

  return {
    headline: { label: 'Maturity Value', value: round2(maturity), format: 'currency', emphasis: true },
    fields: [
      { label: 'Invested Amount', value: round2(invested), format: 'currency' },
      { label: 'Estimated Returns', value: round2(returns), format: 'currency' },
      { label: 'Investment Period', value: `${years} Years`, format: 'text' },
    ],
    chartData: [
      { label: 'Invested Amount', value: round2(invested), color: '#3466e0' },
      { label: 'Estimated Returns', value: round2(returns), color: '#22c55e' },
    ],
    raw: { invested: round2(invested), maturity: round2(maturity), returns: round2(returns), months },
  };
}

// ---------- GST ----------
export function calculateGST(inputs: Inputs): CalculatorResult {
  const amount = Math.max(0, toNumber(inputs.amount));
  const rate = Math.max(0, toNumber(inputs.gstRate));
  const mode = String(inputs.mode ?? 'exclusive'); // 'exclusive' | 'inclusive'

  let base: number;
  let gst: number;
  let total: number;

  if (mode === 'inclusive') {
    base = amount / (1 + rate / 100);
    gst = amount - base;
    total = amount;
  } else {
    base = amount;
    gst = amount * (rate / 100);
    total = base + gst;
  }

  return {
    headline: { label: 'Total Amount', value: round2(total), format: 'currency', emphasis: true },
    fields: [
      { label: 'Base Amount', value: round2(base), format: 'currency' },
      { label: 'GST Amount', value: round2(gst), format: 'currency' },
      { label: 'GST Rate', value: rate, format: 'percentage' },
    ],
    raw: { base: round2(base), gst: round2(gst), total: round2(total) },
  };
}

// ---------- Age ----------
export function calculateAge(inputs: Inputs): CalculatorResult {
  const dob = new Date(String(inputs.dob));
  const asOf = inputs.asOfDate ? new Date(String(inputs.asOfDate)) : new Date();

  if (isNaN(dob.getTime()) || isNaN(asOf.getTime()) || dob > asOf) {
    return {
      headline: { label: 'Age', value: '—', format: 'text', emphasis: true },
      fields: [{ label: 'Error', value: 'Please enter a valid date of birth.', format: 'text' }],
      raw: {},
    };
  }

  let years = asOf.getFullYear() - dob.getFullYear();
  let months = asOf.getMonth() - dob.getMonth();
  let days = asOf.getDate() - dob.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(asOf.getFullYear(), asOf.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.floor((asOf.getTime() - dob.getTime()) / msPerDay);
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = years * 12 + months;

  const nextBirthday = new Date(asOf.getFullYear(), dob.getMonth(), dob.getDate());
  if (nextBirthday < asOf) nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
  const daysToNextBirthday = Math.ceil((nextBirthday.getTime() - asOf.getTime()) / msPerDay);

  return {
    headline: { label: 'Your Age', value: `${years}y ${months}m ${days}d`, format: 'text', emphasis: true },
    fields: [
      { label: 'Total Months', value: totalMonths, format: 'number' },
      { label: 'Total Weeks', value: totalWeeks, format: 'number' },
      { label: 'Total Days', value: totalDays, format: 'number' },
      { label: 'Days to Next Birthday', value: daysToNextBirthday, format: 'number' },
    ],
    raw: { years, months, days, totalDays, totalWeeks, totalMonths, daysToNextBirthday },
  };
}

// ---------- Percentage (attendance / grade / plain percentage) ----------
export function calculatePercentage(inputs: Inputs): CalculatorResult {
  const value = toNumber(inputs.value);
  const total = toNumber(inputs.total);
  const pct = total !== 0 ? (value / total) * 100 : 0;

  return {
    headline: { label: 'Percentage', value: round2(pct), format: 'percentage', emphasis: true },
    fields: [
      { label: 'Value', value: round2(value), format: 'number' },
      { label: 'Total', value: round2(total), format: 'number' },
    ],
    raw: { percentage: round2(pct) },
  };
}

// ---------- Average ----------
export function calculateAverage(inputs: Inputs): CalculatorResult {
  const n1 = toNumber(inputs.number1);
  const n2 = toNumber(inputs.number2);
  const n3 = toNumber(inputs.number3);
  const n4 = toNumber(inputs.number4);
  const n5 = toNumber(inputs.number5);
  const sum = n1 + n2 + n3 + n4 + n5;
  const avg = sum / 5;

  return {
    headline: { label: 'Average', value: round2(avg), format: 'number', emphasis: true },
    fields: [{ label: 'Sum', value: round2(sum), format: 'number' }],
    raw: { average: round2(avg), sum: round2(sum) },
  };
}

// ---------- BMR (Mifflin-St Jeor) ----------
export function calculateBMR(inputs: Inputs): CalculatorResult {
  const gender = String(inputs.gender ?? 'male');
  const age = Math.max(0, toNumber(inputs.age));
  const heightCm = Math.max(0, toNumber(inputs.heightCm));
  const weightKg = Math.max(0, toNumber(inputs.weightKg));

  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = gender === 'female' ? base - 161 : base + 5;

  return {
    headline: { label: 'BMR', value: round2(bmr), format: 'number', emphasis: true },
    fields: [{ label: 'Calories/day at rest', value: `${round2(bmr)} kcal`, format: 'text' }],
    raw: { bmr: round2(bmr) },
  };
}

// ---------- Body Fat (US Navy method) ----------
export function calculateBodyFat(inputs: Inputs): CalculatorResult {
  const gender = String(inputs.gender ?? 'male');
  const heightCm = Math.max(1, toNumber(inputs.heightCm));
  const waistCm = Math.max(1, toNumber(inputs.waistCm));
  const neckCm = Math.max(1, toNumber(inputs.neckCm));
  const hipCm = Math.max(1, toNumber(inputs.hipCm));

  let bodyFat: number;
  if (gender === 'female') {
    bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.221 * Math.log10(heightCm)) - 450;
  } else {
    bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
  }
  bodyFat = Math.max(0, bodyFat);

  return {
    headline: { label: 'Body Fat %', value: round2(bodyFat), format: 'percentage', emphasis: true },
    fields: [{ label: 'Method', value: 'US Navy formula', format: 'text' }],
    raw: { bodyFat: round2(bodyFat) },
  };
}

// ---------- Break-Even ----------
export function calculateBreakEven(inputs: Inputs): CalculatorResult {
  const fixedCosts = Math.max(0, toNumber(inputs.fixedCosts));
  const price = toNumber(inputs.pricePerUnit);
  const variableCost = toNumber(inputs.variableCostPerUnit);
  const contribution = price - variableCost;
  const units = contribution > 0 ? fixedCosts / contribution : 0;
  const revenue = units * price;

  return {
    headline: { label: 'Break-Even Units', value: Math.ceil(units), format: 'number', emphasis: true },
    fields: [
      { label: 'Contribution Margin/Unit', value: round2(contribution), format: 'currency' },
      { label: 'Break-Even Revenue', value: round2(revenue), format: 'currency' },
    ],
    raw: { units: Math.ceil(units), revenue: round2(revenue) },
  };
}

// ---------- Calorie (Mifflin-St Jeor x activity) ----------
const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

export function calculateCalorie(inputs: Inputs): CalculatorResult {
  const gender = String(inputs.gender ?? 'male');
  const age = Math.max(0, toNumber(inputs.age));
  const heightCm = Math.max(0, toNumber(inputs.heightCm));
  const weightKg = Math.max(0, toNumber(inputs.weightKg));
  const activityLevel = String(inputs.activityLevel ?? 'sedentary');

  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = gender === 'female' ? base - 161 : base + 5;
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.2;
  const maintenance = bmr * multiplier;

  return {
    headline: { label: 'Daily Calories', value: round2(maintenance), format: 'number', emphasis: true },
    fields: [
      { label: 'BMR', value: round2(bmr), format: 'number' },
      { label: 'Activity Multiplier', value: multiplier, format: 'number' },
    ],
    raw: { bmr: round2(bmr), maintenance: round2(maintenance) },
  };
}

// ---------- CGPA to Percentage ----------
export function calculateCgpaToPercentage(inputs: Inputs): CalculatorResult {
  const cgpa = Math.max(0, toNumber(inputs.cgpa));
  const percentage = cgpa * 9.5;

  return {
    headline: { label: 'Percentage', value: round2(percentage), format: 'percentage', emphasis: true },
    fields: [{ label: 'CGPA', value: cgpa, format: 'number' }],
    raw: { percentage: round2(percentage) },
  };
}

// ---------- Compound Interest ----------
export function calculateCompoundInterest(inputs: Inputs): CalculatorResult {
  const principal = Math.max(0, toNumber(inputs.principal));
  const rate = Math.max(0, toNumber(inputs.rate));
  const time = Math.max(0, toNumber(inputs.time));
  const n = Math.max(1, toNumber(inputs.frequency, 1));

  const amount = principal * Math.pow(1 + rate / 100 / n, n * time);
  const interest = Math.max(0, amount - principal);

  return {
    headline: { label: 'Maturity Amount', value: round2(amount), format: 'currency', emphasis: true },
    fields: [
      { label: 'Principal', value: round2(principal), format: 'currency' },
      { label: 'Interest Earned', value: round2(interest), format: 'currency' },
    ],
    chartData: [
      { label: 'Principal', value: round2(principal), color: '#3466e0' },
      { label: 'Interest', value: round2(interest), color: '#22c55e' },
    ],
    raw: { amount: round2(amount), interest: round2(interest) },
  };
}

// ---------- Countdown ----------
export function calculateCountdown(inputs: Inputs): CalculatorResult {
  const target = new Date(String(inputs.targetDate));
  const now = new Date();

  if (isNaN(target.getTime())) {
    return {
      headline: { label: 'Countdown', value: '—', format: 'text', emphasis: true },
      fields: [{ label: 'Error', value: 'Please enter a valid target date.', format: 'text' }],
      raw: {},
    };
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffMs = target.getTime() - now.getTime();
  const totalDays = Math.ceil(diffMs / msPerDay);
  const days = Math.max(0, totalDays);

  return {
    headline: { label: 'Days Remaining', value: days, format: 'number', emphasis: true },
    fields: [
      { label: 'Target Date', value: target.toDateString(), format: 'text' },
      { label: 'Status', value: diffMs >= 0 ? 'Upcoming' : 'Passed', format: 'text' },
    ],
    raw: { days, totalDays },
  };
}

// ---------- Currency Convert ----------
// NOTE: static demo rates (units per 1 USD) — replace with a live exchange-rate API before production use.
const CURRENCY_RATES_PER_USD: Record<string, number> = {
  USD: 1,
  INR: 83,
  EUR: 0.92,
  GBP: 0.79,
  AUD: 1.52,
  CAD: 1.36,
};

export function calculateCurrencyConvert(inputs: Inputs): CalculatorResult {
  const amount = Math.max(0, toNumber(inputs.amount));
  const from = String(inputs.fromCurrency ?? 'USD');
  const to = String(inputs.toCurrency ?? 'INR');

  const fromRate = CURRENCY_RATES_PER_USD[from] ?? 1;
  const toRate = CURRENCY_RATES_PER_USD[to] ?? 1;
  const usdAmount = amount / fromRate;
  const converted = usdAmount * toRate;

  return {
    headline: { label: `${to} Amount`, value: round2(converted), format: 'currency', emphasis: true },
    fields: [
      { label: 'Original Amount', value: `${round2(amount)} ${from}`, format: 'text' },
      { label: 'Note', value: 'Static demo rates — connect a live API for accuracy', format: 'text' },
    ],
    raw: { converted: round2(converted) },
  };
}

// ---------- Date Difference ----------
export function calculateDateDifference(inputs: Inputs): CalculatorResult {
  const start = new Date(String(inputs.startDate));
  const end = new Date(String(inputs.endDate));

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      headline: { label: 'Difference', value: '—', format: 'text', emphasis: true },
      fields: [{ label: 'Error', value: 'Please enter valid dates.', format: 'text' }],
      raw: {},
    };
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.abs(Math.round((end.getTime() - start.getTime()) / msPerDay));
  const weeks = Math.floor(totalDays / 7);
  const months = Math.floor(totalDays / 30.44);
  const years = Math.floor(totalDays / 365.25);

  return {
    headline: { label: 'Total Days', value: totalDays, format: 'number', emphasis: true },
    fields: [
      { label: 'Weeks', value: weeks, format: 'number' },
      { label: 'Approx. Months', value: months, format: 'number' },
      { label: 'Approx. Years', value: years, format: 'number' },
    ],
    raw: { totalDays, weeks, months, years },
  };
}

// ---------- Day of Week ----------
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function calculateDayOfWeek(inputs: Inputs): CalculatorResult {
  const date = new Date(String(inputs.date));

  if (isNaN(date.getTime())) {
    return {
      headline: { label: 'Day', value: '—', format: 'text', emphasis: true },
      fields: [{ label: 'Error', value: 'Please enter a valid date.', format: 'text' }],
      raw: {},
    };
  }

  const dayName = DAY_NAMES[date.getDay()];

  return {
    headline: { label: 'Day of the Week', value: dayName, format: 'text', emphasis: true },
    fields: [{ label: 'Date', value: date.toDateString(), format: 'text' }],
    raw: { dayOfWeek: dayName },
  };
}

// ---------- Discount ----------
export function calculateDiscount(inputs: Inputs): CalculatorResult {
  const price = Math.max(0, toNumber(inputs.price));
  const pct = Math.max(0, toNumber(inputs.discountPercent));
  const discount = price * (pct / 100);
  const final = price - discount;

  return {
    headline: { label: 'Final Price', value: round2(final), format: 'currency', emphasis: true },
    fields: [{ label: 'You Save', value: round2(discount), format: 'currency' }],
    raw: { final: round2(final), discount: round2(discount) },
  };
}

// ---------- Electricity Bill ----------
export function calculateElectricityBill(inputs: Inputs): CalculatorResult {
  const units = Math.max(0, toNumber(inputs.unitsConsumed));
  const rate = Math.max(0, toNumber(inputs.ratePerUnit));
  const fixedCharge = Math.max(0, toNumber(inputs.fixedCharge));

  const energyCost = units * rate;
  const total = energyCost + fixedCharge;

  return {
    headline: { label: 'Total Bill', value: round2(total), format: 'currency', emphasis: true },
    fields: [
      { label: 'Energy Charges', value: round2(energyCost), format: 'currency' },
      { label: 'Fixed Charges', value: round2(fixedCharge), format: 'currency' },
    ],
    raw: { total: round2(total), energyCost: round2(energyCost) },
  };
}

// ---------- Fuel Cost ----------
export function calculateFuelCost(inputs: Inputs): CalculatorResult {
  const distance = Math.max(0, toNumber(inputs.distance));
  const mileage = Math.max(0.0001, toNumber(inputs.mileage));
  const fuelPrice = Math.max(0, toNumber(inputs.fuelPrice));

  const fuelNeeded = distance / mileage;
  const cost = fuelNeeded * fuelPrice;

  return {
    headline: { label: 'Total Fuel Cost', value: round2(cost), format: 'currency', emphasis: true },
    fields: [{ label: 'Fuel Required', value: `${round2(fuelNeeded)} L`, format: 'text' }],
    raw: { cost: round2(cost), fuelNeeded: round2(fuelNeeded) },
  };
}

// ---------- GPA ----------
export function calculateGPA(inputs: Inputs): CalculatorResult {
  const totalGradePoints = Math.max(0, toNumber(inputs.totalGradePoints));
  const totalCredits = Math.max(0.0001, toNumber(inputs.totalCredits));
  const gpa = totalGradePoints / totalCredits;

  return {
    headline: { label: 'GPA', value: round2(gpa), format: 'number', emphasis: true },
    fields: [{ label: 'Total Credits', value: totalCredits, format: 'number' }],
    raw: { gpa: round2(gpa) },
  };
}

// ---------- LCM / HCF ----------
export function calculateLcmHcf(inputs: Inputs): CalculatorResult {
  const a = Math.max(1, toNumber(inputs.numberA, 1));
  const b = Math.max(1, toNumber(inputs.numberB, 1));

  const hcf = gcdOf(a, b);
  const lcm = (a * b) / hcf;

  return {
    headline: { label: 'LCM', value: lcm, format: 'number', emphasis: true },
    fields: [{ label: 'HCF (GCD)', value: hcf, format: 'number' }],
    raw: { lcm, hcf },
  };
}

// ---------- Length Convert ----------
const LENGTH_TO_METERS: Record<string, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
};

export function calculateLengthConvert(inputs: Inputs): CalculatorResult {
  const value = toNumber(inputs.value);
  const from = String(inputs.fromUnit ?? 'm');
  const to = String(inputs.toUnit ?? 'm');

  const meters = value * (LENGTH_TO_METERS[from] ?? 1);
  const converted = meters / (LENGTH_TO_METERS[to] ?? 1);

  return {
    headline: { label: 'Converted Value', value: round2(converted), format: 'number', emphasis: true },
    fields: [{ label: 'Unit', value: to, format: 'text' }],
    raw: { converted: round2(converted) },
  };
}

// ---------- Markup ----------
export function calculateMarkup(inputs: Inputs): CalculatorResult {
  const costPrice = Math.max(0, toNumber(inputs.costPrice));
  const markupPct = Math.max(0, toNumber(inputs.markupPercent));

  const markupAmount = costPrice * (markupPct / 100);
  const sellingPrice = costPrice + markupAmount;

  return {
    headline: { label: 'Selling Price', value: round2(sellingPrice), format: 'currency', emphasis: true },
    fields: [{ label: 'Markup Amount', value: round2(markupAmount), format: 'currency' }],
    raw: { sellingPrice: round2(sellingPrice), markupAmount: round2(markupAmount) },
  };
}

// ---------- Payroll ----------
export function calculatePayroll(inputs: Inputs): CalculatorResult {
  const hoursWorked = Math.max(0, toNumber(inputs.hoursWorked));
  const hourlyRate = Math.max(0, toNumber(inputs.hourlyRate));
  const overtimeHours = Math.max(0, toNumber(inputs.overtimeHours));
  const overtimeMultiplier = Math.max(1, toNumber(inputs.overtimeMultiplier, 1.5));

  const regularPay = hoursWorked * hourlyRate;
  const overtimePay = overtimeHours * hourlyRate * overtimeMultiplier;
  const total = regularPay + overtimePay;

  return {
    headline: { label: 'Total Pay', value: round2(total), format: 'currency', emphasis: true },
    fields: [
      { label: 'Regular Pay', value: round2(regularPay), format: 'currency' },
      { label: 'Overtime Pay', value: round2(overtimePay), format: 'currency' },
    ],
    raw: { total: round2(total), regularPay: round2(regularPay), overtimePay: round2(overtimePay) },
  };
}

// ---------- Percentile ----------
export function calculatePercentile(inputs: Inputs): CalculatorResult {
  const rank = Math.max(0, toNumber(inputs.rank));
  const totalStudents = Math.max(1, toNumber(inputs.totalStudents, 1));

  const percentile = ((totalStudents - rank) / totalStudents) * 100;

  return {
    headline: { label: 'Percentile', value: round2(percentile), format: 'percentage', emphasis: true },
    fields: [{ label: 'Rank', value: rank, format: 'number' }],
    raw: { percentile: round2(percentile) },
  };
}

// ---------- Profit Margin ----------
export function calculateProfitMargin(inputs: Inputs): CalculatorResult {
  const costPrice = Math.max(0, toNumber(inputs.costPrice));
  const sellingPrice = Math.max(0, toNumber(inputs.sellingPrice));

  const profit = sellingPrice - costPrice;
  const margin = sellingPrice !== 0 ? (profit / sellingPrice) * 100 : 0;

  return {
    headline: { label: 'Profit Margin', value: round2(margin), format: 'percentage', emphasis: true },
    fields: [{ label: 'Profit', value: round2(profit), format: 'currency' }],
    raw: { margin: round2(margin), profit: round2(profit) },
  };
}

// ---------- Quadratic Equation ----------
export function calculateQuadratic(inputs: Inputs): CalculatorResult {
  const a = toNumber(inputs.a);
  const b = toNumber(inputs.b);
  const c = toNumber(inputs.c);

  if (a === 0) {
    return {
      headline: { label: 'Roots', value: '—', format: 'text', emphasis: true },
      fields: [{ label: 'Error', value: '"a" must not be zero for a quadratic equation.', format: 'text' }],
      raw: {},
    };
  }

  const discriminant = b * b - 4 * a * c;
  let rootsText: string;
  let raw: Record<string, number | string> = {};

  if (discriminant > 0) {
    const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    rootsText = `${round2(root1)}, ${round2(root2)}`;
    raw = { root1: round2(root1), root2: round2(root2) };
  } else if (discriminant === 0) {
    const root = -b / (2 * a);
    rootsText = `${round2(root)}`;
    raw = { root: round2(root) };
  } else {
    const real = -b / (2 * a);
    const imag = Math.sqrt(-discriminant) / (2 * a);
    rootsText = `${round2(real)} + ${round2(imag)}i, ${round2(real)} - ${round2(imag)}i`;
    raw = { realPart: round2(real), imagPart: round2(imag) };
  }

  return {
    headline: { label: 'Roots', value: rootsText, format: 'text', emphasis: true },
    fields: [{ label: 'Discriminant', value: round2(discriminant), format: 'number' }],
    raw,
  };
}

// ---------- Ratio ----------
export function calculateRatio(inputs: Inputs): CalculatorResult {
  const a = Math.max(0, toNumber(inputs.valueA));
  const b = Math.max(0, toNumber(inputs.valueB));
  const divisor = gcdOf(a || 1, b || 1);

  const simplifiedA = divisor > 0 ? a / divisor : a;
  const simplifiedB = divisor > 0 ? b / divisor : b;

  return {
    headline: { label: 'Simplified Ratio', value: `${round2(simplifiedA)} : ${round2(simplifiedB)}`, format: 'text', emphasis: true },
    fields: [{ label: 'Original', value: `${a} : ${b}`, format: 'text' }],
    raw: { simplifiedA: round2(simplifiedA), simplifiedB: round2(simplifiedB) },
  };
}

// ---------- ROI ----------
export function calculateROI(inputs: Inputs): CalculatorResult {
  const initial = Math.max(0.0001, toNumber(inputs.initialInvestment, 1));
  const final = toNumber(inputs.finalValue);

  const gain = final - initial;
  const roi = (gain / initial) * 100;

  return {
    headline: { label: 'ROI', value: round2(roi), format: 'percentage', emphasis: true },
    fields: [{ label: 'Net Gain', value: round2(gain), format: 'currency' }],
    raw: { roi: round2(roi), gain: round2(gain) },
  };
}

// ---------- Simple Interest ----------
export function calculateSimpleInterest(inputs: Inputs): CalculatorResult {
  const principal = Math.max(0, toNumber(inputs.principal));
  const rate = Math.max(0, toNumber(inputs.rate));
  const time = Math.max(0, toNumber(inputs.time));

  const interest = (principal * rate * time) / 100;
  const total = principal + interest;

  return {
    headline: { label: 'Total Amount', value: round2(total), format: 'currency', emphasis: true },
    fields: [{ label: 'Interest Earned', value: round2(interest), format: 'currency' }],
    raw: { total: round2(total), interest: round2(interest) },
  };
}

// ---------- Speed Convert ----------
const SPEED_TO_MPS: Record<string, number> = {
  mps: 1,
  kmph: 1 / 3.6,
  mph: 0.44704,
  knot: 0.514444,
};

export function calculateSpeedConvert(inputs: Inputs): CalculatorResult {
  const value = toNumber(inputs.value);
  const from = String(inputs.fromUnit ?? 'mps');
  const to = String(inputs.toUnit ?? 'mps');

  const mps = value * (SPEED_TO_MPS[from] ?? 1);
  const converted = mps / (SPEED_TO_MPS[to] ?? 1);

  return {
    headline: { label: 'Converted Speed', value: round2(converted), format: 'number', emphasis: true },
    fields: [{ label: 'Unit', value: to, format: 'text' }],
    raw: { converted: round2(converted) },
  };
}

// ---------- Temperature Convert ----------
function toCelsius(value: number, unit: string): number {
  if (unit === 'F') return (value - 32) * (5 / 9);
  if (unit === 'K') return value - 273.15;
  return value;
}

function fromCelsius(celsius: number, unit: string): number {
  if (unit === 'F') return celsius * (9 / 5) + 32;
  if (unit === 'K') return celsius + 273.15;
  return celsius;
}

export function calculateTemperatureConvert(inputs: Inputs): CalculatorResult {
  const value = toNumber(inputs.value);
  const from = String(inputs.fromUnit ?? 'C');
  const to = String(inputs.toUnit ?? 'C');

  const celsius = toCelsius(value, from);
  const converted = fromCelsius(celsius, to);

  return {
    headline: { label: 'Converted Temperature', value: round2(converted), format: 'number', emphasis: true },
    fields: [{ label: 'Unit', value: to, format: 'text' }],
    raw: { converted: round2(converted) },
  };
}

// ---------- Time Duration ----------
export function calculateTimeDuration(inputs: Inputs): CalculatorResult {
  const startHour = toNumber(inputs.startHour);
  const startMinute = toNumber(inputs.startMinute);
  const endHour = toNumber(inputs.endHour);
  const endMinute = toNumber(inputs.endMinute);

  const startTotal = startHour * 60 + startMinute;
  let endTotal = endHour * 60 + endMinute;
  if (endTotal < startTotal) endTotal += 24 * 60; // crosses midnight

  const totalMinutes = endTotal - startTotal;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return {
    headline: { label: 'Duration', value: `${hours}h ${minutes}m`, format: 'text', emphasis: true },
    fields: [{ label: 'Total Minutes', value: totalMinutes, format: 'number' }],
    raw: { hours, minutes, totalMinutes },
  };
}

// ---------- Tip ----------
export function calculateTip(inputs: Inputs): CalculatorResult {
  const billAmount = Math.max(0, toNumber(inputs.billAmount));
  const tipPercent = Math.max(0, toNumber(inputs.tipPercent));
  const numPeople = Math.max(1, toNumber(inputs.numPeople, 1));

  const tipAmount = billAmount * (tipPercent / 100);
  const total = billAmount + tipAmount;
  const perPerson = total / numPeople;

  return {
    headline: { label: 'Total Per Person', value: round2(perPerson), format: 'currency', emphasis: true },
    fields: [
      { label: 'Tip Amount', value: round2(tipAmount), format: 'currency' },
      { label: 'Total Bill', value: round2(total), format: 'currency' },
    ],
    raw: { perPerson: round2(perPerson), tipAmount: round2(tipAmount), total: round2(total) },
  };
}

// ---------- Unit Price ----------
export function calculateUnitPrice(inputs: Inputs): CalculatorResult {
  const totalPrice = Math.max(0, toNumber(inputs.totalPrice));
  const quantity = Math.max(0.0001, toNumber(inputs.quantity, 1));

  const unitPrice = totalPrice / quantity;

  return {
    headline: { label: 'Price Per Unit', value: round2(unitPrice), format: 'currency', emphasis: true },
    fields: [{ label: 'Quantity', value: quantity, format: 'number' }],
    raw: { unitPrice: round2(unitPrice) },
  };
}

// ---------- Water Intake ----------
const WATER_ACTIVITY_BONUS_L: Record<string, number> = {
  low: 0,
  moderate: 0.35,
  high: 0.7,
};

export function calculateWaterIntake(inputs: Inputs): CalculatorResult {
  const weightKg = Math.max(0, toNumber(inputs.weightKg));
  const activityLevel = String(inputs.activityLevel ?? 'moderate');

  const baseLiters = weightKg * 0.033;
  const bonus = WATER_ACTIVITY_BONUS_L[activityLevel] ?? 0;
  const totalLiters = baseLiters + bonus;

  return {
    headline: { label: 'Daily Water Intake', value: `${round2(totalLiters)} L`, format: 'text', emphasis: true },
    fields: [{ label: 'Glasses (approx, 250ml)', value: Math.round((totalLiters * 1000) / 250), format: 'number' }],
    raw: { liters: round2(totalLiters) },
  };
}

// ---------- Weight Convert ----------
const WEIGHT_TO_GRAMS: Record<string, number> = {
  mg: 0.001,
  g: 1,
  kg: 1000,
  tonne: 1000000,
  oz: 28.3495,
  lb: 453.592,
};

export function calculateWeightConvert(inputs: Inputs): CalculatorResult {
  const value = toNumber(inputs.value);
  const from = String(inputs.fromUnit ?? 'kg');
  const to = String(inputs.toUnit ?? 'kg');

  const grams = value * (WEIGHT_TO_GRAMS[from] ?? 1);
  const converted = grams / (WEIGHT_TO_GRAMS[to] ?? 1);

  return {
    headline: { label: 'Converted Weight', value: round2(converted), format: 'number', emphasis: true },
    fields: [{ label: 'Unit', value: to, format: 'text' }],
    raw: { converted: round2(converted) },
  };
}

// ---------- Registry ----------
export const formulaRegistry: Record<FormulaName, FormulaFn> = {
  age: calculateAge,
  emi: calculateEMI,
  mortgage: calculateMortgage,
  bmi: calculateBMI,
  sip: calculateSIP,
  gst: calculateGST,
  percentage: calculatePercentage,
  average: calculateAverage,
  bmr: calculateBMR,
  bodyFat: calculateBodyFat,
  breakEven: calculateBreakEven,
  calorie: calculateCalorie,
  cgpaToPercentage: calculateCgpaToPercentage,
  compoundInterest: calculateCompoundInterest,
  countdown: calculateCountdown,
  currencyConvert: calculateCurrencyConvert,
  dateDifference: calculateDateDifference,
  dayOfWeek: calculateDayOfWeek,
  discount: calculateDiscount,
  electricityBill: calculateElectricityBill,
  fuelCost: calculateFuelCost,
  gpa: calculateGPA,
  lcmHcf: calculateLcmHcf,
  lengthConvert: calculateLengthConvert,
  markup: calculateMarkup,
  payroll: calculatePayroll,
  percentile: calculatePercentile,
  profitMargin: calculateProfitMargin,
  quadratic: calculateQuadratic,
  ratio: calculateRatio,
  roi: calculateROI,
  simpleInterest: calculateSimpleInterest,
  speedConvert: calculateSpeedConvert,
  temperatureConvert: calculateTemperatureConvert,
  timeDuration: calculateTimeDuration,
  tip: calculateTip,
  unitPrice: calculateUnitPrice,
  waterIntake: calculateWaterIntake,
  weightConvert: calculateWeightConvert,
};

export function runFormula(name: FormulaName, inputs: Inputs): CalculatorResult {
  const fn = formulaRegistry[name];
  if (!fn) {
    throw new Error(`Unknown formula "${name}". Check the calculator JSON's "formula" field.`);
  }
  return fn(inputs);
}
