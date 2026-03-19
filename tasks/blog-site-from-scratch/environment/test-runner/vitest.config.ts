import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: [
      '../../tests/**/*.test.ts',
    ],
    exclude: [
      'node_modules/',
      'dist/',
      'tests/e2e/**',  // Exclude Playwright tests
      'tests/auth/**', // Exclude old auth tests with missing dependencies
      'tests/database/**', // Exclude old database tests
      'tests/content/**',
      'tests/performance/**',
      'tests/deployment/**',
    ],
    testTimeout: 10000,
    hookTimeout: 10000,
    // Force sequential test execution to prevent database locking
    pool: 'forks',
    singleThread: true,
    isolate: true,
  },
});
