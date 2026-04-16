import i18nextPlugin from 'eslint-plugin-i18next';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/**/*.test.{ts,tsx}', 'src/**/*.d.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { i18next: i18nextPlugin },
    rules: {
      'i18next/no-literal-string': [
        'warn',
        {
          mode: 'jsx-text-only',
          'jsx-attributes': {
            exclude: [
              'testID',
              'className',
              'style',
              'key',
              'type',
              'name',
              'id',
              'href',
              'to',
              'role',
              'accessibilityRole',
            ],
          },
          'words': {
            exclude: [
              '\\d+',
              '[A-Z_]+',
              '\\s*',
              '^[→←↑↓•·|/\\-–—]$',
            ],
          },
          'callees': {
            exclude: [
              'console.log',
              'console.warn',
              'console.error',
              'Error',
              'new Error',
              'require',
              'import',
            ],
          },
        },
      ],
    },
  },
];
