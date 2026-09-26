import Link from 'next/link'

/**
 * The three generation modes. These are genuinely different workflows, so they
 * are presented as an ordered list of choices rather than three identical
 * tiles. The numbers carry real order: it is a decision list, not a feature set.
 */
const MODES = [
  {
    number: '01',
    href: '/prd/new/wizard',
    title: 'Create from Scratch',
    body: 'Work through the sections one at a time. Reorder them, hide the ones you do not need, and regenerate any single section on its own.',
  },
  {
    number: '02',
    href: '/prd/new/chat',
    title: 'Chat',
    body: 'Describe the product in conversation. The model asks follow-up questions and keeps the whole thread in mind while it drafts.',
  },
  {
    number: '03',
    href: '/prd/new/oneshot',
    title: 'One-Shot',
    body: 'Paste an idea along with its constraints. Get a complete draft in one pass and regenerate it whenever the direction changes.',
  },
]

export function ModeChooser() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <header className="space-y-3">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
          New document
        </p>
        <h1 className="text-3xl sm:text-4xl">How do you want to start?</h1>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          All three produce the same PRD. Pick the process that matches how you
          already know what you need.
        </p>
      </header>

      <ol className="mt-8 divide-y border-y">
        {MODES.map((mode) => (
          <li key={mode.number}>
            <Link
              href={mode.href}
              className="group flex flex-col gap-2.5 py-6 transition-colors duration-[120ms] sm:flex-row sm:gap-8"
            >
              <span className="font-mono text-xs tabular-nums text-muted-foreground sm:pt-2">
                {mode.number}
              </span>
              <div className="min-w-0 flex-1 space-y-1.5">
                <h2 className="text-lg leading-snug group-hover:text-primary">
                  {mode.title}
                </h2>
                <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                  {mode.body}
                </p>
              </div>
              <span className="shrink-0 self-start font-mono text-xs text-muted-foreground sm:pt-2">
                Open
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}
