import plugin from 'tailwindcss/plugin'

/**
 * The base layer and the design system's few utilities, injected as a
 * Tailwind plugin rather than an @import-ed stylesheet.
 *
 * Reason: postcss-import hoists every @import to the top of the file, so a
 * separate base.css would land its @layer ahead of the @tailwind directives
 * and fail to compile. A plugin lets each piece go into the correct layer.
 */

/** MOTION 1: functional motion only. The caret reports real streaming state. */
const KEYFRAMES = `
@keyframes caret-blink {
  0%, 45% { opacity: 1; }
  46%, 100% { opacity: 0; }
}
@keyframes clause-in {
  from { opacity: 0.35; }
  to { opacity: 1; }
}
`

export const baseStyles = plugin(({ addBase, addComponents, addUtilities, theme }) => {
  addBase({
    '*': { borderColor: theme('colors.border') },
    html: { WebkitTextSizeAdjust: '100%' },
    body: {
      backgroundColor: theme('colors.background'),
      color: theme('colors.foreground'),
      fontFamily: theme('fontFamily.sans'),
      fontFeatureSettings: "'cv02', 'cv03', 'cv04'",
      WebkitFontSmoothing: 'antialiased',
    },
    // A document has a serif head.
    'h1, h2, h3, h4, h5, h6': {
      fontFamily: theme('fontFamily.display'),
      fontWeight: '400',
      letterSpacing: '-0.015em',
    },
    // Numbers sitting in columns must line up.
    'code, kbd, pre, samp': {
      fontFamily: theme('fontFamily.mono'),
      fontFeatureSettings: "'tnum'",
    },
  })

  // The margin rule: a hairline down the left edge of a document surface, with
  // clause numbers hung off it. Appears in the hero, the reader, and the diff.
  // It is structure, not decoration.
  addComponents({
    '.spec-rule': {
      position: 'relative',
      paddingLeft: '3.25rem',
      '&::before': {
        content: "''",
        position: 'absolute',
        left: '2.25rem',
        top: '0.25rem',
        bottom: '0.25rem',
        width: '1px',
        backgroundColor: theme('colors.rule.DEFAULT'),
      },
      '@screen sm': {
        paddingLeft: '4.5rem',
        '&::before': { left: '3.25rem' },
      },
    },
    '.clause-number': {
      position: 'absolute',
      left: '0',
      width: '1.75rem',
      textAlign: 'right',
      fontFamily: theme('fontFamily.mono'),
      fontSize: '0.6875rem',
      lineHeight: '1.7rem',
      color: theme('colors.rule.foreground'),
      fontVariantNumeric: 'tabular-nums',
      '@screen sm': { width: '2.75rem' },
      // The clause currently being written.
      '&[data-active="true"]': { color: theme('colors.primary.DEFAULT') },
    },
  })

  addUtilities({
    '.animate-caret': {
      animation: 'caret-blink 1.1s steps(1) infinite',
    },
    // One-shot: a clause that just finished generating settles into place.
    '.animate-clause-in': {
      animation: 'clause-in 220ms ease-out both',
    },
    '.tabular': { fontVariantNumeric: 'tabular-nums' },
  })
})

export { KEYFRAMES }
