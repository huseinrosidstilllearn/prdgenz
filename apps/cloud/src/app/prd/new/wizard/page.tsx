'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AIChatBubble,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  ProviderSelector,
  Textarea,
  WizardStepper,
} from '@prdgenz/ui'
import {
  FIXED_WIZARD_STEPS,
  WIZARD_STEPS,
  filterWizardInput,
  normalizeWizardSteps,
  type PRDContent,
} from '@prdgenz/shared'
import { useGenerationSetup } from '@/hooks/use-generation-setup'

const WIZARD_CONFIG_KEY = 'prdgenz:wizard-config'

export default function WizardPage() {
  const router = useRouter()
  const setup = useGenerationSetup()
  const [currentStepName, setCurrentStepName] = useState<string>('idea')
  const [stepOrder, setStepOrder] = useState<string[]>([...WIZARD_STEPS])
  const [hiddenSteps, setHiddenSteps] = useState<string[]>([])
  const [configuring, setConfiguring] = useState(false)
  const [configLoaded, setConfigLoaded] = useState(false)
  const [idea, setIdea] = useState('')
  const [problem, setProblem] = useState('')
  const [targetUser, setTargetUser] = useState('')
  const [features, setFeatures] = useState<string[]>([])
  const [featureInput, setFeatureInput] = useState('')
  const [techStack, setTechStack] = useState('')
  const [timeline, setTimeline] = useState('')
  const [outputFormat, setOutputFormat] = useState('')
  const [projectId, setProjectId] = useState('')
  const [result, setResult] = useState<PRDContent | null>(null)
  const [streamText, setStreamText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  // Load persisted wizard config (order + hidden) once from localStorage.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(WIZARD_CONFIG_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as { order?: string[]; hidden?: string[] }
        const normalized = normalizeWizardSteps(parsed.order, parsed.hidden)
        if (normalized) {
          setStepOrder(normalized.order)
          setHiddenSteps(normalized.hidden)
        }
      }
    } catch {
      /* corrupt JSON â†’ keep defaults */
    }
    setConfigLoaded(true)
  }, [])

  function persistConfig(order: string[], hidden: string[]) {
    try {
      localStorage.setItem(WIZARD_CONFIG_KEY, JSON.stringify({ order, hidden }))
    } catch {
      /* private mode */
    }
  }

  function updateStepOrder(next: string[]) {
    setStepOrder(next)
    persistConfig(next, hiddenSteps)
  }

  function updateHiddenSteps(next: string[]) {
    setHiddenSteps(next)
    persistConfig(stepOrder, next)
    // Toggle-hide on the active step â†’ auto-jump to the next visible step.
    if (next.includes(currentStepName)) {
      const visible = stepOrder.filter((s) => !next.includes(s))
      const idx = visible.indexOf(currentStepName)
      const fallback = visible[Math.min(idx + 1, visible.length - 1)] ?? visible[0] ?? 'idea'
      setCurrentStepName(fallback)
    }
  }

  /** Visible navigation order: stepOrder minus hiddenSteps. */
  const visibleSteps = stepOrder.filter((s) => !hiddenSteps.includes(s))
  const currentStep = stepOrder.indexOf(currentStepName) // derived index for WizardStepper
  const lastStep = visibleSteps[visibleSteps.length - 1] === currentStepName

  function next() {
    const i = visibleSteps.indexOf(currentStepName)
    const target = visibleSteps[Math.min(visibleSteps.length - 1, i + 1)]
    if (target) setCurrentStepName(target)
  }

  function back() {
    const i = visibleSteps.indexOf(currentStepName)
    const target = visibleSteps[Math.max(0, i - 1)]
    if (target) setCurrentStepName(target)
  }

  function moveStep(from: number, to: number) {
    if (to < 0 || to >= stepOrder.length || from === to) return
    const next = [...stepOrder]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    updateStepOrder(next)
  }

  function toggleStep(step: string) {
    if ((FIXED_WIZARD_STEPS as readonly string[]).includes(step)) return
    updateHiddenSteps(
      hiddenSteps.includes(step) ? hiddenSteps.filter((s) => s !== step) : [...hiddenSteps, step]
    )
  }

  const canNext = currentStepName === 'idea' ? idea.trim().length >= 3 : true

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
          projectId: projectId || undefined,
          // Hidden steps are excluded from the AI payload (deterministic).
          input: filterWizardInput(
            {
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
            hiddenSteps
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
          if (evt.type === 'delta') setStreamText((t) => t + evt.text)
          else if (evt.type === 'done') {
            setResult(evt.content as PRDContent)
            setStreamText('')
            if (evt.saved?.prdId) {
              setTimeout(() => router.push(`/prd/${evt.saved.prdId}`), 800)
            }
          } else if (evt.type === 'error') {
            throw new Error(evt.error)
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        setError((e as Error).message)
      }
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

  const stepFields = (
    <>
      {currentStepName === 'idea' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="idea">Idea / Problem Statement *</Label>
            <Textarea
              id="idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Describe the product you want to build..."
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
      {currentStepName === 'targetUser' && (
        <div className="space-y-2">
          <Label htmlFor="targetUser">Target User</Label>
          <Textarea
            id="targetUser"
            value={targetUser}
            onChange={(e) => setTargetUser(e.target.value)}
            placeholder="Who will use this product? e.g. freelance developers in Indonesia..."
            rows={4}
          />
        </div>
      )}
      {currentStepName === 'features' && (
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
      {(currentStepName === 'userStories' || currentStepName === 'acceptanceCriteria') && (
        <div className="space-y-2">
          <Label
            htmlFor={`notes-${currentStepName}`}
          >
            {currentStepName === 'userStories'
              ? 'User Story Notes'
              : 'Acceptance Criteria Notes'}{' '}
            (optional)
          </Label>
          <p className="text-xs text-muted-foreground">
            {currentStepName === 'userStories'
              ? 'Any preferred flows: the AI will expand them into As a / I want / So that stories.'
              : 'Specific criteria: the AI will derive checklist items per feature.'}
          </p>
          <Textarea
            id={`notes-${currentStepName}`}
            value={currentStepName === 'userStories' ? targetUser : problem}
            onChange={(e) =>
              currentStepName === 'userStories'
                ? setTargetUser(e.target.value)
                : setProblem(e.target.value)
            }
            rows={3}
            placeholder={
              currentStepName === 'userStories'
                ? 'e.g. users can invite team members...'
                : 'e.g. login must support Google SSO...'
            }
          />
        </div>
      )}
      {currentStepName === 'techStack' && (
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
      {currentStepName === 'timeline' && (
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
      {currentStepName === 'outputFormat' && (
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
          <div className="space-y-2">
            <Label htmlFor="project">Save into project (optional)</Label>
            <Input
              id="project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="Project ID: paste from dashboard, or leave blank"
            />
          </div>
        </div>
      )}
    </>
  )

  return (
    <div className="container max-w-2xl space-y-6 py-10">
      <div>
        <h1 className="text-2xl font-bold">Create from Scratch</h1>
        <p className="text-sm text-muted-foreground">
          Step {visibleSteps.indexOf(currentStepName) + 1} of {visibleSteps.length}:{' '}
          {currentStepName}
        </p>
      </div>

      <WizardStepper
        steps={stepOrder}
        currentStep={currentStep}
        onStepClick={(i) => setCurrentStepName(stepOrder[i])}
        canConfigure={configuring}
        onMoveStep={moveStep}
        onToggleStep={toggleStep}
        hiddenSteps={hiddenSteps}
      />

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="capitalize">{currentStepName}</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setConfiguring((c) => !c)}
            disabled={generating}
          >
            {configuring ? 'Done' : 'Reorder steps'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {setup.config}
          {stepFields}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {generating && (
            <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Generating... {streamText.length} chars streamed
              </p>
              <AIChatBubble role="assistant" content={streamText || 'Contacting AI...'} streaming />
              <Button variant="outline" size="sm" onClick={() => abortRef.current?.abort()}>
                Cancel
              </Button>
            </div>
          )}
          {result && (
            <p className="text-sm text-primary">PRD generated: redirecting to the PRD page...</p>
          )}
          {!configuring && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={back}
                disabled={currentStepName === 'idea' || generating}
              >
                Back
              </Button>
              {lastStep ? (
                <Button onClick={generate} disabled={generating || idea.trim().length < 3}>
                  {generating ? 'Generating...' : 'Generate PRD'}
                </Button>
              ) : (
                <Button onClick={next} disabled={!canNext || generating}>
                  Next
                </Button>
              )}
            </div>
          )}
          {configuring && (
            <p className="text-xs text-muted-foreground">
              Reorder steps with â†‘/â†“ and hide optional steps with Hide. Hidden steps are skipped
              during navigation and excluded from the AI input. The idea step stays first and is
              always required.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
