'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, ExportMenu, SectionRegenerate, VersionHistory, type ExportFormat, type VersionItem } from '@prdgenz/ui'
import type { PRDContent } from '@prdgenz/shared'

export function PRDActions({
  prdId,
  title,
  content,
  language,
}: {
  prdId: string
  title: string
  content: PRDContent
  language: string
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [sectionBusy, setSectionBusy] = useState<string | null>(null)
  const [sectionNote, setSectionNote] = useState<string | null>(null)
  const [sectionError, setSectionError] = useState<string | null>(null)

  const sectionContext = {
    idea: content.summary || title,
    problem: content.problem,
    targetUser: content.targetUser,
    features: content.features.map((f) => f.name),
  }

  /** Same provider choice as the wizard (localStorage → default openai). */
  function pickSectionProvider(): string {
    try {
      const saved = localStorage.getItem('prdgenz:provider')
      if (saved) return saved
    } catch {
      /* private mode */
    }
    return 'openai'
  }

  async function regenerateSection(section: string) {
    setSectionBusy(section)
    setSectionNote(null)
    setSectionError(null)
    try {
      const res = await fetch('/api/ai/section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          provider: pickSectionProvider(),
          prdId,
          section,
          input: sectionContext,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Section regenerate failed')
      }
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''
        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith('data:')) continue
          const evt = JSON.parse(line.slice(5).trim())
          if (evt.type === 'done') {
            setSectionNote(
              `"${section}" regenerated — saved as v${evt.saved?.versionNumber ?? '?'}.`
            )
            router.refresh()
          } else if (evt.type === 'error') {
            throw new Error(evt.error)
          }
        }
      }
    } catch (e) {
      setSectionError((e as Error).message)
    } finally {
      setSectionBusy(null)
    }
  }

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
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`
      a.click()
      URL.revokeObjectURL(url)
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
      const { renderAIReadyPrompt } = await import('@prdgenz/shared')
      await navigator.clipboard.writeText(renderAIReadyPrompt(content))
      setNote('AI-ready prompt copied to clipboard.')
    }
  }

  return (
    <div className="space-y-3">
      <ExportMenu onExport={onExport} />
      <SectionRegenerate
        sections={['summary', 'problem', 'targetUser', 'features', 'userStories', 'acceptanceCriteria', 'techStack', 'timeline', 'risks', 'successMetrics', 'openQuestions']}
        onSelect={regenerateSection}
        busy={sectionBusy}
        note={sectionNote}
        error={sectionError}
      />
      {note && <p className="break-all text-xs text-muted-foreground">{note}</p>}
    </div>
  )
}

export function DeletePRDButton({ prdId }: { prdId: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function remove() {
    if (!confirm('Delete this PRD and all its versions? This cannot be undone.')) return
    setDeleting(true)
    const res = await fetch(`/api/prd/${prdId}`, { method: 'DELETE' })
    if (res.ok) router.push('/')
    else setDeleting(false)
  }

  return (
    <Button variant="destructive" size="sm" onClick={remove} disabled={deleting}>
      {deleting ? 'Deleting…' : 'Delete PRD'}
    </Button>
  )
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
        onDiff={(v) => router.push(`/prd/${prdId}/diff?from=${v}&to=${currentVersion}`)}
      />
      {busy !== null && <p className="text-xs text-muted-foreground">Restoring v{busy}…</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
