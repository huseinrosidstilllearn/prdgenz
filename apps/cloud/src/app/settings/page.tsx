'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button, Input, Label } from '@prdgenz/ui'
import { FormSection } from '@prdgenz/app'
import { AI_PROVIDERS, testProviderConnection } from '@prdgenz/shared'

const PROVIDER_IDS: string[] = AI_PROVIDERS.map((p) => p.id as string)

interface MaskedKey {
  id: string
  provider: string
  maskedKey: string
  baseUrl?: string | null
  updatedAt: string
}

export default function SettingsPage() {
  const [keys, setKeys] = useState<MaskedKey[]>([])
  const [loading, setLoading] = useState(true)
  const [provider, setProvider] = useState<string>(PROVIDER_IDS[0])
  const [key, setKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/settings/apikey')
    const data = await res.json().catch(() => null)
    setKeys(data?.apiKeys ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function save() {
    setError(null)
    setMessage(null)
    if (key.trim().length < 8) {
      setError('API key must be at least 8 characters.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/settings/apikey', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          key: key.trim(),
          customBaseUrl: baseUrl.trim() ? baseUrl.trim() : undefined,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error ?? 'Failed to save API key.')
      setMessage(
        data?.connectionOk
          ? 'Saved: connection test passed.'
          : 'Saved, but the connection test failed; double-check the key.'
      )
      setKey('')
      setBaseUrl('')
      await load()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(providerId: string) {
    setError(null)
    const res = await fetch(`/api/settings/apikey?provider=${encodeURIComponent(providerId)}`, {
      method: 'DELETE',
    })
    if (!res.ok) setError('Failed to delete key.')
    else setMessage(`Removed ${providerId} key.`)
    await load()
  }

  const selectedNeedsBaseUrl = provider === 'custom'

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <header className="mb-8">
        <p className="mb-2 font-mono text-xs uppercase tracking-wide text-muted-foreground">
          Account
        </p>
        <h1 className="font-display text-3xl leading-tight">Settings</h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Manage your AI provider API keys. Keys are encrypted (AES-256) before
          storage.
        </p>
      </header>

      <FormSection
        title="AI API keys"
        description="Use your own keys: OpenAI, Anthropic, Google, or any OpenAI-compatible aggregator (OmniRoute, TokenRouter, 9Router) or custom endpoint."
      >
        <div className="grid gap-2">
          <Label htmlFor="provider">Provider</Label>
          <select
            id="provider"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {AI_PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="apikey">API key</Label>
          <Input
            id="apikey"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-… / paste provider key"
            autoComplete="off"
          />
        </div>

        {selectedNeedsBaseUrl ? (
          <div className="grid gap-2">
            <Label htmlFor="baseurl">Base URL (required for Custom)</Label>
            <Input
              id="baseurl"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://your-provider.example.com/v1"
            />
          </div>
        ) : null}
        {baseUrl && !selectedNeedsBaseUrl ? (
          <div className="grid gap-2">
            <Label htmlFor="baseurl-override">Custom base URL override (optional)</Label>
            <Input
              id="baseurl-override"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://proxy.example.com/v1"
            />
          </div>
        ) : null}

        <Button onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save and test connection'}
        </Button>
        {message ? <p className="text-sm text-primary">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </FormSection>

      <FormSection title="Configured keys" className="mt-10">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : keys.length === 0 ? (
          <p className="text-sm text-muted-foreground">No keys configured yet.</p>
        ) : (
          <ul className="divide-y border-y">
            {keys.map((k) => (
              <li
                key={k.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium capitalize">{k.provider}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {k.maskedKey}
                    {k.baseUrl ? ` · ${k.baseUrl}` : ''}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => remove(k.provider)}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </FormSection>
    </div>
  )
}

