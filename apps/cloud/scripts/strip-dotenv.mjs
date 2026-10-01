/**
 * Strip .env files out of the OpenNext build output.
 *
 * Next.js `output: 'standalone'` traces and copies .env files into the
 * standalone bundle, and OpenNext then copies that bundle verbatim into the
 * Worker payload. Left alone, the production DATABASE_URL (with its password),
 * NEXTAUTH_SECRET and ENCRYPTION_KEY are uploaded to Cloudflare as plain files
 * in the deploy artifact, instead of living only in encrypted Worker secrets.
 *
 * Runs after `opennextjs-cloudflare build`, before `wrangler deploy`.
 */
import { existsSync, readdirSync, statSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'

const OPEN_NEXT_DIR = join(process.cwd(), '.open-next')
const removed = []

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      walk(full)
      continue
    }
    const name = entry.toLowerCase()
    if (name === '.env' || name.startsWith('.env.')) {
      unlinkSync(full)
      removed.push(full.slice(process.cwd().length + 1))
    }
  }
}

if (!existsSync(OPEN_NEXT_DIR)) {
  console.error('strip-dotenv: .open-next not found — did the build run?')
  process.exit(1)
}

walk(OPEN_NEXT_DIR)

if (removed.length === 0) {
  console.log('strip-dotenv: no .env files found in the build output (nothing to do)')
} else {
  console.log(`strip-dotenv: removed ${removed.length} secret file(s) from the build output:`)
  for (const f of removed) console.log(`  - ${f}`)
}
