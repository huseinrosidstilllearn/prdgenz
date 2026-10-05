import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { ThemeProvider } from '@prdgenz/ui'
import { AppShell } from './app-shell'

beforeEach(() => vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => undefined }))
afterEach(() => vi.unstubAllGlobals())

describe('AppShell', () => {
  it('provides the same real destinations on desktop and mobile with an active page', () => {
    render(<ThemeProvider><AppShell nav={[
      { href: '/dashboard', label: 'PRDs' },
      { href: '/prd/new', label: 'New PRD', active: true },
      { href: '/settings', label: 'Settings' },
    ]} railExtra={<span>Free plan</span>} headerExtra={<span>Account</span>}>
      <h1>Write a brief</h1>
    </AppShell></ThemeProvider>)
    for (const nav of screen.getAllByRole('navigation', { name: 'Main' })) {
      expect(within(nav).getByRole('link', { name: 'New PRD' })).toHaveAttribute('aria-current', 'page')
      expect(within(nav).getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/settings')
      expect(within(nav).getByRole('link', { name: 'PRDs' })).toHaveAttribute('href', '/dashboard')
    }
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main-content')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
  })
})
