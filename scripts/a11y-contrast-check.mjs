// WCAG contrast check for PRD GenZ design tokens (oklch -> sRGB -> ratio).
// Usage: node scripts/a11y-contrast-check.mjs
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function oklchToLinearSRGB(L, C, H) {
  // L,C,H -> OKLab -> OKLMS -> linear sRGB (Björn Ottosson's matrices)
  const h = (H * Math.PI) / 180
  const l = L + C * Math.cos(h)
  const m = L + C * 0.3963377774 * Math.sin(h) - 0.0112803717 * Math.cos(h) // wait, use proper matrix below
  // Proper OKLab conversion:
  const l_ = L + 0.3963377774 * C * Math.cos(h) + 0.2158037573 * C * Math.sin(h)
  const m_ = L - 0.1055613458 * C * Math.cos(h) - 0.0638541728 * C * Math.sin(h)
  const s_ = L - 0.0894841775 * C * Math.cos(h) - 1.291485548 * C * Math.sin(h)
  const l3 = l_ ** 3, m3 = m_ ** 3, s3 = s_ ** 3
  const r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3
  const g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3
  const b = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3
  return [r, g, b]
}

function linToSRGB(c) {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
  return Math.min(255, Math.max(0, Math.round(v * 255)))
}

function luminanceFromLin([r, g, b]) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function parseOklch(str) {
  const m = str.match(/oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.-]+)/)
  if (!m) throw new Error('bad oklch: ' + str)
  return [parseFloat(m[1]) / 100, parseFloat(m[2]), parseFloat(m[3])]
}

function relLum(token) {
  const [L, C, H] = parseOklch(token)
  return luminanceFromLin(oklchToLinearSRGB(L, C, H))
}

function ratio(a, b) {
  const la = relLum(a), lb = relLum(b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

function css(t) {
  const [L, C, H] = parseOklch(t)
  const [r, g, b] = oklchToLinearSRGB(L, C, H).map(linToSRGB)
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

// Parse tokens.css blocks
const cssText = readFileSync(join(root, 'packages/ui/src/styles/tokens.css'), 'utf8')
function parseBlock(name) {
  const m = cssText.match(new RegExp(`${name == 'light' ? ':root' : '\\.dark'} \\{([\\s\\S]*?)\\n\\}`))
  if (!m) throw new Error('block not found: ' + name)
  const vars = {}
  for (const line of m[1].split('\n')) {
    const v = line.match(/--([a-z-]+):\s*([^;]+);/)
    if (v) vars[v[1]] = v[2].trim()
  }
  return vars
}

const themes = { light: parseBlock('light'), dark: parseBlock('dark') }

// Pairings: [text token, background token, context, large-ok?]
const PAIRINGS = [
  ['foreground', 'background', 'body text on page', false],
  ['foreground', 'card', 'body text on card', false],
  ['card-foreground', 'card', 'card text', false],
  ['secondary-foreground', 'secondary', 'secondary text/chip', false],
  ['muted-foreground', 'background', 'muted text on page (helper text, timestamps)', false],
  ['muted-foreground', 'card', 'muted text on card', false],
  ['muted-foreground', 'muted', 'muted text on muted chip', false],
  ['muted-foreground', 'surface-sunken', 'muted text on sunken panel', false],
  ['accent-foreground', 'accent', 'accent chip text', false],
  ['primary-foreground', 'primary', 'text on primary button (CTA)', false],
  ['primary-soft-foreground', 'primary-soft', 'text on soft primary chip', false],
  ['primary', 'background', 'primary as text/link on page', false],
  ['primary', 'card', 'primary as text/link on card', false],
  ['destructive-foreground', 'destructive', 'text on destructive button', false],
  ['destructive', 'background', 'destructive as text on page (error message)', false],
  ['destructive', 'card', 'destructive as text on card', false],
  ['success-foreground', 'success', 'text on success badge', false],
  ['success', 'background', 'success as text on page', false],
  ['rule-foreground', 'background', 'clause numbers / margin labels', false],
  ['rule-foreground', 'card', 'clause numbers on card', false],
  ['secondary-foreground', 'background', 'secondary text on page', false],
]

// Non-text: 3:1
const NONTEXT = [
  ['ring', 'background', 'focus ring on page'],
  ['ring', 'card', 'focus ring on card'],
  ['border', 'background', 'input/card border on page'],
  ['border', 'card', 'card border on card'],
  ['border-strong', 'background', 'strong border on page'],
  ['primary', 'background', 'primary boundary / selected state on page'],
  ['primary', 'card', 'primary boundary on card'],
  ['destructive', 'background', 'destructive boundary on page'],
  ['rule', 'background', 'margin rule vs page'],
]

for (const [theme, vars] of Object.entries(themes)) {
  console.log(`\n=== ${theme.toUpperCase()} ===`)
  let fails = 0
  for (const [fg, bg, why] of PAIRINGS) {
    if (!vars[fg] || !vars[bg]) { console.log(`  SKIP ${fg}/${bg}`); continue }
    const r = ratio(vars[fg], vars[bg])
    const pass = r >= 4.5
    if (!pass) fails++
    console.log(`  ${pass ? 'PASS' : 'FAIL'} ${r.toFixed(2)}:1  ${fg} on ${bg}  (${css(vars[fg])} on ${css(vars[bg])})  ${why}`)
  }
  for (const [fg, bg, why] of NONTEXT) {
    if (!vars[fg] || !vars[bg]) { console.log(`  SKIP ${fg}/${bg}`); continue }
    const r = ratio(vars[fg], vars[bg])
    const pass = r >= 3.0
    if (!pass) fails++
    console.log(`  ${pass ? 'PASS' : 'FAIL'} ${r.toFixed(2)}:1  ${fg} vs ${bg}  (${css(vars[fg])} vs ${css(vars[bg])})  [non-text] ${why}`)
  }
  console.log(`  -> ${fails} failure(s)`)
}
