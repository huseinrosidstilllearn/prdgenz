'use client'

import { useCallback, useEffect, useState } from 'react'
import { FIXED_WIZARD_STEPS, WIZARD_STEPS, normalizeWizardSteps } from '@prdgenz/shared'

const WIZARD_CONFIG_KEY = 'prdgenz:wizard-config'

export interface WizardConfig {
  stepOrder: string[]
  hiddenSteps: string[]
  /** Visible navigation order: the full order minus hidden steps. */
  visibleSteps: string[]
  loaded: boolean
  moveStep: (from: number, to: number) => void
  toggleStep: (step: string) => string | null
}

/**
 * Which clauses the wizard asks about, in what order, persisted per browser.
 *
 * `toggleStep` returns the step to jump to when hiding the one you are on, or
 * null when nothing moved. The caller owns the current step so that hiding is
 * a single transition rather than two setState calls that can disagree.
 */
export function useWizardConfig(currentStepName: string): WizardConfig {
  const [stepOrder, setStepOrder] = useState<string[]>([...WIZARD_STEPS])
  const [hiddenSteps, setHiddenSteps] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)

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
      /* corrupt JSON → keep defaults */
    }
    setLoaded(true)
  }, [])

  const persist = useCallback((order: string[], hidden: string[]) => {
    try {
      localStorage.setItem(WIZARD_CONFIG_KEY, JSON.stringify({ order, hidden }))
    } catch {
      /* private mode */
    }
  }, [])

  const moveStep = useCallback(
    (from: number, to: number) => {
      if (to < 0 || to >= stepOrder.length || from === to) return
      const next = [...stepOrder]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      setStepOrder(next)
      persist(next, hiddenSteps)
    },
    [stepOrder, hiddenSteps, persist]
  )

  const toggleStep = useCallback(
    (step: string): string | null => {
      // The idea clause is the required entry point; it cannot be reordered away.
      if ((FIXED_WIZARD_STEPS as readonly string[]).includes(step)) return null
      const next = hiddenSteps.includes(step)
        ? hiddenSteps.filter((s) => s !== step)
        : [...hiddenSteps, step]
      setHiddenSteps(next)
      persist(stepOrder, next)
      if (next.includes(currentStepName)) {
        const visible = stepOrder.filter((s) => !next.includes(s))
        const idx = visible.indexOf(currentStepName)
        return visible[Math.min(idx + 1, visible.length - 1)] ?? visible[0] ?? 'idea'
      }
      return null
    },
    [hiddenSteps, stepOrder, currentStepName, persist]
  )

  return {
    stepOrder,
    hiddenSteps,
    visibleSteps: stepOrder.filter((s) => !hiddenSteps.includes(s)),
    loaded,
    moveStep,
    toggleStep,
  }
}
