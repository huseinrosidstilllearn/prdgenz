export function NavIcon({ href }: { href: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden="true">
      {href.includes('/new') ? <path d="M12 5v14M5 12h14" />
        : href.includes('/settings') ? <><path d="M4 7h16M4 17h16" /><path d="M8 4v6M16 14v6" /></>
        : <><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8Z" /><path d="M14 3v5h5M9 12h6M9 16h6" /></>}
    </svg>
  )
}
