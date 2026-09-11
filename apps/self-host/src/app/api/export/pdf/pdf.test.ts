import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    pRD: { findUnique: vi.fn() },
    pRDVersion: { findFirst: vi.fn() },
  },
}))

vi.mock('@/lib/prd-service', () => ({
  ServiceError: class ServiceError extends Error {
    status: number
    constructor(message: string, status = 400) {
      super(message)
      this.status = status
    }
  },
  getPRD: vi.fn(),
  getCurrentVersion: vi.fn(),
}))

import { getPRD, getCurrentVersion } from '@/lib/prd-service'
import { POST as exportPdf } from './route'

function makeReq(body: unknown): Request {
  return new Request('http://localhost:3001/api/export/pdf', {
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
  contentMd: '# Aplikasi Kasir\n\nTes isi.',
}

describe('POST /api/export/pdf (self-host, no Pro gate)', () => {
  beforeEach(() => {
    vi.mocked(getPRD).mockReset()
    vi.mocked(getCurrentVersion).mockReset()
  })

  it('returns 400 when prdId is missing', async () => {
    const res = await exportPdf(makeReq({}))
    expect(res.status).toBe(400)
  })

  it('escapes markup in the PRD title everywhere in the print doc', async () => {
    vi.mocked(getPRD).mockResolvedValue({
      ...ownedPrd,
      title: '<script>alert(1)</script>',
    } as never)
    vi.mocked(getCurrentVersion).mockResolvedValue(generatedVersion as never)

    const res = await exportPdf(makeReq({ prdId: 'prd1' }))
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/html')
    const html = await res.text()
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<title><script>')
    expect(html).not.toContain('meta">PRD GenZ (self-hosted) — <script>')
  })

  it('returns 409 when the PRD has no generated content', async () => {
    vi.mocked(getPRD).mockResolvedValue(ownedPrd as never)
    vi.mocked(getCurrentVersion).mockResolvedValue(null)

    const res = await exportPdf(makeReq({ prdId: 'prd1' }))
    expect(res.status).toBe(409)
  })
})