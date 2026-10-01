import Link from "next/link";
import { FREE_PLAN_LIMIT, PRO_PRICE } from "@prdgenz/shared";
import { Badge, Button } from "@prdgenz/ui";
import { Wordmark } from "../shell/wordmark";
import { SpecPanel } from "./spec-panel";

/**
 * The clauses the AI actually writes, numbered the way the output is numbered.
 * Nothing here is invented: this mirrors the real PRD section list.
 */
const HERO_CLAUSES = [
  { number: "01", title: "Problem", lines: 12 },
  { number: "02", title: "Target user", lines: 10 },
  { number: "03", title: "Features", lines: 13 },
  { number: "04", title: "Acceptance criteria", lines: 11 },
  { number: "05", title: "Out of scope", lines: 8 },
];

/** Three different workflows, so they read as a list of choices rather than
 *  three identical feature tiles. The numbering carries real order. */
const WAYS_IN = [
  {
    number: "01",
    title: "Create from Scratch",
    body: "Work through the sections one at a time. Reorder them, hide the ones you do not need, and regenerate any single section without losing the rest.",
    href: "/prd/new/wizard",
  },
  {
    number: "02",
    title: "Chat",
    body: "Describe the product in conversation. The model asks for what is missing and remembers the whole thread, so the PRD comes out the way you explained it.",
    href: "/prd/new/chat",
  },
  {
    number: "03",
    title: "One-Shot",
    body: "Paste an idea and its constraints. Get a complete draft in one pass, then regenerate whenever the direction changes.",
    href: "/prd/new/oneshot",
  },
];

