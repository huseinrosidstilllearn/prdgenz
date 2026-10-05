import type { ReactNode } from 'react'
import { cn } from '@prdgenz/ui'

/**
 * Page header. The title leads, with context and page actions alongside it.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string
  title: string
  description?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('workspace-page-header mb-8 flex flex-wrap items-start justify-between gap-4', className)}>
      <div className="min-w-0 space-y-2">
        {eyebrow ? (
          <p className="text-sm font-medium text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-medium leading-tight tracking-tight sm:text-5xl">{title}</h1>
        {description ? (
          <div className="max-w-prose text-sm leading-relaxed text-muted-foreground">
            {description}
          </div>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  )
}
