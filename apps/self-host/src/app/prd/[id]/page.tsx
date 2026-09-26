import { notFound } from 'next/navigation'
import { ThemeToggle } from '@prdgenz/ui'
import { PRDDocument } from '@prdgenz/app'
import type { PRDContent } from '@prdgenz/shared'
import { prisma } from '@/lib/prisma'
import { getCurrentVersion } from '@/lib/prd-service'

// SQLite-backed page — always render on demand.
export const dynamic = 'force-dynamic'

/** Self-host PRD view: preview + export + version history (PRD §9.2). */
export default async function PRDPage({ params }: { params: { id: string } }) {
  const prd = await prisma.pRD.findUnique({ where: { id: params.id } })
  if (!prd) notFound()

  const version = await getCurrentVersion(prd.id)
  const versions = await prisma.pRDVersion.findMany({
    where: { prdId: prd.id },
    orderBy: { versionNumber: 'desc' },
    select: { versionNumber: true, createdAt: true },
  })

  return (
    <PRDDocument
      prdId={prd.id}
      title={prd.title}
      mode={prd.mode}
      language={prd.language}
      currentVersion={prd.currentVersion}
      content={version ? (JSON.parse(version.content) as PRDContent) : null}
      versions={versions}
      showDelete
      headerExtra={<ThemeToggle />}
    />
  )
}

