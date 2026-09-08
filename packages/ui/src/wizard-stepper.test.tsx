import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WizardStepper } from './wizard-stepper'

const STEPS = ['idea', 'targetUser', 'features', 'techStack']

describe('WizardStepper (PRD §6.1.1)', () => {
  it('renders every step in order with 1-based numbers', () => {
    render(<WizardStepper steps={STEPS} currentStep={0} />)
    const items = screen.getAllByRole('button')
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
