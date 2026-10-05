import Link from 'next/link'
import { Badge } from '@prdgenz/ui'

export interface PRDListItem {
  id: string
  title: string
  /** Self-hosted installs have no Project table, so this is optional there. */
  projectName?: string
  version: number
  mode: string
  language: 'ID' | 'EN'
  updatedAt: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * A PRD is a document, so the index reads as a table of contents: a ruled list
 * with a monospace metadata line, not a grid of floating cards.
 */
export function PRDList({ items }: { items: PRDListItem[] }) {
  return (
    <ul className="workspace-document-list divide-y overflow-hidden rounded-lg border bg-card">
      {items.map((prd) => (
        <li key={prd.id}>
          <Link
            href={`/prd/${prd.id}`}
            className="group flex flex-col gap-2 px-5 py-5 transition-colors duration-[120ms] hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:flex-row sm:items-baseline sm:gap-6"
          >
            <div className="min-w-0 flex-1 space-y-1.5">
              <p className="truncate font-medium group-hover:text-primary">
                {prd.title}
              </p>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.6875rem] text-muted-foreground">
                {prd.projectName ? <span>{prd.projectName}</span> : null}
                <span aria-hidden>v{prd.version}</span>
                <span>{prd.mode.toLowerCase()}</span>
                <span>{prd.language === 'ID' ? 'Bahasa Indonesia' : 'English'}</span>
                <span>{formatDate(prd.updatedAt)}</span>
              </p>
            </div>
            <span className="shrink-0 sm:pt-0.5">
              <Badge variant="secondary">Open</Badge>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export { formatDate }
