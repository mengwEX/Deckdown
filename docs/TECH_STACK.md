# Deckdown Tech Stack

This is the proposed final stack for a complete, maintainable Deckdown product.

## Primary Language

TypeScript is the main language for parser, compiler, renderer, exporter orchestration, CLI, and UI.

Rust is used only where Tauri requires it or where native desktop integration is cleaner.

## Package Manager

Use `pnpm` workspaces.

Reasons:

- Fast monorepo installs.
- Strict dependency layout.
- Good support for shared package development.

## Desktop App

Framework: Tauri 2

Dependencies:

- `@tauri-apps/api`
- `@tauri-apps/plugin-dialog`
- `@tauri-apps/plugin-fs`
- `@tauri-apps/plugin-shell`
- `@tauri-apps/plugin-window-state`

Reasons:

- Smaller and more native than Electron.
- WebView is enough because Deckdown controls slide HTML.
- Rust side can own filesystem, export process, and native dialogs.

## Frontend App

Framework: React + Vite + TypeScript

Dependencies:

- `react`
- `react-dom`
- `vite`
- `typescript`
- `@vitejs/plugin-react`
- `zustand`
- `@tanstack/react-virtual`
- `lucide-react`

Reasons:

- React is practical for editor, diagnostics, thumbnails, dialogs, and presentation state.
- Vite keeps desktop and web builds fast.
- Zustand is enough for app state without framework ceremony.
- Virtualized thumbnails matter for large decks.
- Lucide provides consistent icon controls.

## Editor

Editor: Monaco

Dependencies:

- `monaco-editor`
- `@monaco-editor/react`

Responsibilities:

- `.dd` syntax highlighting.
- Diagnostics from parser.
- Jump from diagnostic to source range.
- Optional formatting actions later.

## Parser

Dependencies:

- `yaml`
- `parse5`
- `zod`

Reasons:

- `yaml` handles frontmatter correctly.
- `parse5` validates HTML without browser-only APIs.
- `zod` gives runtime validation and typed frontmatter.

## CSS Compiler

Compiler: UnoCSS

Dependencies:

- `unocss`
- `@unocss/core`
- `@unocss/preset-wind3`
- `@unocss/preset-attributify` only if Deckdown later supports attribute syntax

Reasons:

- Fast atomic CSS generation.
- Good arbitrary value support.
- Easier to embed than invoking the Tailwind CLI repeatedly.
- Suitable for live preview on every edit.

Deckdown should start with `preset-wind3` and a small Deckdown-specific preset for presentation-safe defaults.

## HTML Sanitization

Dependency:

- `dompurify`
- `jsdom` for Node-side sanitization tests when needed

Reasons:

- Slide HTML is untrusted document content.
- Deckdown blocks JavaScript by design.

## Export

Renderer: Playwright Chromium

Dependencies:

- `playwright`

Reasons:

- Screenshots and PDF output must match preview as closely as possible.
- Chromium gives deterministic viewport, screenshot, and PDF APIs.

Tauri desktop should call the same exporter package. If bundling Playwright browsers inside the desktop app becomes too heavy, V0.2 can evaluate a sidecar Chromium strategy.

## CLI

CLI framework:

- `commander`
- `picocolors`
- `ora` only for long exports, if needed

Reasons:

- Command parsing should be boring and stable.
- Output must be script-friendly.

## Testing

Dependencies:

- `vitest`
- `@vitest/coverage-v8`
- `playwright`
- `pixelmatch`
- `pngjs`

Responsibilities:

- Unit tests for parser/compiler.
- CLI integration tests.
- Export smoke tests.
- Visual regression tests for canonical decks.

## Formatting And Linting

Dependencies:

- `eslint`
- `typescript-eslint`
- `prettier`

Rules:

- TypeScript strict mode.
- No implicit `any`.
- Parser diagnostics must be tested.
- Shared packages must avoid app-specific imports.

## Suggested Workspace Dependencies

```json
{
  "devDependencies": {
    "@types/node": "^24.0.0",
    "@vitejs/plugin-react": "^5.0.0",
    "@vitest/coverage-v8": "^3.0.0",
    "eslint": "^9.0.0",
    "pixelmatch": "^7.0.0",
    "pngjs": "^7.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.8.0",
    "typescript-eslint": "^8.0.0",
    "vite": "^7.0.0",
    "vitest": "^3.0.0"
  },
  "dependencies": {
    "@monaco-editor/react": "^4.7.0",
    "@tauri-apps/api": "^2.0.0",
    "@tauri-apps/plugin-dialog": "^2.0.0",
    "@tauri-apps/plugin-fs": "^2.0.0",
    "@tanstack/react-virtual": "^3.0.0",
    "@unocss/core": "^66.0.0",
    "@unocss/preset-wind3": "^66.0.0",
    "commander": "^14.0.0",
    "dompurify": "^3.0.0",
    "lucide-react": "^0.500.0",
    "monaco-editor": "^0.52.0",
    "parse5": "^8.0.0",
    "playwright": "^1.54.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "yaml": "^2.0.0",
    "zod": "^4.0.0",
    "zustand": "^5.0.0"
  }
}
```

Versions should be pinned when the production workspace is scaffolded.
