#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Command } from "commander";
import pc from "picocolors";
import { compileDeckStyles } from "@deckdownjs/compiler";
import { exportHtml, exportPdf, exportPng } from "@deckdownjs/exporter";
import { parseDeckdown } from "@deckdownjs/parser";
import { DeckDocument, Diagnostic, hasErrors } from "@deckdownjs/schema";

const program = new Command();

program
  .name("deckdown")
  .description("Validate, inspect, render, and export Deckdown .dd files.")
  .version("0.1.0");

program
  .command("validate")
  .argument("<file>", ".dd file")
  .description("Validate a Deckdown file.")
  .action(async (file) => {
    const deck = await readDeck(file);
    printDiagnostics(deck.diagnostics);
    if (hasErrors(deck.diagnostics)) process.exitCode = 1;
    else console.log(pc.green(`valid: ${deck.frontmatter.title} (${deck.slides.length} slides)`));
  });

program
  .command("inspect")
  .argument("<file>", ".dd file")
  .option("--json", "Print machine-readable JSON.")
  .description("Inspect parsed deck metadata.")
  .action(async (file, options) => {
    const deck = await readDeck(file);
    if (options.json) {
      console.log(JSON.stringify(deck, null, 2));
      return;
    }
    printDiagnostics(deck.diagnostics);
    console.log(`${pc.bold(deck.frontmatter.title)}\nslides: ${deck.slides.length}\nsize: ${deck.frontmatter.size.width}x${deck.frontmatter.size.height}`);
  });

program
  .command("render")
  .argument("<file>", ".dd file")
  .option("--out <file>", "HTML output path", "dist/deck.html")
  .description("Render a standalone HTML deck.")
  .action(async (file, options) => {
    const deck = await readValidDeck(file);
    const outFile = await exportHtml(deck, { outFile: resolveUserPath(options.out), includeNavigation: true });
    console.log(pc.green(`rendered: ${outFile}`));
  });

program
  .command("export")
  .argument("<file>", ".dd file")
  .option("--html", "Export standalone HTML.")
  .option("--png", "Export PNG pages.")
  .option("--pdf", "Export PDF.")
  .option("--out <path>", "Output file or directory.", "dist/export")
  .description("Export deck assets.")
  .action(async (file, options) => {
    const deck = await readValidDeck(file);
    const out = String(options.out);
    if (!options.html && !options.png && !options.pdf) {
      console.error(pc.red("Choose at least one export target: --html, --png, or --pdf."));
      process.exit(1);
    }
    if (options.html) {
      const outFile = out.endsWith(".html") ? resolveUserPath(out) : resolveUserPath(`${out.replace(/\/$/, "")}/deck.html`);
      console.log(pc.green(`html: ${await exportHtml(deck, { outFile, includeNavigation: true })}`));
    }
    if (options.png) {
      const outDir = resolveUserPath(out);
      const files = await exportPng(deck, { outDir });
      console.log(pc.green(`png: ${files.length} pages in ${outDir}`));
    }
    if (options.pdf) {
      const outFile = out.endsWith(".pdf") ? resolveUserPath(out) : resolveUserPath(`${out.replace(/\/$/, "")}/deck.pdf`);
      console.log(pc.green(`pdf: ${await exportPdf(deck, { outFile })}`));
    }
  });

program
  .command("compile-css")
  .argument("<file>", ".dd file")
  .description("Print compiled deck CSS.")
  .action(async (file) => {
    const deck = await readValidDeck(file);
    const result = await compileDeckStyles(deck);
    printDiagnostics(result.diagnostics);
    console.log(result.css);
  });

program.parseAsync(process.argv);

async function readDeck(file: string): Promise<DeckDocument> {
  const sourcePath = resolveUserPath(file);
  const source = await readFile(sourcePath, "utf8");
  return parseDeckdown(source, { sourcePath });
}

async function readValidDeck(file: string): Promise<DeckDocument> {
  const deck = await readDeck(file);
  printDiagnostics(deck.diagnostics);
  if (hasErrors(deck.diagnostics)) {
    console.error(pc.red("Deck has validation errors."));
    process.exit(1);
  }
  return deck;
}

function printDiagnostics(diagnostics: Diagnostic[]) {
  for (const diagnostic of diagnostics) {
    const label = diagnostic.severity === "error" ? pc.red("error") : diagnostic.severity === "warning" ? pc.yellow("warning") : pc.cyan("info");
    const where = diagnostic.range ? `:${diagnostic.range.start.line}:${diagnostic.range.start.column}` : "";
    console.error(`${label} ${diagnostic.code}${where} ${diagnostic.message}`);
  }
}

function resolveUserPath(file: string): string {
  return resolve(process.env.INIT_CWD ?? process.cwd(), file);
}
