'use client'

import { useState } from 'react'
import { Button } from '@prdgenz/ui'

export interface ShareButtonProps {
  prdId: string
}

/**
 * Cloud only. Self-host has no share table, so this is not rendered there
 * rather than being rendered and failing.
 */
export function ShareButton({ prdId }: ShareButtonProps) {
  const [shareId, setShareId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  async function share() {
    setNote(null)
    // Second press must re-copy the existing link, not mint another one.
    if (shareId) {
      const url = `${window.location.origin}/s/${shareId}`
      try {
        await navigator.clipboard.writeText(url)
        setNote(`Share link copied: ${url}`)
      } catch {
        setNote('Could not reach the clipboard. Copy the link from above.')
      }
      return
    }
    setBusy(true)
    try {
      const res = await fetch(`/api/prd/${prdId}/share`, { method: 'POST' })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error ?? 'Share failed')
      setShareId(data.shareId)
      const url = `${window.location.origin}/s/${data.shareId}`
      // A blocked clipboard must not discard the link we just created.
      await navigator.clipboard.writeText(url).catch(() => {})
      setNote(`Share link copied: ${url}`)
    } catch (e) {
      setNote((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button variant="outline" size="sm" onClick={share} disabled={busy}>
        {busy ? 'Creating…' : shareId ? 'Copy Share Link' : 'Create Share Link'}
      </Button>
      {note ? <p className="break-all text-xs text-muted-foreground">{note}</p> : null}
    </div>
  )
}
