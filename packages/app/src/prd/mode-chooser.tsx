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
    body: 'Work through the sections one at a time. Choose what belongs in your brief and refine each part.',
    bestFor: 'You want control over every section.',
    example: 'Define the target users, list the core features, then write acceptance criteria.',
    result: 'A brief assembled section by section.',
  },
  {
    number: '02',
    href: '/prd/new/chat',
    title: 'Chat',
    body: 'Talk through the product with the model before asking it to draft your PRD.',
    bestFor: 'You are still working out the details.',
    example: 'I want to build a booking app. Help me decide what should be in the first release.',
    result: 'A draft based on your conversation.',
  },
  {
    number: '03',
    href: '/prd/new/oneshot',
    title: 'One-Shot',
    body: 'Describe your idea and constraints. Generate a complete first draft in one pass.',
    bestFor: 'You already know the problem and main features.',
    example: 'A coffee shop ordering app for customers and baristas. Include a menu and order queue; leave payments out.',
    result: 'A complete draft you can edit afterwards.',
  },
]

export function ModeChooser() {
  return (
    <div className="mx-auto w-full">
      <header className="space-y-3">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
          New document
        </p>
        <h1 className="text-3xl sm:text-4xl">How do you want to start?</h1>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          Choose how to turn your idea into requirements. You can edit and save
          versions of the document afterwards.
        </p>
      </header>

      <p className="mt-5 text-sm text-muted-foreground">
        Writing your first brief? <Link href="/prd/new/oneshot" className="font-medium text-foreground underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring">Start with One-Shot.</Link>
      </p>

      <ol className="mt-7 divide-y rounded-lg border bg-card">
        {MODES.map((mode) => (
          <li key={mode.number}>
            <Link
              href={mode.href}
              className="group grid gap-3 p-5 transition-colors duration-[120ms] hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[2rem_1fr] sm:gap-5 sm:p-6 lg:grid-cols-[2rem_1fr_1fr]"
            >
              <span className="font-mono text-xs tabular-nums text-muted-foreground sm:pt-2">
                {mode.number}
              </span>
              <div className="min-w-0 flex-1 space-y-1.5">
                <h2 className="text-lg leading-snug group-hover:text-primary">
                  {mode.title}
                </h2>
                <p className="text-xs font-medium">{mode.bestFor}</p>
                <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                  {mode.body}
                </p>
                <p className="pt-2 text-xs font-medium">Choose {mode.title}</p>
              </div>
              <div className="rounded-md bg-surface-sunken p-4 sm:col-start-2 lg:col-start-auto">
                <p className="mb-2 font-mono text-[0.6875rem] text-muted-foreground">Example starting point</p>
                <p className="text-xs leading-relaxed">{mode.example}</p>
                <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">{mode.result}</p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
      <div className="mt-6 flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:justify-between">
        <p>Output language: English or Bahasa Indonesia.</p>
        <Link href="/settings" className="font-medium underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring">Manage your AI provider</Link>
      </div>
    </div>
  )
}
