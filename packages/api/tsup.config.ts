import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    client: 'src/client.ts',
    provider: 'src/Provider.tsx',
    providerNative: 'src/ProviderNative.tsx',
    server: 'src/serverClient.ts',
  },
  dts: true,
  clean: true,
  format: ['esm'],
  sourcemap: true,
  splitting: false,
});
