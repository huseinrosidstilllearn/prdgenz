import { IBM_Plex_Mono, Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google'

/**
 * Typography for PRD GenZ — one definition, both apps.
 *
 * Space Grotesk is the display face: technical and geometric, it reads like
 * drafting typography rather than a book head. Plus Jakarta Sans carries the
 * interface at small sizes. IBM Plex Mono marks clause numbers, version
 * stamps, and code, and gives the spec-sheet vernacular its texture.
 */
export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

/** Class list to drop on <html> or <body>. */
export const fontVariables = [
  plusJakartaSans.variable,
  spaceGrotesk.variable,
  ibmPlexMono.variable,
].join(' ')
