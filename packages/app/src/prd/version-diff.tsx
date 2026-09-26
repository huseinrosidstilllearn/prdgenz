import Link from 'next/link'
import { Button, VersionDiff, type VersionDiffProps } from '@prdgenz/ui'

export interface VersionDiffViewProps {
  prdId: string
  title: string
  versions: { versionNumber: number; createdAt: Date | string }[]
  from: number
  to: number
  diff: VersionDiffProps['diff']
}

/**
 * Revision comparison. The two-version picker is a native GET form, so it
 * works without JavaScript and the URL stays shareable.
 */
export function VersionDiffView({
  prdId,
  title,
  versions,
  from,
  to,
  diff,
}: VersionDiffViewProps) {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <p className="mb-2 font-mono text-xs uppercase tracking-wide text-muted-foreground">
            {title} · revision diff
          </p>
          <h1 className="font-display text-3xl leading-tight">Compare versions</h1>
        </div>
        <Link
          href={`/prd/${prdId}`}
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Back to document
        </Link>
      </header>

      <form method="get" className="mb-8 flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label htmlFor="from" className="font-mono text-xs text-muted-foreground">
            From
          </label>
          <select
            id="from"
            name="from"
            defaultValue={String(from)}
            className="h-9 rounded-md border border-input bg-transparent px-3 font-mono text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {versions.map((v) => (
              <option key={v.versionNumber} value={v.versionNumber}>
                v{v.versionNumber}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="to" className="font-mono text-xs text-muted-foreground">
            To
          </label>
          <select
            id="to"
            name="to"
            defaultValue={String(to)}
            className="h-9 rounded-md border border-input bg-transparent px-3 font-mono text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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

      <div className="spec-rule pl-6">
        <VersionDiff diff={diff} fromVersion={from} toVersion={to} />
      </div>
    </div>
  )
}
