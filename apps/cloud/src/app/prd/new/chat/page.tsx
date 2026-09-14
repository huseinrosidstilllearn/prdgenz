'use client'

import { useEffect, useRef, useState } from 'react'
import { AIChatBubble, Button, Card, CardContent, Textarea } from '@prdgenz/ui'
import type { PRDContent } from '@prdgenz/shared'
import { useGenerationSetup } from '@/hooks/use-generation-setup'

interface Msg {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  const setup = useGenerationSetup()
  const [messages, setMessages] = useState<Msg[]>([])
  const [draft, setDraft] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamText])

  async function send() {
    const text = draft.trim()
    if (!text || streaming) return
    setError(null)
    setDraft('')
    const history: Msg[] = [...messages, { role: 'user', content: text }]
    setMessages(history)
    setStreaming(true)
    setStreamText('')
    const abort = new AbortController()
    abortRef.current = abort

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abort.signal,
        body: JSON.stringify({
          language: setup.language,
          provider: setup.provider,
          model: setup.model,
          messages: history,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Chat request failed')
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let full = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''
        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith('data:')) continue
          const evt = JSON.parse(line.slice(5).trim())
          if (evt.type === 'delta') {
            full += evt.text
            setStreamText(full)
          } else if (evt.type === 'done') {
            setMessages((m) => [...m, { role: 'assistant', content: evt.full ?? full }])
            setStreamText('')
            if (evt.full?.trim().startsWith('{')) {
              try {
                const content = JSON.parse(evt.full) as PRDContent
                if (content?.title && content?.features) {
                  await saveChatPRD(history)
                }
              } catch {
                /* not a PRD json — keep chatting */
              }
            }
          } else if (evt.type === 'error') {
            throw new Error(evt.error)
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setError((e as Error).message)
    } finally {
      setStreaming(false)
    }
  }

  async function saveChatPRD(history: Msg[]) {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: setup.language,
        mode: 'CHAT',
        provider: setup.provider,
        model: setup.model,
        input: history,
      }),
    })
    const data = await res.json().catch(() => null)
    if (data?.saved?.prdId) window.location.href = `/prd/${data.saved.prdId}`
  }

  return (
    <div className="container flex max-w-3xl flex-1 flex-col py-10">
      <div className="mb-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Chat Mode</h1>
          <p className="text-sm text-muted-foreground">
            Discuss your idea: the AI asks clarifying questions. Say &quot;generate&quot; to get the full PRD.
          </p>
        </div>
        {setup.config}
      </div>

      <Card className="flex flex-1 flex-col">
        <CardContent className="flex flex-1 flex-col gap-4 p-6">
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
            {messages.length === 0 && (
              <p className="mt-8 text-center text-sm text-muted-foreground">
                Start by describing your product idea…
              </p>
            )}
            {messages.map((m, i) => (
              <AIChatBubble key={i} role={m.role} content={m.content} />
            ))}
            {streaming && (
              <AIChatBubble role="assistant" content={streamText || '…'} streaming />
            )}
            <div ref={bottomRef} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
              rows={2}
              disabled={streaming}
            />
            {streaming ? (
              <Button variant="outline" onClick={() => abortRef.current?.abort()}>
                Stop
              </Button>
            ) : (
              <Button onClick={send} disabled={!draft.trim()}>
                Send
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}