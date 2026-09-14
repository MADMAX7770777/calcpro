# ============================================================
# CalcPro — Apply 35 New Calculators
# Run this from your project root:
#   C:\Users\NISHANT JOSHI\OneDrive\Desktop\CALCULATOR\calcpro\calcpro
#
# What this does:
#   1. Extracts calcpro-new-calculators.zip (35 JSON + 35 MDX files)
#      into .\data\calculators\ and .\content\
#   2. Patches lib\types.ts — expands the FormulaName union
#   3. Patches lib\formulas.ts — appends 33 new formula functions
#      and registers them in formulaRegistry
#   4. Runs `npx tsc --noEmit` to confirm everything compiles
#
# A .bak of both lib files is created before editing.
# Place calcpro-new-calculators.zip in this same folder before running.
# ============================================================

$zipPath = ".\calcpro-new-calculators.zip"
if (-not (Test-Path -LiteralPath $zipPath)) {
  Write-Host "ERROR: calcpro-new-calculators.zip not found in current folder." -ForegroundColor Red
  exit 1
}

Write-Host "Extracting 35 calculators..." -ForegroundColor Cyan
Expand-Archive -LiteralPath $zipPath -DestinationPath "." -Force
Write-Host "Done: data\calculators\ and content\ updated." -ForegroundColor Green

# ---- Backup lib files ----
Copy-Item ".\lib\types.ts" ".\lib\types.ts.bak" -Force
Copy-Item ".\lib\formulas.ts" ".\lib\formulas.ts.bak" -Force
Write-Host "Backed up lib\types.ts and lib\formulas.ts" -ForegroundColor Cyan

# ---- Patch lib\types.ts: expand FormulaName union ----
$typesPath = ".\lib\types.ts"
$typesContent = [System.IO.File]::ReadAllText($typesPath)

$oldUnion = "export type FormulaName = 'age' | 'emi' | 'mortgage' | 'bmi' | 'sip' | 'gst';"

$newUnion = @'
export type FormulaName =
  | 'age'
  | 'emi'
  | 'mortgage'
  | 'bmi'
  | 'sip'
  | 'gst'
  | 'simpleInterest'
  | 'compoundInterest'
  | 'bmr'
  | 'calorie'
  | 'bodyFat'
  | 'waterIntake'
  | 'dateDifference'
  | 'countdown'
  | 'timeDuration'
  | 'dayOfWeek'
  | 'percentage'
  | 'ratio'
  | 'average'
  | 'lcmHcf'
  | 'quadratic'
  | 'lengthConvert'
  | 'weightConvert'
  | 'temperatureConvert'
  | 'currencyConvert'
  | 'speedConvert'
  | 'discount'
  | 'fuelCost'
  | 'tip'
  | 'electricityBill'
  | 'unitPrice'
  | 'profitMargin'
  | 'breakEven'
  | 'markup'
  | 'payroll'
  | 'roi'
  | 'gpa'
  | 'cgpaToPercentage'
  | 'percentile';
'@

if ($typesContent.Contains($oldUnion)) {
  $typesContent = $typesContent.Replace($oldUnion, $newUnion)
  [System.IO.File]::WriteAllText($typesPath, $typesContent)
  Write-Host "Patched lib\types.ts (FormulaName union expanded)" -ForegroundColor Green
} else {
  Write-Host "WARNING: expected FormulaName line not found in lib\types.ts — skipped (check manually)." -ForegroundColor Yellow
}

# ---- Patch lib\formulas.ts: insert new functions + registry entries ----
$formulasPath = ".\lib\formulas.ts"
$formulasContent = [System.IO.File]::ReadAllText($formulasPath)

$registryMarker = "export const formulaRegistry: Record<FormulaName, FormulaFn> = {"

$newFunctions = @'
// ============================================================
// NEW FORMULAS — appended to reach 5+ calculators per category
// ============================================================

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
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
    fields: [
      { label: 'Principal', value: round2(principal), format: 'currency' },
      { label: 'Interest Earned', value: round2(interest), format: 'currency' },
      { label: 'Time Period', value: `${time} Years`, format: 'text' },
    ],
    chartData: [
      { label: 'Principal', value: round2(principal), color: '#3466e0' },
      { label: 'Interest', value: round2(interest), color: '#22c55e' },
    ],
    raw: { principal: round2(principal), interest: round2(interest), total: round2(total) },
  };
}

