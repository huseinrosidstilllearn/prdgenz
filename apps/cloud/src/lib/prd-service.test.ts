import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./prisma', () => ({
  prisma: {
    project: { findFirst: vi.fn(), count: vi.fn() },
    pRD: {
      findFirst: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    pRDVersion: { findFirst: vi.fn(), create: vi.fn() },
    user: { findUnique: vi.fn() },
    $transaction: vi.fn(),
  },
}))

import { prisma } from './prisma'
import {
  assertProjectOwnership,
  assertPRDOwnership,
  assertCreateAllowed,
  assertProjectCreateAllowed,
  validatePRDContent,
  markdownFor,
  restoreVersion,
} from './prd-service'
import { ServiceError } from './prd-service'
import { FREE_PLAN_LIMIT, Language } from '@prdgenz/shared'
import type { PRDContent } from '@prdgenz/shared'

const validContent: PRDContent = {
  title: 'Aplikasi Kasir',
  summary: 's',
  problem: 'p',
  targetUser: 't',
  features: [{ id: 'f1', name: 'Login', description: 'd', priority: 'must' }],
  userStories: [],
  acceptanceCriteria: [],
  techStack: { frontend: [], backend: [], database: [], infrastructure: [], reasoning: 'r' },
  timeline: [],
  outputFormat: 'Markdown',
}

describe('assertProjectOwnership', () => {
  beforeEach(() => vi.mocked(prisma.project.findFirst).mockReset())

  it('returns the project when owned', async () => {
    vi.mocked(prisma.project.findFirst).mockResolvedValue({ id: 'p1', userId: 'u1' } as never)
    expect(await assertProjectOwnership('u1', 'p1')).toEqual({ id: 'p1', userId: 'u1' })
  })
  it('throws 404 for a foreign/missing project', async () => {
    vi.mocked(prisma.project.findFirst).mockResolvedValue(null)
    await expect(assertProjectOwnership('u1', 'pX')).rejects.toMatchObject({
      status: 404,
      message: 'Project not found',
    })
  })
})

describe('assertPRDOwnership', () => {
  beforeEach(() => vi.mocked(prisma.pRD.findFirst).mockReset())

  it('throws 404 for a PRD belonging to another user', async () => {
    vi.mocked(prisma.pRD.findFirst).mockResolvedValue(null)
    await expect(assertPRDOwnership('u1', 'prdX')).rejects.toBeInstanceOf(ServiceError)
    await expect(assertPRDOwnership('u1', 'prdX')).rejects.toMatchObject({ status: 404 })
  })
})

describe('assertCreateAllowed (free-plan limiter, PRD §14)', () => {
  beforeEach(() => {
    vi.mocked(prisma.user.findUnique).mockReset()
    vi.mocked(prisma.pRD.count).mockReset()
  })

  it('lets PRO users bypass the limit entirely', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'PRO' } as never)
    vi.mocked(prisma.pRD.count).mockResolvedValue(999)
    await expect(assertCreateAllowed('u1')).resolves.toBeUndefined()
    expect(prisma.pRD.count).not.toHaveBeenCalled()
  })

  it('allows a FREE user below the limit', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'FREE' } as never)
    vi.mocked(prisma.pRD.count).mockResolvedValue(FREE_PLAN_LIMIT - 1)
    await expect(assertCreateAllowed('u1')).resolves.toBeUndefined()
  })

  it('blocks a FREE user at the limit with 403', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'FREE' } as never)
    vi.mocked(prisma.pRD.count).mockResolvedValue(FREE_PLAN_LIMIT)
    await expect(assertCreateAllowed('u1')).rejects.toMatchObject({
      status: 403,
      message: expect.stringContaining('Free plan limit reached'),
    })
  })

  it('counts only PRDs created in the last 30 days', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'FREE' } as never)
    vi.mocked(prisma.pRD.count).mockResolvedValue(0)
    await assertCreateAllowed('u1')
    const arg = vi.mocked(prisma.pRD.count).mock.calls[0]![0]!
    const createdAt = arg.where!.createdAt as { gte: Date }
    expect(createdAt.gte).toBeInstanceOf(Date)
    expect(arg.where!.project).toEqual({ userId: 'u1' })
  })
})

describe('assertProjectCreateAllowed (free-plan 1-project limit, PRD §14)', () => {
  beforeEach(() => {
    vi.mocked(prisma.user.findUnique).mockReset()
    vi.mocked(prisma.project.count).mockReset()
  })

  it('lets PRO users bypass the limit entirely', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'PRO' } as never)
    vi.mocked(prisma.project.count).mockResolvedValue(99)
    await expect(assertProjectCreateAllowed('u1')).resolves.toBeUndefined()
    expect(prisma.project.count).not.toHaveBeenCalled()
  })

  it('allows a FREE user with 0 existing projects', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'FREE' } as never)
    vi.mocked(prisma.project.count).mockResolvedValue(0)
    await expect(assertProjectCreateAllowed('u1')).resolves.toBeUndefined()
    expect(vi.mocked(prisma.project.count).mock.calls[0]![0]!.where).toEqual({ userId: 'u1' })
  })

  it('blocks a FREE user with 1 existing project using 403', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'FREE' } as never)
    vi.mocked(prisma.project.count).mockResolvedValue(1)
    await expect(assertProjectCreateAllowed('u1')).rejects.toMatchObject({
      status: 403,
      message: 'Free plan is limited to 1 project. Upgrade to Pro for unlimited projects.',
    })
  })

  it('throws 401 when the user does not exist', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    await expect(assertProjectCreateAllowed('ghost')).rejects.toMatchObject({ status: 401 })
  })
})
describe('validatePRDContent (AI output guard, PRD §6.3)', () => {
  it('passes through valid content', () => {
    expect(validatePRDContent(validContent)).toEqual(validContent)
  })
  it('throws 502 when the AI returns an invalid structure', () => {
    const bad = { ...validContent, features: [] }
    expect(() => validatePRDContent(bad)).toThrow(/invalid PRD structure/)
    expect(() => validatePRDContent('not-an-object')).toThrow(/invalid PRD structure/)
  })
})

describe('markdownFor', () => {
  it('renders markdown via the shared template', () => {
    const md = markdownFor(validContent, Language.ID)
    expect(md).toContain('# Aplikasi Kasir')
    expect(md).toContain('## Ringkasan')
  })
})

describe('restoreVersion (non-destructive, PRD §6.6)', () => {
  beforeEach(() => {
    vi.mocked(prisma.pRD.findFirst).mockReset()
    vi.mocked(prisma.pRDVersion.findFirst).mockReset()
    vi.mocked(prisma.$transaction).mockReset()
  })

  it('throws 404 when the version does not exist', async () => {
    vi.mocked(prisma.pRD.findFirst).mockResolvedValue({
      id: 'prd1',
      currentVersion: 3,
      language: 'EN',
    } as never)
    vi.mocked(prisma.pRDVersion.findFirst).mockResolvedValue(null)
    await expect(restoreVersion('u1', 'prd1', 2)).rejects.toMatchObject({ status: 404 })
  })
})
