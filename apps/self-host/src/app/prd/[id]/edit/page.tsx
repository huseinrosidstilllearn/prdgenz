'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@prdgenz/ui'

/** Edit metadata: rename PRD, change language (self-host /prd/[id]/edit). */
export default function EditPRDPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [language, setLanguage] = useState<'EN' | 'ID'>('EN')
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)

  useEffect(() => {
    if (loaded) return
    setLoaded(true)
    fetch(`/api/prd/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.prd) {
          setTitle(d.prd.title)
          setLanguage(d.prd.language)
        }
      })
      .catch(() => {})
  }, [loaded, params.id])

  async function save() {
    setSaving(true)
    setError(null)
    setNote(null)
    try {
      const res = await fetch(`/api/prd/${params.id}`, {
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
            <p className="text-xs text-muted-foreground">Applies to the next regenerated version.</p>
          </div>
          {note && <p className="text-sm text-primary">{note}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={save} disabled={saving || !title.trim()}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        To change content, generate a new version via Create from Scratch / Chat / One-Shot. Every change is
        kept as a restorable version.
      </p>
    </div>
  )
}
