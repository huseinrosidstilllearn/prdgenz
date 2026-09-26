export interface ProjectListItem {
  id: string
  name: string
  description?: string | null
  /** Number of PRDs in the project. */
  prdCount: number
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
 * Projects are the folder level of the hierarchy, so they get a definition-list
 * treatment: name and count on the leading edge, dates trailing. Hairline rows
 * rather than a card grid, matching PRDList.
 */
export function ProjectList({ items }: { items: ProjectListItem[] }) {
  return (
    <ul className="divide-y border-y">
      {items.map((project) => (
        <li
          key={project.id}
          className="flex items-baseline justify-between gap-6 py-4"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{project.name}</p>
            {project.description ? (
              <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">
                {project.description}
              </p>
            ) : null}
          </div>
          <div className="shrink-0 text-right font-mono text-xs text-muted-foreground">
            <p>
              {project.prdCount} {project.prdCount === 1 ? 'doc' : 'docs'}
            </p>
            <p>{formatDate(project.updatedAt)}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
