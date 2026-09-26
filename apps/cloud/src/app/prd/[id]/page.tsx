import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { PRDDocument } from '@prdgenz/app'
import type { PRDContent } from '@prdgenz/shared'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCurrentVersion } from '@/lib/prd-service'

// Session-backed page — always render on demand.
export const dynamic = 'force-dynamic'

/** PRD view: preview + export + share + version history (PRD §9.2 /prd/[id]). */
export default async function PRDPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id

  const prd = await prisma.pRD.findFirst({
    where: { id, project: { userId: userId! } },
    include: { project: { select: { name: true } } },
  })
  if (!prd) notFound()

  const user = await prisma.user.findUnique({ where: { id: userId! }, select: { role: true } })
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
      projectName={prd.project.name}
      mode={prd.mode}
      language={prd.language}
      currentVersion={prd.currentVersion}
      content={version ? (version.content as unknown as PRDContent) : null}
      versions={versions}
      canShare
      canRegenerate
      pdfLocked={user?.role !== 'PRO'}
    />
  )
}

