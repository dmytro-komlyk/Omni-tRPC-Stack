import { next } from '@package/eslint-config';

export default [
  ...next,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      globals: {
        process: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        URL: 'readonly',
        console: 'readonly',
        React: 'off',
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      '@next/next/no-img-element': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'simple-import-sort/imports': 'off',
      'simple-import-sort/exports': 'off',
    },
  },
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'dist/**', 'public/**'],
  },
];
