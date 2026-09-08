'use client'

import { Button } from './button'
import { cn } from './lib/utils'

export interface VersionItem {
  versionNumber: number
  createdAt: string | Date
  summary?: string
}

export interface VersionHistoryProps {
  versions: VersionItem[]
  currentVersion: number
  onRestore?: (versionNumber: number) => void
}

export function VersionHistory({ versions, currentVersion, onRestore }: VersionHistoryProps) {
  return (
    <ul className="space-y-2">
      {versions.map((v) => (
        <li
          key={v.versionNumber}
          className={cn(
            'flex items-center justify-between rounded-lg border p-3',
            v.versionNumber === currentVersion && 'border-primary bg-primary/5'
          )}
        >
          <div>
            <p className="text-sm font-medium">v{v.versionNumber}</p>
            <p className="text-xs text-muted-foreground">{new Date(v.createdAt).toLocaleString()}</p>
          </div>
          {v.versionNumber === currentVersion ? (
            <span className="text-xs font-medium text-primary">Current</span>
          ) : (
            onRestore && (
              <Button variant="outline" size="sm" onClick={() => onRestore(v.versionNumber)}>
                Restore
              </Button>
            )
          )}
        </li>
      ))}
    </ul>
  )
}
