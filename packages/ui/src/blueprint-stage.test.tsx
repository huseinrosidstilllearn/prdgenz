import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BlueprintStage } from './blueprint-stage'

describe('BlueprintStage', () => {
  it('renders a decorative svg with stroke-draw sections and caret', () => {
    const { container } = render(<BlueprintStage />)
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.getAttribute('aria-hidden')).toBe('true')
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    // Five section groups + paper + corner + 2 export chips, all stroke-draw.
    const draws = container.querySelectorAll('.bp-draw')
    expect(draws.length).toBe(9)
    // Each section group carries its own draw window.
    const g = draws[3] as SVGGElement
    expect(g.getAttribute('style')).toContain('--bp-start')
    // Typing caret animates.
    expect(container.querySelector('.animate-type')).not.toBeNull()
  })

  it('uses currentColor strokes so both themes render', () => {
    const { container } = render(<BlueprintStage />)
    const line = container.querySelector('.bp-draw line') as SVGLineElement
    expect(line.getAttribute('stroke')).toBe('currentColor')
  })
})
