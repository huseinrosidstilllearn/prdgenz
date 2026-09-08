'use client'

import { useEffect, useState } from 'react'
import { ProviderSelector } from '@prdgenz/ui'
import { AI_PROVIDERS, Language } from '@prdgenz/shared'

const PROVIDER_IDS: string[] = AI_PROVIDERS.map((p) => p.id as string)
const DEFAULT_PROVIDER = PROVIDER_IDS[0]
const DEFAULT_MODEL = AI_PROVIDERS[0].models[0] as string

/**
 * Shared generation-bar state: language + provider + model, persisted to
 * localStorage so users don't re-choose every time.
 */
export function useGenerationSetup() {
  const [language, setLanguage] = useState<Language>(Language.EN)
  const [provider, setProvider] = useState<string>(DEFAULT_PROVIDER)
  const [model, setModel] = useState<string | undefined>(DEFAULT_MODEL)
  const [configuredIds, setConfiguredIds] = useState<string[]>([])

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('prdgenz:lang')
      if (savedLang === 'ID' || savedLang === 'EN') setLanguage(savedLang as Language)
      const savedProv = localStorage.getItem('prdgenz:provider')
      if (savedProv && PROVIDER_IDS.includes(savedProv)) setProvider(savedProv)
    } catch {
      /* private mode */
    }
    fetch('/api/ai/providers')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.providers) {
          setConfiguredIds(d.providers.filter((p: any) => p.configured).map((p: any) => p.id))
        }
      })
      .catch(() => {})
  }, [])

  function changeLanguage(l: Language) {
    setLanguage(l)
    try {
      localStorage.setItem('prdgenz:lang', l)
    } catch {
      /* ignore */
    }
  }

  function changeProvider(p: string) {
    setProvider(p)
    try {
      localStorage.setItem('prdgenz:provider', p)
    } catch {
      /* ignore */
    }
  }

  const selector = (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="grid gap-2">
        <label htmlFor="lang" className="text-sm font-medium">
          Output Language
        </label>
        <select
          id="lang"
          value={language}
          onChange={(e) => changeLanguage(e.target.value as Language)}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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

  return { language, provider, model, configuredIds, setModel, config: selector }
}
