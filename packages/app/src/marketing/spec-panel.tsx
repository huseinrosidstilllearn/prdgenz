import { cn } from '@prdgenz/ui'

/**
 * SpecPanel — the signature element.
 *
 * A PRD is a numbered document, so the product shows you a numbered document.
 * The margin rule and the clause numbers come from the content itself: this is
 * the shape of the artefact you are about to get, not decoration around it.
 */
export function SpecPanel({
  className,
  clauses,
  activeIndex,
}: {
  className?: string
  clauses: { number: string; title: string; lines: number }[]
  activeIndex?: number
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border bg-card',
        className
      )}
      aria-hidden="true"
    >
      {/* Title block, the way a drawing sheet is stamped. */}
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
          prd.md
        </span>
        <span className="font-mono text-[0.6875rem] tabular-nums text-muted-foreground">
          rev 3
        </span>
      </div>

      <div className="px-4 py-5 sm:px-5">
        {clauses.map((clause, i) => (
          <div
            key={clause.number}
            className={cn(
              'spec-rule relative py-2.5',
              i > 0 && 'border-t border-border/60'
            )}
          >
            <span
              className="clause-number"
              data-active={i === activeIndex ? 'true' : undefined}
            >
              {clause.number}
            </span>
            <p className="text-sm font-medium leading-6">{clause.title}</p>
            {/* Placeholder rules stand in for prose: this is a document in
                progress, not a screenshot of fake data. */}
            <div className="mt-2 space-y-1.5" style={{ width: `${clause.lines * 7}%` }}>
              <div className="h-1.5 rounded-full bg-border" />
              <div className="h-1.5 w-4/5 rounded-full bg-border/70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
