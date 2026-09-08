import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@prdgenz/ui'
import { Button } from '@prdgenz/ui'

const MODES = [
  {
    href: '/prd/new/wizard',
    title: 'Wizard',
    tagline: 'Structured & guided (default)',
    description:
      'Step through idea, target users, features, stories, tech stack, timeline and output format. AI fills each section; you review as you go.',
    bullets: ['8 guided steps', 'Per-section AI generation', 'Real-time preview'],
  },
  {
    href: '/prd/new/chat',
    title: 'Chat',
    tagline: 'Conversational',
    description:
      'Discuss your idea with the AI. It asks clarifying questions, remembers everything, and produces the PRD when you are ready.',
    bullets: ['Context-aware conversation', 'Clarifying questions', 'Streaming responses'],
  },
  {
    href: '/prd/new/oneshot',
    title: 'One-Shot',
    tagline: 'Fastest',
    description:
      'Paste your raw idea and constraints, get a complete professional PRD in a single pass. Regenerate anytime.',
    bullets: ['Single input → full PRD', 'Great for quick drafts', 'One-click regenerate'],
  },
]

/** Mode chooser (PRD §9.2: /prd/new — pilih mode). */
export default function NewPRDPage() {
  return (
    <div className="container max-w-4xl py-16">
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-3xl font-bold">Create a new PRD</h1>
        <p className="text-muted-foreground">Choose how you want to work</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {MODES.map((m) => (
          <Card key={m.href} className="flex flex-col transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>{m.title}</CardTitle>
              <CardDescription>{m.tagline}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <p className="text-sm text-muted-foreground">{m.description}</p>
              <ul className="mb-2 space-y-1 text-sm">
                {m.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="text-primary">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-auto w-full">
                <Link href={m.href}>Start {m.title}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
