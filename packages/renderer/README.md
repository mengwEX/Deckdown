# @deckdownjs/renderer

Safe HTML rendering and standalone document helpers for Deckdown `.dd` decks.

## Install

```bash
npm install @deckdownjs/renderer
```

## Usage

```ts
import { createStandaloneHtml, sanitizeSlideHtml } from "@deckdownjs/renderer";
```

`@deckdownjs/renderer` expects a parsed `DeckDocument` from `@deckdownjs/schema` and renders slide HTML with Deckdown's document CSS and sanitization rules.

This package is part of [Deckdown](https://github.com/mengwEX/Deckdown) and is released under the MIT License.
