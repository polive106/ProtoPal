import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    exclude: ['dist/**', 'node_modules/**'],
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
      jsc: {
        target: 'es2022',
        transform: {
          decoratorMetadata: true,
        },
      },
    }),
  ],
});
