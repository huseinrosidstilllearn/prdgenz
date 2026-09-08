import { PRDContent, Language } from '../types'

/**
 * Render a PRDContent object to a full Markdown document (PRD §6.3).
 */
export function renderPRDToMarkdown(content: PRDContent, language: Language): string {
  const isID = language === Language.ID
  const t = {
    title: isID ? 'Judul' : 'Title',
    summary: isID ? 'Ringkasan' : 'Executive Summary',
    problem: isID ? 'Masalah' : 'Problem Statement',
    targetUser: isID ? 'Target Pengguna' : 'Target User',
    features: isID ? 'Fitur' : 'Features',
    userStories: isID ? 'User Story' : 'User Stories',
    acceptanceCriteria: isID ? 'Kriteria Penerimaan' : 'Acceptance Criteria',
    techStack: 'Tech Stack',
    timeline: 'Timeline',
    outputFormat: isID ? 'Format Output' : 'Output Format',
    risks: isID ? 'Risiko & Mitigasi' : 'Risks & Mitigation',
    successMetrics: isID ? 'Metrik Keberhasilan' : 'Success Metrics',
    openQuestions: isID ? 'Pertanyaan Terbuka' : 'Open Questions',
    asA: isID ? 'Sebagai' : 'As a',
    iWant: isID ? 'saya ingin' : 'I want',
    soThat: isID ? 'sehingga' : 'so that',
    frontend: 'Frontend',
    backend: 'Backend',
    database: isID ? 'Database' : 'Database',
    infrastructure: isID ? 'Infrastruktur' : 'Infrastructure',
    reasoning: isID ? 'Alasan' : 'Reasoning',
    duration: isID ? 'Durasi' : 'Duration',
    impact: isID ? 'Dampak' : 'Impact',
    mitigation: isID ? 'Mitigasi' : 'Mitigation',
  }

  const lines: string[] = []

  lines.push(`# ${content.title}`, '')
  lines.push(`## ${t.summary}`, '', content.summary, '')
  lines.push(`## ${t.problem}`, '', content.problem, '')
  lines.push(`## ${t.targetUser}`, '', content.targetUser, '')

  lines.push(`## ${t.features}`, '')
  content.features.forEach((f) => {
    lines.push(`- **${f.name}** [${f.priority.toUpperCase()}]: ${f.description}`)
  })
  lines.push('')

  lines.push(`## ${t.userStories}`, '')
  content.userStories.forEach((us, i) => {
    lines.push(
      `${i + 1}. **${t.asA}** ${us.asA}, **${t.iWant}** ${us.iWant}, **${t.soThat}** ${us.soThat}`
    )
  })
  lines.push('')

  lines.push(`## ${t.acceptanceCriteria}`, '')
  content.acceptanceCriteria.forEach((ac) => {
    lines.push(`- [ ] ${ac.criteria}`)
  })
  lines.push('')

  lines.push(`## ${t.techStack}`, '')
  lines.push(`- **${t.frontend}**: ${content.techStack.frontend.join(', ')}`)
  lines.push(`- **${t.backend}**: ${content.techStack.backend.join(', ')}`)
  lines.push(`- **${t.database}**: ${content.techStack.database.join(', ')}`)
  lines.push(`- **${t.infrastructure}**: ${content.techStack.infrastructure.join(', ')}`)
  lines.push(`- **${t.reasoning}**: ${content.techStack.reasoning}`, '')

  lines.push(`## ${t.timeline}`, '')
  content.timeline.forEach((tl) => {
    lines.push(`- **${tl.milestone}** (${t.duration}: ${tl.duration}): ${tl.deliverables.join(', ')}`)
  })
  lines.push('')

  lines.push(`## ${t.outputFormat}`, '', content.outputFormat, '')

  if (content.risks && content.risks.length > 0) {
    lines.push(`## ${t.risks}`, '')
    content.risks.forEach((r) => {
      lines.push(`- **${r.description}** (${t.impact}: ${r.impact}) — ${t.mitigation}: ${r.mitigation}`)
    })
    lines.push('')
  }

  if (content.successMetrics && content.successMetrics.length > 0) {
    lines.push(`## ${t.successMetrics}`, '')
    content.successMetrics.forEach((m) => lines.push(`- ${m}`))
    lines.push('')
  }

  if (content.openQuestions && content.openQuestions.length > 0) {
    lines.push(`## ${t.openQuestions}`, '')
    content.openQuestions.forEach((q) => lines.push(`- ${q}`))
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Render an AI-ready coding prompt from a PRD (PRD §6.3.3 "AI-ready prompt").
 * Paste the result into Cline, Cursor, Lovable, etc.
 */
export function renderAIReadyPrompt(content: PRDContent): string {
  return [
    `# AI Coding Prompt`,
    ``,
    `Based on the following PRD, help me build this application step by step.`,
    ``,
    `## Project: ${content.title}`,
    ``,
    content.summary,
    ``,
    `## Problem`,
    content.problem,
    ``,
    `## Target User`,
    content.targetUser,
    ``,
    `## Tech Stack`,
    `- Frontend: ${content.techStack.frontend.join(', ')}`,
    `- Backend: ${content.techStack.backend.join(', ')}`,
    `- Database: ${content.techStack.database.join(', ')}`,
    `- Infrastructure: ${content.techStack.infrastructure.join(', ')}`,
    ``,
    `## Features`,
    ...content.features.map((f) => `- ${f.name} (${f.priority}): ${f.description}`),
    ``,
    `## User Stories`,
    ...content.userStories.map((us) => `- As a ${us.asA}, I want ${us.iWant}, so that ${us.soThat}`),
    ``,
    `## Acceptance Criteria`,
    ...content.acceptanceCriteria.map((ac) => `- [ ] ${ac.criteria}`),
    ``,
    `## Timeline`,
    ...content.timeline.map((tl) => `- ${tl.milestone} (${tl.duration}): ${tl.deliverables.join(', ')}`),
    ``,
    `## Output`,
    content.outputFormat,
    ``,
    `Please start by setting up the project structure, then implement the core features first.`,
  ].join('\n')
}
