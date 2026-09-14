import * as React from 'react'
import { cn } from './lib/utils'

/**
 * BlueprintStage — identity centerpiece: a PRD document drawing itself.
 * Section outlines appear via the stroke-draw motif (bp-draw keyframes in
 * globals.css), a typing bar marks the active section, and export chips
 * land at the end of the loop. Pure CSS animation, currentColor-driven,
 * adapts to both themes. Reason (R-22): the illustration IS the product:
 * a PRD being written, not a decorative 3D blob.
 */
export function BlueprintStage({ className }: { className?: string }) {
  // Draw windows per section (percent of the 10s loop): each section draws
  // in sequence, holds, then everything fades before the loop restarts.
  // Pitch: 41px per section, titles at y = 26 + i*41.
  const sections = [
    { label: 'Judul', start: '8%', end: '20%' },
    { label: 'Ringkasan', start: '22%', end: '34%' },
    { label: 'Problem', start: '36%', end: '48%' },
    { label: 'Fitur', start: '50%', end: '62%' },
    { label: 'Timeline', start: '64%', end: '76%' },
  ]
  const pitch = 41

  return (
    <div
      aria-hidden="true"
      className={cn('relative mx-auto w-full max-w-md select-none', className)}
    >
      <svg viewBox="0 0 320 260" fill="none" className="h-auto w-full">
        {/* Paper sheet, drawn first. */}
        <rect
          x="56"
          y="8"
          width="208"
          height="244"
          rx="10"
          stroke="currentColor"
          strokeOpacity="0.55"
          strokeWidth="2"
          pathLength="1"
          className="bp-draw text-foreground/70"
          style={{ '--bp-start': '0%', '--bp-end': '6%' } as React.CSSProperties}
        />
        {/* Folded corner top-right: a draft on the desk, not a finished file. */}
        <path
          d="M232 8 l32 32 v212"
          stroke="currentColor"
          strokeOpacity="0.35"
          strokeWidth="2"
          pathLength="1"
          className="bp-draw text-foreground/50"
          style={{ '--bp-start': '3%', '--bp-end': '7%' } as React.CSSProperties}
        />

        {sections.map((s, i) => {
          const titleY = 26 + i * pitch
          return (
            <g
              key={s.label}
              className="bp-draw text-primary"
              style={{ '--bp-start': s.start, '--bp-end': s.end } as React.CSSProperties}
            >
              {/* Section title line. */}
              <line
                x1="76"
                y1={titleY}
                x2="196"
                y2={titleY}
                stroke="currentColor"
                strokeWidth="2.5"
                pathLength="1"
              />
              {/* Content bars; last one is shorter, like a real paragraph end. */}
              <line
                x1="76"
                y1={titleY + 13}
                x2="244"
                y2={titleY + 13}
                stroke="currentColor"
                strokeOpacity="0.4"
                strokeWidth="2"
                pathLength="1"
              />
              <line
                x1="76"
                y1={titleY + 24}
                x2="150"
                y2={titleY + 24}
                stroke="currentColor"
                strokeOpacity="0.4"
                strokeWidth="2"
                pathLength="1"
              />
            </g>
          )
        })}

        {/* Typing caret at the end of the active section's last line. */}
        <rect
          x="158"
          y="206"
          width="8"
          height="11"
          rx="1.5"
          className="animate-type fill-primary"
          style={{ transformOrigin: '162px 211px' } as React.CSSProperties}
        />

        {/* Export chips land after the document completes. */}
        {[76, 136].map((x, i) => (
          <g
            key={x}
            className="bp-draw text-primary"
            style={
              {
                '--bp-start': `${80 + i * 4}%`,
                '--bp-end': `${88 + i * 4}%`,
              } as React.CSSProperties
            }
          >
            <rect
              x={x}
              y="234"
              width="52"
              height="14"
              rx="5"
              stroke="currentColor"
              strokeWidth="2"
              pathLength="1"
            />
            <line
              x1={x + 9}
              y1="241"
              x2={x + 43}
              y2="241"
              stroke="currentColor"
              strokeOpacity="0.8"
              strokeWidth="2"
              pathLength="1"
            />
          </g>
        ))}
      </svg>
    </div>
  )
}
