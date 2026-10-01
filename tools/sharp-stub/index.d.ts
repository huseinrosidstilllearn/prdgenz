export interface SharpFormatInfo {
  [key: string]: unknown
}

export interface Sharp {
  (input?: unknown, options?: unknown): never
  concurrency: number
  simd: boolean
  cache(): void
  queue(): void
  format: Record<string, SharpFormatInfo>
}

declare const sharp: Sharp
export default sharp
export = sharp
