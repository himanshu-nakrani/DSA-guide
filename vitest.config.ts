<import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['src/lib/problem-progress.ts'],
    },
    server: {
      deps: {
        inline: ['server-only'],
      },
    },
    env: {
      REACT_SERVER: 'true',
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'server-only': path.resolve(__dirname, './src/__mocks__/server-only.ts'),
    },
  },
});
