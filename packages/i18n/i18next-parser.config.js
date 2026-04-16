/** @type {import('i18next-parser').UserConfig} */
export default {
  locales: ['en', 'fr'],
  defaultNamespace: 'common',
  namespaceSeparator: ':',
  keySeparator: '.',

  input: [
    '../frontend/src/**/*.{ts,tsx}',
    '../mobile/src/**/*.{ts,tsx}',
  ],
  // Exclude test files
  ignore: ['**/*.test.*', '**/*.spec.*', '**/*.d.ts'],

  output: 'locales/$LOCALE/$NAMESPACE.json',

  // Keep existing translations, don't overwrite
  keepRemoved: true,

  // Sort keys for consistent diffs
  sort: true,

  // Use the same indentation as existing files
  indentation: 2,

  // Don't add default values for new keys — flag them as empty
  defaultValue: '',

  // Fail when running in CI (--fail-on-update flag)
  failOnUpdate: false,
};
