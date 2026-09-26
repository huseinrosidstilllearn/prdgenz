'use client'

import { RouteError } from '@prdgenz/app'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <RouteError error={error} reset={reset} backHref="/" backLabel="Back to your PRDs" />
}
