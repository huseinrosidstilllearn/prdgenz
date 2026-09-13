import * as React from 'react'
import { cn } from './lib/utils'

export interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  pauseOnHover?: boolean
  duration?: number
}

/**
 * Marquee — infinite horizontal scroll strip (Magic UI style).
 * Duplicate content twice; animates translateX by one copy width.
 * Reduced-motion users see a static row via globals.css.
 */
export function Marquee({
  className,
  children,
  pauseOnHover = true,
  duration,
  ...props
}: MarqueeProps) {
  return (
    <div
      className={cn(
        'group flex w-full overflow-hidden',
        pauseOnHover && 'marquee-paused',
        className
      )}
      {...props}
    >
      <div
        className="animate-marquee flex w-max shrink-0 items-center gap-4 pr-4"
        style={duration ? ({ '--marquee-duration': `${duration}s` } as React.CSSProperties) : undefined}
      >
        {children}
        {children}
      </div>
    </div>
  )
}
