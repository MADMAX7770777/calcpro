// Loads long-form MDX content for a calculator by slug.
// Kept separate from calculators.ts since content and configuration are
// different concerns (one describes behavior, the other describes prose).

import fs from 'node:fs';
import path from 'node:path';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export function getCalculatorContentSource(slug: string): string | null {
  const file = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, 'utf-8');
}

export function calculatorContentExists(slug: string): boolean {
  return fs.existsSync(path.join(CONTENT_DIR, `${slug}.mdx`));
}
