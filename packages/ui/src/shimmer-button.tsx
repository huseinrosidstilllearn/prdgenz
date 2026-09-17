import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from './lib/utils'

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

/**
 * ShimmerButton — primary CTA with steel→cyan gradient and a
 * sweeping highlight (Magic UI style). CSS-only animation.
 */
const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(
          'relative inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-8 text-base font-semibold text-white shadow-lg transition-transform duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'active:translate-y-px disabled:pointer-events-none disabled:opacity-50',
          'bg-gradient-to-r from-[oklch(48%_0.13_240)] to-[oklch(62%_0.13_210)]',
          'animate-shimmer hover:scale-[1.02]',
          className
        )}
        {...props}
      />
    )
  }
)
ShimmerButton.displayName = 'ShimmerButton'

export { ShimmerButton }
