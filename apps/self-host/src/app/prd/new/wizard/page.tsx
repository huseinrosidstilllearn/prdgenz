'use client'

import { useRef, useState } from 'react'
import {
  AIChatBubble,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  WizardStepper,
} from '@prdgenz/ui'
import { WIZARD_STEPS, type PRDContent } from '@prdgenz/shared'
import { useGenerationSetup } from '@/hooks/use-generation-setup'

export default function WizardPage() {
  const setup = useGenerationSetup()
  const [step, setStep] = useState(0)
  const [idea, setIdea] = useState('')
  const [problem, setProblem] = useState('')
  const [targetUser, setTargetUser] = useState('')
  const [features, setFeatures] = useState<string[]>([])
  const [featureInput, setFeatureInput] = useState('')
  const [techStack, setTechStack] = useState('')
  const [timeline, setTimeline] = useState('')
  const [outputFormat, setOutputFormat] = useState('')
  const [result, setResult] = useState<PRDContent | null>(null)
  const [streamText, setStreamText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const canNext = [idea.trim().length >= 3, true, true, true, true, true, true, true]

  async function generate() {
    setError(null)
    setResult(null)
    setStreamText('')
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
          mode: 'WIZARD',
          provider: setup.provider,
          model: setup.model,
          input: {
            idea,
            problem,
            targetUser,
            features,
            techStack: techStack
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
            timeline,
            constraints: outputFormat,
          },
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
          if (evt.type === 'delta') setStreamText((t) => t + evt.text)
          else if (evt.type === 'done') {
            setResult(evt.content as PRDContent)
            setStreamText('')
            if (evt.saved?.prdId) {
              setTimeout(() => (window.location.href = `/prd/${evt.saved.prdId}`), 800)
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

  function addFeature() {
    const v = featureInput.trim()
    if (!v) return
    setFeatures((f) => [...f, v])
    setFeatureInput('')
  }

  const lastStep = step === WIZARD_STEPS.length - 1

  const stepFields = (
    <>
      {step === 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="idea">Idea / Problem Statement *</Label>
            <Textarea
              id="idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Describe the product you want to build…"
              rows={5}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="problem">Known problem (optional)</Label>
            <Textarea
              id="problem"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="What pain does this solve? Leave blank and let AI draft it."
              rows={3}
            />
          </div>
        </div>
      )}
      {step === 1 && (
        <div className="space-y-2">
          <Label htmlFor="targetUser">Target User</Label>
          <Textarea
            id="targetUser"
            value={targetUser}
            onChange={(e) => setTargetUser(e.target.value)}
            placeholder="Who will use this product? e.g. freelance developers in Indonesia…"
            rows={4}
          />
        </div>
      )}
      {step === 2 && (
        <div className="space-y-3">
          <Label>Key Features</Label>
          <div className="flex gap-2">
            <Input
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              placeholder="e.g. User authentication"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addFeature()
                }
              }}
            />
            <Button type="button" variant="secondary" onClick={addFeature}>
              Add
            </Button>
          </div>
          <ul className="space-y-1 text-sm">
            {features.map((f, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-1.5"
              >
                {f}
                <button
                  type="button"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setFeatures((arr) => arr.filter((_, j) => j !== i))}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">Leave empty to let the AI propose features.</p>
        </div>
      )}
      {step >= 3 && step <= 4 && (
        <div className="space-y-2">
          <Label htmlFor={`notes-${step}`}>
            {step === 3 ? 'User Story Notes' : 'Acceptance Criteria Notes'} (optional)
          </Label>
          <p className="text-xs text-muted-foreground">
            {step === 3
              ? 'Any preferred flows — the AI will expand them into As a / I want / So that stories.'
              : 'Specific criteria — the AI will derive checklist items per feature.'}
          </p>
          <Textarea
            id={`notes-${step}`}
            value={step === 3 ? targetUser : problem}
            onChange={(e) => (step === 3 ? setTargetUser(e.target.value) : setProblem(e.target.value))}
            rows={3}
            placeholder={step === 3 ? 'e.g. users can invite team members…' : 'e.g. login must support Google SSO…'}
          />
        </div>
      )}
      {step === 5 && (
        <div className="space-y-2">
          <Label htmlFor="techstack">Preferred Tech Stack (optional)</Label>
          <p className="text-xs text-muted-foreground">Comma-separated. Leave blank for AI recommendation.</p>
          <Input
            id="techstack"
            value={techStack}
            onChange={(e) => setTechStack(e.target.value)}
            placeholder="e.g. Next.js, PostgreSQL, Prisma, Tailwind"
          />
        </div>
      )}
      {step === 6 && (
        <div className="space-y-2">
          <Label htmlFor="timeline">Timeline Notes (optional)</Label>
          <Textarea
            id="timeline"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            rows={3}
            placeholder="e.g. MVP in 4 weeks, launch in 3 months"
          />
        </div>
      )}
      {step === 7 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="outputformat">Output Format Requirements (optional)</Label>
            <Textarea
              id="outputformat"
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              rows={3}
              placeholder="e.g. mobile-first responsive web app with offline support"
            />
          </div>
        </div>
      )}
    </>
  )

  return (
    <div className="container max-w-2xl space-y-6 py-10">
      <div>
        <h1 className="text-2xl font-bold">PRD Wizard</h1>
        <p className="text-sm text-muted-foreground">
          Step {step + 1} of {WIZARD_STEPS.length}: {WIZARD_STEPS[step]}
        </p>
      </div>

      <WizardStepper steps={WIZARD_STEPS} currentStep={step} onStepClick={setStep} />

      <Card>
        <CardHeader>
          <CardTitle className="capitalize">{WIZARD_STEPS[step]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {setup.config}
          {stepFields}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {generating && (
            <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Generating… {streamText.length} chars streamed
              </p>
              <AIChatBubble role="assistant" content={streamText || 'Contacting AI…'} streaming />
              <Button variant="outline" size="sm" onClick={() => abortRef.current?.abort()}>
                Cancel
              </Button>
            </div>
          )}
          {result && <p className="text-sm text-primary">PRD generated — redirecting…</p>}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || generating}
            >
              Back
            </Button>
            {lastStep ? (
              <Button onClick={generate} disabled={generating || !canNext[0]}>
                {generating ? 'Generating…' : 'Generate PRD'}
              </Button>
            ) : (
              <Button
                onClick={() => setStep((s) => Math.min(WIZARD_STEPS.length - 1, s + 1))}
                disabled={!canNext[step]}
              >
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
