# Deckdown Authoring Guide

Use Deckdown when the user wants a generated presentation as one `.dd` file.

## Generation Checklist

- Choose a clear deck title and concise slide IDs such as `cover`, `problem`, `method`, and `summary`.
- Keep each slide focused on one idea.
- Use large typography: titles around `text-6xl` to `text-8xl`, body text at `text-3xl` or larger.
- Prefer explicit positions and sizes for predictable rendering on the `1920x1080` canvas.
- Keep content inside the canvas. Avoid elements that extend beyond `left-0 right-0 top-0 bottom-0` unless intentionally clipped.
- Use color contrast strong enough for projection.
- Make visual groupings with spacing, borders, panels, and hierarchy, not dense paragraphs.

## Review Checklist

When reviewing a `.dd` file, check these issues first:

- Missing or invalid frontmatter.
- Missing `:::slide` blocks.
- Duplicate or invalid slide IDs.
- More than one root element in a slide.
- Root section missing `relative`, `w-[1920px]`, `h-[1080px]`, or `overflow-hidden`.
- Forbidden HTML, remote assets, scripts, iframes, or event handlers.
- Text too small for a presentation.
- Content likely outside the `1920x1080` canvas.

## Response Style

If the user asks for a deck, return the deck directly in a fenced `dd` code block unless they request a file or additional explanation.

If the user asks for fixes, summarize the blocking issues briefly, then provide a corrected `.dd` file or targeted patch.
