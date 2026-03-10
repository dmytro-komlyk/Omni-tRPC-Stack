import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/theme-server.ts', 'src/theme-cookie.ts', 'src/ThemeProvider.tsx'],
  format: ['esm', 'cjs'],
  dts: false,
  clean: process.env.NODE_ENV === 'production',
  sourcemap: true,
  splitting: false,
  minify: process.env.NODE_ENV === 'production',
  target: 'es2020',
});
