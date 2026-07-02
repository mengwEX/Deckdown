# @deckdown/renderer

Safe HTML rendering and standalone document helpers for Deckdown `.dd` decks.

## Install

```bash
npm install @deckdown/renderer
```

## Usage

```ts
import { createStandaloneHtml, sanitizeSlideHtml } from "@deckdown/renderer";
```

`@deckdown/renderer` expects a parsed `DeckDocument` from `@deckdown/schema` and renders slide HTML with Deckdown's document CSS and sanitization rules.

This package is part of [Deckdown](https://github.com/mengwEX/Deckdown) and is released under the MIT License.
