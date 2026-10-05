# PRD GenZ — Approved visual direction

Approved by the user on 2026-10-05 through the interactive reference-direction preview, then authorized for deployment. This supersedes the earlier technical spec-sheet direction.

Reference composition: Huly via SaaSFrame, Codefronts glass navbar and bento patterns. Original layouts and SVG artwork; no copied vendor imagery.

- DM Sans for headings, body, controls, and labels. Local licensed font files live in `packages/ui/src/assets/fonts`; `@prdgenz/ui/fonts` loads them for both apps. Code can use the system monospace family where alignment matters.
- Minimal SVG line icons, 24px coordinate grid, 1.75px stroke, currentColor. Decorative icons stay out of accessible names. Keep text labels for actions.
- Marketing: shared 1184px grid, copy/composer left, illustrated example right; document example below, three mode cards, revision comparison, FAQ and self-host note. Static blue light connects the idea and brief illustration. Glass is limited to the navigation and illustrative surfaces.
- Workspace: clear rail, spacious reading column, restrained card surfaces, matching typography and wordmark. Auth uses a brand panel and focused form. Preserve all real generation, account, and document flows.
- Narrow screens: controls stack, document navigation scrolls locally, illustration cards never obscure their text, mode cards form a single column.
- All colors and font variables live in `packages/ui/src/styles/tokens.css`. Landing layout is scoped in shared `landing.css`, imported by both apps. Shared views belong in `packages/app`.
- Labels are English. Self-host is outside cloud subscriptions. Free and Pro both include modes, sharing and history; cloud PDF remains Pro.
- Examples are labelled examples and never represent saved user work or successful AI generation. No invented social proof or activity counts.
- Keyboard focus, skip links, native buttons, details and labelled fields remain usable. Functional state announcements use status/alert. No perpetual decorative animations. Respect reduced motion and existing theme preference.

Validate typecheck, lint, meaningful interaction tests, CI builds and E2E, plus desktop/mobile browser checks. Run `node scripts/a11y-contrast-check.mjs` for shared token contrast.
