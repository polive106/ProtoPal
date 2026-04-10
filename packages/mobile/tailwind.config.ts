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
    extend: {
      colors: {
        brand: { DEFAULT: '#4f46e5', dark: '#3730a3', light: '#818cf8' },
        surface: { DEFAULT: '#f8f7f4', card: '#fffffe' },
        ink: { DEFAULT: '#1c1917', muted: '#78716c', light: '#a8a29e' },
        danger: { DEFAULT: '#9f1239', light: '#fff1f2' },
        warmBorder: '#e7e5e4',
      },
      fontFamily: {
        heading: ['SourceSerif4_600SemiBold'],
        'heading-regular': ['SourceSerif4_400Regular'],
        body: ['Karla_400Regular'],
        'body-medium': ['Karla_500Medium'],
        'body-bold': ['Karla_700Bold'],
      },
    },
  },
  plugins: [],
} satisfies Config;
