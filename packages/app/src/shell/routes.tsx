'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@prdgenz/ui'

/**
 * Route-level error boundary. Kept as a shared component because the only
 * difference between the two apps was the href of the escape button.
 */
export function RouteError({
  error,
  reset,
  backHref,
  backLabel,
}: {
  error: Error & { digest?: string }
  reset: () => void
  backHref: string
  backLabel: string
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-wide text-destructive">
          Error
        </p>
        <h1 className="mt-3 font-display text-2xl">Something went wrong</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={reset}>Try again</Button>
          <Button asChild variant="outline">
            <Link href={backHref}>{backLabel}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export function RouteNotFound({
  backHref,
  backLabel,
}: {
  backHref: string
  backLabel: string
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
          404
        </p>
        <h1 className="mt-3 font-display text-2xl">Page not found</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The page you are looking for does not exist.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button asChild>
            <Link href={backHref}>{backLabel}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Go to landing</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
