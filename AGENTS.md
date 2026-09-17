# PRD GenZ — Agent Instructions

## Repo layout
- `apps/cloud` — Next.js 15 cloud app (Cloudflare Workers via OpenNext, live at https://prdgenz.my.id)
- `apps/self-host` — Self-hosted app (SQLite, single-user, Docker)
- `packages/ui` — Shared UI components (shadcn-style, `@prdgenz/ui`)
- `packages/shared` — Types, validation, AI prompts, templates
- `apps/cloud/e2e` — Playwright E2E (needs PostgreSQL on localhost:5432, `E2E_DATABASE_URL`)

## Commands (run in WSL Ubuntu)
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Unit tests: `pnpm test` / `pnpm test:coverage`
- E2E: `pnpm e2e` (Windows or WSL with local PostgreSQL)
- Cloudflare build + deploy: `apps/cloud` → `pnpm build:cf` then `npx wrangler deploy`

## Conventions
- Design tokens live in `apps/{cloud,self-host}/src/app/globals.css` (oklch) — keep both byte-identical
- Fonts via `next/font/google` in both root layouts — keep both apps in sync
- UI components: `export function` pattern in `packages/ui/src`, smoke test per component (coverage thresholds enforced)
- Do not rename user-facing labels "Create from Scratch" back; internal identifiers (`WIZARD` enum, `WizardStepper`, wizard URL routes) stay untouched
- Commit style: conventional commits (`feat:`, `fix:`, `docs:`)

## antislop pointer

<!-- antislop: begin — do not remove this block. It loads the antislop filter into every session. -->

**antislop is installed globally** at `C:\Users\husei\.kilo\skills\` (skills: `antislop`, `antislop-ui`, `antislop-copywriting`, `antislop-human`, `antislop-layoutmobile`, `antislop-code`).

When generating or building any UI, copy, or code comments for this project, load the `antislop` core skill first, plus the skill matching the work (`antislop-ui` for UI, `antislop-copywriting` for text, `antislop-layoutmobile` for responsive layouts, `antislop-human` for accessibility, `antislop-code` when touching comments). Ask whether antislop applies **during** or **after** the work before starting UI work. Run the Delivery Gate before shipping.

<!-- antislop: end -->
