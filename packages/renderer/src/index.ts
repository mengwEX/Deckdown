import * as parse5 from "parse5";
import { DeckDocument, SlideDocument } from "@deckdown/schema";

export interface StandaloneHtmlOptions {
  title?: string;
  includeNavigation?: boolean;
}

const FORBIDDEN_TAGS = new Set(["script", "iframe", "object", "embed", "link"]);

export function createStandaloneHtml(deck: DeckDocument, css: string, options: StandaloneHtmlOptions = {}): string {
  const pages = deck.slides.map((slide) => createPageMarkup(slide)).join("\n");
  const navigationScript = options.includeNavigation === false ? "" : standaloneNavigationScript();
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(options.title ?? deck.frontmatter.title)}</title>
    <style>
${createDocumentCss(deck)}
${css}
    </style>
  </head>
  <body>
    <main class="dd-export-shell" data-deck-title="${escapeHtml(deck.frontmatter.title)}">
${pages}
    </main>
${navigationScript}
  </body>
</html>`;
}

export function createPageMarkup(slide: SlideDocument): string {
  return `<article class="dd-export-page" data-slide-id="${escapeHtml(slide.id)}">${addSlideRootClass(
    sanitizeSlideHtml(slide.html)
  )}</article>`;
}

export function addSlideRootClass(html: string): string {
  if (/^<section\b[^>]*\bclass=(["'])/i.test(html)) {
    return html.replace(/^<section\b([^>]*?)\bclass=(["'])(.*?)\2/i, (_match, before: string, quote: string, className: string) => {
      return `<section${before} class=${quote}dd-slide-root ${className}${quote}`;
    });
  }
  return html.replace(/^<section\b/i, '<section class="dd-slide-root"');
}

export function createDocumentCss(deck: DeckDocument): string {
  const { width, height } = deck.frontmatter.size;
  return `
html, body { margin: 0; min-height: 100%; background: #dfe4ec; }
body { font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
.dd-export-shell { display: grid; gap: 32px; place-items: center; padding: 32px; }
.dd-export-page { position: relative; width: ${width}px; height: ${height}px; overflow: hidden; background: white; box-shadow: 0 20px 70px rgb(0 0 0 / 0.22); }
.dd-export-page > section { position: absolute; inset: 0; }
@media print {
  @page { size: ${width}px ${height}px; margin: 0; }
  html, body { width: ${width}px; background: white; }
  .dd-export-shell { display: block; padding: 0; }
  .dd-export-page { box-shadow: none; break-after: page; page-break-after: always; }
}
`;
}

export function sanitizeSlideHtml(html: string): string {
  const fragment = parse5.parseFragment(html) as parse5.DefaultTreeAdapterMap["documentFragment"];
  sanitizeNode(fragment);
  return parse5.serialize(fragment);
}

function sanitizeNode(node: parse5.DefaultTreeAdapterMap["node"]) {
  if (!("childNodes" in node)) return;
  node.childNodes = node.childNodes.filter((child) => {
    if (isElement(child) && FORBIDDEN_TAGS.has(child.tagName)) return false;
    sanitizeAttrs(child);
    sanitizeNode(child);
    return true;
  });
}

function sanitizeAttrs(node: parse5.DefaultTreeAdapterMap["node"]) {
  if (!isElement(node)) return;
  node.attrs = node.attrs.filter((attr) => {
    const name = attr.name.toLowerCase();
    const value = attr.value.trim().toLowerCase();
    if (name.startsWith("on")) return false;
    if ((name === "href" || name === "src") && value.startsWith("javascript:")) return false;
    return true;
  });
}

function standaloneNavigationScript(): string {
  return `<script>
(() => {
  const pages = [...document.querySelectorAll('.dd-export-page')];
  let index = 0;
  const show = () => {
    pages.forEach((page, pageIndex) => {
      page.style.display = pageIndex === index ? 'block' : 'none';
    });
  };
  if (new URLSearchParams(location.search).get('present') === '1') {
    document.body.style.overflow = 'hidden';
    document.querySelector('.dd-export-shell').style.padding = '0';
    document.querySelector('.dd-export-shell').style.placeItems = 'center';
    show();
    addEventListener('keydown', (event) => {
      if (['ArrowRight', 'PageDown', ' '].includes(event.key)) index = Math.min(index + 1, pages.length - 1);
      if (['ArrowLeft', 'PageUp'].includes(event.key)) index = Math.max(index - 1, 0);
      show();
    });
  }
})();
</script>`;
}

function isElement(node: parse5.DefaultTreeAdapterMap["node"]): node is parse5.DefaultTreeAdapterMap["element"] {
  return "tagName" in node;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
