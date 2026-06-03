import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts', 'stores/**/*.test.ts'],
    typecheck: {
      tsconfig: './tsconfig.vitest.json',
    },
  },
  resolve: {
    alias: {
      '@symb-abm/shared': path.resolve(rootDir, '../../packages/shared/src/index.ts'),
      '~': rootDir,
      '@': rootDir,
    },
  },
});
