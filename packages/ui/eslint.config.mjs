import { defineConfig } from 'eslint/config';
import { library } from '@package/eslint-config';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default defineConfig([
  ...library,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-no-useless-fragment': 'error',
      'react/jsx-key': 'error',
      '@typescript-eslint/no-empty-function': 'off',
      'import-x/no-default-export': 'error',
    },
  },
  {
    files: ['*.config.{ts,js,mjs}'],
    rules: {
      'import-x/no-default-export': 'off',
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '*.stories.@(ts|tsx|js|jsx)',
      '__stories__/**',
      'stories/**',
    ],
  },
]);
