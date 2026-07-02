# Deckdown

Deckdown is an AI-first single-file presentation format, renderer, desktop app, and CLI for `.dd` decks.

The product promise is simple:

> AI writes one `.dd` file. Deckdown previews, validates, presents, and exports it.

Deckdown treats presentations as portable source files: frontmatter plus slide blocks, rendered through a deterministic HTML/CSS pipeline.

## Features

- `.dd` format for single-file presentations.
- Parser, schema, diagnostics, and validation pipeline.
- Tailwind-style utility compilation through UnoCSS.
- React/Vite editor and preview surface.
- Tauri desktop client for macOS and Windows.
- CLI for validation, inspection, rendering, and export.
- PNG, PDF, and standalone HTML export paths.
- Deckdown skill for authoring and reviewing `.dd` files.

## Quick Start

```bash
pnpm install
pnpm dev:web
```

Open the Vite URL to try the web editor.

Validate the canonical example deck:

```bash
pnpm validate
```

Run the desktop client:

```bash
pnpm --filter @deckdown/desktop dev
```

## Commands

| Command | Description |
| --- | --- |
| `pnpm dev:web` | Start the React/Vite web app. |
| `pnpm --filter @deckdown/desktop dev` | Start the Tauri desktop app. |
| `pnpm build` | Build shared packages and the web app. |
| `pnpm check` | Run TypeScript checks across packages and apps. |
| `pnpm validate` | Validate `packages/examples/decks/chordedit.dd`. |
| `pnpm deckdown -- --help` | Show CLI usage after packages are built. |

## Repository Structure

```text
apps/
  desktop/              Tauri desktop shell
  web/                  React/Vite editor and preview app
packages/
  cli/                  deckdown command
  compiler/             utility class extraction and CSS generation
  exporter/             PNG/PDF/HTML export pipeline
  parser/               .dd parser and diagnostics
  renderer/             slide rendering and standalone HTML
  schema/               shared TypeScript contracts
  examples/decks/       canonical .dd examples
docs/                   architecture, format, roadmap, and CI notes
skills/deckdown/        Deckdown skill, references, and examples
```

## Deck Format

A `.dd` file starts with YAML frontmatter, then one or more slide blocks:

```dd
---
title: Demo Deck
size: 1920x1080
ratio: 16:9
engine: deckdown@0.1
---
:::slide cover
<section class="relative w-[1920px] h-[1080px] overflow-hidden bg-neutral-950 text-white">
  <h1 class="absolute left-24 top-24 text-7xl font-semibold">Demo Deck</h1>
</section>
:::
```

See [docs/FORMAT.md](./docs/FORMAT.md) for the full V0.1 format rules.

## Skill

The Deckdown skill lives in [skills/deckdown](./skills/deckdown). It gives agents the format rules, authoring checklist, and examples needed to generate or review `.dd` decks.

## Status

Deckdown is an early production monorepo. The core format, parser, renderer, compiler, exporter, CLI, web app, desktop client, canonical examples, skill, and CI/CD workflows are in place. Current work should deepen package behavior and wire the desktop shell into native file/export workflows.

## Documents

- [Architecture](./docs/ARCHITECTURE.md)
- [CI/CD](./docs/CI_CD.md)
- [Tech Stack](./docs/TECH_STACK.md)
- [Format](./docs/FORMAT.md)
- [Roadmap](./docs/ROADMAP.md)
- [Specification Index](./docs/SPEC.md)
- [Deckdown Skill](./skills/deckdown/SKILL.md)

## License

Deckdown is released under the [MIT License](./LICENSE).
