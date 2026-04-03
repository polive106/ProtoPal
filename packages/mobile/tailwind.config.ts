import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '../design-system-mobile/src/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
