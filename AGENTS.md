# PRD GenZ — Agent Instructions

## Repo layout
- `apps/cloud` — Next.js 15 cloud app (Cloudflare Workers via OpenNext, live at https://prdgenz.my.id)
- `apps/self-host` — Self-hosted app (SQLite, single-user, Docker)
- `packages/shared` — Types, validation, AI prompts, templates
- `packages/ui` — Design system: tokens, fonts, Tailwind preset, UI primitives (`@prdgenz/ui`)
- `packages/app` — App shell and every view both apps share (`@prdgenz/app`)
- `apps/cloud/e2e` — Playwright E2E (needs PostgreSQL on localhost:5432, `E2E_DATABASE_URL`)

## Commands (run in PowerShell from the repo root)
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Unit tests: `pnpm test` / `pnpm test:coverage`
- E2E: `pnpm e2e` (needs PostgreSQL on localhost:5432, `E2E_DATABASE_URL`)
- Prisma client must be generated before typecheck: `pnpm --filter @prdgenz/cloud db:generate`
- Cloudflare deploy: `pnpm --filter @prdgenz/cloud run deploy:cf` (build → patch-worker → strip-dotenv → deploy)

## Cloudflare Workers deploy pipeline
Config lives in `apps/cloud/wrangler.toml` (worker entry, ASSETS binding, `CF_WORKERS`,
the prdgenz.my.id custom domain). Two post-build scripts patch the OpenNext output;
both run inside `build:cf` / `deploy:cf`:
- `scripts/patch-worker.mjs` — rewrites next-server's `getMiddlewareManifest()` to
  return null. Its raw `require(middlewareManifestPath)` cannot be resolved by esbuild
  and 500s every request on workerd (opennextjs-cloudflare #1232/#1380). The script
  fails the build loudly if the pattern disappears in a next/adapter upgrade.
- `scripts/strip-dotenv.mjs` — deletes .env files from the build output so secrets
  never ship inside the Worker artifact.

Auth for pages lives in server layouts (`src/lib/page-auth.ts`), not middleware: the
adapter disables Node middleware on Workers. Any layout calling `requirePageUser()`
must also `export const dynamic = 'force-dynamic'` — otherwise the build prerenders
the route and `assertProdSecrets` kills the build in CI, which has no secrets.

The Workers build runs fine on Windows, but fails with `EPERM` removing `.open-next`
if a previous `wrangler dev` is still around — kill `workerd.exe`/`esbuild.exe` first.

## CI is the source of truth for build verification
Do not use `pnpm build` locally to check a change compiles — CI (ubuntu-latest) is
the only place the full build matrix and the Docker image get built. The cloud app's
Workers build (`pnpm --filter @prdgenz/cloud build:cf`) does work on Windows.

Push and read the run instead:
- `gh run list --limit 1` to get the run id
- `gh run view <id> --json jobs` to see which of build / e2e / docker failed
- `gh run view --job <jobId> --log-failed` for the log once the run completes
- `gh api repos/<owner>/<repo>/actions/jobs/<jobId>/logs --allow-escape-sequences`
  to read a completed job's log while the rest of the run is still going

CI runs on `ubuntu-latest` and is the only place `next build` and the Docker
image actually get built. Do not use WSL for this: the VM restarts between
shell invocations here and long builds get killed mid-flight.

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
