import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
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
        'src/middleware.ts',
        'src/app/api/auth/[...nextauth]/**',
      ],
      reporter: ['text', 'html'],
      // Calibrated 2026-09-11 from baseline (39.75/80.69/66.12) minus 5pp.
      // Low stmts/lines: pages/routes rely on E2E (Playwright) — raise as E2E lands.
      thresholds: { statements: 34, branches: 75, functions: 61, lines: 34 },
    },
  },
})
