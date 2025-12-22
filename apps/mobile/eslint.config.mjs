import { reactNative } from '@package/eslint-config';

export default [
  ...reactNative,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    ignores: ['android/', 'ios/', '**/*.d.ts'],
  },
];
