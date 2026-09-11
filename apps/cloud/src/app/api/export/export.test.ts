import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/api-auth', () => ({
  requireUserId: vi.fn(),
}))

vi.mock('@/lib/prd-service', () => ({
  ServiceError: class ServiceError extends Error {
    status: number
    constructor(message: string, status = 400) {
      super(message)
      this.status = status
    }
  },
  assertPRDOwnership: vi.fn(),
  getCurrentVersion: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
  },
}))

import { requireUserId } from '@/lib/api-auth'
import { assertPRDOwnership, getCurrentVersion, ServiceError } from '@/lib/prd-service'
import { prisma } from '@/lib/prisma'
import { POST as exportMd } from './md/route'
import { POST as exportPdf } from './pdf/route'

function makeReq(body: unknown): Request {
  return new Request('http://localhost/api/export', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const ownedPrd = {
  id: 'prd1',
  title: 'Aplikasi Kasir Warung Kopi!',
  language: 'ID',
}

const generatedVersion = {
  id: 'v1',
  versionNumber: 2,
  contentMd: '# Aplikasi Kasir\n\n## Ringkasan\n\nTes isi.',
}

describe('POST /api/export/md (all plans, PRD §10.4)', () => {
  beforeEach(() => {
    vi.mocked(requireUserId).mockReset()
    vi.mocked(assertPRDOwnership).mockReset()
    vi.mocked(getCurrentVersion).mockReset()
  })

  it('returns the current version markdown as a download with a slugified filename', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(assertPRDOwnership).mockResolvedValue(ownedPrd as never)
    vi.mocked(getCurrentVersion).mockResolvedValue(generatedVersion as never)

    const res = await exportMd(makeReq({ prdId: 'prd1' }))
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/markdown')
    expect(res.headers.get('Content-Disposition')).toBe(
      'attachment; filename="aplikasi-kasir-warung-kopi.md"'
    )
    expect(await res.text()).toContain('# Aplikasi Kasir')
  })

  it('returns 409 when the PRD has never been generated', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(assertPRDOwnership).mockResolvedValue(ownedPrd as never)
    vi.mocked(getCurrentVersion).mockResolvedValue(null)

    const res = await exportMd(makeReq({ prdId: 'prd1' }))
    expect(res.status).toBe(409)
    expect((await res.json()).error).toContain('no generated content')
  })

  it('returns 404 when the PRD belongs to someone else', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(assertPRDOwnership).mockRejectedValue(new ServiceError('PRD not found', 404))

    const res = await exportMd(makeReq({ prdId: 'foreign' }))
    expect(res.status).toBe(404)
  })

  it('returns 400 when prdId is missing', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    const res = await exportMd(makeReq({}))
    expect(res.status).toBe(400)
  })

  it('returns 401 without a session', async () => {
    vi.mocked(requireUserId).mockResolvedValue(null)
    expect((await exportMd(makeReq({ prdId: 'prd1' }))).status).toBe(401)
  })
})

describe('POST /api/export/pdf (PRO-only, PRD §10.4 + §14)', () => {
  beforeEach(() => {
    vi.mocked(requireUserId).mockReset()
    vi.mocked(assertPRDOwnership).mockReset()
    vi.mocked(getCurrentVersion).mockReset()
    vi.mocked(prisma.user.findUnique).mockReset()
  })

  it('blocks FREE users with 403 and an upgrade message', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'FREE' } as never)

    const res = await exportPdf(makeReq({ prdId: 'prd1' }))
    expect(res.status).toBe(403)
    expect((await res.json()).error).toContain('Pro feature')
    expect(assertPRDOwnership).not.toHaveBeenCalled()
  })

  it('blocks unknown users with 403 (role undefined is not PRO)', async () => {
    vi.mocked(requireUserId).mockResolvedValue('ghost')
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const res = await exportPdf(makeReq({ prdId: 'prd1' }))
    expect(res.status).toBe(403)
  })

  it('returns print-optimized HTML for PRO users', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'PRO' } as never)
    vi.mocked(assertPRDOwnership).mockResolvedValue(ownedPrd as never)
    vi.mocked(getCurrentVersion).mockResolvedValue(generatedVersion as never)

    const res = await exportPdf(makeReq({ prdId: 'prd1' }))
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/html')
    const html = await res.text()
    expect(html).toContain('window.print()')
    expect(html).toContain('<h1>Aplikasi Kasir</h1>')
    expect(html).toContain('v2')
  })

  it('escapes HTML in the PRD title (no injection into the print doc)', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'PRO' } as never)
    vi.mocked(assertPRDOwnership).mockResolvedValue({
      ...ownedPrd,
      title: 'Evil <script>alert(1)</script>',
    } as never)
    vi.mocked(getCurrentVersion).mockResolvedValue(generatedVersion as never)

    const res = await exportPdf(makeReq({ prdId: 'prd1' }))
    const html = await res.text()
    expect(html).not.toContain('<script>alert(1)')
    expect(html).toContain('&lt;script&gt;')
  })

  it('fully escapes a PRD title made of markup (<script>alert(1)</script>)', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'PRO' } as never)
    vi.mocked(assertPRDOwnership).mockResolvedValue({
      ...ownedPrd,
      title: '<script>alert(1)</script>',
    } as never)
    vi.mocked(getCurrentVersion).mockResolvedValue(generatedVersion as never)

    const res = await exportPdf(makeReq({ prdId: 'prd1' }))
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<title><script>')
    expect(html).not.toContain('meta">PRD GenZ — <script>')
  })

  it('returns 409 when the PRD has no generated content', async () => {
    vi.mocked(requireUserId).mockResolvedValue('u1')
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'PRO' } as never)
    vi.mocked(assertPRDOwnership).mockResolvedValue(ownedPrd as never)
    vi.mocked(getCurrentVersion).mockResolvedValue(null)

    const res = await exportPdf(makeReq({ prdId: 'prd1' }))
    expect(res.status).toBe(409)
  })

  it('returns 401 without a session', async () => {
    vi.mocked(requireUserId).mockResolvedValue(null)
    expect((await exportPdf(makeReq({ prdId: 'prd1' }))).status).toBe(401)
  })
})
