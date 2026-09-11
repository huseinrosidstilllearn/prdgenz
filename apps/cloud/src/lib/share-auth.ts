import { createHash } from 'crypto'

/** Cookie name for a share-link gate (shareId prefix keeps it unique per link). */
export function shareAuthCookieName(shareId: string): string {
  return `shareAuth_${shareId.slice(0, 8)}`
}

/** Signed value the gate cookie must carry: sha256(shareId + passwordHash). */
export function shareAuthValue(shareId: string, passwordHash: string): string {
  return createHash('sha256').update(shareId + passwordHash).digest('hex')
}

/** True when the request cookies carry a valid gate value for this share. */
export function shareAuthValid(
  cookies: { get(name: string): { value: string } | undefined },
  shareId: string,
  passwordHash: string
): boolean {
  const cookie = cookies.get(shareAuthCookieName(shareId))
  return !!cookie && cookie.value === shareAuthValue(shareId, passwordHash)
}