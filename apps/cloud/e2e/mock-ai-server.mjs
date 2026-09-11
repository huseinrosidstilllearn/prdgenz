/**
 * Minimal OpenAI-compatible mock for E2E (PRD GenZ cloud).
 * Serves POST /v1/chat/completions as SSE (streaming deltas that assemble
 * into the fixture PRD JSON) and GET /v1/models (connection test).
 * Non-production SSRF guard allows 127.0.0.1.
 */
import http from 'node:http'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.MOCK_AI_PORT ?? 3999)

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://127.0.0.1:${PORT}`)

  if (req.method === 'GET' && url.pathname === '/v1/models') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ object: 'list', data: [{ id: 'mock-model' }] }))
    return
  }

  if (req.method === 'POST' && url.pathname === '/v1/chat/completions') {
    // Drain the request body (not needed for the mock response).
    await new Promise((resolve) => {
      req.on('data', () => {})
      req.on('end', resolve)
    })

    const prdJson = await readFile(path.join(here, 'fixtures', 'prd.json'), 'utf8')

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })

    // Stream the PRD JSON in a few chunks as OpenAI-style deltas.
    const chunks = prdJson.match(/[\s\S]{1,900}/g) ?? [prdJson]
    for (const chunk of chunks) {
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: chunk } }] })}\n\n`)
      await new Promise((r) => setTimeout(r, 5))
    }
    res.write('data: [DONE]\n\n')
    res.end()
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'not found' }))
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`mock-ai-server listening on http://127.0.0.1:${PORT}`)
})
