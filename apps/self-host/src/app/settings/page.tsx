import Link from 'next/link'
import { ThemeToggle } from '@prdgenz/ui'
import { FormSection } from '@prdgenz/app'
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

function Code({ children }: { children: string }) {
  return (
    <code className="rounded bg-muted px-1 font-mono text-[0.8em]">{children}</code>
  )
}

/** Self-host settings: read-only provider status from env (PRD §6.2.2). */
export default function SettingsPage() {
  const configured = configuredProviderIds()

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-wide text-muted-foreground">
            Instance
          </p>
          <h1 className="font-display text-3xl leading-tight">Settings</h1>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
            Self-hosted keys are configured via environment variables, in{' '}
            <Code>.env</Code> or <Code>docker-compose.yml</Code>.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <FormSection
        title="AI providers"
        description="Set the matching environment variable and restart the app to enable a provider."
      >
        <ul className="divide-y border-y">
          {AI_PROVIDERS.map((p) => {
            const ok = configured.includes(p.id)
            return (
              <li
                key={p.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {p.name}{' '}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({p.type})
                    </span>
                  </p>
                  <p className="mt-0.5 truncate text-muted-foreground">
                    <Code>{ENV_NAMES[p.id] ?? p.id}</Code>
                  </p>
                </div>
                {/* Status is the only place a semantic colour is allowed here:
                    it is a real state, not decoration. */}
                <span
                  className={
                    ok
                      ? 'font-mono text-xs text-primary'
                      : 'font-mono text-xs text-muted-foreground'
                  }
                >
                  {ok ? 'configured' : 'not set'}
                </span>
              </li>
            )
          })}
        </ul>
      </FormSection>

      <FormSection
        title="Storage"
        className="mt-10"
        description="All PRDs live in a local SQLite file. Back it up by copying the mounted /data volume."
      >
        <p className="text-sm text-muted-foreground">
          Database URL is set via <Code>DATABASE_URL</Code>.
        </p>
      </FormSection>

      <p className="mt-10 text-sm text-muted-foreground">
        <Link href="/" className="underline underline-offset-4">
          Back to your PRDs
        </Link>
      </p>
    </div>
  )
}

