---
name: deckdown
description: Create, validate, and improve Deckdown .dd presentation files. Use when writing Deckdown decks, converting outlines into .dd slides, or reviewing Deckdown format issues.
---

# Deckdown Skill

Use this skill to help users create and refine Deckdown `.dd` files.

Deckdown is a single-file presentation format. A valid deck contains YAML frontmatter followed by one or more `:::slide id` blocks. Each slide body is one HTML `<section>` styled with Tailwind-style utility classes.

## Workflow

1. Read the user's requested topic, audience, tone, and slide count.
2. Generate exactly one `.dd` document unless the user asks for explanation.
3. Use the Deckdown V0.1 format from `references/format.md`.
4. Keep slides visually clear: low density, large text, strong hierarchy, and no off-canvas content.
5. When revising an existing deck, preserve valid slide IDs unless the user asks to reorganize the deck.
6. When checking a deck, report blocking format errors first, then design or readability improvements.

## Required Deck Shape

Every generated deck must:

- Start with YAML frontmatter containing `title`, `size`, `ratio`, and `engine`.
- Use `size: 1920x1080`, `ratio: 16:9`, and `engine: deckdown@0.1`.
- Wrap each slide in `:::slide id` and closing `:::`.
- Use unique slide IDs matching `[A-Za-z0-9_-]+`.
- Put exactly one root `<section>` inside each slide.
- Include `relative`, `w-[1920px]`, `h-[1080px]`, and `overflow-hidden` on each root section.
- Use HTML and Tailwind-style utility classes only.

## Do Not Use

Do not include React, Vue, JSX, MDX, scripts, inline event handlers, external CSS, external JavaScript, iframes, embeds, remote image URLs, or assets that require network access.

## References

- `references/format.md`: Deckdown V0.1 file and slide rules.
- `references/authoring-guide.md`: practical deck-writing guidance for agents.
- `examples/chordedit.dd`: canonical example deck.
