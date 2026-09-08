/** Generate a random UUID (works in Node 20+ and browsers). */
export function generateId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/** Parse an AI response into JSON, tolerating surrounding prose (PRD §6.2.3). */
export function parseAIResponse<T = unknown>(content: string): T {
  const trimmed = content.trim()
  try {
    return JSON.parse(trimmed) as T
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0]) as T
      } catch {
        /* fall through */
      }
    }
    throw new Error('Failed to parse AI response as JSON')
  }
}

/** Mask an API key for display (PRD §15: "masked display"). */
export function maskApiKey(key: string): string {
  if (key.length <= 8) return '****'
  return `${key.slice(0, 4)}****${key.slice(-4)}`
}

/**
 * AES-256-GCM secret encryption via Web Crypto — works in Node 20+ and
 * browsers. `secretHex` must be 64 hex chars (32 bytes) — PRD §7.2.
 * Output format: base64(iv[12] + ciphertext + authTag).
 */
export async function encryptSecret(plain: string, secretHex: string): Promise<string> {
  const key = await importAesKey(secretHex)
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await globalThis.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plain)
  )
  const bytes = new Uint8Array(iv.length + ciphertext.byteLength)
  bytes.set(iv, 0)
  bytes.set(new Uint8Array(ciphertext), iv.length)
  return bytesToBase64(bytes)
}

/** Decrypt a secret produced by `encryptSecret`. */
export async function decryptSecret(encrypted: string, secretHex: string): Promise<string> {
  const key = await importAesKey(secretHex)
  const bytes = base64ToBytes(encrypted)
  const iv = bytes.slice(0, 12)
  const data = bytes.slice(12)
  const plain = await globalThis.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
  return new TextDecoder().decode(plain)
}

async function importAesKey(secretHex: string): Promise<CryptoKey> {
  if (!/^[0-9a-fA-F]{64}$/.test(secretHex)) {
    throw new Error('ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)')
  }
  const raw = new Uint8Array(32)
  for (let i = 0; i < 32; i++) {
    raw[i] = parseInt(secretHex.slice(i * 2, i * 2 + 2), 16)
  }
  return globalThis.crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ])
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

/** Format a date in the requested locale. */
export function formatDate(date: Date, language: 'id' | 'en' = 'en'): string {
  return new Intl.DateTimeFormat(language === 'id' ? 'id-ID' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/** URL-safe slug from arbitrary text. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Truncate long text for list previews. */
export function truncate(text: string, max = 120): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`
}
