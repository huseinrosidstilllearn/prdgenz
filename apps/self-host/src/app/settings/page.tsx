import Link from 'next/link'
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, ThemeToggle } from '@prdgenz/ui'
import { AI_PROVIDERS } from '@prdgenz/shared'
import { configuredProviderIds } from '@/lib/env'

const ENV_NAMES: Record<string, string> = {
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  google: 'GOOGLE_API_KEY',
  omniroute: 'OMNIROUTE_API_KEY',
  tokenrouter: 'TOKENROUTER_API_KEY',
  '9router': '9ROUTER_API_KEY',
  custom: 'CUSTOM_API_KEY (+ CUSTOM_BASE_URL)',
}

/** Self-host settings: read-only provider status from env (PRD §6.2.2). */
export default function SettingsPage() {
  const configured = configuredProviderIds()

  return (
    <div className="container max-w-2xl space-y-8 py-10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Self-hosted keys are configured via environment variables (e.g.{' '}
            <code className="rounded bg-muted px-1">.env</code> or{' '}
            <code className="rounded bg-muted px-1">docker-compose.yml</code>).
          </p>
        </div>
        <ThemeToggle />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Providers</CardTitle>
          <CardDescription>
            Set the matching environment variable and restart the app to enable a provider.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {AI_PROVIDERS.map((p) => {
              const ok = configured.includes(p.id)
              return (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {p.name}{' '}
                      <span className="text-xs font-normal text-muted-foreground">({p.type})</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <code className="rounded bg-muted px-1">{ENV_NAMES[p.id] ?? p.id}</code>
                    </p>
                  </div>
                  <Badge variant={ok ? 'default' : 'secondary'}>
                    {ok ? 'configured' : 'not set'}
                  </Badge>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Storage</CardTitle>
          <CardDescription>
            All PRDs live in a local SQLite file — back it up by copying the mounted{' '}
            <code className="rounded bg-muted px-1">/data</code> volume.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Database URL is set via <code className="rounded bg-muted px-1">DATABASE_URL</code>.
          </p>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        <Link href="/" className="underline underline-offset-4">
          ← Back to your PRDs
        </Link>
      </p>
    </div>
  )
}
