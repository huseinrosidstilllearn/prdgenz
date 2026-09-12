/**
 * Playwright globalSetup:
 * 1. Push the Prisma schema to the E2E database (SAFETY: refuses unless the
 *    database name contains "e2e" so a misconfigured DATABASE_URL can never
 *    touch a real/dev database).
 * 2. Register + sign in one dedicated E2E user through the real login page and
 *    persist the storage state to .playwright-state.json for authenticated specs.
 */
import { spawnSync } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const here = path.join(process.cwd(), 'e2e')
const stateFile = path.join(here, '.playwright-state.json')

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3100'
const E2E_EMAIL = process.env.E2E_EMAIL ?? 'e2e-prd-user@test.local'
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'E2eTest123!pass'

export default async function globalSetup(): Promise<void> {
  // ---- 1. database ---------------------------------------------------------
  const dbUrl =
    process.env.E2E_DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/prdgenz_e2e?schema=public'

  let dbName = ''
  try {
    dbName = new URL(dbUrl).pathname.split('/').pop() ?? ''
  } catch {
    dbName = ''
  }
  if (!dbName.toLowerCase().includes('e2e')) {
    throw new Error(
      `Refusing to run E2E against database "${dbName}" — the E2E database name must contain "e2e" (got E2E_DATABASE_URL=${dbUrl})`
    )
  }

  const push = spawnSync('pnpm', ['exec', 'prisma', 'db', 'push', '--skip-generate'], {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: dbUrl },
    encoding: 'utf8',
    shell: process.platform === 'win32',
  })
  if (push.status !== 0) {
    throw new Error(
      `prisma db push failed (is PostgreSQL running at the E2E_DATABASE_URL host?).\n${push.stdout}\n${push.stderr}`
    )
  }

  // ---- 2. authenticated storage state (via real browser + login UI) ---------
  const { chromium } = await import('@playwright/test')
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  // Register (409 on re-runs is fine — account already exists).
  const register = await page.request.post(`${BASE_URL}/api/auth/register`, {
    data: { email: E2E_EMAIL, name: 'PRD Tester', password: E2E_PASSWORD },
  })
  if (!register.ok() && register.status() !== 409) {
    await browser.close()
    throw new Error(`E2E user registration failed: ${register.status()} ${await register.text()}`)
  }

  // Promote the E2E user to PRO so the 1-project Free-plan limit does not
  // interfere across repeated runs against a reused database.
  const promote = spawnSync(
    'pnpm',
    ['exec', 'prisma', 'db', 'execute', '--stdin'],
    {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: dbUrl },
      input: `UPDATE users SET role = 'PRO' WHERE email = '${E2E_EMAIL}';`,
      encoding: 'utf8',
      shell: process.platform === 'win32',
    }
  )
  if (promote.status !== 0) {
    await browser.close()
    throw new Error(`Failed to promote E2E user to PRO.\n${promote.stdout}\n${promote.stderr}`)
  }

  // Sign in through the real /login page so NextAuth sets its cookies in a
  // real browser context — then capture the storage state.
  // Cold-start on Windows (first compile of the dev server) can exceed the
  // default 30s navigation timeout, so allow up to 120s for this first goto.
  page.setDefaultNavigationTimeout(120_000)
  await page.goto(`${BASE_URL}/login`)
  await page.getByLabel('Email').fill(E2E_EMAIL)
  await page.getByLabel('Password').fill(E2E_PASSWORD)
  await page.getByRole('button', { name: 'Log in' }).click()
  await page.waitForURL(/\/dashboard/, { timeout: 60_000 })

  const state = await context.storageState()
  await browser.close()

  const hasSession = state.cookies.some((c) => c.name.startsWith('next-auth.session-token'))
  if (!hasSession) {
    throw new Error('E2E sign-in did not produce a session cookie — check NEXTAUTH_SECRET env')
  }

  await mkdir(path.dirname(stateFile), { recursive: true })
  await writeFile(stateFile, JSON.stringify(state))
}
