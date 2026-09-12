import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { Button, VersionDiff } from '@prdgenz/ui'
import { diffPRDVersions } from '@prdgenz/shared'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Session-backed page — always render on demand.
export const dynamic = 'force-dynamic'

interface DiffPageProps {
  params: { id: string }
  searchParams: { from?: string; to?: string }
}

/** Resolve the from/to pair: explicit query when valid, else the two newest versions. */
function resolvePair(
  available: number[],
  currentVersion: number,
  fromQuery?: string,
  toQuery?: string
): { from: number; to: number } | null {
  const fromNum = fromQuery !== undefined ? Number.parseInt(fromQuery, 10) : NaN
  const toNum = toQuery !== undefined ? Number.parseInt(toQuery, 10) : NaN

  const fromValid = Number.isInteger(fromNum) && available.includes(fromNum)
  const toValid = Number.isInteger(toNum) && available.includes(toNum)

  if (fromValid && toValid && fromNum !== toNum) return { from: fromNum, to: toNum }

  // Fallback: current version vs the version right below it.
  const to = currentVersion
  const sorted = [...available].sort((a, b) => b - a)
  const below = sorted.find((v) => v < to)
  if (below === undefined) return null // only one version exists
  return { from: below, to }
}

/** Version diff view: per-section markdown diff between two versions (PRD §6.6). */
export default async function PRDDiffPage({ params, searchParams }: DiffPageProps) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id

  const prd = await prisma.pRD.findFirst({
    where: { id: params.id, project: { userId: userId! } },
  })
  if (!prd) notFound()

  const versions = await prisma.pRDVersion.findMany({
    where: { prdId: prd.id },
    orderBy: { versionNumber: 'desc' },
    select: { versionNumber: true, createdAt: true },
  })

  const available = versions.map((v) => v.versionNumber)

  // Fewer than two versions — nothing to diff yet.
  if (versions.length < 2) {
    return (
      <div className="container max-w-3xl space-y-6 py-10">
        <Link
          href={`/prd/${prd.id}`}
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Back to PRD
        </Link>
        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          <p className="font-medium text-foreground">Only one version exists</p>
          <p className="mt-1">
            Regenerate the PRD to create a new version, then compare it with the previous one here.
          </p>
          <Button asChild className="mt-4">
            <Link href={`/prd/${prd.id}`}>Back to PRD</Link>
          </Button>
        </div>
      </div>
    )
  }

  const pair = resolvePair(available, prd.currentVersion, searchParams.from, searchParams.to)
  if (!pair) notFound() // e.g. only one distinct version — unreachable after the guard above, kept for safety

  const [fromVersion, toVersion] = await prisma.$transaction([
    prisma.pRDVersion.findFirst({ where: { prdId: prd.id, versionNumber: pair.from } }),
    prisma.pRDVersion.findFirst({ where: { prdId: prd.id, versionNumber: pair.to } }),
  ])
  if (!fromVersion || !toVersion) notFound()

  const diff = diffPRDVersions(fromVersion.contentMd, toVersion.contentMd)

  return (
    <div className="container max-w-4xl space-y-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
            {prd.title} · version diff
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Compare versions</h1>
        </div>
        <Link
          href={`/prd/${prd.id}`}
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Back to PRD
        </Link>
      </div>

      {/* No-JS picker: native GET form re-navigates to this page. */}
      <form method="get" className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label htmlFor="from" className="text-xs font-medium text-muted-foreground">
            From
          </label>
          <select
            id="from"
            name="from"
            defaultValue={String(pair.from)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {versions.map((v) => (
              <option key={v.versionNumber} value={v.versionNumber}>
                v{v.versionNumber}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="to" className="text-xs font-medium text-muted-foreground">
            To
          </label>
          <select
            id="to"
            name="to"
            defaultValue={String(pair.to)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {versions.map((v) => (
              <option key={v.versionNumber} value={v.versionNumber}>
                v{v.versionNumber}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" size="sm">
          Compare
        </Button>
      </form>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <VersionDiff diff={diff} fromVersion={pair.from} toVersion={pair.to} />
      </div>
    </div>
  )
}
