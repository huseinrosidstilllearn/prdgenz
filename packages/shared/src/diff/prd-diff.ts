/** Per-section diff result between two PRD markdown versions (PRD §6.6 diff view). */
export interface PRDSectionDiff {
  /** Heading text after the '#' markers. */
  heading: string
  /** 1 = document title (H1), 2 = section (H2). */
  level: 1 | 2
  status: 'unchanged' | 'changed' | 'added' | 'removed'
  /** Old body (without the heading line) — absent on 'added'. */
  fromText?: string
  /** New body (without the heading line) — absent on 'removed'. */
  toText?: string
}

interface SplitSection {
  key: string
  heading: string
  level: 1 | 2
  body: string
}

const HEADING_RE = /^#{1,2}\s/

/**
 * Split a rendered PRD markdown document into H1/H2 sections. H3+ lines stay
 * inside the body of their parent section. Sections are keyed by heading text
 * plus an occurrence index so duplicate headings never collide.
 */
function splitSections(md: string): SplitSection[] {
  const lines = md.split('\n')
  const sections: SplitSection[] = []
  const seen = new Map<string, number>()

  let current: SplitSection | null = null
  for (const line of lines) {
    if (HEADING_RE.test(line)) {
      const level = line.startsWith('# ') ? 1 : 2
      const heading = line.replace(/^#{1,2}\s+/, '').trim()
      const occurrence = seen.get(heading) ?? 0
      seen.set(heading, occurrence + 1)
      current = { key: `${heading}#${occurrence}`, heading, level, body: '' }
      sections.push(current)
    } else if (current) {
      current.body += (current.body ? '\n' : '') + line
    }
    // Lines before the first heading are ignored (there are none in practice —
    // renderPRDToMarkdown always starts with the H1 title).
  }

  for (const s of sections) s.body = s.body.trimEnd()
  return sections
}

/**
 * Compare two PRD markdown versions section by section (PRD §6.6).
 * Bodies are compared as exact strings — the shared renderer is deterministic,
 * so identical content always renders byte-identical markdown.
 *
 * Output order: sections in `toMd` document order, then sections only present
 * in `fromMd` ('removed') appended in their `fromMd` order.
 */
export function diffPRDVersions(fromMd: string, toMd: string): PRDSectionDiff[] {
  const from = splitSections(fromMd)
  const fromByKey = new Map(from.map((s) => [s.key, s]))
  const to = splitSections(toMd)

  const result: PRDSectionDiff[] = []
  const matchedFromKeys = new Set<string>()

  for (const toSection of to) {
    const fromSection = fromByKey.get(toSection.key)
    if (fromSection) {
      matchedFromKeys.add(fromSection.key)
      const unchangedBody = fromSection.body === toSection.body
      result.push(
        unchangedBody
          ? {
              heading: toSection.heading,
              level: toSection.level,
              status: 'unchanged',
              fromText: fromSection.body,
              toText: toSection.body,
            }
          : {
              heading: toSection.heading,
              level: toSection.level,
              status: 'changed',
              fromText: fromSection.body,
              toText: toSection.body,
            }
      )
    } else {
      result.push({
        heading: toSection.heading,
        level: toSection.level,
        status: 'added',
        toText: toSection.body,
      })
    }
  }

  for (const fromSection of from) {
    if (!matchedFromKeys.has(fromSection.key)) {
      result.push({
        heading: fromSection.heading,
        level: fromSection.level,
        status: 'removed',
        fromText: fromSection.body,
      })
    }
  }

  return result
}
