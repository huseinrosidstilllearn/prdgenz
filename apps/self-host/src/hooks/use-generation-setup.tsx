'use client'

import { useEffect, useState } from 'react'
import { ProviderSelector } from '@prdgenz/ui'
import { AI_PROVIDERS, Language } from '@prdgenz/shared'

/**
 * Self-host generation bar: language + provider + model. Providers come from
 * env config (/api/ai/providers reports which *_API_KEY vars are set).
 */
export function useGenerationSetup() {
  const [language, setLanguage] = useState<Language>(Language.EN)
  const [provider, setProvider] = useState<string>(AI_PROVIDERS[0].id)
  const [model, setModel] = useState<string | undefined>(AI_PROVIDERS[0].models[0])
  const [configuredIds, setConfiguredIds] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/ai/providers')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.providers) {
          setConfiguredIds(d.providers.filter((p: any) => p.configured).map((p: any) => p.id))
        }
        if (d?.defaultProvider) setProvider(d.defaultProvider)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  function changeLanguage(l: Language) {
    setLanguage(l)
  }

  function changeProvider(p: string) {
    setProvider(p)
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

  return { language, provider, model, configuredIds, loaded, setModel, config: selector }
}
