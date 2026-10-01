import { Wordmark } from "./wordmark";

/** The clauses on the brand panel: the shape of the artefact, in miniature. */
const PANEL_CLAUSES = [
  { number: "01", title: "Problem" },
  { number: "02", title: "Target user" },
  { number: "03", title: "Features" },
  { number: "04", title: "Acceptance criteria" },
];

/**
 * Split-screen layout for sign-in and registration: the brand panel carries
 * the document motif on a dark surface, the form sits alone on paper. The
 * form fields are deliberately not wrapped in the margin rule — a rule needs
 * a document around it to mean something.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel: the artefact, not a tagline. Hidden where it would
          crowd the form. */}
      <aside className="relative hidden flex-col justify-between border-r bg-foreground px-10 py-10 text-background lg:flex xl:px-16">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-baseline gap-1.5 text-lg leading-none">
            <span className="font-display">PRD</span>
            <span className="font-mono text-[0.8em] font-medium tracking-tight text-primary">
              GenZ
            </span>
          </span>
          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] opacity-60">
            prd.md
          </span>
        </div>

        <div className="max-w-md space-y-5">
          <h2 className="font-display text-3xl leading-tight xl:text-4xl">
            Turn a rough idea into a spec an agent can run.
          </h2>
          <p className="text-sm leading-relaxed opacity-70">
            Numbered sections, acceptance criteria, and a revision history you
            can diff. Drafted with your own model key.
          </p>
          <ol>
            {PANEL_CLAUSES.map((clause) => (
              <li
                key={clause.number}
                className="flex items-baseline gap-4 border-t border-current/15 py-2 text-sm first:border-t-0"
              >
                <span className="w-7 text-right font-mono text-[0.6875rem] tabular-nums opacity-60">
                  {clause.number}
                </span>
                {clause.title}
              </li>
            ))}
          </ol>
        </div>

        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] opacity-50">
          Free plan covers 10 PRDs a month
        </p>
      </aside>

      {/* Form panel: quiet on purpose. */}
      <main className="flex items-center justify-center px-4 py-16 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Wordmark />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8 space-y-4">{children}</div>
          {footer ? (
            <p className="mt-6 text-sm text-muted-foreground">{footer}</p>
          ) : null}
        </div>
      </main>
    </div>
  );
}

/**
 * A titled block of settings. Replaces the stacked Cards: one hairline panel
 * per group, so the page reads as a form with sections rather than a set of
 * floating boxes.
 */
export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <h2 className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
