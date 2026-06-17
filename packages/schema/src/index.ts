import { z } from "zod";

export const DeckdownVersionSchema = z.literal("0.1");

export const DeckSizeStringSchema = z
  .string()
  .regex(/^\d+x\d+$/, "size must look like 1920x1080");

export const DeckFrontmatterInputSchema = z.object({
  title: z.string().min(1, "title is required"),
  size: DeckSizeStringSchema,
  ratio: z.literal("16:9"),
  engine: z.string().regex(/^deckdown@\d+\.\d+/, "engine must look like deckdown@0.1")
});

export const SourcePositionSchema = z.object({
  offset: z.number().int().nonnegative(),
  line: z.number().int().positive(),
  column: z.number().int().positive()
});

export const SourceRangeSchema = z.object({
  start: SourcePositionSchema,
  end: SourcePositionSchema
});

export const DiagnosticSchema = z.object({
  severity: z.enum(["error", "warning", "info"]),
  code: z.string(),
  message: z.string(),
  range: SourceRangeSchema.optional()
});

export type DeckdownVersion = z.infer<typeof DeckdownVersionSchema>;
export type DeckFrontmatterInput = z.infer<typeof DeckFrontmatterInputSchema>;
export type SourcePosition = z.infer<typeof SourcePositionSchema>;
export type SourceRange = z.infer<typeof SourceRangeSchema>;
export type Diagnostic = z.infer<typeof DiagnosticSchema>;

export interface DeckSize {
  width: number;
  height: number;
}

export interface DeckFrontmatter {
  title: string;
  size: DeckSize;
  ratio: "16:9";
  engine: string;
}

export interface SlideDocument {
  id: string;
  order: number;
  html: string;
  sectionClass: string;
  sourceRange: SourceRange;
}

export interface DeckDocument {
  version: DeckdownVersion;
  sourcePath?: string;
  frontmatter: DeckFrontmatter;
  slides: SlideDocument[];
  diagnostics: Diagnostic[];
}

export interface CompileResult {
  css: string;
  tokens: string[];
  diagnostics: Diagnostic[];
}

export function parseDeckSize(value: string): DeckSize {
  const [width, height] = value.split("x").map((part) => Number(part));
  return { width, height };
}

export function hasErrors(diagnostics: Diagnostic[]): boolean {
  return diagnostics.some((diagnostic) => diagnostic.severity === "error");
}

export function createDiagnostic(
  severity: Diagnostic["severity"],
  code: string,
  message: string,
  range?: SourceRange
): Diagnostic {
  return range ? { severity, code, message, range } : { severity, code, message };
}
