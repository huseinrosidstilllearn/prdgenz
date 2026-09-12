'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@prdgenz/ui'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="max-w-md text-center">
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            {error.message || 'An unexpected error occurred.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
