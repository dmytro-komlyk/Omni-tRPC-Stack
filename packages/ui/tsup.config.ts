import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/ThemeProvider.tsx', 'src/theme-cookie.ts', 'src/theme-server.ts'],
  dts: true,
  clean: true,
  format: ['esm', 'cjs'],
});
