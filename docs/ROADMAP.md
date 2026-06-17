# Deckdown Roadmap

The implementation should grow from format authority outward. Do not start by polishing UI before the parser, renderer, and export path are correct.

## Phase 0: Architecture Lock

Deliverables:

- Final architecture docs.
- `.dd` V0.1 format spec.
- Tech stack decision.
- Monorepo layout decision.
- Dependency list.

Exit criteria:

- A new contributor can explain how parse, compile, render, and export connect.
- The CLI and desktop app have a shared package plan.

## Phase 1: Core Packages

Deliverables:

- `packages/parser`
- `packages/compiler`
- `packages/renderer`
- `packages/schema`
- Canonical example decks.
- Unit tests.

Exit criteria:

- Parser returns AST and diagnostics with source ranges.
- Compiler generates CSS from real deck classes using UnoCSS.
- Renderer can mount sanitized slides in a browser test.

## Phase 2: CLI

Deliverables:

- `deckdown validate`
- `deckdown inspect --json`
- `deckdown export --html`
- `deckdown export --png`
- `deckdown export --pdf`

Exit criteria:

- CLI can run in CI.
- PNG exports are exact deck size.
- PDF has correct page count and dimensions.

## Phase 3: Desktop App

Deliverables:

- Tauri app scaffold.
- Monaco editor.
- Live preview.
- Diagnostics panel.
- File open/save.
- Thumbnail navigator.
- Fullscreen presentation mode.
- Export dialog.

Exit criteria:

- User can author, validate, present, and export a real `.dd` deck without terminal usage.

## Phase 4: Quality Layer

Deliverables:

- Visual regression tests.
- Crash-safe file save.
- Recent files.
- App settings.
- Better unsupported-class diagnostics.
- Error recovery for malformed decks.

Exit criteria:

- Canonical decks are visually stable.
- Common authoring mistakes point to exact source lines.

## Phase 5: Authoring Improvements

Deliverables:

- `.dd` syntax highlighting.
- Formatting command.
- Snippets for slide patterns.
- Optional speaker notes.
- Hot reload preview from external editor.

Exit criteria:

- Deckdown feels good both as a standalone app and as an AI-generated artifact previewer.

## Deferred

These should not block the first complete product:

- Cloud sync.
- Collaboration.
- Template marketplace.
- Animation timeline.
- VS Code extension.
- Remote asset fetching.
