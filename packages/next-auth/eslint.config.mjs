import { defineConfig } from 'eslint/config';
import { library } from '@package/eslint-config';
import tsParser from '@typescript-eslint/parser';

export default defineConfig([
  ...library,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    ignores: ['node_modules/**', 'dist/**'],
  },
]);
