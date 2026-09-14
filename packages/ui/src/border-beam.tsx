import * as React from 'react'
import { cn } from './lib/utils'

export interface BorderBeamProps extends React.HTMLAttributes<HTMLDivElement> {
  duration?: number
  size?: number
  colorFrom?: string
  colorTo?: string
}

/**
 * BorderBeam — a glowing dot travels the parent card's border using
 * CSS offset-path (Magic UI style). Parent must be `relative`.
 * Render inside the card, absolute inset-0.
 */
export function BorderBeam({
  className,
  duration = 6,
  size = 2,
  colorFrom = 'oklch(62% 0.13 210)',
  colorTo = 'oklch(48% 0.13 240)',
  ...props
}: BorderBeamProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 rounded-xl', className)}
      style={{ '--beam-duration': `${duration}s` } as React.CSSProperties}
      {...props}
    >
      <div
        className="animate-beam absolute"
        style={
          {
            width: size * 3,
            height: size,
            offsetDistance: '0%',
            background: `linear-gradient(90deg, ${colorFrom}, ${colorTo})`,
            borderRadius: size,
          } as React.CSSProperties
        }
      />
    </div>
  )
}
