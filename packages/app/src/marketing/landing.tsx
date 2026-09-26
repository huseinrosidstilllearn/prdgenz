import Link from 'next/link'
import { FREE_PLAN_LIMIT, PRO_PRICE } from '@prdgenz/shared'
import { Badge, Button } from '@prdgenz/ui'
import { Wordmark } from '../shell/wordmark'
import { SpecPanel } from './spec-panel'

/**
 * The clauses the AI actually writes, numbered the way the output is numbered.
 * Nothing here is invented: this mirrors the real PRD section list.
 */
const HERO_CLAUSES = [
  { number: '01', title: 'Problem', lines: 12 },
  { number: '02', title: 'Target user', lines: 10 },
  { number: '03', title: 'Features', lines: 13 },
  { number: '04', title: 'Acceptance criteria', lines: 11 },
  { number: '05', title: 'Out of scope', lines: 8 },
]

/** Three different workflows, so they read as a list of choices rather than
 *  three identical feature tiles. The numbering carries real order. */
const WAYS_IN = [
  {
    number: '01',
    title: 'Create from Scratch',
    body: 'Work through the sections one at a time. Reorder them, hide the ones you do not need, and regenerate any single section without losing the rest.',
    href: '/prd/new/wizard',
  },
  {
    number: '02',
    title: 'Chat',
    body: 'Describe the product in conversation. The model asks for what is missing and remembers the whole thread, so the PRD comes out the way you explained it.',
    href: '/prd/new/chat',
  },
  {
    number: '03',
    title: 'One-Shot',
    body: 'Paste an idea and its constraints. Get a complete draft in one pass, then regenerate whenever the direction changes.',
    href: '/prd/new/oneshot',
  },
]


export function Landing({
  signedIn,
  isSelfHost,
}: {
  signedIn: boolean
  isSelfHost?: boolean
}) {
  const primaryHref = signedIn ? '/prd/new' : '/register'
  const primaryLabel = signedIn ? 'New PRD' : 'Create an account'

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-4 px-6">
          <Wordmark suffix={isSelfHost ? 'self-hosted' : undefined} />
          <nav className="ml-auto flex items-center gap-1 text-sm">
            <Link
              href="/pricing"
              className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
            {signedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  Dashboard
                </Link>
                <Button asChild size="sm" className="ml-1">
                  <Link href={primaryHref}>New PRD</Link>
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  Log in
                </Link>
                <Button asChild size="sm" className="ml-1">
                  <Link href={primaryHref}>{primaryLabel}</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero: asymmetric, and the right column holds the real artefact. */}
        <section className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
                Product requirements, drafted
              </p>
              <h1 className="text-4xl leading-[1.08] sm:text-5xl">
                Turn a rough idea into a spec an agent can run.
              </h1>
              <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
                Write down what you want to build. Get back a numbered PRD with
                problem, users, features, and acceptance criteria. Every
                regeneration is kept as a revision, so you can diff two versions
                and restore the one you liked.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href={primaryHref}>{primaryLabel}</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/pricing">See the plans</Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Free plan covers {FREE_PLAN_LIMIT} PRDs a month. Pro is ${PRO_PRICE}.
                Bring your own API key either way.
              </p>
            </div>

            <SpecPanel clauses={HERO_CLAUSES} activeIndex={2} />
          </div>
        </section>


        {/* Three ways in: a numbered list, because the numbering carries real
            order. These are ways to work, not filler features. */}
        <section className="border-t bg-surface-sunken">
          <div className="mx-auto w-full max-w-5xl px-6 py-16">
            <div className="max-w-prose space-y-3">
              <h2 className="text-2xl sm:text-3xl">Three ways to start</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Same output, different process. Pick the one that fits how you
                already think about the problem.
              </p>
            </div>

            <ol className="mt-10 divide-y border-y">
              {WAYS_IN.map((way) => (
                <li key={way.number}>
                  <Link
                    href={way.href}
                    className="group flex flex-col gap-3 py-7 transition-colors duration-[120ms] sm:flex-row sm:gap-8"
                  >
                    <span className="font-mono text-xs tabular-nums text-muted-foreground sm:pt-1.5">
                      {way.number}
                    </span>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <h3 className="text-xl leading-snug group-hover:text-primary">
                        {way.title}
                      </h3>
                      <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                        {way.body}
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
        </section>


        {/* Proof: version history is a real capability, so show it working
            instead of claiming it in a badge. */}
        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div className="max-w-prose space-y-3">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
                Revisions
              </p>
              <h2 className="text-2xl sm:text-3xl">
                Change your mind as often as you need
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Each regeneration writes a new version instead of overwriting the
                old one. Compare any two, read the diff line by line, and restore
                whichever revision was better.
              </p>
            </div>

            <div className="overflow-hidden rounded-lg border bg-card">
              <div className="flex items-center justify-between border-b px-4 py-2.5">
                <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
                  prd.md
                </span>
                <Badge variant="secondary">v2 to v3</Badge>
              </div>
              <div className="font-mono text-xs leading-6">
                <div className="flex gap-3 bg-destructive/5 px-4 py-1.5">
                  <span className="select-none text-destructive">-</span>
                  <span className="text-muted-foreground">
                    Users export the report as CSV.
                  </span>
                </div>
                <div className="flex gap-3 bg-success/5 px-4 py-1.5">
                  <span className="select-none text-success">+</span>
                  <span>
                    Users export the report as CSV or as a scheduled email.
                  </span>
                </div>
                <div className="flex gap-3 px-4 py-1.5">
                  <span className="select-none text-muted-foreground"> </span>
                  <span className="text-muted-foreground">
                    Scheduled delivery respects the workspace timezone.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Self-host note, only where it is true. */}
        {!isSelfHost ? (
          <section className="border-t bg-surface-sunken">
            <div className="mx-auto w-full max-w-5xl px-6 py-14">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div className="max-w-prose space-y-2">
                  <h2 className="text-2xl">Run it yourself</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    One compose file, SQLite, no account. Your PRDs and your API
                    key never leave the machine.
                  </p>
                </div>
                <pre className="rounded-md border bg-card px-4 py-2.5 font-mono text-xs">
                  docker compose up -d
                </pre>
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-6 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>PRD GenZ, MIT licensed</span>
          <div className="flex gap-4">
            <Link href="/pricing" className="transition-colors hover:text-foreground">
              Pricing
            </Link>
            {signedIn ? (
              <Link href="/settings" className="transition-colors hover:text-foreground">
                Settings
              </Link>
            ) : (
              <>
                <Link href="/login" className="transition-colors hover:text-foreground">
                  Log in
                </Link>
                <Link href="/register" className="transition-colors hover:text-foreground">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}

