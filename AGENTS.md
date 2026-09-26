# PRD GenZ — Agent Instructions

## Repo layout
- `apps/cloud` — Next.js 15 cloud app (Cloudflare Workers via OpenNext, live at https://prdgenz.my.id)
- `apps/self-host` — Self-hosted app (SQLite, single-user, Docker)
- `packages/shared` — Types, validation, AI prompts, templates
- `packages/ui` — Design system: tokens, fonts, Tailwind preset, UI primitives (`@prdgenz/ui`)
- `packages/app` — App shell and every view both apps share (`@prdgenz/app`)
- `apps/cloud/e2e` — Playwright E2E (needs PostgreSQL on localhost:5432, `E2E_DATABASE_URL`)

## Commands (run in WSL Ubuntu)
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Unit tests: `pnpm test` / `pnpm test:coverage`
- E2E: `pnpm e2e` (Windows or WSL with local PostgreSQL)
- Prisma client must be generated before typecheck: `pnpm --filter @prdgenz/cloud db:generate`
- Cloudflare build + deploy: `apps/cloud` → `pnpm build:cf` then `npx wrangler deploy`

## Conventions
- **Design tokens have exactly one home: `packages/ui/src/styles/tokens.css`.** Both apps import it. Never copy a token into an app's `globals.css`. The old "keep both globals.css byte-identical" rule is gone: it caused silent drift and is now unnecessary.
- Base layer, `.spec-rule`, and utilities live in `packages/ui/src/tailwind-plugins.ts` (a Tailwind plugin), not in an `@import`-ed stylesheet, because postcss-import hoists imports above `@tailwind` and the layer then fails to compile. Keyframes stay in `packages/ui/src/styles/base.css` and are imported last.
- Fonts load from `@prdgenz/ui/fonts` (subpath), never from the main barrel: `next/font/google` only works inside the Next build pipeline, and exporting it from `@prdgenz/ui` breaks every vitest suite that imports the package.
- A new workspace package must be added to `transpilePackages` in both `next.config.mjs` files.
- Visual direction lives in `DESIGN.md`. Read it before any UI work.
- Shared views belong in `packages/app`; an app page should be a thin data-fetching wrapper, not a copy of the other app's page.
- UI components: `export function` pattern, smoke test per component (coverage thresholds enforced)
- Do not rename user-facing labels "Create from Scratch" back; internal identifiers (`WIZARD` enum, `WizardStepper`, wizard URL routes) stay untouched
- UI chrome and landing copy are in English; Indonesian applies only to generated PRD content
- Commit style: conventional commits (`feat:`, `fix:`, `docs:`)

## antislop pointer

<!-- antislop: begin — do not remove this block. It loads the antislop filter into every session. -->

**antislop is installed globally** at `C:\Users\husei\.kilo\skills\` (skills: `antislop`, `antislop-ui`, `antislop-copywriting`, `antislop-human`, `antislop-layoutmobile`, `antislop-code`).

When generating or building any UI, copy, or code comments for this project, load the `antislop` core skill first, plus the skill matching the work (`antislop-ui` for UI, `antislop-copywriting` for text, `antislop-layoutmobile` for responsive layouts, `antislop-human` for accessibility, `antislop-code` when touching comments). Ask whether antislop applies **during** or **after** the work before starting UI work. Run the Delivery Gate before shipping.

<!-- antislop: end -->
