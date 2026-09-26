'use client'

import { Button, Input, Label, Textarea } from '@prdgenz/ui'

export interface WizardValues {
  idea: string
  problem: string
  targetUser: string
  features: string[]
  featureInput: string
  userStories: string
  acceptanceCriteria: string
  techStack: string
  timeline: string
  outputFormat: string
}

export const EMPTY_WIZARD_VALUES: WizardValues = {
  idea: '',
  problem: '',
  targetUser: '',
  features: [],
  featureInput: '',
  userStories: '',
  acceptanceCriteria: '',
  techStack: '',
  timeline: '',
  outputFormat: '',
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs leading-relaxed text-muted-foreground">{children}</p>
}

/**
 * The input for one clause at a time.
 *
 * userStories and acceptanceCriteria used to write into the targetUser and
 * problem fields, so filling in "any preferred flows" silently overwrote the
 * answer the user had already given for Target user. They have their own
 * state now, and the payload builder folds them back in.
 */
export function WizardStepFields({
  step,
  values,
  onChange,
  projectField,
}: {
  step: string
  values: WizardValues
  onChange: <K extends keyof WizardValues>(key: K, value: WizardValues[K]) => void
  /** Cloud-only: which project to file the document under. */
  projectField?: React.ReactNode
}) {
  if (step === 'idea') {
    return (
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="idea">Idea / problem statement *</Label>
          <Textarea
            id="idea"
            value={values.idea}
            onChange={(e) => onChange('idea', e.target.value)}
            placeholder="Describe the product you want to build."
            rows={5}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="problem">Known problem (optional)</Label>
          <Textarea
            id="problem"
            value={values.problem}
            onChange={(e) => onChange('problem', e.target.value)}
            placeholder="What pain does this solve? Leave blank and let the model draft it."
            rows={3}
          />
        </div>
      </div>
    )
  }

  if (step === 'targetUser') {
    return (
      <div className="space-y-2">
        <Label htmlFor="targetUser">Target user</Label>
        <Textarea
          id="targetUser"
          value={values.targetUser}
          onChange={(e) => onChange('targetUser', e.target.value)}
          placeholder="Who will use this product?"
          rows={4}
        />
      </div>
    )
  }

  if (step === 'features') {
    function addFeature() {
      const v = values.featureInput.trim()
      if (!v) return
      onChange('features', [...values.features, v])
      onChange('featureInput', '')
    }
    return (
      <div className="space-y-3">
        <Label htmlFor="feature">Key features</Label>
        <div className="flex gap-2">
          <Input
            id="feature"
            value={values.featureInput}
            onChange={(e) => onChange('featureInput', e.target.value)}
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
        {values.features.length > 0 ? (
          <ul className="divide-y border-y">
            {values.features.map((f, i) => (
              <li
                key={`${f}-${i}`}
                className="flex items-center justify-between gap-4 py-2 text-sm"
              >
                <span className="min-w-0 truncate">{f}</span>
                <button
                  type="button"
                  aria-label={`Remove ${f}`}
                  className="font-mono text-xs text-muted-foreground transition-colors hover:text-destructive"
                  onClick={() => onChange('features', values.features.filter((_, j) => j !== i))}
                >
                  remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <Hint>Leave empty to let the model propose features.</Hint>
      </div>
    )
  }

  if (step === 'userStories' || step === 'acceptanceCriteria') {
    const isStories = step === 'userStories'
    return (
      <div className="space-y-2">
        <Label htmlFor={`notes-${step}`}>
          {isStories ? 'User story notes' : 'Acceptance criteria notes'} (optional)
        </Label>
        <Hint>
          {isStories
            ? 'Any preferred flows. The model expands these into As a / I want / So that stories.'
            : 'Specific criteria. The model derives checklist items per feature.'}
        </Hint>
        <Textarea
          id={`notes-${step}`}
          value={isStories ? values.userStories : values.acceptanceCriteria}
          onChange={(e) =>
            onChange(isStories ? 'userStories' : 'acceptanceCriteria', e.target.value)
          }
          rows={3}
          placeholder={
            isStories
              ? 'e.g. users can invite team members'
              : 'e.g. login must support Google SSO'
          }
        />
      </div>
    )
  }

  if (step === 'techStack') {
    return (
      <div className="space-y-2">
        <Label htmlFor="techstack">Preferred tech stack (optional)</Label>
        <Hint>Comma-separated. Leave blank for a recommendation.</Hint>
        <Input
          id="techstack"
          value={values.techStack}
          onChange={(e) => onChange('techStack', e.target.value)}
          placeholder="e.g. Next.js, PostgreSQL, Prisma"
        />
      </div>
    )
  }

  if (step === 'timeline') {
    return (
      <div className="space-y-2">
        <Label htmlFor="timeline">Timeline notes (optional)</Label>
        <Textarea
          id="timeline"
          value={values.timeline}
          onChange={(e) => onChange('timeline', e.target.value)}
          rows={3}
          placeholder="e.g. MVP in 4 weeks, launch in 3 months"
        />
      </div>
    )
  }

  if (step === 'outputFormat') {
    return (
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="outputformat">Output format requirements (optional)</Label>
          <Textarea
            id="outputformat"
            value={values.outputFormat}
            onChange={(e) => onChange('outputFormat', e.target.value)}
            rows={3}
            placeholder="e.g. mobile-first responsive web app with offline support"
          />
        </div>
        {projectField}
      </div>
    )
  }

  return null
}
