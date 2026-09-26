import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WizardStepFields, EMPTY_WIZARD_VALUES, type WizardValues } from './wizard-step-fields'

function setup(overrides: Partial<WizardValues> = {}, projectField?: React.ReactNode) {
  const values = { ...EMPTY_WIZARD_VALUES, ...overrides }
  const onChange = vi.fn()
  render(
    <WizardStepFields
      step="idea"
      values={values}
      onChange={onChange}
      projectField={projectField}
    />
  )
  return { onChange }
}

function renderStep(
  step: string,
  values: Partial<WizardValues> = {},
  projectField?: React.ReactNode
) {
  const onChange = vi.fn()
  const view = render(
    <WizardStepFields
      step={step}
      values={{ ...EMPTY_WIZARD_VALUES, ...values }}
      onChange={onChange}
      projectField={projectField}
    />
  )
  return { onChange, ...view }
}

describe('WizardStepFields', () => {
  it('renders the idea and problem inputs on the idea step', () => {
    setup()
    expect(screen.getByLabelText(/idea \/ problem statement/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/known problem/i)).toBeInTheDocument()
  })

  it('reports a keystroke against the idea key', () => {
    const { onChange } = setup()
    fireEvent.change(screen.getByLabelText(/idea \/ problem statement/i), {
      target: { value: 'A booking app' },
    })
    expect(onChange).toHaveBeenCalledWith('idea', 'A booking app')
  })

  it('adds a trimmed feature and clears the input', () => {
    const { onChange } = renderStep('features', { featureInput: '  Auth  ' })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(onChange).toHaveBeenCalledWith('features', ['Auth'])
    expect(onChange).toHaveBeenCalledWith('featureInput', '')
  })

  it('ignores an empty feature', () => {
    const { onChange } = renderStep('features', { featureInput: '   ' })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('adds a feature on Enter without submitting', () => {
    const { onChange } = renderStep('features', { featureInput: 'Search' })
    fireEvent.keyDown(screen.getByLabelText(/key features/i), { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('features', ['Search'])
  })

  it('removes a feature by index', () => {
    const { onChange } = renderStep('features', { features: ['Auth', 'Search'] })
    fireEvent.click(screen.getByRole('button', { name: 'Remove Auth' }))
    expect(onChange).toHaveBeenCalledWith('features', ['Search'])
  })

  it('keeps user story notes separate from the target user answer', () => {
    // These two used to share one field, so typing notes overwrote the answer.
    const { onChange } = renderStep('userStories', {
      targetUser: 'freelancers',
      userStories: 'invite flow',
    })
    fireEvent.change(screen.getByLabelText(/user story notes/i), {
      target: { value: 'invite teammates' },
    })
    expect(onChange).toHaveBeenCalledWith('userStories', 'invite teammates')
    expect(onChange).not.toHaveBeenCalledWith('targetUser', expect.anything())
  })

  it('writes acceptance criteria notes to their own key', () => {
    const { onChange } = renderStep('acceptanceCriteria', {
      problem: 'a known problem',
      acceptanceCriteria: '',
    })
    fireEvent.change(screen.getByLabelText(/acceptance criteria notes/i), {
      target: { value: 'SSO required' },
    })
    expect(onChange).toHaveBeenCalledWith('acceptanceCriteria', 'SSO required')
    expect(onChange).not.toHaveBeenCalledWith('problem', expect.anything())
  })

  it('renders the project picker only on the last step, and only when given', () => {
    renderStep('outputFormat', {}, <input aria-label="project" />)
    expect(screen.getByLabelText('project')).toBeInTheDocument()
  })

  it('renders nothing for an unknown step', () => {
    const { container } = renderStep('nonsense')
    expect(container.innerHTML).toBe('')
  })
})
