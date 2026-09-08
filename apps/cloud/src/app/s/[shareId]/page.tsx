import Link from 'next/link'
import { Badge } from '@prdgenz/ui'
import { prisma } from '@/lib/prisma'
import { getCurrentVersion } from '@/lib/prd-service'
import { truncate } from '@prdgenz/shared'

// Public share page backed by the DB — always render on demand.
export const dynamic = 'force-dynamic'

/** Public view-only PRD page via share link — no login required (PRD §6.7). */
export default async function SharedPRDPage({
  params,
}: {
  params: { shareId: string }
}) {
  const prd = await prisma.pRD.findUnique({
    where: { shareId: params.shareId },
    include: { project: { select: { name: true } } },
  })

  if (!prd) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-semibold">PRD not found</h1>
        <p className="text-muted-foreground">
          This share link is invalid or has been revoked.
        </p>
        <Link href="/" className="text-sm underline underline-offset-4">
          Go to PRD GenZ
        </Link>
      </div>
    )
  }

  const version = await getCurrentVersion(prd.id)
  const content = (version?.content ?? null) as never

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="text-lg font-bold">
            PRD GenZ
          </Link>
          <Badge variant="secondary">Shared · View only</Badge>
        </div>
      </header>
      <main className="container max-w-3xl py-10">
        <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
          {prd.project.name} · v{prd.currentVersion}
        </p>
        {content ? (
          <div className="rounded-xl border bg-card p-8 shadow-sm">
            <div className="[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-6 [&_li]:my-1 [&_p]:my-2 text-sm">
              <PRDBody content={content} />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed bg-card p-10 text-center text-muted-foreground">
            This PRD has no generated content yet.
          </div>
        )}
      </main>
    </div>
  )
}

import { PRDPreview } from '@prdgenz/ui'

function PRDBody({ content }: { content: never }) {
  return <PRDPreview content={content} />
}