export function Landing({
  signedIn,
  isSelfHost,
}: {
  signedIn: boolean;
  isSelfHost?: boolean;
}) {
  const primaryHref = signedIn ? "/prd/new" : "/register";
  const primaryLabel = signedIn ? "New PRD" : "Create an account";

  return (
    <div className="flex min-h-screen flex-col">
      {/* First focusable element on the landing page: keyboard users skip the nav. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-6">
          <Wordmark />
          <nav className="ml-auto flex items-center gap-1 text-sm">
            <Link
              href="/pricing"
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-muted-foreground transition-colors duration-[120ms] hover:text-foreground"
            >
              Pricing
            </Link>
            {signedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="whitespace-nowrap rounded-md px-3 py-1.5 text-muted-foreground transition-colors duration-[120ms] hover:text-foreground"
                >
                  Dashboard
                </Link>
                <Button asChild size="sm" className="ml-2">
                  <Link href={primaryHref}>New PRD</Link>
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="whitespace-nowrap rounded-md px-3 py-1.5 text-muted-foreground transition-colors duration-[120ms] hover:text-foreground"
                >
                  Log in
                </Link>
                <Button asChild size="sm" className="ml-2">
                  <Link href={primaryHref}>{primaryLabel}</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {/* Hero: the accent gets one band of soft wash to anchor the page, and
            the right column holds the real artefact mid-generation. */}
        <section className="border-b bg-[color-mix(in_oklab,var(--primary-soft)_45%,var(--background))]">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
            <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-7">
                <p className="flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
                  <span
                    aria-hidden="true"
                    className="inline-block size-1.5 rounded-[2px] bg-primary"
                  />
                  Product requirements, drafted
                </p>
                <h1 className="font-display text-5xl leading-[1.04] tracking-[-0.01em] sm:text-6xl">
                  Turn a rough idea into a spec an agent can run.
                </h1>
                <p className="max-w-prose text-lg leading-relaxed text-muted-foreground">
                  Write down what you want to build. Get back a numbered PRD
                  with problem, users, features, and acceptance criteria. Every
                  regeneration is kept as a revision, so you can diff two
                  versions and restore the one you liked.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button asChild size="lg">
                    <Link href={primaryHref}>{primaryLabel}</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/pricing">See the plans</Link>
                  </Button>
                </div>
                <p className="font-mono text-xs tabular-nums text-muted-foreground">
                  Free · {FREE_PLAN_LIMIT} PRDs/mo · Pro ${PRO_PRICE}/mo · BYOK
                </p>
              </div>

              <SpecPanel clauses={HERO_CLAUSES} activeIndex={2} />
            </div>
          </div>
        </section>

        {/* Three ways in: the signature margin rule carries the numbering, the
            way it does inside a real PRD. */}
        <section className="border-b">
          <div className="mx-auto w-full max-w-6xl px-6 py-20">
            <div className="max-w-prose space-y-3">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
                Workflows
              </p>
              <h2 className="font-display text-3xl sm:text-4xl">
                Three ways to start
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                Same output, different process. Pick the one that fits how you
                already think about the problem.
              </p>
            </div>

            <ol className="mt-12">
              {WAYS_IN.map((way) => (
                <li
                  key={way.number}
                  className="spec-rule border-t first:border-t-0"
                >
                  <Link
                    href={way.href}
                    className="group flex flex-col gap-2 py-8 transition-colors duration-[120ms] sm:flex-row sm:items-baseline sm:gap-10"
                  >
                    <h3 className="min-w-0 flex-1 text-2xl leading-snug transition-colors duration-[120ms] group-hover:text-primary sm:text-3xl">
                      {way.title}
                    </h3>
                    <p className="max-w-prose flex-1 text-sm leading-relaxed text-muted-foreground">
                      {way.body}
                    </p>
                    <span
                      aria-hidden="true"
                      className="hidden shrink-0 font-mono text-sm text-muted-foreground transition-colors duration-[120ms] group-hover:text-primary sm:block"
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Proof: version history is a real capability, so show it working
            instead of claiming it in a badge. */}
        <section className="border-b bg-surface-sunken">
          <div className="mx-auto w-full max-w-6xl px-6 py-20">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
              <div className="max-w-prose space-y-4">
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
                  Revisions
                </p>
                <h2 className="font-display text-3xl sm:text-4xl">
                  Change your mind as often as you need
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  Each regeneration writes a new version instead of overwriting
                  the old one. Compare any two, read the diff line by line, and
                  restore whichever revision was better.
                </p>
              </div>

              <div className="overflow-hidden rounded-lg border bg-card">
                <div className="flex items-center justify-between border-b px-4 py-2.5">
                  <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
                    prd.md · diff
                  </span>
                  <Badge variant="secondary">v2 to v3</Badge>
                </div>
                <div className="space-y-6 p-5">
                  <div className="space-y-3">
                    <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
                      04 · Acceptance criteria
                    </p>
                    <div className="overflow-hidden rounded-md border font-mono text-xs leading-6">
                      <div className="flex gap-3 bg-destructive/5 px-4 py-1.5">
                        <span className="select-none text-destructive">-</span>
                        <span className="text-muted-foreground">
                          Users export the report as CSV.
                        </span>
                      </div>
                      <div className="flex gap-3 bg-success/5 px-4 py-1.5">
                        <span className="select-none text-success">+</span>
                        <span>
                          Users export the report as CSV or as a scheduled
                          email.
                        </span>
                      </div>
                      <div className="flex gap-3 border-t px-4 py-1.5">
                        <span className="select-none text-muted-foreground">
                          {" "}
                        </span>
                        <span className="text-muted-foreground">
                          Scheduled delivery respects the workspace timezone.
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button asChild size="sm" variant="outline">
                      <Link href={signedIn ? "/dashboard" : "/register"}>
                        Open the diff view
                      </Link>
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Then restore whichever revision was better.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Self-host note, only where it is true. */}
        {!isSelfHost ? (
          <section>
            <div className="mx-auto w-full max-w-6xl px-6 py-20">
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div className="max-w-prose space-y-4">
                  <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
                    Self-host
                  </p>
                  <h2 className="font-display text-3xl sm:text-4xl">
                    Run it yourself
                  </h2>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    One compose file, SQLite, no account. Your PRDs and your API
                    key never leave the machine.
                  </p>
                </div>
                <div className="overflow-hidden rounded-lg border bg-card">
                  <div className="flex items-center justify-between border-b px-4 py-2.5">
                    <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
                      terminal
                    </span>
                    <span className="font-mono text-[0.625rem] text-muted-foreground">
                      sqlite · mit
                    </span>
                  </div>
                  <pre className="overflow-x-auto px-5 py-4 font-mono text-xs leading-6">
                    <span className="select-none text-muted-foreground">
                      ${" "}
                    </span>
                    docker compose up -d
                    {"\n"}
                    <span className="select-none text-muted-foreground">
                      ${" "}
                    </span>
                    <span className="text-muted-foreground">
                      # open http://localhost:3000
                    </span>
                  </pre>
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <footer className="border-t">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 sm:grid-cols-[1.5fr_1fr_1fr]">
          <div className="space-y-2">
            <Wordmark />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              A drafting table for product requirements. MIT licensed.
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
              Product
            </p>
            <div className="flex flex-col items-start gap-1.5">
              <Link
                href="/pricing"
                className="text-muted-foreground transition-colors duration-[120ms] hover:text-foreground"
              >
                Pricing
              </Link>
              {signedIn ? (
                <Link
                  href="/settings"
                  className="text-muted-foreground transition-colors duration-[120ms] hover:text-foreground"
                >
                  Settings
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-muted-foreground transition-colors duration-[120ms] hover:text-foreground"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="text-muted-foreground transition-colors duration-[120ms] hover:text-foreground"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
              Get started
            </p>
            <div className="flex flex-col items-start gap-1.5">
              <Link
                href={primaryHref}
                className="text-muted-foreground transition-colors duration-[120ms] hover:text-foreground"
              >
                {primaryLabel}
              </Link>
              {!isSelfHost ? (
                <span className="text-muted-foreground">
                  Or self-host with one compose file.
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
