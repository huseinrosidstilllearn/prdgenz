'use client'

import { useState } from 'react'
import { Button } from './button'
import { Label } from './label'

export interface SectionRegenerateProps {
  sections: readonly string[]
  onSelect: (section: string) => void
  busy?: string | null
  note?: string | null
  error?: string | null
}

/**
 * Per-section regenerate control (PRD §6.1.1 "AI generate per section").
 * Server-safe wrapper is not possible: this needs interactive state — but it
 * renders fine inside a client island.
 */
export function SectionRegenerate({
  sections,
  onSelect,
  busy,
  note,
  error,
}: SectionRegenerateProps) {
  const [section, setSection] = useState<string>(sections[0] ?? '')

  return (
    <div className="space-y-2">
      <Label htmlFor="section-regen">Regenerate a single section</Label>
      <div className="flex gap-2">
        <select
          id="section-regen"
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {sections.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!section || busy != null}
          onClick={() => onSelect(section)}
        >
          {busy ? 'Generating…' : 'Regenerate'}
        </Button>
      </div>
      {busy && <p className="text-xs text-muted-foreground">Regenerating {busy}…</p>}
      {note && <p className="break-all text-xs text-muted-foreground">{note}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
