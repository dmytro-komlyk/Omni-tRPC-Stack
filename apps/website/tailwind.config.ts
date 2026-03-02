import { heroui } from '@heroui/react';
import sharedConfig from '@package/tailwindcss-config';
import scrollbar from 'tailwind-scrollbar';
import type { Config } from 'tailwindcss';

const config: Config = {
  presets: [sharedConfig as Config],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
    '../../node_modules/@heroui/react/dist/**/*.{js,ts,jsx,tsx}',
  ],
  plugins: [heroui(), scrollbar({ nocompatible: true })],
} satisfies Config;

export default config;
