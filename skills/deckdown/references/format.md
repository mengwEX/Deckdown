# Deckdown Format Reference

Deckdown `.dd` V0.1 is a UTF-8 single-file presentation format optimized for AI generation.

## File Structure

Each file contains:

1. YAML frontmatter.
2. One or more slide blocks.

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

## Frontmatter

Required fields:

- `title`: deck title.
- `size`: logical canvas. Use `1920x1080`.
- `ratio`: aspect ratio label. Use `16:9`.
- `engine`: target engine. Use `deckdown@0.1`.

## Slide Blocks

Slide blocks use this form:

```dd
:::slide slide-id
<section class="relative w-[1920px] h-[1080px] overflow-hidden ...">
  ...
</section>
:::
```

Rules:

- Slide IDs must match `[A-Za-z0-9_-]+`.
- Slide IDs must be unique.
- Each slide body must contain exactly one root `<section>`.
- The root section should include `relative`, `w-[1920px]`, `h-[1080px]`, and `overflow-hidden`.

## HTML And Assets

Allowed:

- Plain HTML layout tags.
- Text, lists, and tables.
- Inline SVG.
- Images encoded as data URLs.

Forbidden:

- React, Vue, JSX, MDX, or framework syntax.
- `<script>`, inline event handlers, remote CSS, or remote JavaScript.
- Remote image URLs.
- `<iframe>`, `<object>`, and `<embed>`.

## Styling

Use Tailwind-style utility classes. Prefer absolute positioning for slide composition, readable text, low information density, and exact arbitrary values such as `w-[820px]`.

Minimum body text recommendation:

```html
<p class="text-3xl leading-snug">Readable presentation copy.</p>
```
