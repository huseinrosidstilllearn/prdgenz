import { NextResponse } from 'next/server'
import { getCurrentVersion, getPRD, ServiceError } from '@/lib/prd-service'

/** Escape PRD-sourced text before interpolating into the print document. */
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function mdToHtml(md: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return md
    .split('\n')
    .map((line) => {
      const e = escape(line)
      if (/^### /.test(e)) return `<h3>${e.slice(4)}</h3>`
      if (/^## /.test(e)) return `<h2>${e.slice(3)}</h2>`
      if (/^# /.test(e)) return `<h1>${e.slice(2)}</h1>`
      if (/^```/.test(e)) return ''
      if (/^- \[ \] /.test(e)) return `<div class="check">▢ ${e.slice(6)}</div>`
      if (/^- /.test(e)) return `<li>${e.slice(2)}</li>`
      if (/^\d+\. /.test(e)) return `<li>${e.replace(/^\d+\. /, '')}</li>`
      if (e === '') return ''
      return `<p>${e}</p>`
    })
    .join('\n')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+?)`/g, '<code>$1</code>')
}

/**
 * POST /api/export/pdf — PDF export via print-optimized HTML (self-host has no
 * Pro gate — everything is free, PRD §1.1).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const prdId = typeof body?.prdId === 'string' ? body.prdId : null
    if (!prdId) return NextResponse.json({ error: 'prdId is required' }, { status: 400 })

    const prd = await getPRD(prdId)
    const version = await getCurrentVersion(prd.id)
    if (!version) {
      return NextResponse.json({ error: 'PRD has no generated content yet' }, { status: 409 })
    }

    const html = `<!DOCTYPE html>
<html lang="${prd.language === 'ID' ? 'id' : 'en'}">
<head>
<meta charset="utf-8">
<title>${escapeHtml(prd.title)}</title>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; max-width: 780px; margin: 40px auto; color: #1a1a1a; line-height: 1.65; }
  h1 { font-size: 28px; border-bottom: 2px solid #1a1a1a; padding-bottom: 8px; }
  h2 { font-size: 20px; margin-top: 32px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
  h3 { font-size: 16px; margin-top: 24px; }
  li { margin: 4px 0; }
  code { background: #f4f4f4; padding: 1px 4px; border-radius: 3px; font-size: 0.9em; }
  .check { margin: 4px 0; }
  .meta { color: #777; font-size: 13px; margin-bottom: 32px; }
  @media print { body { margin: 0 20mm; } }
</style>
</head>
<body onload="window.print()">
<p class="meta">PRD GenZ (self-hosted) — ${escapeHtml(prd.title)} — v${version.versionNumber}</p>
${mdToHtml(version.contentMd)}
</body>
</html>`

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (err) {
    if (err instanceof ServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[export/pdf]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
