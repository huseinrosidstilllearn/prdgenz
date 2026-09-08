'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Label } from '@prdgenz/ui'

export function CreateProjectButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function create() {
    if (!name.trim()) {
      setError('Project name is required.')
      return
    }
    setLoading(true)
    setError(null)
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error ?? 'Failed to create project.')
      return
    }
    setOpen(false)
    setName('')
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>New Project</Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm space-y-4 rounded-xl border bg-card p-6 shadow-lg">
            <h2 className="text-lg font-semibold">New Project</h2>
            <div className="space-y-2">
              <Label htmlFor="project-name">Name</Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mobile App Revamp"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && create()}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={create} disabled={loading}>
                {loading ? 'Creating…' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