// ---------- Compound Interest ----------
export function calculateCompoundInterest(inputs: Inputs): CalculatorResult {
  const principal = Math.max(0, toNumber(inputs.principal));
  const rate = Math.max(0, toNumber(inputs.rate));
  const time = Math.max(0, toNumber(inputs.time));
  const n = Math.max(1, toNumber(inputs.frequency, 1));
  const total = principal * Math.pow(1 + rate / (100 * n), n * time);
  const interest = Math.max(0, total - principal);
  return {
    headline: { label: 'Maturity Amount', value: round2(total), format: 'currency', emphasis: true },
    fields: [
      { label: 'Principal', value: round2(principal), format: 'currency' },
      { label: 'Interest Earned', value: round2(interest), format: 'currency' },
      { label: 'Time Period', value: `${time} Years`, format: 'text' },
    ],
    chartData: [
      { label: 'Principal', value: round2(principal), color: '#3466e0' },
      { label: 'Interest', value: round2(interest), color: '#22c55e' },
    ],
    raw: { principal: round2(principal), interest: round2(interest), total: round2(total) },
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
    headline: { label: 'Your BMR', value: round2(bmr), format: 'number', emphasis: true },
    fields: [{ label: 'Unit', value: 'calories/day', format: 'text' }],
    raw: { bmr: round2(bmr) },
  };
}

// ---------- Calorie (maintenance) ----------
const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};
export function calculateCalorie(inputs: Inputs): CalculatorResult {
  const bmrResult = calculateBMR(inputs);
  const bmr = toNumber(bmrResult.raw.bmr as number);
  const activity = String(inputs.activityLevel ?? 'sedentary');
  const multiplier = ACTIVITY_MULTIPLIERS[activity] ?? 1.2;
  const maintenance = bmr * multiplier;
  return {
    headline: { label: 'Daily Calories (Maintenance)', value: round2(maintenance), format: 'number', emphasis: true },
    fields: [
      { label: 'Base BMR', value: round2(bmr), format: 'number' },
      { label: 'Activity Multiplier', value: multiplier, format: 'number' },
    ],
    raw: { bmr: round2(bmr), maintenance: round2(maintenance) },
  };
}

// ---------- Body Fat (US Navy method) ----------
export function calculateBodyFat(inputs: Inputs): CalculatorResult {
  const gender = String(inputs.gender ?? 'male');
  const heightCm = Math.max(1, toNumber(inputs.heightCm));
  const waistCm = Math.max(0, toNumber(inputs.waistCm));
  const neckCm = Math.max(0, toNumber(inputs.neckCm));
  const hipCm = Math.max(0, toNumber(inputs.hipCm));

  let bodyFat: number;
  if (gender === 'female') {
    bodyFat =
      495 /
        (1.29579 -
          0.35004 * Math.log10(waistCm + hipCm - neckCm) +
          0.221 * Math.log10(heightCm)) -
      450;
  } else {
    bodyFat =
      495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
  }
  bodyFat = Number.isFinite(bodyFat) ? Math.max(0, bodyFat) : 0;

  return {
    headline: { label: 'Estimated Body Fat', value: round2(bodyFat), format: 'percentage', emphasis: true },
    fields: [{ label: 'Method', value: 'US Navy Formula', format: 'text' }],
    raw: { bodyFat: round2(bodyFat) },
  };
}

// ---------- Water Intake ----------
const WATER_ACTIVITY_BONUS: Record<string, number> = { low: 0, moderate: 0.35, high: 0.7 };
export function calculateWaterIntake(inputs: Inputs): CalculatorResult {
  const weightKg = Math.max(0, toNumber(inputs.weightKg));
  const activity = String(inputs.activityLevel ?? 'low');
  const liters = weightKg * 0.033 + (WATER_ACTIVITY_BONUS[activity] ?? 0);
  return {
    headline: { label: 'Recommended Water Intake', value: round2(liters), format: 'number', emphasis: true },
    fields: [{ label: 'Unit', value: 'liters/day', format: 'text' }],
    raw: { liters: round2(liters) },
  };
}

