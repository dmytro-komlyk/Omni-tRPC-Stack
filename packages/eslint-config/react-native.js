import expoConfig from 'eslint-config-expo/flat.js';
import prettierPlugin from 'eslint-plugin-prettier';

export const reactNative = [
  ...expoConfig,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'warn',
    },
  },
  {
    languageOptions: {
      globals: {
        __DEV__: 'readonly',
        fetch: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        Headers: 'readonly',
      },
    },
    rules: {
      'react/jsx-no-target-blank': 'off',
      'react/react-in-jsx-scope': 'off',
    },
    ignores: ['dist/', '.expo/', 'node_modules/'],
  },
];
