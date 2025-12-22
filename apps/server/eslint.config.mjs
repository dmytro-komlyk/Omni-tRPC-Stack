import { defineConfig } from 'eslint/config';
import { library, nest } from '@package/eslint-config';
import tsParser from '@typescript-eslint/parser';

export default defineConfig([
  ...library,
  ...nest,
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['**/*.d.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'import-x/no-default-export': 'off',
    },
  },
  {
    files: ['*.config.{js,ts,mjs}', 'src/main.ts'],
    rules: {
      'import-x/no-default-export': 'off',
    },
  },
  {
    ignores: ['node_modules/**', 'dist/**', '**/*.d.ts'],
  },
]);
