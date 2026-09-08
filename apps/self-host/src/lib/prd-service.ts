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

/** Append a new version (regenerate). */
export async function appendPRDVersion(
  prdId: string,
  content: PRDContent,
  language?: string
) {
  const prd = await getPRD(prdId)
  const lang = assertLang(language ?? prd.language)
  const contentMd = renderPRDToMarkdown(content, lang)
  const versionNumber = prd.currentVersion + 1
  const [version] = await prisma.$transaction([
    prisma.pRDVersion.create({
      data: { prdId, versionNumber, content: JSON.stringify(content), contentMd },
    }),
    prisma.pRD.update({
      where: { id: prdId },
      data: { title: content.title, language: lang, currentVersion: versionNumber },
    }),
  ])
  return version
}

/** Restore an old version as a NEW version (non-destructive, PRD §6.6). */
export async function restoreVersion(prdId: string, vid: number) {
  const prd = await getPRD(prdId)
  const old = await prisma.pRDVersion.findFirst({ where: { prdId, versionNumber: vid } })
  if (!old) throw new ServiceError('Version not found', 404)
  const versionNumber = prd.currentVersion + 1
  const [version] = await prisma.$transaction([
    prisma.pRDVersion.create({
      data: { prdId, versionNumber, content: old.content, contentMd: old.contentMd },
    }),
    prisma.pRD.update({ where: { id: prdId }, data: { currentVersion: versionNumber } }),
  ])
  return version
}

/** Current version row (or null when never generated). */
export async function getCurrentVersion(prdId: string) {
  const prd = await getPRD(prdId)
  return prisma.pRDVersion.findFirst({
    where: { prdId, versionNumber: prd.currentVersion },
  })
}
