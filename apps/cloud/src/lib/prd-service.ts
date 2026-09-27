import { prisma } from './prisma'
import {
  FREE_PLAN_LIMIT,
  Language,
  PRDMode,
  renderPRDToMarkdown,
  prdContentSchema,
  type PRDContent,
} from '@prdgenz/shared'

/** Error with an HTTP status, thrown by service helpers. */
export class ServiceError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

export async function assertProjectOwnership(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } })
  if (!project) throw new ServiceError('Project not found', 404)
  return project
}

export async function assertPRDOwnership(userId: string, prdId: string) {
  const prd = await prisma.pRD.findFirst({
    where: { id: prdId, project: { userId } },
    include: { project: true },
  })
  if (!prd) throw new ServiceError('PRD not found', 404)
  return prd
}

/** Free plan: max FREE_PLAN_LIMIT new PRDs per rolling 30 days (PRD §14). */
export async function assertCreateAllowed(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
  if (!user) throw new ServiceError('Unauthorized', 401)
  if (user.role === 'PRO') return
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const count = await prisma.pRD.count({
    where: { project: { userId }, createdAt: { gte: since } },
  })
  if (count >= FREE_PLAN_LIMIT) {
    throw new ServiceError(
      `Free plan limit reached (${FREE_PLAN_LIMIT} PRDs per 30 days). Upgrade to Pro for unlimited PRDs.`,
      403
    )
  }
}

/** Free plan: max 1 project total (PRD §14). */
export async function assertProjectCreateAllowed(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
  if (!user) throw new ServiceError('Unauthorized', 401)
  if (user.role === 'PRO') return
  const count = await prisma.project.count({ where: { userId } })
  if (count >= 1) {
    throw new ServiceError('Free plan is limited to 1 project. Upgrade to Pro for unlimited projects.', 403)
  }
}
/** Validate raw AI output against the PRD content schema (PRD §6.3). */
export function validatePRDContent(raw: unknown): PRDContent {
  const parsed = prdContentSchema.safeParse(raw)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    throw new ServiceError(
      `AI returned an invalid PRD structure (${issue?.path?.join('.') ?? 'root'}: ${issue?.message ?? 'unknown'})`,
      502
    )
  }
  return parsed.data as PRDContent
}

export function markdownFor(content: PRDContent, language: Language): string {
  return renderPRDToMarkdown(content, language)
}

/** Create a brand-new PRD (with v1) inside a project. */
export async function createPRDFromContent(
  userId: string,
  opts: { projectId: string; language: Language; mode: PRDMode },
  content: PRDContent
) {
  await assertProjectOwnership(userId, opts.projectId)
  await assertCreateAllowed(userId)
  const contentMd = markdownFor(content, opts.language)
  return prisma.pRD.create({
    data: {
      projectId: opts.projectId,
      title: content.title,
      language: opts.language,
      mode: opts.mode,
      currentVersion: 1,
      versions: {
        create: { versionNumber: 1, content: content as unknown as object, contentMd },
      },
    },
    include: { project: { select: { name: true } } },
  })
}

/**
 * Prisma's error code for a unique-index violation.
 * Only the code is matched, not the message: Prisma reworded these between
 * versions and matching text would silently stop catching them.
 */
const PRISMA_UNIQUE_VIOLATION = 'P2002'

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as { code?: unknown }).code === PRISMA_UNIQUE_VIOLATION
  )
}

/**
 * Append a new version to an existing PRD (regenerate / restore).
 *
 * The version number is allocated inside the transaction rather than derived
 * from the currentVersion read above it. Two regenerates can be in flight at
 * once (double-click, or a section regen racing a full one); both would read
 * the same currentVersion and pick the same number, and the
 * @@unique([prdId, versionNumber]) index would reject the loser. Taking the
 * max inside the transaction does not fully serialise the two either, so a
 * collision is still reported as a 409 the caller can retry rather than a 500
 * that reads like a server fault.
 */
export async function appendPRDVersion(
  userId: string,
  prdId: string,
  content: PRDContent,
  language?: Language
) {
  const prd = await assertPRDOwnership(userId, prdId)
  const lang = language ?? (prd.language as Language)
  const contentMd = markdownFor(content, lang)

  try {
    return await prisma.$transaction(async (tx) => {
      const latest = await tx.pRDVersion.aggregate({
        where: { prdId },
        _max: { versionNumber: true },
      })
      const versionNumber = (latest._max.versionNumber ?? 0) + 1

      const version = await tx.pRDVersion.create({
        data: { prdId, versionNumber, content: content as unknown as object, contentMd },
      })
      await tx.pRD.update({
        where: { id: prdId },
        data: { title: content.title, language: lang, currentVersion: versionNumber },
      })
      return version
    })
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new ServiceError(
        'Another regeneration just finished. Try again to save this version.',
        409
      )
    }
    throw err
  }
}

/** Restore an old version as a NEW version (non-destructive, PRD §6.6). */
export async function restoreVersion(userId: string, prdId: string, vid: number) {
  // Ownership is what the read is for; the row itself is no longer needed now
  // that the version number is allocated from the database inside the write.
  await assertPRDOwnership(userId, prdId)
  const old = await prisma.pRDVersion.findFirst({
    where: { prdId, versionNumber: vid },
  })
  if (!old) throw new ServiceError('Version not found', 404)

  // Same reasoning as appendPRDVersion: allocate inside the transaction so a
  // concurrent regenerate cannot hand us the same number.
  try {
    return await prisma.$transaction(async (tx) => {
      const latest = await tx.pRDVersion.aggregate({
        where: { prdId },
        _max: { versionNumber: true },
      })
      const versionNumber = (latest._max.versionNumber ?? 0) + 1

      const version = await tx.pRDVersion.create({
        data: {
          prdId,
          versionNumber,
          content: old.content as object,
          contentMd: old.contentMd,
        },
      })
      await tx.pRD.update({ where: { id: prdId }, data: { currentVersion: versionNumber } })
      return version
    })
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new ServiceError(
        'Another regeneration just finished. Try again to restore this version.',
        409
      )
    }
    throw err
  }
}

/** Current version row of a PRD (or null when never generated). */
export async function getCurrentVersion(prdId: string) {
  const prd = await prisma.pRD.findUnique({ where: { id: prdId } })
  if (!prd) throw new ServiceError('PRD not found', 404)
  return prisma.pRDVersion.findFirst({
    where: { prdId, versionNumber: prd.currentVersion },
  })
}

/** Load a PRD with its current version content included. */
export async function loadPRDWithVersion(prdId: string) {
  const prd = await prisma.pRD.findUnique({
    where: { id: prdId },
    include: {
      project: { select: { id: true, name: true, userId: true } },
      versions: {
        orderBy: { versionNumber: 'desc' },
        take: 1,
      },
    },
  })
  if (!prd) throw new ServiceError('PRD not found', 404)
  return prd
}
