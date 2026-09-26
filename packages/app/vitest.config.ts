import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['src/**/*.test.{ts,tsx}'],
      reporter: ['text', 'html'],
      thresholds: { statements: 25, branches: 70, functions: 40, lines: 25 },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // next/link renders an anchor in tests; stub the module surface we use.
      'next/link': path.resolve(__dirname, './test/next-link.tsx'),
    },
  },
})
