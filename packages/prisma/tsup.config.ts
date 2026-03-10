import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false,
  clean: process.env.NODE_ENV === 'production',
  sourcemap: true,
  splitting: false,
  minify: process.env.NODE_ENV === 'production',
  target: 'es2020',
});
