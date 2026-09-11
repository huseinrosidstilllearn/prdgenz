import path from 'node:path'
import { defineConfig } from '@playwright/test'

const PORT = Number(process.env.E2E_PORT ?? 3100)
const MOCK_PORT = Number(process.env.MOCK_AI_PORT ?? 3999)

const E2E_DATABASE_URL =
  process.env.E2E_DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/prdgenz_e2e?schema=public'

// Fixed non-placeholder values for the E2E environment only — never used in
// production. ENCRYPTION_KEY must be 64 hex chars; NEXTAUTH_SECRET >= 32 chars.
const appEnv = {
  DATABASE_URL: E2E_DATABASE_URL,
  NEXTAUTH_URL: `http://localhost:${PORT}`,
  NEXTAUTH_SECRET: 'e2e-secret-0123456789abcdef0123456789abcdef',
  ENCRYPTION_KEY: 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90',
  NODE_ENV: 'development' as const,
}

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  timeout: 90_000,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  use: {
    baseURL: `http://localhost:${PORT}`,
  },
  projects: [
    {
      name: 'anonymous',
      testMatch: /auth\.spec\.ts/,
    },
    {
      name: 'authenticated',
      testMatch: /prd\.spec\.ts/,
      use: {
        storageState: path.join(__dirname, 'e2e', '.playwright-state.json'),
      },
    },
  ],
  webServer: [
    {
      command: 'node e2e/mock-ai-server.mjs',
      port: MOCK_PORT,
      reuseExistingServer: true,
      env: { MOCK_AI_PORT: String(MOCK_PORT) },
    },
    {
      command: 'pnpm exec next dev -p ' + PORT,
      port: PORT,
      timeout: 120_000,
      reuseExistingServer: true,
      env: appEnv,
    },
  ],
})
