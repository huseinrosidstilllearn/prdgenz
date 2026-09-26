import { Wordmark } from './wordmark'

/**
 * Centred single-column layout for sign-in and registration. Narrow on
 * purpose: these are two fields, and a wide card would imply a wide form.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Wordmark />
          <h1 className="mt-4 font-display text-2xl">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="spec-rule space-y-4 pl-5">{children}</div>
        {footer ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
        ) : null}
      </div>
    </div>
  )
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
  title: string
  description?: string
  children: React.ReactNode
  className?: string
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
  )
}
