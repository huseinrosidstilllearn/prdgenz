import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProviderSelector } from './provider-selector'

describe('ProviderSelector (PRD §6.2.1)', () => {
  it('lists all 7 providers and marks configured ones', () => {
    render(
      <ProviderSelector value="openai" configuredIds={['openai', 'anthropic']} onChange={vi.fn()} />
    )
    const select = screen.getByLabelText('AI Provider') as HTMLSelectElement
    const options = Array.from(select.options).map((o) => o.textContent)
    expect(options).toHaveLength(7)
    expect(options[0]).toBe('OpenAI (configured)')
    expect(options[1]).toBe('Anthropic (configured)')
    expect(options[2]).toBe('Google')
    expect(options[3]).toBe('OmniRoute')
  })

  it('shows the model dropdown for providers with models and defaults to the first model', () => {
    render(<ProviderSelector value="openai" onChange={vi.fn()} />)
    const modelSelect = screen.getByLabelText('Model') as HTMLSelectElement
    expect(modelSelect.value).toBe('gpt-4o')
    expect(Array.from(modelSelect.options).map((o) => o.value)).toEqual([
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
    ])
  })

  it('hides the model dropdown for providers without models (custom)', () => {
    render(<ProviderSelector value="custom" onChange={vi.fn()} />)
    expect(screen.queryByLabelText('Model')).not.toBeInTheDocument()
  })

  it('fires onChange with the provider id and auto-selects its first model', () => {
    const onChange = vi.fn()
    const onModelChange = vi.fn()
    render(
      <ProviderSelector value="openai" onChange={onChange} onModelChange={onModelChange} />
    )
    fireEvent.change(screen.getByLabelText('AI Provider'), { target: { value: 'anthropic' } })
    expect(onChange).toHaveBeenCalledWith('anthropic')
    expect(onModelChange).toHaveBeenCalledWith('claude-sonnet-4-20250514')
  })

  it('fires onModelChange when picking another model', () => {
    const onModelChange = vi.fn()
    render(
      <ProviderSelector value="openai" onChange={vi.fn()} onModelChange={onModelChange} />
    )
    fireEvent.change(screen.getByLabelText('Model'), { target: { value: 'gpt-4o-mini' } })
    expect(onModelChange).toHaveBeenCalledWith('gpt-4o-mini')
  })
})