// ---------- Date Difference ----------
export function calculateDateDifference(inputs: Inputs): CalculatorResult {
  const start = new Date(String(inputs.startDate));
  const end = new Date(String(inputs.endDate));
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      headline: { label: 'Result', value: '—', format: 'text', emphasis: true },
      fields: [{ label: 'Error', value: 'Please enter valid dates.', format: 'text' }],
      raw: {},
    };
  }
  const [from, to] = start <= end ? [start, end] : [end, start];
  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.round((to.getTime() - from.getTime()) / msPerDay);

  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(to.getFullYear(), to.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return {
    headline: { label: 'Difference', value: `${years}y ${months}m ${days}d`, format: 'text', emphasis: true },
    fields: [
      { label: 'Total Days', value: totalDays, format: 'number' },
      { label: 'Total Weeks', value: Math.floor(totalDays / 7), format: 'number' },
    ],
    raw: { years, months, days, totalDays },
  };
}

// ---------- Countdown ----------
export function calculateCountdown(inputs: Inputs): CalculatorResult {
  const target = new Date(String(inputs.targetDate));
  const now = new Date();
  if (isNaN(target.getTime())) {
    return {
      headline: { label: 'Result', value: '—', format: 'text', emphasis: true },
      fields: [{ label: 'Error', value: 'Please enter a valid date.', format: 'text' }],
      raw: {},
    };
  }
  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.ceil((target.getTime() - now.getTime()) / msPerDay);
  return {
    headline: {
      label: totalDays >= 0 ? 'Days Remaining' : 'Days Since',
      value: Math.abs(totalDays),
      format: 'number',
      emphasis: true,
    },
    fields: [{ label: 'Target Date', value: String(inputs.targetDate), format: 'text' }],
    raw: { totalDays },
  };
}

// ---------- Time Duration ----------
export function calculateTimeDuration(inputs: Inputs): CalculatorResult {
  const startH = Math.max(0, Math.min(23, toNumber(inputs.startHour)));
  const startM = Math.max(0, Math.min(59, toNumber(inputs.startMinute)));
  const endH = Math.max(0, Math.min(23, toNumber(inputs.endHour)));
  const endM = Math.max(0, Math.min(59, toNumber(inputs.endMinute)));

  let startTotal = startH * 60 + startM;
  let endTotal = endH * 60 + endM;
  let diff = endTotal - startTotal;
  if (diff < 0) diff += 24 * 60;

  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  return {
    headline: { label: 'Duration', value: `${hours}h ${minutes}m`, format: 'text', emphasis: true },
    fields: [{ label: 'Total Minutes', value: diff, format: 'number' }],
    raw: { hours, minutes, totalMinutes: diff },
  };
}

// ---------- Day of Week ----------
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export function calculateDayOfWeek(inputs: Inputs): CalculatorResult {
  const date = new Date(String(inputs.date));
  if (isNaN(date.getTime())) {
    return {
      headline: { label: 'Result', value: '—', format: 'text', emphasis: true },
      fields: [{ label: 'Error', value: 'Please enter a valid date.', format: 'text' }],
      raw: {},
    };
  }
  const dayName = DAY_NAMES[date.getUTCDay()];
  return {
    headline: { label: 'Day of the Week', value: dayName, format: 'text', emphasis: true },
    fields: [],
    raw: { dayName },
  };
}

// ---------- Percentage (value / total) ----------
export function calculatePercentage(inputs: Inputs): CalculatorResult {
  const value = Math.max(0, toNumber(inputs.value));
  const total = Math.max(0, toNumber(inputs.total));
  const pct = total > 0 ? (value / total) * 100 : 0;
  return {
    headline: { label: 'Percentage', value: round2(pct), format: 'percentage', emphasis: true },
    fields: [
      { label: 'Value', value: round2(value), format: 'number' },
      { label: 'Total', value: round2(total), format: 'number' },
    ],
    raw: { value: round2(value), total: round2(total), percentage: round2(pct) },
  };
}

// ---------- Ratio ----------
export function calculateRatio(inputs: Inputs): CalculatorResult {
  const a = Math.max(0, toNumber(inputs.valueA));
  const b = Math.max(0, toNumber(inputs.valueB));
  const g = gcd(a, b);
  const simplifiedA = g > 0 ? Math.round(a / g) : 0;
  const simplifiedB = g > 0 ? Math.round(b / g) : 0;
  return {
    headline: { label: 'Simplified Ratio', value: `${simplifiedA} : ${simplifiedB}`, format: 'text', emphasis: true },
    fields: [],
    raw: { simplifiedA, simplifiedB },
  };
}

