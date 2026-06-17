import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { compileDeckStyles } from "@deckdown/compiler";
import { createStandaloneHtml } from "@deckdown/renderer";
import { DeckDocument } from "@deckdown/schema";

export interface ExportHtmlOptions {
  outFile: string;
  includeNavigation?: boolean;
}

export interface ExportImageOptions {
  outDir: string;
}

export interface ExportPdfOptions {
  outFile: string;
}

export async function exportHtml(deck: DeckDocument, options: ExportHtmlOptions): Promise<string> {
  const compiled = await compileDeckStyles(deck);
  const outFile = resolve(options.outFile);
  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, createStandaloneHtml(deck, compiled.css, { includeNavigation: options.includeNavigation }), "utf8");
  return outFile;
}

export async function exportPng(deck: DeckDocument, options: ExportImageOptions): Promise<string[]> {
  const outDir = resolve(options.outDir);
  await mkdir(outDir, { recursive: true });
  const htmlFile = await exportHtml(deck, { outFile: join(outDir, "deckdown-export.html"), includeNavigation: false });
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: deck.frontmatter.size });
    await page.goto(pathToFileURL(htmlFile).toString());
    const pages = await page.locator(".dd-export-page").all();
    const files: string[] = [];
    for (let index = 0; index < pages.length; index += 1) {
      const file = join(outDir, `page-${String(index + 1).padStart(3, "0")}.png`);
      await pages[index].screenshot({ path: file });
      files.push(file);
    }
    return files;
  } finally {
    await browser.close();
  }
}

export async function exportPdf(deck: DeckDocument, options: ExportPdfOptions): Promise<string> {
  const outFile = resolve(options.outFile);
  await mkdir(dirname(outFile), { recursive: true });
  const htmlFile = await exportHtml(deck, { outFile: join(dirname(outFile), "deckdown-export.html"), includeNavigation: false });
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: deck.frontmatter.size });
    await page.goto(pathToFileURL(htmlFile).toString());
    await page.pdf({
      path: outFile,
      width: `${deck.frontmatter.size.width}px`,
      height: `${deck.frontmatter.size.height}px`,
      printBackground: true
    });
    return outFile;
  } finally {
    await browser.close();
  }
}
