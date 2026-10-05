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
  await expect(page.getByRole('heading', { name: 'Your documents' })).toBeVisible({
    timeout: 30_000,
  })
  await expect(page.getByText('Example PRD', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Add API key', exact: true })).toHaveAttribute('href', '/settings')
  await page.getByRole('link', { name: 'Create a project', exact: true }).click()
  await page.getByRole('button', { name: 'New Project', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'New Project' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByLabel('Name', { exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(page.getByRole('button', { name: 'New Project', exact: true })).toBeFocused()
  await page.getByRole('button', { name: 'New Project', exact: true }).click()
  await dialog.getByRole('button', { name: 'Create', exact: true }).click()
  await expect(dialog.getByRole('alert')).toHaveText('Project name is required.')
  await dialog.getByLabel('Name', { exact: true }).fill('First product')
  await dialog.getByRole('button', { name: 'Create', exact: true }).click()
  await expect(dialog).not.toBeVisible()
  await expect(page.getByRole('link', { name: 'View projects', exact: true })).toBeVisible()

  await page.setViewportSize({ width: 390, height: 844 })
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.getByRole('button', { name: 'Toggle theme' }).click()
  await page.getByRole('link', { name: 'Create your first PRD', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'How do you want to start?' })).toBeVisible()
  for (const [label, route] of [
    ['Create from Scratch', 'wizard'], ['Chat', 'chat'], ['One-Shot', 'oneshot'],
  ]) {
    await page.getByRole('link', { name: new RegExp(`Choose ${label}`) }).click()
    await expect(page).toHaveURL(new RegExp(`/prd/new/${route}$`))
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await page.getByRole('link', { name: 'New PRD', exact: true }).click()
  }
  await page.getByRole('link', { name: 'Manage your AI provider', exact: true }).click()
  await expect(page).toHaveURL(/\/settings$/)
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
