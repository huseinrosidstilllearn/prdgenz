import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/api-auth'
import { assertPRDOwnership, getCurrentVersion, ServiceError } from '@/lib/prd-service'

/** Minimal markdown -> HTML transform for the print document (headings, lists, bold, code). */
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
 * POST /api/export/pdf — PRO-only PDF export (PRD §10.4, §14).
 * v1 pragmatic approach: returns a print-optimized HTML document that triggers
 * the browser's Save-as-PDF dialog — avoids a heavy headless-Chromium dependency.
 */
export async function POST(req: Request) {
  const userId = await requireUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
    if (user?.role !== 'PRO') {
      return NextResponse.json(
        { error: 'PDF export is a Pro feature. Upgrade to Pro to enable it.' },
        { status: 403 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const prdId = typeof body?.prdId === 'string' ? body.prdId : null
    if (!prdId) return NextResponse.json({ error: 'prdId is required' }, { status: 400 })

    const prd = await assertPRDOwnership(userId, prdId)
    const version = await getCurrentVersion(prd.id)
    if (!version) {
      return NextResponse.json({ error: 'PRD has no generated content yet' }, { status: 409 })
    }

    const html = `<!DOCTYPE html>
<html lang="${prd.language === 'ID' ? 'id' : 'en'}">
<head>
<meta charset="utf-8">
<title>${prd.title.replace(/</g, '&lt;')}</title>
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
<p class="meta">PRD GenZ — ${prd.title} — v${version.versionNumber}</p>
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
