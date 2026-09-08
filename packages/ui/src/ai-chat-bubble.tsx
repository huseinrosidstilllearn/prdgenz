'use client'

import { cn } from './lib/utils'

export interface AIChatBubbleProps {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

export function AIChatBubble({ role, content, streaming }: AIChatBubbleProps) {
  const isUser = role === 'user'
  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm',
          isUser
            ? 'rounded-br-sm bg-primary text-primary-foreground'
            : 'rounded-bl-sm bg-muted text-foreground'
        )}
      >
        {content}
        {streaming && (
          <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-current align-middle" />
        )}
      </div>
    </div>
  )
}
