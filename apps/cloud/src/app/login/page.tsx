'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button, Input, Label } from '@prdgenz/ui'
import { AuthShell } from '@prdgenz/app'
import { loginSchema } from '@prdgenz/shared'
import { safeCallbackUrl } from '@/lib/redirect'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    const parsed = loginSchema.safeParse({
      email: form.get('email'),
      password: form.get('password'),
    })
    if (!parsed.success) {
      setError('Enter a valid email and password.')
      return
    }
    setLoading(true)
    const res = await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      setError('Invalid email or password.')
      return
    }
    router.push(safeCallbackUrl(searchParams.get('callbackUrl')))
    router.refresh()
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your account"
      footer={
        <>
          No account?{' '}
          <Link href="/register" className="text-foreground underline underline-offset-4">
            Register
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
    </AuthShell>
  )
}

