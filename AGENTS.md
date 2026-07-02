# Repository Guidelines

## Project Structure & Module Organization

Deckdown is a TypeScript-first pnpm monorepo. `apps/web` contains the React/Vite frontend used by the editor and preview surface. `apps/desktop` wraps that UI in Tauri; Rust sources and Tauri config live in `apps/desktop/src-tauri`. Shared packages live under `packages`: `parser`, `compiler`, `renderer`, `exporter`, `cli`, and `schema`. Canonical sample decks are in `packages/examples/decks`, product/format notes are in `docs`, and the Deckdown skill lives in `skills/deckdown`.

## Build, Test, and Development Commands

- `pnpm install`: install workspace dependencies with pnpm 10.
- `pnpm dev:web`: run the web app with Vite.
- `pnpm --filter @deckdown/desktop dev`: run the Tauri desktop app.
- `pnpm build`: build shared packages, then the web app.
- `pnpm check`: run TypeScript checks across packages plus web and desktop.
- `pnpm validate`: build/use the CLI to validate `packages/examples/decks/chordedit.dd`.
- `pnpm deckdown -- --help`: invoke the local CLI after package builds.

## Coding Style & Naming Conventions

Use ESM TypeScript, strict types, and two-space indentation. Prefer exported interfaces and functions with clear names, such as `DeckDocument`, `parseDeckdown`, and `compileDeckStyles`. Keep shared packages app-agnostic: package code should not import from `apps/*`. Use `@deckdown/<package>` workspace imports instead of relative cross-package paths. React components use PascalCase; hooks, helpers, and variables use camelCase.

## Testing Guidelines

There is no committed `test` script yet. Until one is added, treat `pnpm check`, `pnpm build`, and `pnpm validate` as the required verification gate. Planned coverage in `docs/TECH_STACK.md` and `docs/ARCHITECTURE.md` calls for Vitest unit tests for parser/compiler behavior, CLI integration tests, Playwright export smoke tests, and visual regression tests against canonical decks. Name future tests close to the code they cover, for example `packages/parser/src/index.test.ts`.

## Commit & Pull Request Guidelines

Recent commits use concise, imperative, lower-case subjects, for example `support multi document tabs` and `build desktop client in ci`. Follow that style and keep one logical change per commit. Pull requests should include a short summary, linked issue when available, validation commands run, and screenshots or recordings for visible UI changes.

## Security & Agent-Specific Notes

Renderer and parser changes must preserve slide isolation: block scripts, event handlers, remote stylesheets, remote scripts, and iframes unless the architecture docs are deliberately updated. For automated agents, reason from first principles, choose the simplest sufficient change, and update confidence as evidence changes.
