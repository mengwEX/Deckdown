# Repository Guidelines

## Decision Framework

Maintain Deckdown with first principles, Occam's razor, and Bayesian updating. Start from the product boundary: Deckdown turns one `.dd` file into a validated, previewable, presentable, and exportable deck. Prefer the simplest change that preserves that boundary. Update confidence as code, tests, docs, and user feedback provide evidence.

## Project Structure

Deckdown is a TypeScript-first pnpm monorepo. `apps/web` is the React/Vite editor and preview app. `apps/desktop` is the Tauri shell; Rust code and Tauri config live in `apps/desktop/src-tauri`. Shared packages live in `packages`: `parser`, `compiler`, `renderer`, `exporter`, `cli`, and `schema`. Canonical decks live in `packages/examples/decks`. Product docs live in `docs`. The public Deckdown skill lives in `skills/deckdown`.

## Ownership Boundaries

Keep shared packages independent from app code. Packages may import other `@deckdownjs/*` packages, but must not import from `apps/*`. The parser is the format authority. The renderer owns safe slide mounting and standalone HTML. The exporter must use the same parsed deck and compiled CSS as preview. The desktop app should wire native workflows without forking parsing, compiling, or rendering behavior.

## Commands

- `pnpm install`: install workspace dependencies with pnpm 10.
- `pnpm dev:web`: run the web app locally.
- `pnpm --filter @deckdownjs/desktop dev`: run the Tauri desktop app.
- `pnpm check`: run TypeScript checks across packages and apps.
- `pnpm build`: build shared packages and the web app.
- `pnpm validate`: validate `packages/examples/decks/chordedit.dd`.
- `pnpm deckdown -- --help`: inspect CLI usage after packages are built.

## Coding Style

Use ESM TypeScript, strict types, and two-space indentation. Prefer explicit exported interfaces and focused functions with names like `DeckDocument`, `parseDeckdown`, and `compileDeckStyles`. React components use PascalCase. Hooks, helpers, variables, and file-local functions use camelCase. Use `@deckdownjs/<package>` workspace imports instead of relative cross-package paths.

## Format And Security Rules

Deckdown `.dd` files are single-file documents. V0.1 targets `1920x1080`, `16:9`, and `deckdown@0.1`. Every slide must be one root `<section>` with `relative`, `w-[1920px]`, `h-[1080px]`, and `overflow-hidden`. Preserve isolation: block scripts, inline event handlers, remote stylesheets, remote scripts, remote assets, iframes, objects, and embeds unless the architecture and format docs are deliberately updated.

## Testing And Verification

There is no committed `test` script yet. Until one is added, use `pnpm check`, `pnpm build`, and `pnpm validate` as the default gate. For narrow docs or skill-only changes, validate any touched example deck with `node packages/cli/dist/index.js validate <file>` when the built CLI is available. Future tests should follow the plan in `docs/TECH_STACK.md`: Vitest unit tests for parser/compiler, CLI integration tests, Playwright export smoke tests, and visual regression tests for canonical decks.

## Skill Maintenance

Keep `skills/deckdown` aligned with `docs/FORMAT.md` and canonical examples. In project copy, call it the Deckdown skill. If the `.dd` format changes, update `skills/deckdown/SKILL.md`, `skills/deckdown/references/*`, and `skills/deckdown/examples/*` in the same change.

## Documentation And License

Public behavior changes require docs updates in `docs/` or README, whichever is closer to the user-facing surface. Deckdown is MIT licensed. Keep `package.json` license metadata and the root `LICENSE` file in sync.

## Git And Pull Requests

Use concise, imperative, lower-case commit subjects, for example `add deckdown skill` or `improve editor preview layout`. Keep one logical change per commit. Pull requests should include a summary, validation commands, linked issue when available, and screenshots or recordings for visible UI changes.
