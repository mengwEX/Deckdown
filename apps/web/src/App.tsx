import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Download, FileCheck2, FolderOpen, Maximize2, Play, SkipBack, SkipForward } from "lucide-react";
import { compileDeckStyles } from "@deckdown/compiler";
import { parseDeckdown } from "@deckdown/parser";
import { addSlideRootClass, sanitizeSlideHtml } from "@deckdown/renderer";
import { Diagnostic, hasErrors } from "@deckdown/schema";
import { sampleDeck } from "./sample";

export function App() {
  const [source, setSource] = useState(sampleDeck);
  const [css, setCss] = useState("");
  const [slideIndex, setSlideIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const stageRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const deck = useMemo(() => parseDeckdown(source), [source]);
  const currentSlide = deck.slides[Math.min(slideIndex, Math.max(deck.slides.length - 1, 0))];

  useEffect(() => {
    let cancelled = false;
    compileDeckStyles(deck).then((result) => {
      if (!cancelled) setCss(result.css);
    });
    return () => {
      cancelled = true;
    };
  }, [deck]);

  useEffect(() => {
    setSlideIndex((index) => Math.min(index, Math.max(deck.slides.length - 1, 0)));
  }, [deck.slides.length]);

  useEffect(() => {
    const resize = () => {
      const stage = stageRef.current;
      const viewport = viewportRef.current;
      if (!stage || !viewport) return;
      const rect = viewport.getBoundingClientRect();
      const nextScale = Math.min(rect.width / deck.frontmatter.size.width, rect.height / deck.frontmatter.size.height, 1);
      setScale(nextScale);
      stage.style.transform = `scale(${nextScale})`;
      stage.style.width = `${deck.frontmatter.size.width}px`;
      stage.style.height = `${deck.frontmatter.size.height}px`;
    };
    resize();
    addEventListener("resize", resize);
    return () => removeEventListener("resize", resize);
  }, [deck.frontmatter.size.height, deck.frontmatter.size.width, currentSlide]);

  const diagnostics = deck.diagnostics;
  const invalid = hasErrors(diagnostics);

  return (
    <div className="app">
      <style>{css}</style>
      <aside className="rail">
        <div className="brand">
          <span className="brandMark">D</span>
          <div>
            <strong>Deckdown</strong>
            <small>{deck.frontmatter.engine}</small>
          </div>
        </div>
        <div className="actions">
          <label className="toolButton">
            <FolderOpen size={16} />
            <span>Open</span>
            <input type="file" accept=".dd,text/plain" onChange={(event) => openFile(event, setSource)} />
          </label>
          <button className="toolButton" onClick={() => downloadSource(source, deck.frontmatter.title)}>
            <Download size={16} />
            <span>Save</span>
          </button>
          <button className="toolButton" onClick={() => downloadHtml(deck.frontmatter.title)}>
            <Play size={16} />
            <span>HTML</span>
          </button>
        </div>
        <nav className="slides" aria-label="Slides">
          {deck.slides.map((slide, index) => (
            <button
              key={slide.id}
              className={`slideTab ${index === slideIndex ? "active" : ""}`}
              onClick={() => setSlideIndex(index)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{slide.id}</strong>
            </button>
          ))}
        </nav>
        <Diagnostics diagnostics={diagnostics} />
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="titleBlock">
            <strong>{deck.frontmatter.title}</strong>
            <span className={invalid ? "bad" : "good"}>
              {invalid ? <AlertTriangle size={15} /> : <FileCheck2 size={15} />}
              {invalid ? "Invalid" : "Valid"}
            </span>
          </div>
          <div className="navTools">
            <button onClick={() => setSlideIndex(Math.max(slideIndex - 1, 0))} aria-label="Previous slide">
              <SkipBack size={18} />
            </button>
            <span>
              {deck.slides.length ? slideIndex + 1 : 0} / {deck.slides.length}
            </span>
            <button onClick={() => setSlideIndex(Math.min(slideIndex + 1, deck.slides.length - 1))} aria-label="Next slide">
              <SkipForward size={18} />
            </button>
            <button onClick={() => viewportRef.current?.requestFullscreen()} aria-label="Fullscreen">
              <Maximize2 size={18} />
            </button>
          </div>
        </header>

        <section className="workArea">
          <div className="editorPane">
            <textarea value={source} spellCheck={false} onChange={(event) => setSource(event.target.value)} />
          </div>
          <div className="previewPane" ref={viewportRef}>
            <div
              className="stageFrame"
              style={{
                width: deck.frontmatter.size.width * scale,
                height: deck.frontmatter.size.height * scale
              }}
            >
              <div className="stage" ref={stageRef}>
                {currentSlide ? (
                  <div dangerouslySetInnerHTML={{ __html: addSlideRootClass(sanitizeSlideHtml(currentSlide.html)) }} />
                ) : (
                  <div className="empty">No slides</div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Diagnostics({ diagnostics }: { diagnostics: Diagnostic[] }) {
  return (
    <section className="diagnostics">
      <strong>Diagnostics</strong>
      {diagnostics.length === 0 ? (
        <p>No issues.</p>
      ) : (
        <ul>
          {diagnostics.map((diagnostic, index) => (
            <li key={`${diagnostic.code}-${index}`} className={diagnostic.severity}>
              <span>{diagnostic.severity}</span>
              <p>{diagnostic.message}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

async function openFile(event: React.ChangeEvent<HTMLInputElement>, setSource: (source: string) => void) {
  const file = event.target.files?.[0];
  if (!file) return;
  setSource(await file.text());
  event.target.value = "";
}

function downloadSource(source: string, title: string) {
  downloadBlob(new Blob([source], { type: "text/plain;charset=utf-8" }), `${slug(title)}.dd`);
}

function downloadHtml(title: string) {
  const html = document.documentElement.outerHTML;
  downloadBlob(new Blob([html], { type: "text/html;charset=utf-8" }), `${slug(title)}.html`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 300);
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "deck";
}
