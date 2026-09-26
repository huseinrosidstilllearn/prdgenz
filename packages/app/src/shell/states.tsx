import type { ReactNode } from 'react'
import { cn } from '@prdgenz/ui'

/**
 * Empty state. Never says "no data": it says what is missing and what to do
 * about it. An empty screen is an invitation to act.
 */
export function EmptyState({
  title,
  body,
  action,
  className,
}: {
  title: string
  body: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-3 rounded-lg border border-dashed p-8',
        className
      )}
    >
      <h2 className="text-xl">{title}</h2>
      <div className="max-w-prose text-sm leading-relaxed text-muted-foreground">
        {body}
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  )
}

/**
 * Error state. Names the failure and the way out. Errors do not apologise and
 * are never vague.
 */
export function ErrorState({
  title = 'Something went wrong',
  detail,
  action,
  className,
}: {
  title?: string
  detail?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-6',
        className
      )}
    >
      <h2 className="text-lg text-destructive">{title}</h2>
      {detail ? (
        <div className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          {detail}
        </div>
      ) : null}
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  )
}
