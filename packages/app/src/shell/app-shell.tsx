import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle, cn } from "@prdgenz/ui";
import { Wordmark } from "./wordmark";
import { NavIcon } from "./nav-icon";

export interface NavItem {
  href: string;
  label: string;
  /** Matches nested routes too, so /prd/abc keeps "PRDs" lit. */
  active?: boolean;
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
  maxWidth = "3xl",
}: {
  nav: NavItem[];
  children: ReactNode;
  railExtra?: ReactNode;
  headerExtra?: ReactNode;
  maxWidth?: "2xl" | "3xl" | "4xl" | "full";
}) {
  return (
    <div className="workspace-direction min-h-screen lg:grid lg:grid-cols-[14rem_minmax(0,1fr)]">
      {/* First focusable element on every app page: keyboard users skip the rail. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>
      {/* Rail: wordmark and navigation only. */}
      <aside className="sticky top-0 hidden h-screen border-r bg-card lg:flex lg:flex-col">
        <div className="flex h-20 items-center border-b px-5">
          <Wordmark />
        </div>
        <nav className="flex-1 space-y-1 p-3 pt-6" aria-label="Main">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors duration-[120ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                item.href === '/prd/new'
                  ? "bg-primary font-medium text-primary-foreground hover:bg-primary/90"
                  : item.active
                    ? "bg-accent font-medium text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <NavIcon href={item.href} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-5 pb-6 text-xs leading-relaxed text-muted-foreground">
          <p className="mb-1 font-medium text-foreground">A place for product decisions.</p>
          <p>Draft, refine, and keep your requirements together.</p>
        </div>
        {railExtra ? (
          <div className="border-t p-3 text-xs text-muted-foreground">
            {railExtra}
          </div>
        ) : null}
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Compact bar: the same destinations, reachable without the rail. */}
        <header className="flex flex-wrap items-center gap-x-3 border-b bg-card px-4 sm:px-8">
          <Wordmark className="lg:hidden" />
          <p className="hidden py-4 text-sm text-muted-foreground lg:block">
            Workspace <span aria-hidden="true" className="mx-2">/</span>
            <span className="text-foreground">{nav.find((item) => item.active)?.label ?? 'PRDs'}</span>
          </p>
          <nav
            className="order-last -mx-1 flex w-full items-center gap-1 border-t py-2 text-sm lg:hidden"
            aria-label="Main"
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md px-2 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  item.active
                    ? "bg-accent font-medium text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <NavIcon href={item.href} />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex min-h-14 items-center gap-2">
            {headerExtra}
            <ThemeToggle />
          </div>
        </header>

        <main
          id="main-content"
          className={cn(
            "flex-1 px-4 py-8 sm:px-6 sm:py-10",
            maxWidth === "full" ? "" : "mx-auto w-full",
            maxWidth === "2xl" && "max-w-2xl",
            maxWidth === "3xl" && "max-w-3xl",
            maxWidth === "4xl" && "max-w-4xl",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
