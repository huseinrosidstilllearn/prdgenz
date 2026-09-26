import type { ReactNode } from 'react'
import Link from 'next/link'
import { ThemeToggle, cn } from '@prdgenz/ui'
import { Wordmark } from './wordmark'

export interface NavItem {
  href: string
  label: string
  /** Matches nested routes too, so /prd/abc keeps "PRDs" lit. */
  active?: boolean
}

/**
 * App shell: a thin left rail with the destinations that actually exist, and a
 * single reading column. No stat row, no filler feed, no decorative sidebar
 * sections.
 */
export function AppShell({
  nav,
  children,
  railExtra,
  headerExtra,
  maxWidth = '3xl',
}: {
  nav: NavItem[]
  children: ReactNode
  railExtra?: ReactNode
  headerExtra?: ReactNode
  maxWidth?: '2xl' | '3xl' | '4xl' | 'full'
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[13rem_minmax(0,1fr)]">
      {/* Rail: wordmark and navigation only. */}
      <aside className="hidden border-r bg-surface-sunken lg:flex lg:flex-col">
        <div className="flex h-14 items-center border-b px-5">
          <Wordmark />
        </div>
        <nav className="flex-1 space-y-0.5 p-3" aria-label="Main">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.active ? 'page' : undefined}
              className={cn(
                'flex items-center rounded-md px-2.5 py-1.5 text-sm transition-colors duration-[120ms]',
                item.active
                  ? 'bg-primary-soft font-medium text-primary-soft-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {railExtra ? (
          <div className="border-t p-3 text-xs text-muted-foreground">
            {railExtra}
          </div>
        ) : null}
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Compact bar: the same destinations, reachable without the rail. */}
        <header className="flex h-14 items-center gap-3 border-b px-4 sm:px-6">
          <Wordmark className="lg:hidden" />
          <nav
            className="flex flex-1 items-center gap-1 text-sm lg:hidden"
            aria-label="Main"
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={item.active ? 'page' : undefined}
                className={cn(
                  'rounded-md px-2.5 py-1.5 transition-colors',
                  item.active
                    ? 'bg-primary-soft font-medium text-primary-soft-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {headerExtra}
            <ThemeToggle />
          </div>
        </header>

        <main
          className={cn(
            'flex-1 px-4 py-8 sm:px-6 sm:py-10',
            maxWidth === 'full' ? '' : 'mx-auto w-full',
            maxWidth === '2xl' && 'max-w-2xl',
            maxWidth === '3xl' && 'max-w-3xl',
            maxWidth === '4xl' && 'max-w-4xl'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
