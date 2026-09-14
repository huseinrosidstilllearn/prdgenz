import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ShimmerButton } from './shimmer-button'
import { BorderBeam } from './border-beam'

describe('Magic UI components', () => {
  it('ShimmerButton renders a button with gradient animation class', () => {
    render(<ShimmerButton>Mulai Gratis</ShimmerButton>)
    const btn = screen.getByRole('button', { name: 'Mulai Gratis' })
    expect(btn.className).toContain('animate-shimmer')
    expect(btn.className).toContain('bg-gradient-to-r')
  })

  it('ShimmerButton asChild renders child anchor', () => {
    render(
      <ShimmerButton asChild>
        <a href="/prd/new">Go</a>
      </ShimmerButton>
    )
    const link = screen.getByRole('link', { name: 'Go' })
    expect(link.className).toContain('animate-shimmer')
  })

  it('BorderBeam renders hidden overlay with beam animation', () => {
    const { container } = render(<BorderBeam />)
    const overlay = container.firstElementChild as HTMLElement
    expect(overlay.getAttribute('aria-hidden')).toBe('true')
    expect(overlay.className).toContain('absolute')
    expect(overlay.firstElementChild?.className).toContain('animate-beam')
  })
})
