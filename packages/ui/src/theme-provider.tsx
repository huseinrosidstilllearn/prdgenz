'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: Theme
  setTheme: (theme: Theme) => void
}

const STORAGE_KEY = 'theme'

const ThemeContext = createContext<ThemeContextValue | null>(null)

// The bootstrap is a static string literal, never a stringified function:
// minifiers rewrite function bodies (next-themes' `I.toString()` shipped a
// `__name()` call into the inline script and threw on every page load).
const BOOTSTRAP = `(function(){try{var s=localStorage.getItem('${STORAGE_KEY}')||'system';var t=s==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):s;var e=document.documentElement;e.classList.remove('light','dark');e.classList.add(t);e.style.colorScheme=t;}catch(_){}})();`

function resolve(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') return theme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  const resolved = resolve(theme)
  const el = document.documentElement
  el.classList.remove('light', 'dark')
  el.classList.add(resolved)
  el.style.colorScheme = resolved
  return resolved
}

interface ThemeProviderProps {
  children: ReactNode
  /** Initial theme before any stored preference exists. */
  defaultTheme?: Theme
}

export function ThemeProvider({ children, defaultTheme = 'dark' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(
    defaultTheme === 'system' ? 'dark' : (defaultTheme as 'light' | 'dark'),
  )

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? defaultTheme
    setThemeState(stored)
    setResolvedTheme(applyTheme(stored))
  }, [defaultTheme])

  const setTheme = useCallback(
    (next: Theme) => {
      localStorage.setItem(STORAGE_KEY, next)
      setThemeState(next)
      setResolvedTheme(applyTheme(next))
    },
    [],
  )

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      <script id="prd-theme" dangerouslySetInnerHTML={{ __html: BOOTSTRAP }} />
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
