import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ModeChooser } from './mode-chooser'

describe('ModeChooser', () => {
  it('explains the choices and sends every mode to its existing flow', () => {
    render(<ModeChooser />)
    expect(screen.getByRole('heading', { name: 'How do you want to start?' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Choose Create from Scratch/ })).toHaveAttribute('href', '/prd/new/wizard')
    expect(screen.getByRole('link', { name: /Choose Chat/ })).toHaveAttribute('href', '/prd/new/chat')
    expect(screen.getByRole('link', { name: /Choose One-Shot/ })).toHaveAttribute('href', '/prd/new/oneshot')
    expect(screen.getAllByText('Example starting point')).toHaveLength(3)
    expect(screen.getByRole('link', { name: 'Manage your AI provider' })).toHaveAttribute('href', '/settings')
  })
})
