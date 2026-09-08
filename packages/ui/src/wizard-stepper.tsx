'use client'

import { cn } from './lib/utils'

export interface WizardStepperProps {
  steps: readonly string[]
  currentStep: number
  onStepClick?: (index: number) => void
}

export function WizardStepper({ steps, currentStep, onStepClick }: WizardStepperProps) {
  return (
    <ol className="flex w-full items-center gap-2 overflow-x-auto pb-1">
      {steps.map((step, i) => {
        const state = i < currentStep ? 'done' : i === currentStep ? 'active' : 'todo'
        return (
          <li key={step} className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => onStepClick?.(i)}
              disabled={!onStepClick || i > currentStep}
              className={cn(
                'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                state === 'done' && 'border-primary bg-primary/10 text-primary',
                state === 'active' && 'border-primary bg-primary text-primary-foreground',
                state === 'todo' && 'border-muted text-muted-foreground'
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full text-[10px]',
                  state === 'active' ? 'bg-primary-foreground/20' : 'bg-muted'
                )}
              >
                {state === 'done' ? '✓' : i + 1}
              </span>
              {step}
            </button>
            {i < steps.length - 1 && <span className="h-px w-4 bg-border" aria-hidden />}
          </li>
        )
      })}
    </ol>
  )
}
