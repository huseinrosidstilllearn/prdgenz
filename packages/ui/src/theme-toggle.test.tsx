import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from './theme-toggle'

const setTheme = vi.fn()

vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'dark', setTheme }),
}))

describe('ThemeToggle', () => {
  it('renders an accessible toggle button', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button', { name: 'Toggle theme' })).toBeDefined()
  })

  it('switches dark to light on click', () => {
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button', { name: 'Toggle theme' }))
    expect(setTheme).toHaveBeenCalledWith('light')
  })
})
