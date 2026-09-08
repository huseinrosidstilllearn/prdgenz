import type { PRDContent } from '@prdgenz/shared'
import { Badge } from './badge'

export interface PRDPreviewProps {
  content: PRDContent
}

const PRIORITY_VARIANT = {
  must: 'default',
  should: 'secondary',
  could: 'outline',
} as const

export function PRDPreview({ content }: PRDPreviewProps) {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{content.title}</h1>
        <p className="text-muted-foreground">{content.summary}</p>
      </header>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Problem</h2>
        <p className="whitespace-pre-wrap">{content.problem}</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Target User</h2>
        <p className="whitespace-pre-wrap">{content.targetUser}</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Features</h2>
        <ul className="space-y-2">
          {content.features.map((f) => (
            <li key={f.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{f.name}</span>
                <Badge variant={PRIORITY_VARIANT[f.priority]}>{f.priority.toUpperCase()}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">User Stories</h2>
        <ol className="list-decimal space-y-1 pl-5">
          {content.userStories.map((us) => (
            <li key={us.id}>
              As a <strong>{us.asA}</strong>, I want <strong>{us.iWant}</strong>, so that {us.soThat}
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Acceptance Criteria</h2>
        <ul className="space-y-1">
          {content.acceptanceCriteria.map((ac) => (
            <li key={ac.id} className="flex gap-2">
              <span aria-hidden>▢</span>
              <span>{ac.criteria}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Tech Stack</h2>
        <ul className="space-y-1 text-sm">
          <li><strong>Frontend:</strong> {content.techStack.frontend.join(', ')}</li>
          <li><strong>Backend:</strong> {content.techStack.backend.join(', ')}</li>
          <li><strong>Database:</strong> {content.techStack.database.join(', ')}</li>
          <li><strong>Infrastructure:</strong> {content.techStack.infrastructure.join(', ')}</li>
        </ul>
        <p className="text-sm text-muted-foreground">{content.techStack.reasoning}</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Timeline</h2>
        <ul className="space-y-1">
          {content.timeline.map((tl) => (
            <li key={tl.id}>
              <strong>{tl.milestone}</strong> ({tl.duration}): {tl.deliverables.join(', ')}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Output Format</h2>
        <p className="whitespace-pre-wrap">{content.outputFormat}</p>
      </section>

      {content.risks && content.risks.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Risks</h2>
          <ul className="space-y-1">
            {content.risks.map((r) => (
              <li key={r.id}>
                <strong>{r.description}</strong> ({r.impact}) — Mitigation: {r.mitigation}
              </li>
            ))}
          </ul>
        </section>
      )}

      {content.successMetrics && content.successMetrics.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Success Metrics</h2>
          <ul className="list-disc space-y-1 pl-5">
            {content.successMetrics.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </section>
      )}

      {content.openQuestions && content.openQuestions.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Open Questions</h2>
          <ul className="list-disc space-y-1 pl-5">
            {content.openQuestions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
