import Link from 'next/link'
import { Button, ThemeToggle } from '@prdgenz/ui'
import { FREE_PLAN_LIMIT, PRO_PRICE } from '@prdgenz/shared'

const FEATURES = [
  {
    title: 'Wizard Mode',
    description:
      'Structured multi-step form guiding you from raw idea to complete PRD, one section at a time.',
  },
  {
    title: 'Chat Mode',
    description:
      'Conversational flow where the AI asks clarifying questions and remembers full context.',
  },
  {
    title: 'One-Shot Mode',
    description: 'Paste your idea, get a complete professional PRD instantly. One input, one output.',
  },
  {
    title: 'Bring Your Own Key',
    description:
      'Use your own OpenAI, Anthropic, Google, or aggregator API key. Your data, your control.',
  },
  {
    title: 'AI-Ready Output',
    description:
      'Exports designed for AI coding workflows — feed straight into Cline, Cursor, or Lovable.',
  },
  {
    title: 'Version History',
    description: 'Every regeneration creates a version. Compare and restore any previous PRD.',
  },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="text-lg font-bold">
            PRD GenZ
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground">
              Login
            </Link>
            <ThemeToggle />
            <Button asChild size="sm">
              <Link href="/register">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="container flex flex-col items-center gap-6 py-24 text-center">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Turn raw ideas into{' '}
            <span className="bg-gradient-to-r from-primary to-muted-foreground bg-clip-text text-transparent">
              production-ready PRDs
            </span>{' '}
            in minutes
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            AI-powered Product Requirements Documents built for modern AI coding workflows —
            wizard, chat, or one-shot. Cloud or self-hosted.
          </p>
          <div className="flex gap-4">
            <Button asChild size="lg">
              <Link href="/register">Start for Free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {FREE_PLAN_LIMIT} PRDs/month free · Upgrade to Pro for ${PRO_PRICE}/month
          </p>
        </section>

        <section className="border-t bg-muted/40 py-20">
          <div className="container">
            <h2 className="mb-10 text-center text-3xl font-semibold">Features</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="rounded-xl border bg-card p-6 shadow-sm">
                  <h3 className="mb-2 font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container py-20 text-center">
          <h2 className="mb-4 text-3xl font-semibold">Self-host for full control</h2>
          <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
            Run the entire app on your own infrastructure with Docker Compose. SQLite storage,
            no accounts, your API keys stay on your machine.
          </p>
          <pre className="mx-auto w-fit rounded-lg border bg-muted/50 p-4 text-sm">
            docker compose up -d
          </pre>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-2 text-sm text-muted-foreground sm:flex-row">
          <span>© 2026 PRD GenZ. MIT License.</span>
          <div className="flex gap-4">
            <Link href="/pricing" className="hover:text-foreground">
              Pricing
            </Link>
            <Link href="/login" className="hover:text-foreground">
              Login
            </Link>
            <Link href="/register" className="hover:text-foreground">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
