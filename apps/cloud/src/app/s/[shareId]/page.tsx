import Link from 'next/link'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import { cache } from 'react'
import { Badge } from '@prdgenz/ui'
import { prisma } from '@/lib/prisma'
import { getCurrentVersion } from '@/lib/prd-service'
import { shareAuthValid } from '@/lib/share-auth'
import { ShareGate } from '@/components/share-gate'
import { truncate } from '@prdgenz/shared'

// Public share page backed by the DB â€” always render on demand.
export const dynamic = 'force-dynamic'

/**
 * Single request-scoped fetcher shared by generateMetadata and the page so the
 * share row is read once per request and both apply the SAME access rules.
 */
const getSharedPRD = cache(async (shareId: string) =>
  prisma.pRD.findUnique({
    where: { shareId },
    include: { project: { select: { name: true } } },
  })
)

/** True when the share is expired (treated like revoked, PRD Â§6.7). */
function shareExpired(shareExpiresAt: Date | null): boolean {
  return Boolean(shareExpiresAt && shareExpiresAt.getTime() < Date.now())
}

/** OG-friendly metadata for a shared PRD (T4 â€” SEO).
 *
 * Applies the same gating as the page body: expired/revoked shares get a
 * neutral title, and password-protected shares only expose the real title
 * when the visitor holds the share-auth cookie.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ shareId: string }>
}): Promise<Metadata> {
  const { shareId } = await params
  const prd = await getSharedPRD(shareId)

  if (!prd || shareExpired(prd.shareExpiresAt)) return { title: 'PRD not found' }

  if (
    prd.sharePasswordHash &&
    !(await shareAuthValid(await cookies(), shareId, prd.sharePasswordHash))
  ) {
    return { title: 'Shared PRD â password required' }
  }

  return {
    title: truncate(prd.title, 60),
    openGraph: {
      title: truncate(prd.title, 60),
      description: 'View this PRD shared via PRD GenZ.',
      type: 'article',
      siteName: 'PRD GenZ',
    },
  }
}

/** Public view-only PRD page via share link â no login required (PRD Â§6.7). */
export default async function SharedPRDPage({
  params,
}: {
  params: Promise<{ shareId: string }>
}) {
  const { shareId } = await params
  const prd = await getSharedPRD(shareId)

  // Expired shares are treated exactly like revoked ones (PRD Â§6.7).
  if (!prd || shareExpired(prd.shareExpiresAt)) {
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

  if (
    prd.sharePasswordHash &&
    !(await shareAuthValid(await cookies(), shareId, prd.sharePasswordHash))
  ) {
    return <ShareGate shareId={shareId} />
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
          <Badge variant="secondary">Shared Â· View only</Badge>
        </div>
      </header>
      <main className="container max-w-3xl py-10">
        <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
          {prd.project.name} Â· v{prd.currentVersion}
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
