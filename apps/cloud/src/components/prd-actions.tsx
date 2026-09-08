'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, ExportMenu, VersionHistory, type ExportFormat, type VersionItem } from '@prdgenz/ui'
import type { PRDContent } from '@prdgenz/shared'

export function PRDActions({
  prdId,
  title,
  content,
  isPro,
}: {
  prdId: string
  title: string
  content: PRDContent
  isPro: boolean
}) {
  const router = useRouter()
  const [shareId, setShareId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  async function onExport(format: ExportFormat) {
    setNote(null)
    if (format === 'markdown') {
      const res = await fetch('/api/export/md', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prdId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setNote(data?.error ?? 'Export failed.')
        return
      }
      const blob = await res.blob()
      downloadBlob(blob, `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`)
    } else if (format === 'pdf') {
      const res = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prdId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setNote(data?.error ?? 'Export failed.')
        return
      }
      const html = await res.text()
      const w = window.open('', '_blank')
      if (w) {
        w.document.write(html)
        w.document.close()
      }
    } else {
      // ai-prompt: build locally from shared template + copy to clipboard
      const { renderAIReadyPrompt } = await import('@prdgenz/shared')
      const prompt = renderAIReadyPrompt(content)
      await navigator.clipboard.writeText(prompt)
      setNote('AI-ready prompt copied to clipboard.')
    }
  }

  async function share() {
    setBusy(true)
    setNote(null)
    try {
      const res = await fetch(`/api/prd/${prdId}/share`, { method: 'POST' })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error ?? 'Share failed')
      setShareId(data.shareId)
      const url = `${window.location.origin}/s/${data.shareId}`
      await navigator.clipboard.writeText(url).catch(() => {})
      setNote(`Share link copied: ${url}`)
    } catch (e) {
      setNote((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function regenerate() {
    setBusy(true)
    setNote(null)
    try {
      const res = await fetch(`/api/prd/${prdId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: 'EN',
          mode: 'ONESHOT',
          provider: 'openai',
          input: { idea: content.summary || title },
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error ?? 'Regenerate failed')
      router.refresh()
    } catch (e) {
      setNote((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <ExportMenu onExport={onExport} />
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={share} disabled={busy}>
          {shareId ? 'Copy Share Link' : 'Create Share Link'}
        </Button>
        <Button variant="outline" size="sm" onClick={regenerate} disabled={busy}>
          Regenerate (new version)
        </Button>
        {!isPro && (
          <span className="self-center text-xs text-muted-foreground">
            PDF export requires Pro
          </span>
        )}
      </div>
      {note && <p className="break-all text-xs text-muted-foreground">{note}</p>}
    </div>
  )
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function VersionSidebar({
  prdId,
  versions,
  currentVersion,
}: {
  prdId: string
  versions: VersionItem[]
  currentVersion: number
}) {
  const router = useRouter()
  const [busy, setBusy] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function restore(versionNumber: number) {
    setBusy(versionNumber)
    setError(null)
    try {
      const res = await fetch(`/api/prd/${prdId}/versions/${versionNumber}/restore`, {
        method: 'POST',
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error ?? 'Restore failed')
      router.refresh()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-2">
      <VersionHistory
        versions={versions}
        currentVersion={currentVersion}
        onRestore={(v) => restore(v)}
      />
      {busy !== null && <p className="text-xs text-muted-foreground">Restoring v{busy}…</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
