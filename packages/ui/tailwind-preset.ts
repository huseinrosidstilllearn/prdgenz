import { baseStyles } from './src/tailwind-plugins'

/**
 * Shared Tailwind preset for @prdgenz/ui.
 * Both apps extend this so color, type, and radius stay in one place.
 * Raw values live in src/styles/tokens.css — this file only maps them.
 *
 * Typed structurally rather than by importing tailwindcss: each app resolves
 * tailwindcss on its own, and a cross-package type import would not resolve.
 */
export const preset = {
  darkMode: ['class'],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1280px' },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'],
        heading: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
      },
      colors: {
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: {
          sunken: 'var(--surface-sunken)',
          raised: 'var(--surface-raised)',
        },
        rule: {
          DEFAULT: 'var(--rule)',
          foreground: 'var(--rule-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
          soft: 'var(--primary-soft)',
          'soft-foreground': 'var(--primary-soft-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        success: {
          DEFAULT: 'var(--success)',
          foreground: 'var(--success-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      // MOTION 1: only the streaming caret loops, because it reports real state.
      keyframes: {
        'caret-blink': {
          '0%, 45%': { opacity: '1' },
          '46%, 100%': { opacity: '0' },
        },
        'clause-in': {
          from: { opacity: '0.35' },
          to: { opacity: '1' },
        },
      },
      animation: {
        caret: 'caret-blink 1.1s steps(1) infinite',
        'clause-in': 'clause-in 220ms ease-out both',
      },
    },
  },
  plugins: [baseStyles],
}

export default preset
