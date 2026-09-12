import Link from 'next/link'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@prdgenz/ui'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="max-w-md text-center">
        <CardHeader>
          <CardTitle>404 — Page not found</CardTitle>
          <CardDescription>The page you are looking for does not exist.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