// ---------- Average ----------
export function calculateAverage(inputs: Inputs): CalculatorResult {
  const values = [inputs.number1, inputs.number2, inputs.number3, inputs.number4, inputs.number5].map((v) =>
    toNumber(v)
  );
  const sum = values.reduce((acc, v) => acc + v, 0);
  const avg = values.length > 0 ? sum / values.length : 0;
  return {
    headline: { label: 'Average', value: round2(avg), format: 'number', emphasis: true },
    fields: [
      { label: 'Sum', value: round2(sum), format: 'number' },
      { label: 'Count', value: values.length, format: 'number' },
    ],
    raw: { sum: round2(sum), average: round2(avg) },
  };
}

// ---------- LCM & HCF ----------
export function calculateLcmHcf(inputs: Inputs): CalculatorResult {
  const a = Math.max(1, Math.round(toNumber(inputs.numberA, 1)));
  const b = Math.max(1, Math.round(toNumber(inputs.numberB, 1)));
  const hcf = gcd(a, b);
  const lcm = Math.round((a * b) / hcf);
  return {
    headline: { label: 'LCM', value: lcm, format: 'number', emphasis: true },
    fields: [{ label: 'HCF (GCD)', value: hcf, format: 'number' }],
    raw: { lcm, hcf },
  };
}

// ---------- Quadratic Equation ----------
export function calculateQuadratic(inputs: Inputs): CalculatorResult {
  const a = toNumber(inputs.a);
  const b = toNumber(inputs.b);
  const c = toNumber(inputs.c);

  if (a === 0) {
    return {
      headline: { label: 'Result', value: '—', format: 'text', emphasis: true },
      fields: [{ label: 'Error', value: '"a" must not be zero for a quadratic equation.', format: 'text' }],
      raw: {},
    };
  }

  const discriminant = b * b - 4 * a * c;
  let rootsText: string;
  if (discriminant > 0) {
    const r1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const r2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    rootsText = `${round2(r1)}, ${round2(r2)}`;
  } else if (discriminant === 0) {
    const r = -b / (2 * a);
    rootsText = `${round2(r)} (double root)`;
  } else {
    const real = round2(-b / (2 * a));
    const imag = round2(Math.sqrt(-discriminant) / (2 * a));
    rootsText = `${real} + ${imag}i, ${real} - ${imag}i`;
  }

  return {
    headline: { label: 'Roots', value: rootsText, format: 'text', emphasis: true },
    fields: [{ label: 'Discriminant', value: round2(discriminant), format: 'number' }],
    raw: { discriminant: round2(discriminant) },
  };
}

// ---------- Length Converter ----------
const LENGTH_TO_M: Record<string, number> = {
  mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344,
};
export function calculateLengthConvert(inputs: Inputs): CalculatorResult {
  const value = toNumber(inputs.value);
  const from = String(inputs.fromUnit ?? 'm');
  const to = String(inputs.toUnit ?? 'm');
  const meters = value * (LENGTH_TO_M[from] ?? 1);
  const result = meters / (LENGTH_TO_M[to] ?? 1);
  return {
    headline: { label: 'Converted Value', value: round2(result), format: 'number', emphasis: true },
    fields: [{ label: 'Unit', value: to, format: 'text' }],
    raw: { result: round2(result) },
  };
}

// ---------- Weight Converter ----------
const WEIGHT_TO_KG: Record<string, number> = {
  mg: 0.000001, g: 0.001, kg: 1, tonne: 1000, oz: 0.0283495, lb: 0.453592,
};
export function calculateWeightConvert(inputs: Inputs): CalculatorResult {
  const value = toNumber(inputs.value);
  const from = String(inputs.fromUnit ?? 'kg');
  const to = String(inputs.toUnit ?? 'kg');
  const kg = value * (WEIGHT_TO_KG[from] ?? 1);
  const result = kg / (WEIGHT_TO_KG[to] ?? 1);
  return {
    headline: { label: 'Converted Value', value: round2(result), format: 'number', emphasis: true },
    fields: [{ label: 'Unit', value: to, format: 'text' }],
    raw: { result: round2(result) },
  };
}

