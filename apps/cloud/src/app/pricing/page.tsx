import Link from 'next/link'
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@prdgenz/ui'
import { Button } from '@prdgenz/ui'
import { FREE_PLAN_LIMIT, PRO_PRICE } from '@prdgenz/shared'

/** Public pricing page (PRD §9.2, §14). */
export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      cadence: 'forever',
      features: [
        `${FREE_PLAN_LIMIT} PRDs per 30 days`,
        'Wizard, Chat & One-Shot modes',
        'Markdown + AI-prompt export',
        '1 project',
        'Bring your own API key',
      ],
      cta: { href: '/register', label: 'Start for Free' },
      highlight: false,
    },
    {
      name: 'Pro',
      price: `$${PRO_PRICE}`,
      cadence: 'per month',
      features: [
        'Unlimited PRDs',
        'PDF export',
        'Share links (view-only)',
        'Unlimited projects',
        'Version history & restore',
        'Priority support',
      ],
      cta: { href: '/register', label: 'Go Pro' },
      highlight: true,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="text-lg font-bold">
            PRD GenZ
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-muted-foreground hover:text-foreground">
              Login
            </Link>
            <Button asChild size="sm">
              <Link href="/register">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container flex-1 py-20">
        <h1 className="mb-3 text-center text-4xl font-bold">Simple pricing</h1>
        <p className="mb-12 text-center text-muted-foreground">
          Start free. Upgrade when you need more.
        </p>
        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.highlight ? 'border-primary shadow-lg' : undefined}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  {plan.highlight && <Badge>Popular</Badge>}
                </div>
                <div className="pt-2">
                  <span className="text-4xl font-bold">{plan.price}</span>{' '}
                  <span className="text-sm text-muted-foreground">{plan.cadence}</span>
                </div>
                <CardDescription>&nbsp;</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-primary">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full" variant={plan.highlight ? 'default' : 'outline'}>
                  <Link href={plan.cta.href}>{plan.cta.label}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Prefer full control? Run the open-source self-hosted version with Docker —
          free forever, no account needed.
        </p>
      </main>
    </div>
  )
}
