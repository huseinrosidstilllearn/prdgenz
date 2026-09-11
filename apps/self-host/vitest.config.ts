import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/generated/**',
        'src/app/**/page.tsx',
        'src/app/**/layout.tsx',
      ],
      reporter: ['text', 'html'],
      // Calibrated 2026-09-11 from baseline (13.26/62.71/42.85) minus 5pp.
      thresholds: { statements: 8, branches: 57, functions: 37, lines: 8 },
    },
  },
})
