/** Only allow same-site relative callback paths (blocks open redirect via // or scheme). */
export function safeCallbackUrl(raw: string | null | undefined, fallback = '/dashboard'): string {
  if (!raw) return fallback
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('://') || raw.includes('\\')) return fallback
  return raw
}
