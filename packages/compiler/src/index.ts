import { createGenerator } from "@unocss/core";
import presetWind3 from "@unocss/preset-wind3";
import { CompileResult, DeckDocument, Diagnostic, createDiagnostic } from "@deckdownjs/schema";

const generatorPromise = createGenerator({
  presets: [presetWind3()],
  theme: {
    fontFamily: {
      sans: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }
  }
});

const cssCache = new Map<string, CompileResult>();

export async function compileDeckStyles(deck: DeckDocument): Promise<CompileResult> {
  const tokens = collectClassTokens(deck);
  const cacheKey = tokens.join("\n");
  const cached = cssCache.get(cacheKey);
  if (cached) return cached;

  const generator = await generatorPromise;
  const generated = await generator.generate(tokens.join(" "), {
    preflights: false
  });

  const matched = generated.matched instanceof Set ? generated.matched : new Set<string>();
  const diagnostics: Diagnostic[] = [];
  for (const token of tokens) {
    if (!matched.has(token) && !isCompositeClass(token)) {
      diagnostics.push(createDiagnostic("info", "compiler.class.unmatched", `Class was not emitted by UnoCSS: ${token}`));
    }
  }

  const result: CompileResult = {
    css: `${baseDeckCss(deck)}\n${generated.css}`,
    tokens,
    diagnostics
  };
  cssCache.set(cacheKey, result);
  return result;
}

export function collectClassTokens(deck: DeckDocument): string[] {
  const tokens = new Set<string>();
  for (const slide of deck.slides) {
    for (const match of slide.html.matchAll(/\bclass=(["'])(.*?)\1/gis)) {
      const value = match[2] ?? "";
      for (const token of value.trim().split(/\s+/)) {
        if (token) tokens.add(token);
      }
    }
  }
  return [...tokens].sort();
}

export function baseDeckCss(deck: DeckDocument): string {
  const { width, height } = deck.frontmatter.size;
  return `
:where(.dd-slide-root, .dd-slide-root *) { box-sizing: border-box; }
.dd-slide-root {
  position: relative;
  width: ${width}px;
  height: ${height}px;
  overflow: hidden;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.dd-slide-root :where(h1, h2, h3, h4, p, ul, ol, figure) { margin: 0; }
.dd-slide-root :where(ul, ol) { padding-left: 1.25em; }
.dd-slide-root :where(img, video, canvas, svg) { max-width: 100%; }
`;
}

function isCompositeClass(token: string): boolean {
  return token.includes(":");
}
