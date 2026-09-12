import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SectionRegenerate } from './section-regenerate'

const SECTIONS = ['summary', 'problem', 'features'] as const

describe('SectionRegenerate (PRD §6.1.1 per-section generate)', () => {
  it('lists every section option', () => {
    render(<SectionRegenerate sections={SECTIONS} onSelect={vi.fn()} />)
    const select = screen.getByLabelText('Regenerate a single section')
    for (const s of SECTIONS) {
      expect(screen.getByRole('option', { name: s })).toBeDefined()
    }
    expect(select).toBeDefined()
  })

  it('fires onSelect with the selected section', () => {
    const onSelect = vi.fn()
    render(<SectionRegenerate sections={SECTIONS} onSelect={onSelect} />)
    fireEvent.change(screen.getByLabelText('Regenerate a single section'), {
      target: { value: 'problem' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Regenerate' }))
    expect(onSelect).toHaveBeenCalledWith('problem')
  })

  it('defaults to the first section', () => {
    render(<SectionRegenerate sections={SECTIONS} onSelect={vi.fn()} />)
    const select = screen.getByLabelText('Regenerate a single section') as HTMLSelectElement
    expect(select.value).toBe('summary')
  })

  it('disables the button and shows progress while busy', () => {
    render(
      <SectionRegenerate sections={SECTIONS} onSelect={vi.fn()} busy="features" note={null} />
    )
    expect(screen.getByRole('button', { name: 'Generating…' })).toBeDisabled()
    expect(screen.getByText('Regenerating features…')).toBeDefined()
  })

  it('shows note and error messages when given', () => {
    render(
      <SectionRegenerate
        sections={SECTIONS}
        onSelect={vi.fn()}
        note="v3 saved"
        error="boom"
      />
    )
    expect(screen.getByText('v3 saved')).toBeDefined()
    expect(screen.getByText('boom')).toBeDefined()
  })
})
