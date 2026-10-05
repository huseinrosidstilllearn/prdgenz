import Link from 'next/link'
import { Button, Icon } from '@prdgenz/ui'
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
    <section aria-label="Getting started" className="workspace-start grid overflow-hidden rounded-2xl border bg-card md:grid-cols-[1.05fr_1fr]">
      <div className="workspace-start-copy p-6 sm:p-9">
        <p className="mb-3 text-sm font-medium text-muted-foreground">Your first product brief</p>
        <h2 className="max-w-md text-3xl font-medium leading-tight tracking-tight sm:text-4xl">Start with the idea.<br />Make the decisions clear.</h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">Turn the problem, users, and constraints into a document you can review and revise.</p>
        <ol className="workspace-setup mt-7 space-y-3">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-4 rounded-xl border bg-background/50 p-4">
              <span className="setup-icon"><Icon name={step.complete ? 'check' : index === 0 ? 'key' : step.href === '#projects' ? 'layers' : 'document'} className="h-5 w-5" /></span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-sans text-sm font-medium">{step.title}</h3>
                  {step.complete ? <span className="text-xs text-muted-foreground">Done</span> : null}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                <Link href={step.href} className="mt-2 inline-flex min-h-8 items-center text-sm font-medium underline decoration-border-strong underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{step.action}</Link>
              </div>
            </li>
          ))}
        </ol>
        <Button asChild className="mt-6"><Link href="/prd/new"><Icon name="plus" />Create your first PRD</Link></Button>
      </div>
      <div className="workspace-example border-t bg-surface-sunken p-6 sm:p-9 md:border-l md:border-t-0">
        <div className="mb-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="text-sm">What you will write</span>
          <span className="rounded-md border px-2 py-1">Example PRD</span>
        </div>
        <article className="example-document rounded-xl border bg-card p-5 sm:p-7" aria-label="Example product requirements document">
          <div className="mb-6 flex items-center gap-2 border-b pb-4 text-sm text-muted-foreground"><Icon name="document" />Product requirements</div>
          <h3 className="mt-2 text-2xl font-medium tracking-tight">Coffee shop ordering</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">An example of a brief with a focused first release.</p>
          <div className="mt-6 space-y-5">
            {EXAMPLE_SECTIONS.map((section) => (
              <section key={section.title} className="example-section">
                <h4 className="font-sans text-sm font-medium">{section.title}</h4>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{section.text}</p>
              </section>
            ))}
          </div>
        </article>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Your draft can be in English or Bahasa Indonesia. Edit it, save versions, and export when it is ready.</p>
      </div>
    </section>
  )
}
