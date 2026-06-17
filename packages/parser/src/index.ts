import * as parse5 from "parse5";
import YAML from "yaml";
import {
  DeckDocument,
  DeckFrontmatter,
  DeckFrontmatterInputSchema,
  Diagnostic,
  SlideDocument,
  SourcePosition,
  SourceRange,
  createDiagnostic,
  parseDeckSize
} from "@deckdown/schema";

export interface ParseDeckOptions {
  sourcePath?: string;
}

const DEFAULT_FRONTMATTER: DeckFrontmatter = {
  title: "Untitled Deck",
  size: { width: 1920, height: 1080 },
  ratio: "16:9",
  engine: "deckdown@0.1"
};

const REQUIRED_ROOT_CLASSES = ["relative", "w-[1920px]", "h-[1080px]", "overflow-hidden"];
const FORBIDDEN_TAGS = new Set(["script", "iframe", "object", "embed"]);

export function parseDeckdown(source: string, options: ParseDeckOptions = {}): DeckDocument {
  const normalized = stripBom(String(source ?? ""));
  const diagnostics: Diagnostic[] = [];
  const frontmatter = parseFrontmatter(normalized, diagnostics);
  const bodyStart = frontmatter.bodyStart;
  const slides = parseSlides(normalized, bodyStart, diagnostics);

  validateDuplicateSlideIds(slides, diagnostics);

  if (slides.length === 0) {
    diagnostics.push(createDiagnostic("error", "deck.slide.missing", "Deck must contain at least one :::slide block."));
  }

  return {
    version: "0.1",
    sourcePath: options.sourcePath,
    frontmatter: frontmatter.value,
    slides,
    diagnostics
  };
}

export function diagnosticsBySeverity(deck: DeckDocument, severity: Diagnostic["severity"]): Diagnostic[] {
  return deck.diagnostics.filter((diagnostic) => diagnostic.severity === severity);
}

function parseFrontmatter(source: string, diagnostics: Diagnostic[]) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
  if (!match) {
    diagnostics.push(createDiagnostic("error", "frontmatter.missing", "Deck must start with YAML frontmatter bounded by ---."));
    return { value: DEFAULT_FRONTMATTER, bodyStart: 0 };
  }

  const raw = match[1] ?? "";
  let parsed: unknown;
  try {
    parsed = YAML.parse(raw);
  } catch (error) {
    diagnostics.push(
      createDiagnostic(
        "error",
        "frontmatter.yaml",
        `Frontmatter is not valid YAML: ${error instanceof Error ? error.message : String(error)}`,
        rangeFromOffsets(source, 0, match[0].length)
      )
    );
    return { value: DEFAULT_FRONTMATTER, bodyStart: match[0].length };
  }

  const result = DeckFrontmatterInputSchema.safeParse(parsed);
  if (!result.success) {
    for (const issue of result.error.issues) {
      diagnostics.push(
        createDiagnostic(
          "error",
          "frontmatter.invalid",
          `${issue.path.join(".") || "frontmatter"}: ${issue.message}`,
          rangeFromOffsets(source, 0, match[0].length)
        )
      );
    }
    return { value: DEFAULT_FRONTMATTER, bodyStart: match[0].length };
  }

  return {
    value: {
      title: result.data.title,
      size: parseDeckSize(result.data.size),
      ratio: result.data.ratio,
      engine: result.data.engine
    },
    bodyStart: match[0].length
  };
}

function parseSlides(source: string, bodyOffset: number, diagnostics: Diagnostic[]): SlideDocument[] {
  const slides: SlideDocument[] = [];
  const body = source.slice(bodyOffset);
  const slidePattern = /(?:^|\r?\n):::slide[ \t]+([A-Za-z0-9_-]+)[ \t]*\r?\n([\s\S]*?)\r?\n:::[ \t]*(?=\r?\n|$)/g;
  let match: RegExpExecArray | null;
  while ((match = slidePattern.exec(body))) {
    const id = match[1] ?? "";
    const html = (match[2] ?? "").trim();
    const blockStart = bodyOffset + match.index + (match[0].startsWith("\n") || match[0].startsWith("\r\n") ? 1 : 0);
    const blockEnd = bodyOffset + match.index + match[0].length;
    const sourceRange = rangeFromOffsets(source, blockStart, blockEnd);
    const sectionClass = validateSlideHtml(html, id, sourceRange, diagnostics);

    slides.push({
      id,
      order: slides.length + 1,
      html,
      sectionClass,
      sourceRange
    });
  }
  return slides;
}