// ---------- Temperature Converter ----------
export function calculateTemperatureConvert(inputs: Inputs): CalculatorResult {
  const value = toNumber(inputs.value);
  const from = String(inputs.fromUnit ?? 'C');
  const to = String(inputs.toUnit ?? 'C');

  let celsius: number;
  if (from === 'F') celsius = ((value - 32) * 5) / 9;
  else if (from === 'K') celsius = value - 273.15;
  else celsius = value;

  let result: number;
  if (to === 'F') result = (celsius * 9) / 5 + 32;
  else if (to === 'K') result = celsius + 273.15;
  else result = celsius;

  return {
    headline: { label: 'Converted Value', value: round2(result), format: 'number', emphasis: true },
    fields: [{ label: 'Unit', value: `°${to}`, format: 'text' }],
    raw: { result: round2(result) },
  };
}

// ---------- Currency Converter (static, approximate rates) ----------
// NOTE: Rates are indicative snapshots, not live — display a "rates may vary" note in the UI.
const CURRENCY_TO_USD: Record<string, number> = {
  INR: 1 / 83, USD: 1, EUR: 1.08, GBP: 1.27, AUD: 0.66, CAD: 0.73,
};
export function calculateCurrencyConvert(inputs: Inputs): CalculatorResult {
  const amount = toNumber(inputs.amount);
  const from = String(inputs.fromCurrency ?? 'USD');
  const to = String(inputs.toCurrency ?? 'INR');
  const usd = amount * (CURRENCY_TO_USD[from] ?? 1);
  const result = usd / (CURRENCY_TO_USD[to] ?? 1);
  return {
    headline: { label: 'Converted Amount', value: round2(result), format: 'currency', emphasis: true },
    fields: [{ label: 'Note', value: 'Approximate rate, not live', format: 'text' }],
    raw: { result: round2(result) },
  };
}

// ---------- Speed Converter ----------
const SPEED_TO_MPS: Record<string, number> = {
  mps: 1, kmph: 0.277778, mph: 0.44704, knot: 0.514444,
};
export function calculateSpeedConvert(inputs: Inputs): CalculatorResult {
  const value = toNumber(inputs.value);
  const from = String(inputs.fromUnit ?? 'kmph');
  const to = String(inputs.toUnit ?? 'mph');
  const mps = value * (SPEED_TO_MPS[from] ?? 1);
  const result = mps / (SPEED_TO_MPS[to] ?? 1);
  return {
    headline: { label: 'Converted Value', value: round2(result), format: 'number', emphasis: true },
    fields: [{ label: 'Unit', value: to, format: 'text' }],
    raw: { result: round2(result) },
  };
}

// ---------- Discount ----------
export function calculateDiscount(inputs: Inputs): CalculatorResult {
  const price = Math.max(0, toNumber(inputs.price));
  const pct = Math.max(0, toNumber(inputs.discountPercent));
  const saved = price * (pct / 100);
  const final = price - saved;
  return {
    headline: { label: 'Final Price', value: round2(final), format: 'currency', emphasis: true },
    fields: [{ label: 'You Save', value: round2(saved), format: 'currency' }],
    chartData: [
      { label: 'Final Price', value: round2(final), color: '#3466e0' },
      { label: 'You Save', value: round2(saved), color: '#22c55e' },
    ],
    raw: { final: round2(final), saved: round2(saved) },
  };
}

// ---------- Fuel Cost ----------
export function calculateFuelCost(inputs: Inputs): CalculatorResult {
  const distance = Math.max(0, toNumber(inputs.distance));
  const mileage = Math.max(0.01, toNumber(inputs.mileage, 1));
  const fuelPrice = Math.max(0, toNumber(inputs.fuelPrice));
  const litersNeeded = distance / mileage;
  const cost = litersNeeded * fuelPrice;
  return {
    headline: { label: 'Trip Fuel Cost', value: round2(cost), format: 'currency', emphasis: true },
    fields: [{ label: 'Fuel Required', value: round2(litersNeeded), format: 'number' }],
    raw: { litersNeeded: round2(litersNeeded), cost: round2(cost) },
  };
}

// ---------- Tip ----------
export function calculateTip(inputs: Inputs): CalculatorResult {
  const bill = Math.max(0, toNumber(inputs.billAmount));
  const pct = Math.max(0, toNumber(inputs.tipPercent));
  const people = Math.max(1, toNumber(inputs.numPeople, 1));
  const tip = bill * (pct / 100);
  const total = bill + tip;
  const perPerson = total / people;
  return {
    headline: { label: 'Total Bill', value: round2(total), format: 'currency', emphasis: true },
    fields: [
      { label: 'Tip Amount', value: round2(tip), format: 'currency' },
      { label: 'Per Person', value: round2(perPerson), format: 'currency' },
    ],
    raw: { tip: round2(tip), total: round2(total), perPerson: round2(perPerson) },
  };
}

