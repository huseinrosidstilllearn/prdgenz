import { prisma } from './prisma'
import {
  Language,
  PRDMode,
  renderPRDToMarkdown,
  prdContentSchema,
  type PRDContent,
} from '@prdgenz/shared'

export class ServiceError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.status = status
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

function assertLang(lang: string): Language {
  if (lang !== 'ID' && lang !== 'EN') throw new ServiceError('Invalid language', 400)
  return lang as Language
}

function assertMode(mode: string): PRDMode {
  if (mode !== 'WIZARD' && mode !== 'CHAT' && mode !== 'ONESHOT') {
    throw new ServiceError('Invalid mode', 400)
  }
  return mode as PRDMode
}

export async function getPRD(prdId: string) {
  const prd = await prisma.pRD.findUnique({ where: { id: prdId } })
  if (!prd) throw new ServiceError('PRD not found', 404)
  return prd
}

export function parseContent(version: { content: string }): PRDContent {
  return JSON.parse(version.content) as PRDContent
}

/** Create a new PRD (with v1) — no user/project concept in self-host. */
export async function createPRDFromContent(
  opts: { language: string; mode: string },
  content: PRDContent
) {
  const language = assertLang(opts.language)
  const mode = assertMode(opts.mode)
  const contentMd = renderPRDToMarkdown(content, language)
  return prisma.pRD.create({
    data: {
      title: content.title,
      language,
      mode,
      currentVersion: 1,
      versions: { create: { versionNumber: 1, content: JSON.stringify(content), contentMd } },
    },
  })
}

/**
 * Prisma's error code for a unique-index violation. Matched on the code, not
 * the message: Prisma reworded these between versions.
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
 * Append a new version (regenerate).
 *
 * The version number is allocated inside the transaction rather than derived
 * from the currentVersion read above it. Two regenerates can be in flight at
 * once (double-click, or a section regen racing a full one); both would read
 * the same currentVersion and pick the same number, and the
 * @@unique([prdId, versionNumber]) index would reject the loser. A collision is
 * reported as a 409 the caller can retry rather than a 500 that reads like a
 * server fault.
 */
export async function appendPRDVersion(
  prdId: string,
  content: PRDContent,
  language?: string
) {
  const prd = await getPRD(prdId)
  const lang = assertLang(language ?? prd.language)
  const contentMd = renderPRDToMarkdown(content, lang)

  try {
    return await prisma.$transaction(async (tx) => {
      const latest = await tx.pRDVersion.aggregate({
        where: { prdId },
        _max: { versionNumber: true },
      })
      const versionNumber = (latest._max.versionNumber ?? 0) + 1

      const version = await tx.pRDVersion.create({
        data: { prdId, versionNumber, content: JSON.stringify(content), contentMd },
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
export async function restoreVersion(prdId: string, vid: number) {
  await getPRD(prdId)
  const old = await prisma.pRDVersion.findFirst({ where: { prdId, versionNumber: vid } })
  if (!old) throw new ServiceError('Version not found', 404)

  // Same reasoning as appendPRDVersion: allocate inside the transaction.
  try {
    return await prisma.$transaction(async (tx) => {
      const latest = await tx.pRDVersion.aggregate({
        where: { prdId },
        _max: { versionNumber: true },
      })
      const versionNumber = (latest._max.versionNumber ?? 0) + 1

      const version = await tx.pRDVersion.create({
        data: { prdId, versionNumber, content: old.content, contentMd: old.contentMd },
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

/** Current version row (or null when never generated). */
export async function getCurrentVersion(prdId: string) {
  const prd = await getPRD(prdId)
  return prisma.pRDVersion.findFirst({
    where: { prdId, versionNumber: prd.currentVersion },
  })
}
