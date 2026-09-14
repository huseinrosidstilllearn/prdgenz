import Link from 'next/link'
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@prdgenz/ui'
import { Button, ThemeToggle } from '@prdgenz/ui'
import { FREE_PLAN_LIMIT, PRO_PRICE } from '@prdgenz/shared'

/** Public pricing page (PRD Â§9.2, Â§14). */
export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      cadence: 'forever',
      features: [
        `${FREE_PLAN_LIMIT} PRDs per 30 days`,
        'Create from Scratch, Chat & One-Shot modes',
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
      {/* Sticky blurred header: same treatment as landing */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between px-2 sm:px-3">
          <Link href="/" className="font-heading text-lg font-bold tracking-tight">
            prd<span className="text-primary">genz</span>
          </Link>
          <nav className="flex items-center gap-2 text-sm sm:gap-4">
            <Link
              href="/login"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Login
            </Link>
            <ThemeToggle />
            <Button asChild size="sm">
              <Link href="/register">Mulai Gratis</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container flex-1 py-20">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <div className="flex justify-center">
            <div className="flex items-center gap-3 rounded-full border bg-card px-4 py-1.5 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                Pricing
              </span>
              <span className="h-4 w-px bg-border opacity-60" aria-hidden="true" />
              <span className="text-xs font-medium text-muted-foreground">
                Gratis buat mulai, Pro kalau butuh lebih
              </span>
            </div>
          </div>
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Harga sederhana, tanpa drama
          </h1>
          <p className="text-muted-foreground">
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.highlight ? 'border-primary shadow-lg' : undefined}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-heading text-xl">{plan.name}</CardTitle>
                  {plan.highlight && <Badge>Popular</Badge>}
                </div>
                <div className="pt-2">
                  <span className="font-heading text-4xl font-bold tabular-nums">
                    {plan.price}
                  </span>{' '}
                  <span className="text-sm text-muted-foreground">{plan.cadence}</span>
                </div>
                <CardDescription>&nbsp;</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-primary">âœ“</span>
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
          Prefer full control? Run the open-source self-hosted version with Docker : 
          free forever, no account needed.
        </p>
      </main>
    </div>
  )
}
