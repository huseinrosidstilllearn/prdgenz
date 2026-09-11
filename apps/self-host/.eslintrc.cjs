/** ESLint config for the self-host app — next lint (Next.js 14, ESLint 8). */
module.exports = {
  extends: ['next/core-web-vitals'],
  ignorePatterns: [
    'node_modules/',
    '.next/',
    '.turbo/',
    'coverage/',
    'src/generated/',
    'next-env.d.ts',
  ],
}
