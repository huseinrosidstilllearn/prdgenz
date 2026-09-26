'use client'

import { useEffect, useState } from 'react'
import { ProviderSelector } from '@prdgenz/ui'
import { AI_PROVIDERS, Language } from '@prdgenz/shared'

const PROVIDER_IDS: string[] = AI_PROVIDERS.map((p) => p.id as string)
const DEFAULT_PROVIDER = PROVIDER_IDS[0]
const DEFAULT_MODEL = AI_PROVIDERS[0].models[0] as string

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    // Private mode throws on access rather than returning null.
    return null
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* private mode */
  }
}

export interface GenerationSetup {
  language: Language
  provider: string
  model: string | undefined
  configuredIds: string[]
  setModel: (m: string | undefined) => void
  /** True once /api/ai/providers has answered, so callers can avoid a flash. */
  loaded: boolean
  config: React.ReactNode
}

/**
 * Generation bar state: output language plus provider and model.
 *
 * Resolution order for the provider is saved choice, then the server's
 * defaultProvider, then the first compiled-in provider. The two apps used to
 * disagree here: cloud persisted to localStorage and ignored the server
 * default, self-host honoured the server default and lost the choice on
 * reload. A self-host install with several keys configured needs the server
 * default to win on a fresh browser, and a user who picked a provider should
 * not lose it on reload.
 */
export function useGenerationSetup(): GenerationSetup {
  const [language, setLanguage] = useState<Language>(Language.EN)
  const [provider, setProvider] = useState<string>(DEFAULT_PROVIDER)
  const [model, setModel] = useState<string | undefined>(DEFAULT_MODEL)
  const [configuredIds, setConfiguredIds] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const savedLang = read('prdgenz:lang')
    if (savedLang === 'ID' || savedLang === 'EN') setLanguage(savedLang as Language)

    const savedProvider = read('prdgenz:provider')
    if (savedProvider && PROVIDER_IDS.includes(savedProvider)) setProvider(savedProvider)

    let cancelled = false
    fetch('/api/ai/providers')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return
        if (d?.providers) {
          setConfiguredIds(
            d.providers.filter((p: { configured?: boolean }) => p.configured).map((p: { id: string }) => p.id)
          )
        }
        // Only override when the user has not chosen for themselves.
        if (!savedProvider && d?.defaultProvider) setProvider(d.defaultProvider)
        setLoaded(true)
      })
      .catch(() => {
        if (!cancelled) setLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  function changeLanguage(l: Language) {
    setLanguage(l)
    write('prdgenz:lang', l)
  }

  function changeProvider(p: string) {
    setProvider(p)
    write('prdgenz:provider', p)
  }

  const config = (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="grid gap-2">
        <label htmlFor="lang" className="text-sm font-medium">
          Output language
        </label>
        <select
          id="lang"
          value={language}
          onChange={(e) => changeLanguage(e.target.value as Language)}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="EN">English</option>
          <option value="ID">Bahasa Indonesia</option>
        </select>
      </div>
      <ProviderSelector
        value={provider}
        model={model}
        configuredIds={configuredIds}
        onChange={changeProvider}
        onModelChange={setModel}
      />
    </div>
  )

  return { language, provider, model, configuredIds, setModel, loaded, config }
}
