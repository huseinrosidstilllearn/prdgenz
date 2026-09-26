import Link from 'next/link'
import { cn } from '@prdgenz/ui'

/**
 * The wordmark. "PRD" is set in the display serif, "GenZ" in the mono, because
 * the two halves of the name mean two different things: the document, and the
 * machine that writes it.
 */
export function Wordmark({
  href = '/',
  className,
  suffix,
}: {
  href?: string
  className?: string
  suffix?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-baseline gap-1.5 text-lg leading-none',
        className
      )}
    >
      <span className="font-display">PRD</span>
      <span className="font-mono text-[0.8em] font-medium tracking-tight text-primary">
        GenZ
      </span>
      {suffix ? (
        <span className="ml-1 font-mono text-[0.625rem] uppercase tracking-widest text-muted-foreground">
          {suffix}
        </span>
      ) : null}
    </Link>
  )
}
