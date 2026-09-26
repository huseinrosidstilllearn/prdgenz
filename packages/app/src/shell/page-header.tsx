import type { ReactNode } from 'react'
import { cn } from '@prdgenz/ui'

/**
 * Page header. The eyebrow is a mono clause label, the way a real spec sheet
 * marks a section. The title is display serif.
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
    <div className={cn('mb-8 flex flex-wrap items-start justify-between gap-4', className)}>
      <div className="min-w-0 space-y-2">
        {eyebrow ? (
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl leading-tight sm:text-4xl">{title}</h1>
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
