import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/client.ts',
    'src/Provider.tsx',
    'src/ProviderNative.tsx',
    'src/serverClient.ts',
  ],
  dts: false,
  clean: process.env.NODE_ENV === 'production',
  format: ['esm'],
  sourcemap: true,
  splitting: false,
  minify: process.env.NODE_ENV === 'production',
  target: 'es2022',
});
