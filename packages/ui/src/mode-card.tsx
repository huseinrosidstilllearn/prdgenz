import * as React from 'react'
import { cn } from './lib/utils'
import { BorderBeam } from './border-beam'

export interface ModeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show a BorderBeam dot traveling the card edge (Magic UI style). */
  beam?: boolean
}

/**
 * ModeCard — action tile: border-2, icon chip, bold heading,
 * hover lift + border highlight, optional border beam.
 */
const ModeCard = React.forwardRef<HTMLDivElement, ModeCardProps>(
  ({ className, beam = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'group relative flex flex-col justify-start rounded-xl border-2 p-6 text-left',
        'bg-card text-card-foreground',
        'transition-all duration-150',
        'hover:-translate-y-1 hover:shadow-lg active:translate-y-0',
        'hover:border-ring/40',
        className
      )}
      {...props}
    >
      {beam ? <BorderBeam /> : null}
      {children}
    </div>
  )
)
ModeCard.displayName = 'ModeCard'

/** Small colored square holding an icon (like ngodingpakeai card icons). */
const IconChip = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('inline-flex self-start rounded-lg p-2.5 [&>svg]:size-6', className)}
      {...props}
    />
  )
)
IconChip.displayName = 'IconChip'

/**
 * LiveBadge — pulsing "live" indicator (green dot with ping animation).
 * Mirrors the ngodingpakeai header LIVE pill.
 */
export function LiveBadge({ label = 'Live' }: { label?: string }) {
  return (
    <span className="flex items-center gap-2 py-1 pl-1 pr-1">
      <span className="relative flex size-2.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-live-ping" />
        <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
      </span>
      <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
        {label}
      </span>
    </span>
  )
}

export { ModeCard, IconChip }
