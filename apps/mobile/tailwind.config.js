const path = require('path');
const sharedConfig = require('@package/tailwindcss-config');

/** @type {import('tailwindcss').Config} */

module.exports = {
  ...sharedConfig,
  content: [
    path.resolve(__dirname, './app/**/*.{js,ts,jsx,tsx}'),
    path.resolve(__dirname, './components/**/*.{js,ts,jsx,tsx}'),
    path.resolve(__dirname, './context/**/*.{js,ts,jsx,tsx}'),
  ],
  presets: [require('nativewind/preset')],
  plugins: [],
};
