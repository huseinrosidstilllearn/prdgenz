import Link from 'next/link'
import type { SVGProps } from 'react'
import { Badge, Button, ModeCard, IconChip, ShimmerButton, ThemeToggle } from '@prdgenz/ui'
import { FREE_PLAN_LIMIT, PRO_PRICE } from '@prdgenz/shared'

// Icons — lucide-style strokes, same visual family as ngodingpakeai.
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
    chipClass: 'bg-emerald-950/80 text-emerald-400 dark:bg-emerald-400/15',
  },
  {
    href: '/prd/new/chat',
    badge: null,
    beam: false,
    title: 'Chat Mode',
    description: 'Ngobrol santai: AI nanya balik, konteks penuh diingat, PRD terbentuk natural.',
    icon: ChatIcon,
    chipClass: 'bg-indigo-950/80 text-indigo-400 dark:bg-indigo-400/15',
  },
  {
    href: '/prd/new/oneshot',
    badge: null,
    beam: false,
    title: 'One-Shot Mode',
    description: 'Paste ide, langsung keluar PRD profesional siap dipake. Satu input, satu output.',
    icon: BoltIcon,
    chipClass: 'bg-amber-950/80 text-amber-500 dark:bg-amber-400/15',
  },
]

const STATS = [
  { label: 'Mode Generate', value: '3' },
  { label: 'Export Format', value: 'MD+PDF' },
  { label: 'Versi Gratis', value: `${FREE_PLAN_LIMIT}/bln` },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Sticky blurred header like ngodingpakeai */}
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
        {/* Hero: headline + mode cards */}
        <section className="flex flex-col items-center px-4 pb-24 pt-16 sm:px-6 sm:pt-20">
          <div className="w-full max-w-4xl space-y-10">
            <div className="space-y-6 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                {STATS.map((s) => `${s.value} ${s.label}`).join(' · ')}
              </p>

              <h1 className="text-gradient font-heading text-4xl font-bold tracking-tight sm:text-5xl">
                Mau bikin PRD apa hari ini?
              </h1>
              <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
                PRD GenZ ngubah ide jadi Product Requirements Document yang
                siap dipake AI coding agent. <span className="font-semibold text-foreground">Gratis</span> untuk
                mulai, API key kamu sendiri.
              </p>
              <div className="flex justify-center pt-2">
                <ShimmerButton asChild>
                  <Link href="/register">Buat PRD Pertama</Link>
                </ShimmerButton>
              </div>
            </div>

            {/* Mode cards: beam hanya di Create from Scratch (fitur baru) */}
            <div className="grid gap-4 sm:grid-cols-3">
              {MODES.map((m) => (
                <Link key={m.href} href={m.href} className="group cursor-pointer">
                  <ModeCard beam={m.beam} className="h-full cursor-pointer">
                    {m.badge && (
                      <span className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                        {m.badge}
                      </span>
                    )}
                    <IconChip className={m.chipClass}>
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

            {/* BYOK: secondary bar, bukan mode card */}
            <Link
              href="/register"
              className="flex items-center justify-between gap-4 rounded-xl border-2 bg-card px-6 py-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-ring/40 hover:shadow-md"
            >
              <span className="flex items-center gap-3">
                <KeyIcon className="size-5 text-sky-500" />
                <span className="text-sm font-semibold">BYOK: key AI milikmu sendiri</span>
              </span>
              <span className="text-sm text-muted-foreground">
                OpenAI, Anthropic, Google, atau aggregator apa pun
              </span>
            </Link>

            <p className="text-center text-sm text-muted-foreground">
              Free plan {FREE_PLAN_LIMIT} PRD/bulan · Pro ${PRO_PRICE}/bulan · Self-host kapan
              saja
            </p>
          </div>
        </section>

        {/* Feature strip */}
        <section className="border-t bg-muted/40 py-16">
          <div className="container">
            <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
              {['AI-Ready Output', 'Version History', 'Per-Section Generate', 'Share Link', 'Dark Mode'].map(
                (f) => (
                  <Badge key={f} variant="secondary" className="px-3 py-1">
                    {f}
                  </Badge>
                )
              )}
            </div>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                Dibuat untuk AI coding workflow
              </h2>
              <p className="mt-3 text-muted-foreground">
                Output PRD langsung siap di-feed ke Cline, Cursor, Lovable, atau Claude Code.
                Setiap regenerate tersimpan sebagai versi: diff, compare, restore kapan saja.
              </p>
            </div>
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
