import Link from 'next/link'
import { PRDPreview, type VersionItem } from '@prdgenz/ui'
import type { PRDContent } from '@prdgenz/shared'
import { PRDActions, VersionSidebar, DeletePRDButton } from './prd-actions'

export interface PRDDocumentProps {
  prdId: string
  title: string
  /** Cloud groups documents under a project; self-host has no Project table. */
  projectName?: string
  mode: string
  language: string
  currentVersion: number
  content: PRDContent | null
  versions: VersionItem[]
  /** Cloud: mint public share links. */
  canShare?: boolean
  /** Cloud: rerun the whole PRD as a new version. */
  canRegenerate?: boolean
  /** Cloud free tier: PDF is a paid export. */
  pdfLocked?: boolean
  /** Self-host: no version control, so no delete affordance in cloud. */
  showDelete?: boolean
  headerExtra?: React.ReactNode
}

/**
 * The reader. One column of prose, metadata in the margin, revision history in
 * a narrow aside. The document is the page: the panel around it is only a
 * sheet of paper, never a floating card.
 */
export function PRDDocument({
  prdId,
  title,
  projectName,
  mode,
  language,
  currentVersion,
  content,
  versions,
  canShare = false,
  canRegenerate = false,
  pdfLocked = false,
  showDelete = false,
  headerExtra,
}: PRDDocumentProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <p className="mb-2 font-mono text-xs uppercase tracking-wide text-muted-foreground">
            {[projectName, mode.toLowerCase(), language === 'ID' ? 'Bahasa Indonesia' : 'English']
              .filter(Boolean)
              .join(' · ')}
          </p>
          <h1 className="font-display text-3xl leading-tight sm:text-4xl">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm text-muted-foreground">
            v{currentVersion}
          </span>
          <Link
            href={`/prd/${prdId}/edit`}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Edit
          </Link>
          {headerExtra}
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="min-w-0 space-y-8">
          {content ? (
            <PRDActions
              prdId={prdId}
              title={title}
              content={content}
              language={language}
              canShare={canShare}
              canRegenerate={canRegenerate}
              pdfLocked={pdfLocked}
            />
          ) : null}

          <article className="spec-rule pl-6">
            {content ? (
              <PRDPreview content={content} />
            ) : (
              <p className="text-sm text-muted-foreground">
                No generated content yet. Generate a version from Create from
                Scratch, Chat, or One-Shot.
              </p>
            )}
          </article>
        </div>

        <aside className="space-y-4">
          <h2 className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            Revisions
          </h2>
          <VersionSidebar
            prdId={prdId}
            versions={versions}
            currentVersion={currentVersion}
          />
          {showDelete ? (
            <div className="border-t pt-4">
              <DeletePRDButton prdId={prdId} redirectTo="/dashboard" />
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
