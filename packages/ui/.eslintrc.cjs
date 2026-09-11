/** ESLint config for the UI package (TS + TSX, React components, no Next). */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['plugin:@typescript-eslint/recommended'],
  parserOptions: { sourceType: 'module', ecmaFeatures: { jsx: true } },
  env: { node: true, browser: true, es2022: true },
  rules: {
    // _-prefixed args mark intentionally-unused params (e.g. fetch stubs in tests)
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
  },
  ignorePatterns: ['node_modules/', 'coverage/', '.turbo/'],
}
