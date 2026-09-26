import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@prdgenz/ui'
import { diffPRDVersions } from '@prdgenz/shared'
import { VersionDiffView, resolveVersionPair } from '@prdgenz/app'
import { prisma } from '@/lib/prisma'

// SQLite-backed page — always render on demand.
export const dynamic = 'force-dynamic'

interface DiffPageProps {
  params: { id: string }
  searchParams: { from?: string; to?: string }
}

/** Self-host version diff view: per-section markdown diff (PRD §6.6, single user). */
export default async function PRDDiffPage({ params, searchParams }: DiffPageProps) {
  const prd = await prisma.pRD.findUnique({ where: { id: params.id } })
  if (!prd) notFound()

  const versions = await prisma.pRDVersion.findMany({
    where: { prdId: prd.id },
    orderBy: { versionNumber: 'desc' },
    select: { versionNumber: true, createdAt: true },
  })

  const available = versions.map((v) => v.versionNumber)
  const pair =
    versions.length < 2
      ? null
      : resolveVersionPair(available, prd.currentVersion, searchParams.from, searchParams.to)

  if (!pair) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-10">
        <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
          Revision diff
        </p>
        <div className="mt-4 border-l-2 border-border pl-5">
          <p className="font-medium">Only one version exists</p>
          <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">
            Regenerate the document to create a second version, then compare the
            two here.
          </p>
          <Button asChild className="mt-4">
            <Link href={`/prd/${prd.id}`}>Back to document</Link>
          </Button>
        </div>
      </div>
    )
  }

  const [fromVersion, toVersion] = await prisma.$transaction([
    prisma.pRDVersion.findFirst({ where: { prdId: prd.id, versionNumber: pair.from } }),
    prisma.pRDVersion.findFirst({ where: { prdId: prd.id, versionNumber: pair.to } }),
  ])
  if (!fromVersion || !toVersion) notFound()

  return (
    <VersionDiffView
      prdId={prd.id}
      title={prd.title}
      versions={versions}
      from={pair.from}
      to={pair.to}
      diff={diffPRDVersions(fromVersion.contentMd, toVersion.contentMd)}
    />
  )
}