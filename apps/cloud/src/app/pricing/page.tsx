import Link from 'next/link'
import { Wordmark } from '@prdgenz/app'
import { Button } from '@prdgenz/ui'
import { FREE_PLAN_LIMIT, PRO_PRICE } from '@prdgenz/shared'

/** Public pricing page (PRD 9.2 and 14). */
export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      cadence: 'forever',
      cta: { href: '/register', label: 'Start free' },
      highlight: false,
    },
    {
      name: 'Pro',
      price: `$${PRO_PRICE}`,
      cadence: 'per month (planned)',
      cta: null,
      highlight: true,
    },
  ]

  // Rows are real capabilities from the PRD, not filler bullet points.
  const featureMatrix = [
    { label: 'PRDs per 30 days', values: [`${FREE_PLAN_LIMIT}`, 'Unlimited'] },
    { label: 'Projects', values: ['1', 'Unlimited'] },
    { label: 'Generation modes', values: ['All three', 'All three'] },
    { label: 'Your own API key', values: ['Yes', 'Yes'] },
    { label: 'Version history and restore', values: ['Yes', 'Yes'] },
    { label: 'PDF export', values: ['', 'Yes'] },
    { label: 'Share links', values: ['View only', 'View only'] },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-4 px-6">
          <Wordmark />
          <nav className="ml-auto flex items-center gap-1 text-sm">
            <Link
              href="/login"
              className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              Log in
            </Link>
            <Button asChild size="sm" className="ml-1">
              <Link href="/register">Start free</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto w-full max-w-3xl px-6 py-16">
          <header className="max-w-prose space-y-3">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
              Pricing
            </p>
            <h1 className="text-4xl leading-tight sm:text-5xl">
              Start with the Free plan.
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Both plans bring your own API key, so you are never billed for
              model usage by us.
            </p>
          </header>

          {/* A table, not two floating cards: the reader is comparing rows. */}
          <table className="mt-12 w-full border-collapse text-sm">
            <caption className="sr-only">Plan comparison</caption>
            <thead>
              <tr className="border-y">
                <th scope="col" className="py-3 pr-4 text-left font-normal">
                  <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
                    Plan
                  </span>
                </th>
                {plans.map((plan) => (
                  <th
                    key={plan.name}
                    scope="col"
                    className="w-40 py-3 text-left font-normal align-top"
                  >
                    <span className="block text-lg">{plan.name}</span>
                    <span className="mt-1 block font-mono text-xs tabular-nums text-muted-foreground">
                      {plan.price} {plan.cadence}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureMatrix.map((row) => (
                <tr key={row.label} className="border-b">
                  <th
                    scope="row"
                    className="py-3 pr-4 text-left font-normal text-muted-foreground"
                  >
                    {row.label}
                  </th>
                  {row.values.map((value, i) => (
                    <td key={i} className="py-3 align-top">
                      {value ? (
                        <span className="text-foreground">{value}</span>
                      ) : (
                        <span
                          className="text-muted-foreground"
                          aria-label="Not included"
                        >
                          Not included
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td />
                {plans.map((plan) => (
                  <td key={plan.name} className="py-4 align-top">
                    {plan.cta ? (
                      <Button
                        asChild
                        className="w-full"
                        variant={plan.highlight ? 'default' : 'outline'}
                      >
                        <Link href={plan.cta.href}>{plan.cta.label}</Link>
                      </Button>
                    ) : (
                      <p className="text-muted-foreground">
                        Pro upgrades are not available yet.
                      </p>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          <p className="mt-8 max-w-prose text-sm leading-relaxed text-muted-foreground">
            Prefer to keep everything on your own machine? The self-hosted build
            is free forever and needs no account.
          </p>
        </section>
      </main>
    </div>
  )
}
