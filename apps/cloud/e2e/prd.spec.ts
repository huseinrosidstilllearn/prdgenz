import { test, expect } from '@playwright/test'

/**
 * Smoke happy-path (authenticated via storageState from global-setup):
 * create project → save custom provider key (local mock AI) → one-shot
 * generate → PRD page renders → export MD → share link → anonymous view.
 */

// Unique per run so the suite is idempotent against a reused E2E database.
const projectName = `E2E Kasir ${Date.now()}`

test('project appears on the dashboard after creation', async ({ page }) => {
  await page.goto('/dashboard')

  await page.getByRole('button', { name: 'New Project' }).click()
  await page.getByLabel('Name').fill(projectName)
  await page.getByRole('button', { name: 'Create', exact: true }).click()
  await expect(page.getByText(projectName).first()).toBeVisible({ timeout: 30_000 })
})

test('custom provider key pointing at the local mock AI can be saved', async ({ page }) => {
  await page.goto('/settings')

  await page.locator('#provider').selectOption('custom')
  await page.locator('#apikey').fill('sk-e2e-mock-key-123456')
  await page.locator('#baseurl').fill('http://127.0.0.1:3999/v1')
  await page.getByRole('button', { name: 'Save & Test Connection' }).click()

  await expect(page.getByText(/saved/i).first()).toBeVisible({ timeout: 30_000 })
  await expect(page.getByText(/configured keys/i)).toBeVisible()
})

test('one-shot generate → PRD page → export MD → share link → anonymous view', async ({
  page,
  browser,
}) => {
  // One-shot generate (streaming) against the mock provider, saved into the
  // project created by the earlier test (single worker → serial order).
  const projects = await (
    await page.request.get('/api/projects', { headers: { 'Content-Type': 'application/json' } })
  ).json()
  const projectId = projects.projects?.find((p: { name: string }) => p.name === projectName)?.id
  expect(projectId).toBeTruthy()

  await page.goto('/prd/new/oneshot')
  await page.locator('#provider-select').selectOption('custom')
  await page.getByLabel(/Idea \/ Problem/).fill(
    'Aplikasi kasir untuk kedai kopi dengan manajemen menu, transaksi, dan laporan harian.'
  )
  await page.getByLabel(/Save into project/).fill(projectId)
  await page.getByRole('button', { name: 'Generate PRD' }).click()

  // Done event navigates to /prd/[id] once saved.
  await expect(page).toHaveURL(/\/prd\/[a-z0-9]+/, { timeout: 90_000 })
  await expect(
    page.getByRole('heading', { name: 'Kasir Kopi Kita' }).first()
  ).toBeVisible({ timeout: 30_000 })
  await expect(page.getByText('Manajemen Menu').first()).toBeVisible()

  // Export Markdown (API-level: the UI download is a programmatic blob fetch,
  // so assert on the endpoint response the button triggers).
  const prdId = new URL(page.url()).pathname.split('/').pop() ?? ''
  const exportRes = await page.request.post('/api/export/md', {
    data: { prdId },
    headers: { 'Content-Type': 'application/json' },
  })
  expect(exportRes.ok()).toBeTruthy()
  expect(exportRes.headers()['content-type']).toContain('text/markdown')
  const md = await exportRes.text()
  expect(md).toContain('Kasir Kopi Kita')

  // Create a share link.
  await page.getByRole('button', { name: /share link/i }).click()
  const note = page.locator('p', { hasText: /\/s\// })
  await expect(note).toBeVisible({ timeout: 30_000 })
  const sharePath = await note.evaluate((el) => {
    const match = el.textContent?.match(/\/s\/[^\s]+/)
    return match ? match[0] : ''
  })
  expect(sharePath).toBeTruthy()

  // Anonymous context: the shared PRD is view-only public.
  const anon = await browser.newContext()
  const anonPage = await anon.newPage()
  await anonPage.goto(sharePath)
  await expect(anonPage.getByText('Shared', { exact: false })).toBeVisible({ timeout: 30_000 })
  await expect(
    anonPage.getByRole('heading', { name: 'Kasir Kopi Kita' }).first()
  ).toBeVisible()
  await anon.close()
})

test('version diff page renders empty-state after a single generate', async ({ page }) => {
  // Reuse the PRD created by the one-shot test (single worker → serial order).
  const prds = await (
    await page.request.get('/api/prd', { headers: { 'Content-Type': 'application/json' } })
  ).json()
  const prdId = prds.prds?.find((p: { title: string }) => p.title === 'Kasir Kopi Kita')?.id
  expect(prdId).toBeTruthy()

  // One generated version only → the diff page shows its empty-state.
  await page.goto(`/prd/${prdId}/diff`)
  await expect(page.getByText('Only one version exists')).toBeVisible({ timeout: 30_000 })
  await expect(
    page.getByText('Regenerate the PRD to create a new version', { exact: false })
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Back to PRD' }).first()).toBeVisible()
})

test('per-section regenerate saves a new version (PRD §6.1.1)', async ({ page }) => {
  // Reuse the PRD created by the one-shot test (single worker → serial order).
  const prds = await (
    await page.request.get('/api/prd', { headers: { 'Content-Type': 'application/json' } })
  ).json()
  const prdId = prds.prds?.find((p: { title: string }) => p.title === 'Kasir Kopi Kita')?.id
  expect(prdId).toBeTruthy()

  await page.goto(`/prd/${prdId}`)
  await expect(page.getByText('Current').first()).toBeVisible({ timeout: 30_000 })

  // Regenerate one section through the mock AI (streams the same fixture PRD
  // JSON; the section value gets merged and saved as v2). The wizard persists
  // the provider choice in localStorage — mirror that here (mock = custom).
  await page.addInitScript(() => localStorage.setItem('prdgenz:provider', 'custom'))
  await page.goto(`/prd/${prdId}`)
  await page.locator('#section-regen').selectOption('summary')
  await page.getByRole('button', { name: 'Regenerate', exact: true }).click()

  // The section regenerates and saves v2: the version history flips to show
  // v2 as Current with v1 offering Restore/Diff.
  await expect(page.getByText('Current').first()).toBeVisible({ timeout: 90_000 })
  const restoreButtons = page.getByRole('button', { name: 'Restore' })
  await expect(restoreButtons.first()).toBeVisible({ timeout: 30_000 })

  // The version list contains both v1 (restorable) and v2 (current).
  const versions = await page.request.get(`/api/prd/${prdId}/versions`, {
    headers: { 'Content-Type': 'application/json' },
  })
  const versionData = await versions.json()
  expect(versionData.versions?.map((v: { versionNumber: number }) => v.versionNumber)).toContain(2)
})
