import { test, expect } from '@playwright/test'

/**
 * Smoke: register → auto sign-in → dashboard; then logout → login again.
 * Emails are unique per run so the suite is idempotent against a reused DB.
 * Cold dev-server start can be slow on first navigation — generous timeouts.
 */

const password = 'E2eTest123!pass'

test('register creates the account, signs in, and lands on the dashboard', async ({ page }) => {
  const email = `e2e+${Date.now()}@test.local`

  await page.goto('/register', { timeout: 60_000 })
  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible({ timeout: 60_000 })

  await page.getByLabel('Name').fill('E2E Tester')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 60_000 })
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 30_000 })
})

test('a freshly registered user can log out and log back in', async ({ page }) => {
  const secondEmail = `e2e-relogin+${Date.now()}@test.local`

  await page.goto('/register', { timeout: 60_000 })
  await page.getByLabel('Name').fill('Relog Tester')
  await page.getByLabel('Email').fill(secondEmail)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 60_000 })

  // Log out via the NextAuth signout endpoint, then log in again through /login.
  const csrf = (await (await page.request.get('/api/auth/csrf')).json()).csrfToken
  await page.request.post('/api/auth/signout', {
    data: `csrfToken=${encodeURIComponent(csrf)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  await page.goto('/login')
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible({ timeout: 60_000 })
  await page.getByLabel('Email').fill(secondEmail)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Log in' }).click()

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 60_000 })
})