function validateSlideHtml(html: string, id: string, range: SourceRange, diagnostics: Diagnostic[]): string {
  const errors: parse5.ParserError[] = [];
  const fragment = parse5.parseFragment(html, {
    sourceCodeLocationInfo: true,
    onParseError: (error) => errors.push(error)
  }) as parse5.DefaultTreeAdapterMap["documentFragment"];

  for (const error of errors) {
    diagnostics.push(
      createDiagnostic("warning", "slide.html.parse", `Slide ${id} HTML parser warning: ${error.code}.`, range)
    );
  }

  const nodes = fragment.childNodes.filter((node) => node.nodeName !== "#text" || !textNodeValue(node).trim());
  if (nodes.length !== 1 || !isElement(nodes[0]) || nodes[0].tagName !== "section") {
    diagnostics.push(createDiagnostic("error", "slide.section.root", `Slide ${id} must contain exactly one root <section>.`, range));
    return "";
  }

  const section = nodes[0];
  const className = getAttr(section, "class") ?? "";
  const classSet = new Set(className.split(/\s+/).filter(Boolean));
  for (const token of REQUIRED_ROOT_CLASSES) {
    if (!classSet.has(token)) {
      diagnostics.push(
        createDiagnostic("warning", "slide.section.class", `Slide ${id} root section should include ${token}.`, range)
      );
    }
  }

  validateUnsafeHtml(section, id, range, diagnostics);
  return className;
}

function validateUnsafeHtml(
  node: parse5.DefaultTreeAdapterMap["node"],
  id: string,
  range: SourceRange,
  diagnostics: Diagnostic[]
) {
  if (isElement(node)) {
    if (FORBIDDEN_TAGS.has(node.tagName)) {
      diagnostics.push(createDiagnostic("error", "slide.html.forbidden_tag", `Slide ${id} uses forbidden <${node.tagName}>.`, range));
    }

    for (const attr of node.attrs) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith("on")) {
        diagnostics.push(createDiagnostic("error", "slide.html.event_handler", `Slide ${id} uses forbidden ${attr.name} attribute.`, range));
      }
      if ((name === "href" || name === "src") && value.startsWith("javascript:")) {
        diagnostics.push(createDiagnostic("error", "slide.html.javascript_url", `Slide ${id} uses a forbidden javascript: URL.`, range));
      }
      if ((name === "href" || name === "src") && /^https?:\/\//.test(value)) {
        diagnostics.push(createDiagnostic("warning", "slide.html.remote_asset", `Slide ${id} references a remote asset: ${attr.value}.`, range));
      }
    }
  }

  if ("childNodes" in node) {
    for (const child of node.childNodes) validateUnsafeHtml(child, id, range, diagnostics);
  }
}

function validateDuplicateSlideIds(slides: SlideDocument[], diagnostics: Diagnostic[]) {
  const seen = new Map<string, SlideDocument>();
  for (const slide of slides) {
    const first = seen.get(slide.id);
    if (first) {
      diagnostics.push(createDiagnostic("error", "slide.id.duplicate", `Duplicate slide id: ${slide.id}.`, slide.sourceRange));
    } else {
      seen.set(slide.id, slide);
    }
  }
}

export function offsetToPosition(source: string, offset: number): SourcePosition {
  const safeOffset = Math.max(0, Math.min(offset, source.length));
  let line = 1;
  let column = 1;
  for (let index = 0; index < safeOffset; index += 1) {
    if (source[index] === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }
  return { offset: safeOffset, line, column };
}

export function rangeFromOffsets(source: string, start: number, end: number, baseOffset = 0): SourceRange {
  return {
    start: offsetToPosition(source, start + baseOffset),
    end: offsetToPosition(source, end + baseOffset)
  };
}

function stripBom(source: string): string {
  return source.charCodeAt(0) === 0xfeff ? source.slice(1) : source;
}

function isElement(node: parse5.DefaultTreeAdapterMap["node"] | undefined): node is parse5.DefaultTreeAdapterMap["element"] {
  return Boolean(node && "tagName" in node);
}

function getAttr(node: parse5.DefaultTreeAdapterMap["element"], name: string): string | undefined {
  return node.attrs.find((attr) => attr.name === name)?.value;
}

function textNodeValue(node: parse5.DefaultTreeAdapterMap["node"]): string {
  return "value" in node ? String(node.value) : "";
}
