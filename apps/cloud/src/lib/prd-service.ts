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

/** Append a new version to an existing PRD (regenerate / restore). */
export async function appendPRDVersion(
  userId: string,
  prdId: string,
  content: PRDContent,
  language?: Language
) {
  const prd = await assertPRDOwnership(userId, prdId)
  const lang = language ?? (prd.language as Language)
  const contentMd = markdownFor(content, lang)
  const versionNumber = prd.currentVersion + 1
  const [version] = await prisma.$transaction([
    prisma.pRDVersion.create({
      data: { prdId, versionNumber, content: content as unknown as object, contentMd },
    }),
    prisma.pRD.update({
      where: { id: prdId },
      data: { title: content.title, language: lang, currentVersion: versionNumber },
    }),
  ])
  return version
}

/** Restore an old version as a NEW version (non-destructive, PRD §6.6). */
export async function restoreVersion(userId: string, prdId: string, vid: number) {
  const prd = await assertPRDOwnership(userId, prdId)
  const old = await prisma.pRDVersion.findFirst({
    where: { prdId, versionNumber: vid },
  })
  if (!old) throw new ServiceError('Version not found', 404)
  const versionNumber = prd.currentVersion + 1
  const [version] = await prisma.$transaction([
    prisma.pRDVersion.create({
      data: {
        prdId,
        versionNumber,
        content: old.content as object,
        contentMd: old.contentMd,
      },
    }),
    prisma.pRD.update({ where: { id: prdId }, data: { currentVersion: versionNumber } }),
  ])
  return version
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
