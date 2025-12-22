import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  dts: true,
  clean: true,
  format: ['esm', 'cjs'],
});
