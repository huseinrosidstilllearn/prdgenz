'use client'

import { EXPORT_FORMATS } from '@prdgenz/shared'
import { Button } from './button'

export type ExportFormat = (typeof EXPORT_FORMATS)[number]

export interface ExportMenuProps {
  onExport: (format: ExportFormat) => void
  disabled?: boolean
}

const LABELS: Record<ExportFormat, string> = {
  markdown: 'Markdown (.md)',
  pdf: 'PDF',
  'ai-prompt': 'AI Prompt',
}

export function ExportMenu({ onExport, disabled }: ExportMenuProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {EXPORT_FORMATS.map((format) => (
        <Button
          key={format}
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => onExport(format)}
        >
          {LABELS[format]}
        </Button>
      ))}
    </div>
  )
}
