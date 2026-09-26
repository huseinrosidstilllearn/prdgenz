'use client'

import { useState } from 'react'
import { ExportMenu, type ExportFormat } from '@prdgenz/ui'
import type { PRDContent } from '@prdgenz/shared'

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

export interface ExportActionsProps {
  prdId: string
  title: string
  content: PRDContent
  /**
   * Cloud free tier: PDF is a paid export. The note is informational because
   * the route is what actually enforces the limit.
   */
  pdfLocked?: boolean
}

/**
 * Export owns its own status line rather than sharing one with the buttons
 * beside it. When these lived together, exporting cleared the share link's
 * message and vice versa.
 */
export function ExportActions({ prdId, title, content, pdfLocked }: ExportActionsProps) {
  const [note, setNote] = useState<string | null>(null)
  const [busy, setBusy] = useState<ExportFormat | null>(null)

  async function onExport(format: ExportFormat) {
    setNote(null)
    setBusy(format)
    try {
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
        downloadBlob(await res.blob(), `${slugify(title)}.md`)
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
        // The route returns a full HTML document intended for the print dialog.
        const w = window.open('', '_blank')
        if (!w) {
          setNote('Allow popups to export PDF.')
          return
        }
        w.document.write(await res.text())
        w.document.close()
      } else {
        const { renderAIReadyPrompt } = await import('@prdgenz/shared')
        await navigator.clipboard.writeText(renderAIReadyPrompt(content))
        setNote('AI-ready prompt copied to clipboard.')
      }
    } catch (e) {
      setNote((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-2">
      <ExportMenu onExport={onExport} disabled={busy !== null} />
      {pdfLocked ? (
        <p className="text-xs text-muted-foreground">PDF export requires Pro.</p>
      ) : null}
      {note ? <p className="break-all text-xs text-muted-foreground">{note}</p> : null}
    </div>
  )
}
