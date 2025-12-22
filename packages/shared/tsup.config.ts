import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  clean: true,
  format: ['esm', 'cjs'],
  sourcemap: true,
  splitting: false,
  tsconfig: './tsconfig.json',
  outExtension: () => ({ js: '.js', dts: '.d.ts' }),
});