// ---------- Electricity Bill ----------
export function calculateElectricityBill(inputs: Inputs): CalculatorResult {
  const units = Math.max(0, toNumber(inputs.unitsConsumed));
  const rate = Math.max(0, toNumber(inputs.ratePerUnit));
  const fixed = Math.max(0, toNumber(inputs.fixedCharge));
  const total = units * rate + fixed;
  return {
    headline: { label: 'Estimated Bill', value: round2(total), format: 'currency', emphasis: true },
    fields: [{ label: 'Energy Charge', value: round2(units * rate), format: 'currency' }],
    raw: { total: round2(total) },
  };
}

// ---------- Unit Price ----------
export function calculateUnitPrice(inputs: Inputs): CalculatorResult {
  const total = Math.max(0, toNumber(inputs.totalPrice));
  const qty = Math.max(0.0001, toNumber(inputs.quantity, 1));
  const perUnit = total / qty;
  return {
    headline: { label: 'Price Per Unit', value: round2(perUnit), format: 'currency', emphasis: true },
    fields: [],
    raw: { perUnit: round2(perUnit) },
  };
}

// ---------- Profit Margin ----------
export function calculateProfitMargin(inputs: Inputs): CalculatorResult {
  const cost = Math.max(0, toNumber(inputs.costPrice));
  const selling = Math.max(0, toNumber(inputs.sellingPrice));
  const profit = selling - cost;
  const margin = selling > 0 ? (profit / selling) * 100 : 0;
  return {
    headline: { label: 'Profit Margin', value: round2(margin), format: 'percentage', emphasis: true },
    fields: [{ label: 'Profit', value: round2(profit), format: 'currency' }],
    chartData: [
      { label: 'Cost', value: round2(cost), color: '#3466e0' },
      { label: 'Profit', value: round2(Math.max(0, profit)), color: '#22c55e' },
    ],
    raw: { profit: round2(profit), margin: round2(margin) },
  };
}

// ---------- Break-even ----------
export function calculateBreakEven(inputs: Inputs): CalculatorResult {
  const fixedCosts = Math.max(0, toNumber(inputs.fixedCosts));
  const price = Math.max(0, toNumber(inputs.pricePerUnit));
  const variableCost = Math.max(0, toNumber(inputs.variableCostPerUnit));
  const contribution = price - variableCost;
  const units = contribution > 0 ? fixedCosts / contribution : 0;
  return {
    headline: { label: 'Break-even Units', value: Math.ceil(units), format: 'number', emphasis: true },
    fields: [{ label: 'Contribution Margin per Unit', value: round2(contribution), format: 'currency' }],
    raw: { units: Math.ceil(units), contribution: round2(contribution) },
  };
}

// ---------- Markup ----------
export function calculateMarkup(inputs: Inputs): CalculatorResult {
  const cost = Math.max(0, toNumber(inputs.costPrice));
  const pct = Math.max(0, toNumber(inputs.markupPercent));
  const selling = cost * (1 + pct / 100);
  return {
    headline: { label: 'Selling Price', value: round2(selling), format: 'currency', emphasis: true },
    fields: [{ label: 'Markup Amount', value: round2(selling - cost), format: 'currency' }],
    raw: { selling: round2(selling) },
  };
}

// ---------- Payroll ----------
export function calculatePayroll(inputs: Inputs): CalculatorResult {
  const hours = Math.max(0, toNumber(inputs.hoursWorked));
  const rate = Math.max(0, toNumber(inputs.hourlyRate));
  const otHours = Math.max(0, toNumber(inputs.overtimeHours));
  const otMultiplier = Math.max(1, toNumber(inputs.overtimeMultiplier, 1.5));
  const regularPay = hours * rate;
  const overtimePay = otHours * rate * otMultiplier;
  const gross = regularPay + overtimePay;
  return {
    headline: { label: 'Gross Pay', value: round2(gross), format: 'currency', emphasis: true },
    fields: [
      { label: 'Regular Pay', value: round2(regularPay), format: 'currency' },
      { label: 'Overtime Pay', value: round2(overtimePay), format: 'currency' },
    ],
    raw: { gross: round2(gross) },
  };
}

