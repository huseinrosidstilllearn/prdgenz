'use client'

import { cn } from './lib/utils'
import { FIXED_WIZARD_STEPS } from '@prdgenz/shared'

export interface WizardStepperProps {
  steps: readonly string[]
  currentStep: number
  onStepClick?: (index: number) => void
  /** Configure mode: show reorder/toggle controls (PRD §6.1.1). */
  canConfigure?: boolean
  /** Move a step within the order (reorder). */
  onMoveStep?: (from: number, to: number) => void
  /** Hide/show a step (toggle — hidden steps are excluded from the AI payload). */
  onToggleStep?: (step: string) => void
  /** Step names that are currently hidden. */
  hiddenSteps?: readonly string[]
}

export function WizardStepper({
  steps,
  currentStep,
  onStepClick,
  canConfigure,
  onMoveStep,
  onToggleStep,
  hiddenSteps,
}: WizardStepperProps) {
  const hidden = new Set(hiddenSteps ?? [])
  const showReorder = canConfigure && onMoveStep != null
  const showToggle = canConfigure && onToggleStep != null

  return (
    <ol className="flex w-full items-center gap-2 overflow-x-auto pb-1">
      {steps.map((step, i) => {
        const state = i < currentStep ? 'done' : i === currentStep ? 'active' : 'todo'
        const isHidden = hidden.has(step)
        const fixed = (FIXED_WIZARD_STEPS as readonly string[]).includes(step)
        const prevFixed = i > 0 && (FIXED_WIZARD_STEPS as readonly string[]).includes(steps[i - 1])
        return (
          <li key={step} className="flex shrink-0 items-center gap-2">
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => onStepClick?.(i)}
                disabled={!onStepClick || i > currentStep}
                aria-label={isHidden ? `${step} (hidden)` : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150',
                  'hover:border-ring/40',
                  state === 'done' && 'border-primary bg-primary/10 text-primary',
                  state === 'active' &&
                    'border-primary bg-primary text-primary-foreground shadow-sm',
                  state === 'todo' && 'border-muted text-muted-foreground',
                  (onStepClick || i <= currentStep) && 'cursor-pointer active:translate-y-px',
                  isHidden && 'opacity-40 line-through'
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
              {showToggle && !fixed && (
                <button
                  type="button"
                  onClick={() => onToggleStep?.(step)}
                  aria-label={isHidden ? `Show ${step}` : `Hide ${step}`}
                  className="rounded-md border border-input px-1.5 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {isHidden ? 'Show' : 'Hide'}
                </button>
              )}
              {showReorder && (
                <span className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => onMoveStep?.(i, i - 1)}
                    disabled={fixed || i === 0 || prevFixed}
                    aria-label={`Move ${step} up`}
                    className="rounded border border-input px-1 text-[10px] leading-tight text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveStep?.(i, i + 1)}
                    disabled={fixed || i === steps.length - 1}
                    aria-label={`Move ${step} down`}
                    className="rounded border border-input px-1 text-[10px] leading-tight text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    ↓
                  </button>
                </span>
              )}
            </div>
            {i < steps.length - 1 && <span className="h-px w-4 bg-border" aria-hidden />}
          </li>
        )
      })}
    </ol>
  )
}
