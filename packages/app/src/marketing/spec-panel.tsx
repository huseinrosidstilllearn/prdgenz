import { cn } from "@prdgenz/ui";

/**
 * SpecPanel — the signature element.
 *
 * A PRD is a numbered document, so the product shows you a numbered document.
 * The margin rule and the clause numbers come from the content itself: this is
 * the shape of the artefact you are about to get, not decoration around it.
 * The active clause streams, the header stamps the revision — the panel reads
 * as the product working, not a screenshot of fake data.
 */
export function SpecPanel({
  className,
  clauses,
  activeIndex,
}: {
  className?: string;
  clauses: { number: string; title: string; lines: number }[];
  activeIndex?: number;
}) {
  return (
    <div
      className={cn("overflow-hidden rounded-lg border bg-card", className)}
      aria-hidden="true"
    >
      {/* Title block, the way a drawing sheet is stamped. */}
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
          prd.md
        </span>
        <div className="flex items-center gap-2">
          <span className="rounded border border-border-strong bg-primary-soft px-1.5 py-0.5 font-mono text-[0.625rem] tabular-nums text-primary-soft-foreground">
            v2 → v3
          </span>
          <span className="font-mono text-[0.6875rem] tabular-nums text-muted-foreground">
            rev 3
          </span>
        </div>
      </div>

      <div className="px-4 py-5 sm:px-5">
        {clauses.map((clause, i) => {
          const active = i === activeIndex;
          return (
            <div
              key={clause.number}
              className={cn(
                "spec-rule relative py-2.5",
                i > 0 && "border-t border-border/60",
              )}
            >
              <span
                className="clause-number"
                data-active={active ? "true" : undefined}
              >
                {clause.number}
              </span>
              <p className="text-sm font-medium leading-6">{clause.title}</p>
              {active ? (
                /* The active clause is being written right now: the status
                   line and the caret report real work, per DESIGN.md motion. */
                <div className="mt-1.5">
                  <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
                    Generating<span className="animate-caret">▍</span>
                  </p>
                  <div
                    className="mt-2 space-y-1.5"
                    style={{ width: `${clause.lines * 7}%` }}
                  >
                    <div className="h-1.5 rounded-full bg-border" />
                    <div className="h-1.5 w-4/5 rounded-full bg-border/70" />
                  </div>
                </div>
              ) : (
                <div
                  className="mt-2 space-y-1.5"
                  style={{ width: `${clause.lines * 7}%` }}
                >
                  <div className="h-1.5 rounded-full bg-border" />
                  <div className="h-1.5 w-4/5 rounded-full bg-border/70" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
