/**
 * Resolve which two revisions to compare.
 *
 * An explicit from/to pair wins when both exist and differ. Otherwise fall
 * back to the current version against the newest one below it, which is what
 * a user means by "what changed". Returns null when there is nothing to
 * compare, so callers can render a real empty state instead of guessing.
 */
export function resolveVersionPair(
  available: number[],
  currentVersion: number,
  fromQuery?: string,
  toQuery?: string
): { from: number; to: number } | null {
  const fromNum = fromQuery !== undefined ? Number.parseInt(fromQuery, 10) : NaN
  const toNum = toQuery !== undefined ? Number.parseInt(toQuery, 10) : NaN

  const fromValid = Number.isInteger(fromNum) && available.includes(fromNum)
  const toValid = Number.isInteger(toNum) && available.includes(toNum)

  if (fromValid && toValid && fromNum !== toNum) return { from: fromNum, to: toNum }

  const to = currentVersion
  const sorted = [...available].sort((a, b) => b - a)
  const below = sorted.find((v) => v < to)
  if (below === undefined) return null
  return { from: below, to }
}
