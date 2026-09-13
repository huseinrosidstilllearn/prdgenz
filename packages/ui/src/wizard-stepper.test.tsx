import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WizardStepper } from './wizard-stepper'

const STEPS = ['idea', 'targetUser', 'features', 'techStack']

describe('WizardStepper (PRD §6.1.1)', () => {
  it('renders every step in order with 1-based numbers', () => {
    render(<WizardStepper steps={STEPS} currentStep={0} />)
    const items = screen.getAllByRole('button')
    // Only step buttons — no reorder/toggle buttons without handlers.
    expect(items).toHaveLength(4)
    expect(items[0]).toHaveTextContent('1idea')
    expect(items[3]).toHaveTextContent('4techStack')
  })

  it('marks completed steps with a check, current with its number, later steps plain', () => {
    render(<WizardStepper steps={STEPS} currentStep={1} />)
    const items = screen.getAllByRole('button')
    expect(items[0]).toHaveTextContent('✓')
    expect(items[1]).toHaveTextContent('2')
    expect(items[2]).not.toHaveTextContent('✓')
  })

  it('allows clicking past and current steps only when clickable', () => {
    const onStepClick = vi.fn()
    render(<WizardStepper steps={STEPS} currentStep={1} onStepClick={onStepClick} />)
    const items = screen.getAllByRole('button')

    expect(items[0]).not.toBeDisabled()
    expect(items[1]).not.toBeDisabled()
    expect(items[2]).toBeDisabled() // future step
    expect(items[3]).toBeDisabled()

    fireEvent.click(items[0])
    expect(onStepClick).toHaveBeenCalledWith(0)
  })

  it('disables all steps when no onStepClick handler is given', () => {
    render(<WizardStepper steps={STEPS} currentStep={0} />)
    for (const b of screen.getAllByRole('button')) expect(b).toBeDisabled()
  })
})

describe('WizardStepper reorder/toggle (PRD §6.1.1 wizard ops)', () => {
  it('renders hidden step dimmed with (hidden) aria-label but still clickable', () => {
    const onStepClick = vi.fn()
    const { container } = render(
      <WizardStepper
        steps={STEPS}
        currentStep={2}
        onStepClick={onStepClick}
        hiddenSteps={['features']}
      />
    )
    const btn = screen.getByLabelText('features (hidden)')
    expect(btn.className).toContain('opacity-40')
    expect(btn.className).toContain('line-through')
    // Defensive: clicking a hidden step still fires onStepClick — the page
    // guards against it via skip logic.
    fireEvent.click(btn)
    expect(onStepClick).toHaveBeenCalledWith(2)
    expect(container).toBeDefined()
  })

  it('fires onMoveStep(from, to) from the up/down buttons', () => {
    const onMoveStep = vi.fn()
    render(
      <WizardStepper
        steps={STEPS}
        currentStep={1}
        canConfigure
        onMoveStep={onMoveStep}
      />
    )
    fireEvent.click(screen.getByLabelText('Move features up'))
    expect(onMoveStep).toHaveBeenCalledWith(2, 1)
    fireEvent.click(screen.getByLabelText('Move features down'))
    expect(onMoveStep).toHaveBeenCalledWith(2, 3)
  })

  it('fires onToggleStep(step) from the Hide/Show buttons', () => {
    const onToggleStep = vi.fn()
    render(
      <WizardStepper
        steps={STEPS}
        currentStep={0}
        canConfigure
        onToggleStep={onToggleStep}
      />
    )
    fireEvent.click(screen.getByLabelText('Hide features'))
    expect(onToggleStep).toHaveBeenCalledWith('features')
  })

  it('shows Show instead of Hide for already-hidden steps', () => {
    const onToggleStep = vi.fn()
    render(
      <WizardStepper
        steps={STEPS}
        currentStep={0}
        canConfigure
        onToggleStep={onToggleStep}
        hiddenSteps={['features']}
      />
    )
    fireEvent.click(screen.getByLabelText('Show features'))
    expect(onToggleStep).toHaveBeenCalledWith('features')
    expect(screen.queryByLabelText('Hide features')).toBeNull()
  })

  it('disables reorder at array bounds and for the fixed idea step', () => {
    render(
      <WizardStepper
        steps={STEPS}
        currentStep={0}
        canConfigure
        onMoveStep={vi.fn()}
      />
    )
    // idea (index 0, fixed) — both directions disabled.
    expect(screen.getByLabelText('Move idea up')).toBeDisabled()
    expect(screen.getByLabelText('Move idea down')).toBeDisabled()
    // First movable step — up disabled (it would swap with fixed idea).
    expect(screen.getByLabelText('Move targetUser up')).toBeDisabled()
    expect(screen.getByLabelText('Move targetUser down')).not.toBeDisabled()
    // Last step — down disabled.
    expect(screen.getByLabelText('Move techStack up')).not.toBeDisabled()
    expect(screen.getByLabelText('Move techStack down')).toBeDisabled()
  })

  it('renders no toggle button for the fixed idea step', () => {
    render(
      <WizardStepper
        steps={STEPS}
        currentStep={0}
        canConfigure
        onToggleStep={vi.fn()}
      />
    )
    expect(screen.queryByLabelText('Hide idea')).toBeNull()
    expect(screen.queryByLabelText('Show idea')).toBeNull()
    expect(screen.getByLabelText('Hide targetUser')).toBeDefined()
  })

  it('renders no ops buttons without handlers even in configure mode', () => {
    render(<WizardStepper steps={STEPS} currentStep={0} canConfigure />)
    expect(screen.queryByLabelText(/Move .+ (up|down)/)).toBeNull()
    expect(screen.queryByLabelText(/(Hide|Show) .+/)).toBeNull()
    expect(screen.getAllByRole('button')).toHaveLength(4)
  })

  it('renders no ops buttons with handlers but configure mode off', () => {
    render(
      <WizardStepper
        steps={STEPS}
        currentStep={0}
        onMoveStep={vi.fn()}
        onToggleStep={vi.fn()}
      />
    )
    expect(screen.queryByLabelText(/Move .+ (up|down)/)).toBeNull()
    expect(screen.queryByLabelText(/(Hide|Show) .+/)).toBeNull()
  })
})
