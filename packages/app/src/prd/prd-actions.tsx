'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  SectionRegenerate,
  VersionHistory,
  type VersionItem,
} from '@prdgenz/ui'
import type { PRDContent } from '@prdgenz/shared'
import { ExportActions } from './export-actions'
import { ShareButton } from './share-button'

/** Every clause a user can regenerate on its own. Order matches the PRD. */
const SECTIONS = [
  'summary',
  'problem',
  'targetUser',
  'features',
  'userStories',
  'acceptanceCriteria',
  'techStack',
  'timeline',
  'risks',
  'successMetrics',
  'openQuestions',
] as const

/**
 * The wizard persists the chosen provider in localStorage, so per-section
 * regenerate has to reuse it. Falls back to the default when storage is
 * unavailable: private mode throws on access, not on getItem returning null.
 */
function pickSectionProvider(): string {
  try {
    const saved = localStorage.getItem('prdgenz:provider')
    if (saved) return saved
  } catch {
    /* private mode */
  }
  return 'openai'
}

export interface PRDActionsProps {
  prdId: string
  title: string
  content: PRDContent
  language: string
  /** Cloud only: mint a public /s/ link. */
  canShare?: boolean
  /** Cloud only: rerun the whole PRD as a new version. */
  canRegenerate?: boolean
  /** Cloud free tier: PDF is a paid export. */
  pdfLocked?: boolean
}

export function PRDActions({
  prdId,
  title,
  content,
  language,
  canShare = false,
  canRegenerate = false,
  pdfLocked = false,
}: PRDActionsProps) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [sectionBusy, setSectionBusy] = useState<string | null>(null)
  const [sectionNote, setSectionNote] = useState<string | null>(null)
  const [sectionError, setSectionError] = useState<string | null>(null)

  // Reuse the current PRD as context so a clause rewrite sees the same product
  // the original generation saw, rather than the bare title.
  const sectionContext = {
    idea: content.summary || title,
    problem: content.problem,
    targetUser: content.targetUser,
    features: content.features.map((f) => f.name),
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
              `"${section}" regenerated, saved as v${evt.saved?.versionNumber ?? '?'}.`
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
    <div className="space-y-6">
      <ExportActions
        prdId={prdId}
        title={title}
        content={content}
        pdfLocked={pdfLocked}
      />

      {canShare || canRegenerate ? (
        <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
          {canShare ? <ShareButton prdId={prdId} /> : null}
          {canRegenerate ? (
            <Button variant="outline" size="sm" onClick={regenerate} disabled={busy}>
              {busy ? 'Regenerating…' : 'Regenerate (new version)'}
            </Button>
          ) : null}
        </div>
      ) : null}
      {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}

      <SectionRegenerate
        sections={SECTIONS}
        onSelect={regenerateSection}
        busy={sectionBusy}
        note={sectionNote}
        error={sectionError}
      />
    </div>
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
        onRestore={restore}
        onDiff={(v) => router.push(`/prd/${prdId}/diff?from=${v}&to=${currentVersion}`)}
      />
      {busy !== null ? (
        <p className="text-xs text-muted-foreground">Restoring v{busy}…</p>
      ) : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}

/**
 * Two-step inline confirm rather than window.confirm: a blocking dialog is
 * jarring mid-reading, and it reads as dead code in a review.
 */
export function DeletePRDButton({
  prdId,
  redirectTo = '/',
}: {
  prdId: string
  redirectTo?: string
}) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function remove() {
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/prd/${prdId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Delete failed')
      }
      router.push(redirectTo)
    } catch (e) {
      setError((e as Error).message)
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          variant="destructive"
          size="sm"
          disabled={deleting}
          onClick={() => (confirming ? remove() : setConfirming(true))}
        >
          {deleting ? 'Deleting…' : confirming ? 'Confirm delete' : 'Delete PRD'}
        </Button>
        {confirming && !deleting ? (
          <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
            Cancel
          </Button>
        ) : null}
      </div>
      {confirming && !deleting ? (
        <p className="text-xs text-muted-foreground">
          Deletes this PRD and every version. This cannot be undone.
        </p>
      ) : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
