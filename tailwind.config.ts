import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.mdx',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dbe6fe',
          400: '#5b8def',
          500: '#3466e0',
          600: '#2851c4',
          700: '#20409b',
        },
        surface: {
          DEFAULT: '#faf9f6',
          card: '#ffffff',
          border: '#e7e3da',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'ui-sans-serif', 'system-ui'],
        body: ['var(--font-body)', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(20,20,30,0.04), 0 4px 16px rgba(20,20,30,0.05)',
      },
    },
  },
  plugins: [],
};
export default config;
