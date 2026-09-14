import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge, PRDPreview, ThemeToggle } from '@prdgenz/ui'
import type { PRDContent } from '@prdgenz/shared'
import { prisma } from '@/lib/prisma'
import { getCurrentVersion } from '@/lib/prd-service'
import { PRDActions, VersionSidebar, DeletePRDButton } from '@/components/prd-actions'

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
  const content = version ? (JSON.parse(version.content) as PRDContent) : null

  return (
    <div className="container max-w-6xl space-y-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
            {prd.mode.toLowerCase()} mode · {prd.language === 'ID' ? 'Bahasa Indonesia' : 'English'}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">{prd.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">v{prd.currentVersion}</Badge>
          <Link
            href={`/prd/${prd.id}/edit`}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Edit
          </Link>
          <ThemeToggle />
        </div>
      </div>

      {content ? (
        <PRDActions prdId={prd.id} title={prd.title} content={content} language={prd.language} />
      ) : (
        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          No generated content yet. Generate a version from Create from Scratch / Chat / One-Shot.
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="rounded-xl border bg-card p-8 shadow-sm">
          {content ? <PRDPreview content={content} /> : <p className="text-sm text-muted-foreground">Empty PRD.</p>}
        </div>
        <aside className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Version History
          </h2>
          <VersionSidebar prdId={prd.id} versions={versions} currentVersion={prd.currentVersion} />
          <div className="pt-4">
            <DeletePRDButton prdId={prd.id} />
          </div>
        </aside>
      </div>
    </div>
  )
}
