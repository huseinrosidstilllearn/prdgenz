import Link from 'next/link'
import { Button } from '@prdgenz/ui'

const EXAMPLE_SECTIONS = [
  { title: 'Problem', text: 'Customers wait in line to order, while staff track orders on paper.' },
  { title: 'Users', text: 'Customers placing an order. Baristas preparing and completing it.' },
  { title: 'Scope', text: 'Browse the menu, submit an order, and follow its status. Payments are out of scope.' },
  { title: 'Acceptance criteria', text: 'A submitted order appears in the barista queue with its items and status.' },
]

export function WorkspaceStart({ providerConfigured, hasProject }: {
  providerConfigured: boolean
  /** Undefined on self-host, which has no projects. */
  hasProject?: boolean
}) {
  const steps = [
    { title: 'Add your AI provider', description: providerConfigured ? 'An API key is configured. You can choose its provider when you create a PRD.' : 'Bring your own API key to generate a draft.', complete: providerConfigured, href: '/settings', action: providerConfigured ? 'Manage providers' : 'Add API key' },
    ...(hasProject === undefined ? [] : [{ title: 'Give it a project', description: hasProject ? 'Your project is ready to hold related documents.' : 'Create a project below to keep related PRDs together.', complete: hasProject, href: '#projects', action: hasProject ? 'View projects' : 'Create a project' }]),
    { title: 'Write your first PRD', description: 'Start with an idea, answer questions, or work section by section.', complete: false, href: '/prd/new', action: 'Choose a writing mode' },
  ]

  return (
    <section aria-label="Getting started" className="grid overflow-hidden rounded-lg border bg-card md:grid-cols-[1.2fr_1fr]">
      <div className="p-5 sm:p-7">
        <p className="mb-3 font-mono text-xs text-muted-foreground">Your first product brief</p>
        <h2 className="max-w-sm text-2xl leading-tight sm:text-3xl">Start with the idea.<br />Make the decisions clear.</h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">Turn the problem, users, and constraints into a document you can review and revise.</p>
        <ol className="mt-6 divide-y">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-3 py-4">
              <span className="pt-0.5 font-mono text-xs text-muted-foreground" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-sans text-sm font-semibold">{step.title}</h3>
                  {step.complete ? <span className="text-xs text-muted-foreground">Done</span> : null}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.description}</p>
                <Link href={step.href} className="mt-2 inline-flex min-h-8 items-center text-xs font-medium underline decoration-border-strong underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{step.action}</Link>
              </div>
            </li>
          ))}
        </ol>
        <Button asChild className="mt-3"><Link href="/prd/new">Create your first PRD</Link></Button>
      </div>
      <div className="border-t bg-surface-sunken p-5 sm:p-7 md:border-l md:border-t-0">
        <div className="mb-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="font-mono">What you will write</span>
          <span>Example PRD</span>
        </div>
        <article className="rounded-md border bg-background p-4 sm:p-5" aria-label="Example product requirements document">
          <p className="font-mono text-[0.6875rem] text-muted-foreground">Product requirements</p>
          <h3 className="mt-2 text-xl">Coffee shop ordering</h3>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">An example of a brief with a focused first release.</p>
          <div className="mt-5 space-y-4">
            {EXAMPLE_SECTIONS.map((section, index) => (
              <section key={section.title} className="spec-rule">
                <span className="clause-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <h4 className="font-sans text-xs font-semibold">{section.title}</h4>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{section.text}</p>
              </section>
            ))}
          </div>
        </article>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Your draft can be in English or Bahasa Indonesia. Edit it, save versions, and export when it is ready.</p>
      </div>
    </section>
  )
}
