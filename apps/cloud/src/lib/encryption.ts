import { prisma } from './prisma'
import { decryptSecret, encryptSecret } from '@prdgenz/shared'

/** Require a valid AES-256 key from env (PRD §7.2: 64 hex chars = 32 bytes). */
function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY
  if (!key || !/^[0-9a-fA-F]{64}$/.test(key)) {
    throw new Error('ENCRYPTION_KEY must be set to exactly 64 hex characters (32 bytes)')
  }
  if (process.env.NODE_ENV === 'production' && /^([0-9a-fA-F])\1{63}$/.test(key)) {
    throw new Error('ENCRYPTION_KEY looks like a placeholder (repeated character). Generate a real key with: openssl rand -hex 32')
  }
  return key
}

export async function encryptApiKey(key: string): Promise<string> {
  return encryptSecret(key, getEncryptionKey())
}

export async function decryptApiKey(encrypted: string): Promise<string> {
  return decryptSecret(encrypted, getEncryptionKey())
}

/** A user's decrypted credential for one provider. */
export interface UserCredential {
  apiKey: string
  baseUrl?: string
}

/** Fetch + decrypt a user's API key for a provider (PRD §6.2.2). */
export async function getUserCredential(
  userId: string,
  provider: string
): Promise<UserCredential | null> {
  const row = await prisma.apiKey.findFirst({ where: { userId, provider } })
  if (!row) return null
  try {
    const apiKey = await decryptApiKey(row.keyEncrypted)
    return { apiKey, baseUrl: row.baseUrl ?? undefined }
  } catch {
    return null
  }
}
