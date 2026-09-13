import * as React from 'react'

export interface DotPatternProps extends React.SVGAttributes<SVGSVGElement> {
  width?: number
  height?: number
  cx?: number
  cy?: number
  cr?: number
}

/**
 * DotPattern — subtle SVG dot-grid background (Magic UI style).
 * Absolutely position over a `relative` section; pointer-events-none.
 */
export function DotPattern({
  width = 20,
  height = 20,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  ...props
}: DotPatternProps) {
  const id = React.useId().replace(/[:]/g, '')
  return (
    <svg
      aria-hidden="true"
      className={className}
      style={{ pointerEvents: 'none' }}
      {...props}
    >
      <defs>
        <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse">
          <circle cx={cx} cy={cy} r={cr} fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}
