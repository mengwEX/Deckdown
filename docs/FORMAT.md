# Deckdown Format

This document defines Deckdown `.dd` version `0.1`.

## Goal

The format optimizes for AI generation. It should be easy for an LLM to produce a complete deck without coordinating multiple files.

## File

A `.dd` file is UTF-8 plain text.

The file contains:

1. Frontmatter.
2. Slide blocks.

## Frontmatter

Frontmatter is required and must be the first block in the file.

```yaml
---
title: Demo Deck
size: 1920x1080
ratio: 16:9
engine: deckdown@0.1
---
```

Required fields:

| Field | Type | Example | Description |
| --- | --- | --- | --- |
| `title` | string | `Demo Deck` | Deck title. |
| `size` | string | `1920x1080` | Logical slide canvas. |
| `ratio` | string | `16:9` | Aspect ratio label. |
| `engine` | string | `deckdown@0.1` | Target Deckdown engine. |

V0.1 only guarantees `1920x1080` and `16:9`.

## Slide Block

```dd
:::slide cover
<section class="relative w-[1920px] h-[1080px] overflow-hidden bg-neutral-950 text-white">
  ...
</section>
:::
```

Rules:

- Slide IDs must match `[A-Za-z0-9_-]+`.
- Slide IDs must be unique.
- Slide body must be exactly one root `<section>`.
- Root section must use the declared deck size.
- Root section should include `relative`, `w-[1920px]`, `h-[1080px]`, and `overflow-hidden`.

## HTML Rules

Allowed:

- Regular HTML layout tags.
- Text content.
- Lists.
- Tables.
- Inline SVG.
- Images with data URLs.

Forbidden:

- React, Vue, JSX, MDX, or framework syntax.
- `<script>`.
- Inline event handlers.
- Remote CSS.
- Remote JavaScript.
- Remote image URLs in V0.1.
- `<iframe>`, `<object>`, and `<embed>`.

## Styling Rules

Slides are styled with Tailwind-style utility classes.

V0.1 supports utility classes through UnoCSS `preset-wind3` plus Deckdown-specific rules.

AI output should prefer:

- Absolute positioning for slide composition.
- Large readable text.
- Low information density.
- Arbitrary values for exact canvas layout.

Minimum body text recommendation:

```html
<p class="text-3xl leading-snug">Readable presentation copy.</p>
```

## Notes

Speaker notes are not in V0.1. V0.2 should add an optional notes block:

```dd
:::notes
Speaker notes for the previous slide.
:::
```

## Assets

V0.1 is single-file and should not reference external resources.

Future asset support should be explicit:

- `assets:` frontmatter manifest.
- Local asset bundle folder.
- Export-time asset embedding.

Deckdown should never silently depend on remote assets for export.

## AI Prompt Contract

When asking an AI to generate Deckdown, use this contract:

```text
You are generating a Deckdown .dd file.
Return exactly one .dd document.
Use YAML frontmatter with title, size, ratio, and engine.
Wrap every page in :::slide id and :::.
Each slide body must be one <section>.
The section must be 1920x1080 and include relative overflow-hidden.
Use HTML and Tailwind-style classes only.
Do not use React, Vue, JSX, external CSS, external JS, scripts, iframes, or remote assets.
Keep body text at text-3xl or larger.
Keep all elements inside the 1920x1080 canvas.
```
