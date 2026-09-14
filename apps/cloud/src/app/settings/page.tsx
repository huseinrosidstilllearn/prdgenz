'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@prdgenz/ui'
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
    <div className="container max-w-2xl space-y-8 py-10">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your AI provider API keys. Keys are encrypted (AES-256) before storage.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI API Keys</CardTitle>
          <CardDescription>
            Use your own keys: OpenAI, Anthropic, Google, or any OpenAI-compatible aggregator
            (OmniRoute, TokenRouter, 9Router) or custom endpoint.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="provider">Provider</Label>
              <select
                id="provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {AI_PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="apikey">API Key</Label>
              <Input
                id="apikey"
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="sk-… / paste provider key"
                autoComplete="off"
              />
            </div>

            {selectedNeedsBaseUrl && (
              <div className="grid gap-2">
                <Label htmlFor="baseurl">Base URL (required for Custom)</Label>
                <Input
                  id="baseurl"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://your-provider.example.com/v1"
                />
              </div>
            )}
            {baseUrl && !selectedNeedsBaseUrl && (
              <div className="grid gap-2">
                <Label htmlFor="baseurl-override">Custom Base URL override (optional)</Label>
                <Input
                  id="baseurl-override"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://proxy.example.com/v1"
                />
              </div>
            )}

            <Button onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save & Test Connection'}
            </Button>
            {message && <p className="text-sm text-primary">{message}</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Configured keys</h3>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : keys.length === 0 ? (
              <p className="text-sm text-muted-foreground">No keys configured yet.</p>
            ) : (
              <ul className="space-y-2">
                {keys.map((k) => (
                  <li
                    key={k.id}
                    className="flex items-center justify-between gap-2 rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium capitalize">{k.provider}</p>
                      <p className="text-xs text-muted-foreground">
                        {k.maskedKey}
                        {k.baseUrl ? ` · ${k.baseUrl}` : ''}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => remove(k.provider)}>
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

