import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

// Badges label a real state (plan tier, version, language). They never
// decorate: the default variant is a hairline outline, not a filled chip.
const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[0.6875rem] font-medium uppercase tracking-wide',
  {
    variants: {
      variant: {
        default: 'border-border-strong text-foreground',
        secondary: 'border-border text-muted-foreground',
        primary: 'border-primary/30 bg-primary-soft text-primary-soft-foreground',
        success: 'border-success/30 bg-success/10 text-success',
        destructive: 'border-destructive/30 bg-destructive/10 text-destructive',
        outline: 'border-border text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }

