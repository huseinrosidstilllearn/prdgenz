import {
  IBM_Plex_Mono,
  Instrument_Sans,
  Instrument_Serif,
} from 'next/font/google'

/**
 * Typography for PRD GenZ — one definition, both apps.
 *
 * Instrument Serif is the masthead: this product writes documents, and a
 * document has a serif head. It is deliberately not the usual SaaS sans.
 * Instrument Sans carries the interface at small sizes.
 * IBM Plex Mono marks clause numbers, version stamps, and code, and gives
 * the spec-sheet vernacular its texture.
 */
export const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument-sans',
  display: 'swap',
})

export const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
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
  instrumentSans.variable,
  instrumentSerif.variable,
  ibmPlexMono.variable,
].join(' ')
