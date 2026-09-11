import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['src/**/*.test.ts', 'src/generated/**'],
      reporter: ['text', 'html'],
      // Calibrated 2026-09-11 from baseline (90/90/90/90) minus 5pp.
      thresholds: { statements: 85, branches: 85, functions: 85, lines: 85 },
    },
  },
})
