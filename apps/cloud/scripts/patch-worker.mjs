/**
 * Patch the OpenNext build output for the Workers runtime.
 *
 * Next's next-server.js resolves middleware through
 *   getMiddlewareManifest(){return this.minimalMode?null:require(this.middlewareManifestPath)}
 * The require argument is dynamic, so esbuild leaves it as a runtime require —
 * and workerd has no require. Every request 500s with
 * "Dynamic require of /.next/server/middleware-manifest.json is not supported".
 * This is opennextjs-cloudflare issue #1232 / #1380: the adapter inlines
 * manifests behind loadManifest() but does not cover this raw require.
 *
 * This app ships no middleware (page auth lives in the server layouts), so
 * returning null is exactly what minimal mode would do — without flipping
 * minimalMode and its cache/preload side effects.
 *
 * Fails the build loudly when the pattern is gone (next or adapter upgrade),
 * so a deploy stops instead of shipping a 500-ing worker. Re-check the issues
 * above and update this patch before removing the failure.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const OPEN_NEXT_DIR = join(process.cwd(), '.open-next')
const PATTERN = 'getMiddlewareManifest(){return this.minimalMode?null:require(this.middlewareManifestPath)}'
const PATCHED = 'getMiddlewareManifest(){return null}'

const patched = []
let alreadyPatched = false

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      walk(full)
      continue
    }
    if (!entry.endsWith('.mjs')) continue
    const src = readFileSync(full, 'utf8')
    if (src.includes(PATTERN)) {
      writeFileSync(full, src.split(PATTERN).join(PATCHED))
      patched.push(full.slice(process.cwd().length + 1))
    } else if (src.includes(PATCHED)) {
      alreadyPatched = true
    }
  }
}

walk(OPEN_NEXT_DIR)

if (patched.length === 0) {
  if (alreadyPatched) {
    console.log('patch-worker: build output already patched (nothing to do)')
    process.exit(0)
  }
  console.error(
    'patch-worker: no getMiddlewareManifest call site found in the build output.\n' +
      `Expected the pattern in a .mjs file under ${OPEN_NEXT_DIR}.\n` +
      'If next or @opennextjs/cloudflare changed, check\n' +
      'https://github.com/opennextjs/opennextjs-cloudflare/issues/1232 and #1380\n' +
      'and update this patch before deploying.'
  )
  process.exit(1)
}

for (const f of patched) console.log(`patch-worker: patched ${f}`)
