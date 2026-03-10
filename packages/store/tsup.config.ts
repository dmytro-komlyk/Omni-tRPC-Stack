import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/secure.store.ts',
    'src/auth-native.store.ts',
    'src/ui.store.ts',
    'src/config-web.store.ts',
    'src/config-native.store.ts',
  ],
  format: ['cjs', 'esm'],
  dts: false,
  clean: process.env.NODE_ENV === 'production',
  sourcemap: true,
  splitting: false,
  minify: process.env.NODE_ENV === 'production',
  target: 'es2020',
});
