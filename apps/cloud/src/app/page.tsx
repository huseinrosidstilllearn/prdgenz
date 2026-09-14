import Link from 'next/link'
import type { SVGProps } from 'react'
import {
  Badge,
  Button,
  ModeCard,
  IconChip,
  ShimmerButton,
  ThemeToggle,
  BlueprintStage,
} from '@prdgenz/ui'
import { FREE_PLAN_LIMIT, PRO_PRICE } from '@prdgenz/shared'

// Icons: lucide-style strokes, one family. Relevance (R-04): wand = compose
// from scratch, chat bubbles = conversation, bolt = single fast pass, key = BYOK.
const WandIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72" />
    <path d="m14 7 3 3" />
    <path d="M5 6v4" />
    <path d="M19 14v4" />
    <path d="M10 2v2" />
    <path d="M7 8H3" />
    <path d="M21 16h-4" />
    <path d="M11 3H9" />
  </svg>
)

const ChatIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M21.5 12c0 5.247-4.253 9.5-9.5 9.5-1.628 0-3.161-.41-4.5-1.131-1.868-1.007-3.125-.071-4.234.097a.28.28 0 0 1-.281-.281c.063-.52.463-2.462-.082-4.099A9.44 9.44 0 0 1 2.5 12c0-5.247 4.253-9.5 9.5-9.5s9.5 4.253 9.5 9.5Z" />
    <path d="M12.005 12h.009" />
    <path d="M8.01 12h.009" />
    <path d="M16 12h.009" />
  </svg>
)

const BoltIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
  </svg>
)

const KeyIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M13.66 6.34a2.83 2.83 0 1 1 4 4L21 11v3l-2 .5-.5 2.5-2.5.5-1 1.5H12l-2-1.5Z" />
    <path d="m8 17 3-3" />
  </svg>
)

const MODES = [
  {
    href: '/prd/new/wizard',
    badge: 'UPDATE BARU',
    beam: true,
    title: 'Create from Scratch',
    description:
      'Susun sendiri step-by-step: atur urutan & pilih section, generate per-section.',
    icon: WandIcon,
  },
  {
    href: '/prd/new/chat',
    badge: null,
    beam: false,
    title: 'Chat Mode',
    description: 'Ngobrol santai: AI nanya balik, konteks penuh diingat, PRD terbentuk natural.',
    icon: ChatIcon,
  },
  {
    href: '/prd/new/oneshot',
    badge: null,
    beam: false,
    title: 'One-Shot Mode',
    description: 'Paste ide, langsung keluar PRD profesional siap dipake. Satu input, satu output.',
    icon: BoltIcon,
  },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between px-2 sm:px-3">
          <Link href="/" className="text-lg font-bold tracking-tight">
            <span className="font-heading font-bold tracking-tight">
              prd<span className="text-primary">genz</span>
            </span>
          </Link>
          <nav className="flex items-center gap-2 text-sm sm:gap-4">
            <Link
              href="/pricing"
              className="hidden text-muted-foreground transition-colors hover:text-foreground sm:inline"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Login
            </Link>
            <ThemeToggle />
            <Button asChild size="sm">
              <Link href="/register">Mulai Gratis</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero: copy left, the document draws itself right. */}
        <section className="container grid items-center gap-10 px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-6 text-center lg:text-left">
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              Mau bikin PRD apa hari ini?
            </h1>
            <p className="mx-auto max-w-xl text-base text-muted-foreground sm:text-lg lg:mx-0">
              PRD GenZ ngubah ide jadi Product Requirements Document yang siap
              dipake AI coding agent.{' '}
              <span className="font-semibold text-foreground">Gratis</span> untuk
              mulai, API key kamu sendiri.
            </p>
            <div className="flex justify-center pt-2 lg:justify-start">
              <ShimmerButton asChild>
                <Link href="/register">Buat PRD Pertama</Link>
              </ShimmerButton>
            </div>
            <p className="text-sm text-muted-foreground">
              Free plan {FREE_PLAN_LIMIT} PRD/bulan · Pro ${PRO_PRICE}/bulan ·
              Self-host kapan saja
            </p>
          </div>

          {/* Centerpiece: the product is the document. */}
          <div className="flex justify-center text-primary lg:justify-end">
            <BlueprintStage className="w-full max-w-sm" />
          </div>
        </section>

        {/* Mode cards: beam only on Create from Scratch (the new feature). */}
        <section className="container px-4 pb-20 sm:px-6">
          <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
            {MODES.map((m) => (
              <Link key={m.href} href={m.href} className="group cursor-pointer">
                <ModeCard beam={m.beam} className="h-full cursor-pointer">
                  {m.badge && (
                    <span className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                      {m.badge}
                    </span>
                  )}
                  <IconChip className="bg-primary/10 text-primary">
                    <m.icon />
                  </IconChip>
                  <div className="mt-4 space-y-1">
                    <h2 className="font-heading text-lg font-bold leading-snug">
                      {m.title}
                    </h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {m.description}
                    </p>
                  </div>
                </ModeCard>
              </Link>
            ))}
          </div>

          {/* BYOK: secondary bar, not a mode card. */}
          <Link
            href="/register"
            className="mx-auto mt-4 flex max-w-4xl items-center justify-between gap-4 rounded-xl border bg-card px-6 py-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-ring/40 hover:shadow-md"
          >
            <span className="flex items-center gap-3">
              <KeyIcon className="size-5 text-primary" />
              <span className="text-sm font-semibold">BYOK: key AI milikmu sendiri</span>
            </span>
            <span className="text-sm text-muted-foreground">
              OpenAI, Anthropic, Google, atau aggregator apa pun
            </span>
          </Link>
        </section>

        {/* Workflow: three real capabilities with concrete proof, not badge soup. */}
        <section className="border-t bg-muted/40 py-16">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                Dibuat untuk AI coding workflow
              </h2>
              <p className="mt-3 text-muted-foreground">
                Output PRD langsung siap di-feed ke Cline, Cursor, Lovable, atau
                Claude Code.
              </p>
            </div>
            <dl className="mx-auto mt-8 grid max-w-4xl gap-6 sm:grid-cols-3">
              <div>
                <dt className="font-heading text-sm font-bold">Version history</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Setiap regenerate tersimpan sebagai versi: diff, compare,
                  restore kapan saja.
                </dd>
              </div>
              <div>
                <dt className="font-heading text-sm font-bold">Per-section generate</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Susun ulang urutan section, sembunyikan yang nggak perlu,
                  generate satu per satu.
                </dd>
              </div>
              <div>
                <dt className="font-heading text-sm font-bold">Export & share</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Markdown + PDF, atau share link view-only tanpa login
                  (password opsional).
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Self-host CTA */}
        <section className="container py-16 text-center">
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Mau full kontrol? Self-host.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Jalanin satu command di infrastrukturmu sendiri: SQLite, tanpa akun,
            API key nggak pernah keluar dari mesinmu.
          </p>
          <pre className="mx-auto mt-6 w-fit rounded-lg border bg-card px-4 py-3 font-mono text-sm shadow-sm">
            docker compose up -d
          </pre>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-2 text-sm text-muted-foreground sm:flex-row">
          <span>© 2026 PRD GenZ · MIT License</span>
          <div className="flex gap-4">
            <Link href="/pricing" className="transition-colors hover:text-foreground">
              Pricing
            </Link>
            <Link href="/login" className="transition-colors hover:text-foreground">
              Login
            </Link>
            <Link href="/register" className="transition-colors hover:text-foreground">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
