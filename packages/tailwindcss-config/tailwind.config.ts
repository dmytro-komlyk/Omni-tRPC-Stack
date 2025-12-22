import type { Config } from 'tailwindcss';

/** @type {import('tailwindcss').Config} */

const config: Config = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {},
      boxShadow: {},
      backgroundImage: {},
      screens: {
        sm: '576px',
        'sm-max': { max: '576px' },
        md: '768px',
        'md-max': { max: '768px' },
        lg: '992px',
        'lg-max': { max: '992px' },
        xl: '1200px',
        'xl-max': { max: '1200px' },
        '2xl': '1320px',
        '2xl-max': { max: '1320px' },
        '3xl': '1600px',
        '3xl-max': { max: '1600px' },
        '4xl': '1850px',
        '4xl-max': { max: '1850px' },
      },
      colors: {
        lightPrimary: '#ffff',
      },
    },
  },
} satisfies Config;

export default config;
