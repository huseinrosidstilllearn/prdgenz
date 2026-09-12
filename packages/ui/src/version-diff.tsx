import type { PRDSectionDiff } from '@prdgenz/shared'
import { Badge } from './badge'

export interface VersionDiffProps {
  diff: PRDSectionDiff[]
  fromVersion: number
  toVersion: number
}

function DiffBlock({
  label,
  text,
  tone,
}: {
  label: string
  text: string
  tone: 'old' | 'new'
}) {
  return (
    <div
      className={
        tone === 'old'
          ? 'rounded-lg bg-destructive/10 p-4'
          : 'rounded-lg bg-emerald-500/10 p-4'
      }
    >
      <p className={tone === 'old' ? 'text-xs font-medium text-destructive' : 'text-xs font-medium text-emerald-600 dark:text-emerald-400'}>
        {label}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm">{text}</p>
    </div>
  )
}

/** Per-section markdown diff renderer (PRD §6.6 diff view). Server-safe. */
export function VersionDiff({ diff, fromVersion, toVersion }: VersionDiffProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Comparing <span className="font-medium text-foreground">v{fromVersion}</span> →{' '}
        <span className="font-medium text-foreground">v{toVersion}</span>
      </p>
      {diff.map((section) => (
        <section
          key={`${section.level}-${section.heading}-${section.status}`}
          className="space-y-2"
        >
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={
                section.level === 1
                  ? 'text-xl font-bold tracking-tight'
                  : 'text-base font-semibold'
              }
            >
              {section.heading}
            </h3>
            {section.status === 'unchanged' && <Badge variant="secondary">No changes</Badge>}
            {section.status === 'changed' && <Badge>Changed</Badge>}
            {section.status === 'added' && <Badge className="border-transparent bg-emerald-600 text-white hover:bg-emerald-600/80">Added</Badge>}
            {section.status === 'removed' && <Badge variant="destructive">Removed</Badge>}
          </div>
          {section.status === 'unchanged' ? null : (
            <div className="space-y-2">
              {section.fromText !== undefined && (
                <DiffBlock label={`v${fromVersion}`} text={section.fromText} tone="old" />
              )}
              {section.toText !== undefined && (
                <DiffBlock label={`v${toVersion}`} text={section.toText} tone="new" />
              )}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
