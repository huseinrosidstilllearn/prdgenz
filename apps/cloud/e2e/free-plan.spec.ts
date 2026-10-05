import { randomUUID } from 'node:crypto'
import { test, expect } from '@playwright/test'
import { FREE_PLAN_LIMIT } from '@prdgenz/shared'

test('Free supports sharing and restore, with project/PRD limits and Pro-only PDF', async ({
  page,
  browser,
}) => {
  const email = `e2e-free+${randomUUID()}@test.local`
  const password = 'E2eFree123!pass'
  const registration = await page.request.post('/api/auth/register', {
    data: { email, password, name: 'Free plan tester' },
  })
  expect(registration.status()).toBe(201)

  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Log in', exact: true }).click()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 60_000 })

  const project = await page.request.post('/api/projects', { data: { name: 'Free plan QA' } })
  expect(project.status()).toBe(201)
  const projectId = (await project.json()).project.id as string
  const secondProject = await page.request.post('/api/projects', {
    data: { name: 'Second project must be rejected' },
  })
  expect(secondProject.status()).toBe(403)

  const provider = await page.request.put('/api/settings/apikey', {
    data: {
      provider: 'custom',
      key: 'sk-e2e-free-mock-key-123456',
      customBaseUrl: `http://127.0.0.1:${process.env.MOCK_AI_PORT ?? 3999}/v1`,
    },
  })
  expect(provider.ok()).toBeTruthy()
  expect((await provider.json()).connectionOk).toBe(true)

  const generated = await page.request.post('/api/ai/generate', {
    data: {
      language: 'ID',
      mode: 'ONESHOT',
      provider: 'custom',
      projectId,
      input: { idea: 'Aplikasi kasir kedai kopi dengan menu dan laporan harian.' },
    },
  })
  expect(generated.ok()).toBeTruthy()
  const events = (await generated.text())
    .split('\n')
    .filter((line) => line.startsWith('data: '))
    .map((line) => JSON.parse(line.slice(6)))
  expect(events.some((event) => event.type === 'error')).toBe(false)
  const completed = events.find((event) => event.type === 'done')
  expect(completed?.saved?.versionNumber).toBe(1)
  const prdId = completed.saved.prdId as string

  const restored = await page.request.post(`/api/prd/${prdId}/versions/1/restore`)
  expect(restored.ok()).toBeTruthy()
  expect((await restored.json()).version.versionNumber).toBe(2)
  const history = await page.request.get(`/api/prd/${prdId}/versions`)
  expect(history.ok()).toBeTruthy()
  const versions = await history.json()
  expect(versions.currentVersion).toBe(2)
  expect(versions.versions.map((version: { versionNumber: number }) => version.versionNumber))
    .toEqual([2, 1])

  const markdown = await page.request.post('/api/export/md', { data: { prdId } })
  expect(markdown.ok()).toBeTruthy()
  expect(await markdown.text()).toContain('Kasir Kopi Kita')
  const pdf = await page.request.post('/api/export/pdf', { data: { prdId } })
  expect(pdf.status()).toBe(403)

  const share = await page.request.post(`/api/prd/${prdId}/share`, { data: {} })
  expect(share.ok()).toBeTruthy()
  const shareId = (await share.json()).shareId as string
  const anonymous = await browser.newContext()
  try {
    const publicPage = await anonymous.newPage()
    await publicPage.goto(`/s/${shareId}`)
    await expect(publicPage.getByRole('heading', { name: 'Kasir Kopi Kita' }).first())
      .toBeVisible()
  } finally {
    await anonymous.close()
  }

  for (let count = 1; count < FREE_PLAN_LIMIT; count++) {
    const created = await page.request.post('/api/prd', {
      data: { projectId, title: `Free quota document ${count}` },
    })
    expect(created.status()).toBe(201)
  }
  const overLimit = await page.request.post('/api/prd', {
    data: { projectId, title: 'Over quota document' },
  })
  expect(overLimit.status()).toBe(403)
  expect((await overLimit.json()).error).toContain('Free plan limit reached')
})
