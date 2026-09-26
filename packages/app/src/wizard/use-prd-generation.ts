'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { filterWizardInput, type PRDContent } from '@prdgenz/shared'

export interface PRDGeneration {
  generating: boolean
  streamText: string
  result: PRDContent | null
  error: string | null
  generate: (req: GenerationRequest) => void
  cancel: () => void
}

export interface GenerationRequest {
  language: string
  provider: string
  model?: string
  /** Cloud groups documents under a project; self-host has no Project table. */
  projectId?: string
  idea: string
  problem: string
  targetUser: string
  features: string[]
  techStack: string
  timeline: string
  constraints: string
  hiddenSteps: string[]
}

/**
 * Streams a PRD from /api/ai/generate.
 *
 * The one moving part worth naming: on success the route both returns the
 * content and persists it, so the redirect is scheduled rather than immediate
 * to let the finished state render once before the router swaps the page.
 */
export function usePRDGeneration(): PRDGeneration {
  const router = useRouter()
  const abortRef = useRef<AbortController | null>(null)
  const [generating, setGenerating] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [result, setResult] = useState<PRDContent | null>(null)
  const [error, setError] = useState<string | null>(null)

  function cancel() {
    abortRef.current?.abort()
  }

  function generate(req: GenerationRequest) {
    setError(null)
    setResult(null)
    setStreamText('')
    setGenerating(true)
    const abort = new AbortController()
    abortRef.current = abort

    void (async () => {
      try {
        const res = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abort.signal,
          body: JSON.stringify({
            language: req.language,
            mode: 'WIZARD',
            provider: req.provider,
            model: req.model,
            projectId: req.projectId || undefined,
            // Hidden steps are excluded from the AI payload (deterministic).
            input: filterWizardInput(
              {
                idea: req.idea,
                problem: req.problem,
                targetUser: req.targetUser,
                features: req.features,
                techStack: req.techStack
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
                timeline: req.timeline,
                constraints: req.constraints,
              },
              req.hiddenSteps
            ),
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
            } else if (evt.type === 'done') {
              setResult(evt.content as PRDContent)
              setStreamText('')
              if (evt.saved?.prdId) {
                // Deferred so the finished state paints before the swap.
                setTimeout(() => router.push(`/prd/${evt.saved.prdId}`), 800)
              }
            } else if (evt.type === 'error') {
              throw new Error(evt.error)
            }
          }
        }
      } catch (e) {
        // A cancel is a user action, not a failure to report.
        if ((e as Error).name !== 'AbortError') setError((e as Error).message)
      } finally {
        setGenerating(false)
      }
    })()
  }

  return { generating, streamText, result, error, generate, cancel }
}
