# Deckdown

Deckdown is an AI-first single-file presentation format and rendering application.

The product goal is simple:

> AI writes one `.dd` file. Deckdown previews, validates, presents, and exports it.

## Current Status

This repository contains the production monorepo implementation:

- Shared parser, compiler, renderer, exporter, schema, and CLI packages.
- React/Vite web app.
- Tauri desktop client for macOS and Windows.
- Canonical example decks.
- GitHub Actions CI/CD workflows.

## Documents

- [Architecture](./docs/ARCHITECTURE.md)
- [CI/CD](./docs/CI_CD.md)
- [Tech Stack](./docs/TECH_STACK.md)
- [Format](./docs/FORMAT.md)
- [Roadmap](./docs/ROADMAP.md)
- [Specification Index](./docs/SPEC.md)

## Direction

The project is a TypeScript-first pnpm monorepo with:

- Tauri 2 desktop app targeting macOS and Windows.
- React + Vite frontend.
- Monaco editor.
- Shared parser, compiler, renderer, exporter, CLI, and schema packages.
- UnoCSS utility compilation.
- Playwright-based PNG/PDF export.

Production work should continue by deepening the shared packages and wiring the Tauri shell into native file/export workflows.
