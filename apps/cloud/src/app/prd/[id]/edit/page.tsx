'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@prdgenz/ui'

/** Edit mode: rename PRD, change language, delete (PRD §9.2 /prd/[id]/edit). */
export default function EditPRDPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [language, setLanguage] = useState<'EN' | 'ID'>('EN')
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [id, setId] = useState<string | null>(null)

  // Unwrap async params (Next 15) and fetch current metadata once.
  if (id === null) {
    params.then((p) => setId(p.id)).catch(() => {})
  }
  if (id !== null && !loaded) {
    fetch(`/api/prd/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.prd) {
          setTitle(d.prd.title)
          setLanguage(d.prd.language)
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }

  async function save() {
    if (id === null) return
    setSaving(true)
    setError(null)
    setNote(null)
    try {
      const res = await fetch(`/api/prd/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, language }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Save failed')
      }
      setNote('Saved.')
      router.refresh()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (id === null) return
    if (!confirm('Delete this PRD and all its versions? This cannot be undone.')) return
    setDeleting(true)
    const res = await fetch(`/api/prd/${id}`, { method: 'DELETE' })
    if (res.ok) router.push('/dashboard')
    else {
      setError('Delete failed.')
      setDeleting(false)
    }
  }

  return (
    <div className="container max-w-xl space-y-6 py-10">
      <h1 className="text-2xl font-bold">Edit PRD</h1>

      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lang">Output language</Label>
            <select
              id="lang"
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'EN' | 'ID')}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="EN">English</option>
              <option value="ID">Bahasa Indonesia</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Applies to the next regenerated version.
            </p>
          </div>
          {note && <p className="text-sm text-primary">{note}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex items-center justify-between">
            <Button onClick={save} disabled={saving || !title.trim()}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
            <Button variant="destructive" onClick={remove} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete PRD'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        To change the content itself, use <strong>Regenerate</strong> on the PRD page or create a new
        version via Create from Scratch / Chat / One-Shot. Every change is kept as a new version you can
        restore.
      </p>
    </div>
  )
}
