import Link from 'next/link'
import type { SVGProps } from 'react'
import { IconChip, ModeCard } from '@prdgenz/ui'

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

const MODES = [
  {
    href: '/prd/new/wizard',
    badge: 'UPDATE BARU',
    beam: true,
    title: 'Create from Scratch',
    description:
      'Susun sendiri step-by-step dari ide ke PRD. Atur urutan section, hide yang nggak perlu, generate per-section.',
    icon: WandIcon,
    chipClass: 'bg-emerald-950/80 text-emerald-400 dark:bg-emerald-400/15',
  },
  {
    href: '/prd/new/chat',
    badge: null,
    beam: false,
    title: 'Chat',
    description:
      'Ngobrol dengan AI: dia nanya balik, ingat konteks penuh, PRD jadi natural. Streaming real-time.',
    icon: ChatIcon,
    chipClass: 'bg-indigo-950/80 text-indigo-400 dark:bg-indigo-400/15',
  },
  {
    href: '/prd/new/oneshot',
    badge: null,
    beam: false,
    title: 'One-Shot',
    description:
      'Paste ide + constraints, langsung keluar PRD lengkap. Cocok untuk draft cepat, regenerate kapan saja.',
    icon: BoltIcon,
    chipClass: 'bg-amber-950/80 text-amber-500 dark:bg-amber-400/15',
  },
]

/** Mode chooser (PRD §9.2: /prd/new — pilih mode). */
export default function NewPRDPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 sm:px-6">
      <div className="w-full max-w-4xl space-y-10">
        <div className="space-y-4 text-center">
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Mau bikin PRD gimana?
          </h1>
          <p className="text-muted-foreground">Pilih cara kerjamu hari ini</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
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
                  <h2 className="font-heading text-lg font-bold leading-snug">{m.title}</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {m.description}
                  </p>
                </div>
              </ModeCard>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
