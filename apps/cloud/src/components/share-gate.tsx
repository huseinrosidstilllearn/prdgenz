'use client'

import { useState } from 'react'
import { Button, Input, Label } from '@prdgenz/ui'

/** Password gate for protected share links (PRD §6.7). */
export function ShareGate({ shareId }: { shareId: string }) {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/share/${shareId}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) throw new Error('Invalid password')
      window.location.reload()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">This PRD is protected</h1>
      <p className="text-muted-foreground">Enter the password to view this shared PRD.</p>
      <form onSubmit={submit} className="w-full max-w-xs space-y-3">
        <div className="space-y-1.5 text-left">
          <Label htmlFor="share-password">Password</Label>
          <Input
            id="share-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </div>
        <Button type="submit" className="w-full" disabled={busy || password.length === 0}>
          {busy ? 'Checking…' : 'View PRD'}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>
    </div>
  )
}