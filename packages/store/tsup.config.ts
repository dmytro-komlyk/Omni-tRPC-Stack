import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    web: 'src/web/index.ts',
    expo: 'src/expo/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: true,
  target: 'es2020',
});