// ---------- ROI ----------
export function calculateROI(inputs: Inputs): CalculatorResult {
  const initial = Math.max(0.0001, toNumber(inputs.initialInvestment, 1));
  const final = Math.max(0, toNumber(inputs.finalValue));
  const roi = ((final - initial) / initial) * 100;
  return {
    headline: { label: 'ROI', value: round2(roi), format: 'percentage', emphasis: true },
    fields: [{ label: 'Net Gain', value: round2(final - initial), format: 'currency' }],
    raw: { roi: round2(roi) },
  };
}

// ---------- GPA ----------
export function calculateGPA(inputs: Inputs): CalculatorResult {
  const points = Math.max(0, toNumber(inputs.totalGradePoints));
  const credits = Math.max(0.0001, toNumber(inputs.totalCredits, 1));
  const gpa = points / credits;
  return {
    headline: { label: 'Your GPA', value: round2(gpa), format: 'number', emphasis: true },
    fields: [],
    raw: { gpa: round2(gpa) },
  };
}

// ---------- CGPA to Percentage (India, 10-point scale) ----------
export function calculateCgpaToPercentage(inputs: Inputs): CalculatorResult {
  const cgpa = Math.max(0, toNumber(inputs.cgpa));
  const percentage = cgpa * 9.5;
  return {
    headline: { label: 'Equivalent Percentage', value: round2(percentage), format: 'percentage', emphasis: true },
    fields: [{ label: 'Formula Used', value: 'CGPA × 9.5', format: 'text' }],
    raw: { percentage: round2(percentage) },
  };
}

// ---------- Percentile ----------
export function calculatePercentile(inputs: Inputs): CalculatorResult {
  const rank = Math.max(1, toNumber(inputs.rank, 1));
  const totalStudents = Math.max(1, toNumber(inputs.totalStudents, 1));
  const percentile = ((totalStudents - rank) / totalStudents) * 100;
  return {
    headline: { label: 'Your Percentile', value: round2(Math.max(0, percentile)), format: 'percentage', emphasis: true },
    fields: [],
    raw: { percentile: round2(Math.max(0, percentile)) },
  };
}
'@

$registryAdditions = @'
  simpleInterest: calculateSimpleInterest,
  compoundInterest: calculateCompoundInterest,
  bmr: calculateBMR,
  calorie: calculateCalorie,
  bodyFat: calculateBodyFat,
  waterIntake: calculateWaterIntake,
  dateDifference: calculateDateDifference,
  countdown: calculateCountdown,
  timeDuration: calculateTimeDuration,
  dayOfWeek: calculateDayOfWeek,
  percentage: calculatePercentage,
  ratio: calculateRatio,
  average: calculateAverage,
  lcmHcf: calculateLcmHcf,
  quadratic: calculateQuadratic,
  lengthConvert: calculateLengthConvert,
  weightConvert: calculateWeightConvert,
  temperatureConvert: calculateTemperatureConvert,
  currencyConvert: calculateCurrencyConvert,
  speedConvert: calculateSpeedConvert,
  discount: calculateDiscount,
  fuelCost: calculateFuelCost,
  tip: calculateTip,
  electricityBill: calculateElectricityBill,
  unitPrice: calculateUnitPrice,
  profitMargin: calculateProfitMargin,
  breakEven: calculateBreakEven,
  markup: calculateMarkup,
  payroll: calculatePayroll,
  roi: calculateROI,
  gpa: calculateGPA,
  cgpaToPercentage: calculateCgpaToPercentage,
  percentile: calculatePercentile,
'@

if ($formulasContent.Contains($registryMarker)) {
  # Insert new functions right before the registry, and add new entries into the registry object
  $formulasContent = $formulasContent.Replace(
    $registryMarker,
    ($newFunctions + "`n" + $registryMarker + "`n" + $registryAdditions)
  )
  [System.IO.File]::WriteAllText($formulasPath, $formulasContent)
  Write-Host "Patched lib\formulas.ts (33 new formula functions + registry entries added)" -ForegroundColor Green
} else {
  Write-Host "ERROR: formulaRegistry marker not found in lib\formulas.ts — no changes made. Check the file manually." -ForegroundColor Red
}

# ---- Type-check ----
Write-Host ""
Write-Host "Running type check..." -ForegroundColor Cyan
npx tsc --noEmit

Write-Host ""
Write-Host "If no errors printed above, restart 'npm run dev' and check the category pages." -ForegroundColor Cyan
