'use client'

import { AI_PROVIDERS } from '@prdgenz/shared'
import { Label } from './label'

export interface ProviderSelectorProps {
  value: string
  model?: string
  configuredIds?: readonly string[]
  onChange: (providerId: string) => void
  onModelChange?: (model: string) => void
}

export function ProviderSelector({
  value,
  model,
  configuredIds = [],
  onChange,
  onModelChange,
}: ProviderSelectorProps) {
  const selected = AI_PROVIDERS.find((p) => p.id === value)
  const models = selected?.models ?? []

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="grid gap-2">
        <Label htmlFor="provider-select">AI Provider</Label>
        <select
          id="provider-select"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            const next = AI_PROVIDERS.find((p) => p.id === e.target.value)
            if (next && next.models.length > 0) onModelChange?.(next.models[0] as string)
          }}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {AI_PROVIDERS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {configuredIds.includes(p.id) ? ' (configured)' : ''}
            </option>
          ))}
        </select>
      </div>
      {models.length > 0 && (
        <div className="grid gap-2">
          <Label htmlFor="model-select">Model</Label>
          <select
            id="model-select"
            value={model ?? models[0]}
            onChange={(e) => onModelChange?.(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
