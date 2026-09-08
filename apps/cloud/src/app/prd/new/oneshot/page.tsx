'use client'

import { useRef, useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Textarea,
} from '@prdgenz/ui'
import type { PRDContent } from '@prdgenz/shared'
import { useGenerationSetup } from '@/hooks/use-generation-setup'

export default function OneShotPage() {
  const setup = useGenerationSetup()
  const [idea, setIdea] = useState('')
  const [constraints, setConstraints] = useState('')
  const [projectId, setProjectId] = useState('')
  const [generating, setGenerating] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [chars, setChars] = useState(0)
  const [result, setResult] = useState<PRDContent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const ready = idea.trim().length >= 10

  async function generate() {
    if (!ready) return
    setError(null)
    setResult(null)
    setStreamText('')
    setChars(0)
    setGenerating(true)
    const abort = new AbortController()
    abortRef.current = abort
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abort.signal,
        body: JSON.stringify({
          language: setup.language,
          mode: 'ONESHOT',
          provider: setup.provider,
          model: setup.model,
          projectId: projectId || undefined,
          input: { idea, constraints: constraints || undefined },
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Generation failed')
      }
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''
        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith('data:')) continue
          const evt = JSON.parse(line.slice(5).trim())
          if (evt.type === 'delta') {
            setStreamText((t) => t + evt.text)
            setChars((c) => c + evt.text.length)
          } else if (evt.type === 'done') {
            setResult(evt.content as PRDContent)
            setStreamText('')
            if (evt.saved?.prdId) {
              setTimeout(() => (window.location.href = `/prd/${evt.saved.prdId}`), 900)
            }
          } else if (evt.type === 'error') {
            throw new Error(evt.error)
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setError((e as Error).message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="container max-w-2xl py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">One-Shot Mode</h1>
        <p className="text-sm text-muted-foreground">
          One input, one complete PRD. Paste your idea and go.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your idea</CardTitle>
          <CardDescription>
            Minimum 10 characters. The more context, the better the PRD.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {setup.config}

          <div className="space-y-2">
            <Label htmlFor="idea">Idea / Problem *</Label>
            <Textarea
              id="idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g. A web app that lets Indonesian freelance developers generate professional PRDs from raw ideas using their own AI API keys, with Docker-based self-hosting support…"
              rows={6}
              disabled={generating}
            />
            <p className="text-xs text-muted-foreground">{idea.length} characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="constraints">Constraints (optional)</Label>
            <Textarea
              id="constraints"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="e.g. must run offline, budget $0, team of one, 4-week deadline"
              rows={3}
              disabled={generating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Save into project (optional)</Label>
            <input
              id="project"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="Project ID — or leave blank to generate without saving"
              disabled={generating}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {generating && (
            <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Generating PRD… {chars} chars streamed
              </p>
              <pre className="max-h-60 overflow-y-auto whitespace-pre-wrap break-words text-xs text-muted-foreground">
                {streamText.slice(-1500)}
              </pre>
              <Button variant="outline" size="sm" onClick={() => abortRef.current?.abort()}>
                Cancel
              </Button>
            </div>
          )}

          {result && (
            <div className="rounded-lg border border-primary/40 bg-primary/5 p-4">
              <p className="font-medium text-primary">✓ {result.title}</p>
              <p className="text-sm text-muted-foreground">
                {result.features.length} features · {result.userStories.length} user stories ·
                redirecting…
              </p>
            </div>
          )}

          <Button onClick={generate} disabled={!ready || generating} className="w-full">
            {generating ? 'Generating…' : 'Generate PRD'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}